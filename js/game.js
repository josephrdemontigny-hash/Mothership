/**
 * Mothership — Chilliwack skies
 * Flow: title (insert cassette → playTheme) → shed (Tayler press steps → UFO land) → yard (board ship) → ship (walk to helm / take seat) → fly → results
 * Pilots: Zakk & Tayler. Theme starts on menu cassette insert (iOS-safe gesture).
 * Fly scroll is player-driven (no auto-scroll). Landing legs extend on ground, tuck on takeoff.
 */
(function () {
  const W = MothershipWorld;
  const Audio = window.MothershipAudio;
  const HS_KEY = 'mothership_highscore';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const CW = canvas.width;
  const CH = canvas.height;
  const GROUND = CH * 0.72;

  const el = {
    hud: document.getElementById('hud'),
    score: document.getElementById('score'),
    beamed: document.getElementById('beamed'),
    modeLabel: document.getElementById('mode-label'),
    district: document.getElementById('district'),
    prompt: document.getElementById('prompt-label'),
    title: document.getElementById('screen-title'),
    results: document.getElementById('screen-results'),
    titleHigh: document.getElementById('title-high'),
    playCount: document.getElementById('play-count'),
    resBeamed: document.getElementById('res-beamed'),
    resScore: document.getElementById('res-score'),
    resHigh: document.getElementById('res-high'),
    resLiner: document.getElementById('res-liner'),
    muteBtn: document.getElementById('mute-btn'),
    touch: document.getElementById('touch'),
    btnAgain: document.getElementById('btn-again'),
    btnTitle: document.getElementById('btn-title'),
    btnBeam: document.getElementById('btn-beam'),
    btnDestruct: document.getElementById('btn-destruct'),
    hudDestruct: document.getElementById('hud-destruct'),
    btnInteract: document.getElementById('btn-interact'),
    carStereo: document.getElementById('car-stereo'),
    menuCassette: document.getElementById('menu-cassette'),
    cassetteSlot: document.getElementById('cassette-slot'),
    stereoDisplay: document.getElementById('stereo-display'),
    slotHint: document.getElementById('slot-hint'),
  };

  const keys = Object.create(null);
  const touchDirs = Object.create(null);
  let interactQueued = false;
  let beamQueued = false;
  let jumpQueued = false;
  let prevInteractHeld = false;
  let prevBeamHeld = false;

  // title | shed | yard | ship | fly | results
  let mode = 'title';
  let t = 0;
  let lastTs = 0;
  let flashMsg = null;
  let flashTimer = 0;
  let particles = [];
  let floaters = [];

  let score = 0;
  let beamed = 0;

  let avatar = null;
  let camX = 0;
  let tayler = null;
  let landing = null;
  let fly = null;
  /** Theme already started from menu cassette insert */
  let tapeInStereo = true;
  /** Shared sesh with Tayler (press-to-advance steps) */
  let smoking = false;
  /** Overall 0..1 progress across joint stages (HUD bar) */
  let smokeProgress = 0;
  /** Finished joint + UFO land gate complete */
  let smokeDone = false;
  /** 0..1 UFO fly-in in shed window; advances after Smoke step */
  let windowUfo = 0;
  /**
   * Joint step id while animating / awaiting next press:
   * 'gethigh' | 'roll' | 'light' | 'smoke' | null
   */
  let jointStage = null;
  /** 'await' = show next button · 'anim' = playing stage · null = not started */
  let jointPhase = null;
  /** Index of next / current JOINT_STEPS entry */
  let jointStepIndex = 0;
  /** Frames elapsed in current joint stage animation */
  let jointTimer = 0;
  /** UFO landing auto-anim after smoke (separate from press steps) */
  let ufoLanding = false;
  /** Mouth-puff frames remaining (Up while holding lit joint) */
  let puffTimer = 0;
  /** Previous frame Up-held for puff edge detect */
  let prevUpHeld = false;
  /** Brief sit + takeoff after taking driver's seat (ship mode) */
  let boardSit = null;
  /** Guard double-insert on title stereo */
  let titleInserting = false;

  /**
   * Press-required Tayler sesh (not one long auto-cutscene).
   * Labels match UX copy casually.
   */
  const JOINT_STEPS = [
    { id: 'gethigh', dur: 34, prompt: 'get high with T', label: 'Start the sesh…', btn: 'get high with T' },
    { id: 'roll', dur: 55, prompt: 'roll joint', label: 'Tayler rolls — paper + weed…', btn: 'roll joint' },
    { id: 'light', dur: 42, prompt: 'light the joint', label: 'Zakk lights it…', btn: 'light the joint' },
    { id: 'smoke', dur: 64, prompt: 'Smoke the joint', label: 'Puff puff…', btn: 'Smoke the joint' },
  ];

  function jointStageIndex(id) {
    for (let i = 0; i < JOINT_STEPS.length; i++) {
      if (JOINT_STEPS[i].id === id) return i;
    }
    return -1;
  }

  function jointOverallProgress() {
    if (smokeDone) return 1;
    if (!jointStage && jointPhase == null) return 0;
    const idx = jointStepIndex;
    let done = 0;
    let total = 0;
    for (let i = 0; i < JOINT_STEPS.length; i++) {
      total += JOINT_STEPS[i].dur;
      if (i < idx) done += JOINT_STEPS[i].dur;
    }
    if (jointPhase === 'anim' && jointStage) {
      const cur = JOINT_STEPS[jointStageIndex(jointStage)];
      if (cur) done += Math.min(cur.dur, jointTimer);
    }
    // UFO landing adds a little tail progress
    total += 90;
    if (ufoLanding || smokeDone) done += Math.min(90, windowUfo * 90);
    return Math.max(0, Math.min(1, done / total));
  }

  function currentJointPrompt() {
    if (smokeDone || ufoLanding) return null;
    const step = JOINT_STEPS[jointStepIndex];
    return step || null;
  }

  function syncInteractBtn() {
    if (!el.btnInteract) return;
    if (mode === 'fly') {
      el.btnInteract.textContent = 'USE';
      return;
    }
    const step = (mode === 'shed' && nearTaylerForPrompt()) ? currentJointPrompt() : null;
    if (step && jointPhase !== 'anim') {
      el.btnInteract.textContent = step.btn;
    } else if (mode === 'shed' && nearDoor() && ufoLanded()) {
      el.btnInteract.textContent = 'EXIT';
    } else if (mode === 'yard' && nearYardShedDoor()) {
      el.btnInteract.textContent = 'ENTER';
    } else if (mode === 'yard' && nearInteract()) {
      el.btnInteract.textContent = 'BOARD';
    } else if (mode === 'ship' && nearInteract() && !boardSit) {
      el.btnInteract.textContent = 'SIT';
    } else {
      el.btnInteract.textContent = 'USE';
    }
  }

  function nearTaylerForPrompt() {
    if (mode !== 'shed' || !avatar || !tayler) return false;
    if (smokeDone || ufoLanding) return false;
    if (jointPhase === 'anim') return false;
    return Math.abs(avatar.x - tayler.x) < 72;
  }

  function getHigh() {
    return parseInt(localStorage.getItem(HS_KEY) || '0', 10) || 0;
  }
  function setHigh(n) {
    localStorage.setItem(HS_KEY, String(n));
  }

  function updateMuteUI() {
    el.muteBtn.textContent = Audio.isMuted() ? '🔇' : '🔊';
  }

  function showFlash(msg, ms) {
    flashMsg = msg;
    flashTimer = ms || 120;
  }

  function syncHud() {
    el.score.textContent = String(score);
    el.beamed.textContent = String(beamed);
    const labels = {
      shed: 'SHED',
      yard: 'YARD',
      ship: 'SHIP',
      fly: 'FLY',
    };
    el.modeLabel.textContent = labels[mode] || '';
    if (mode === 'fly' && fly) {
      el.district.classList.remove('hidden');
      el.district.textContent =
        W.DISTRICTS[fly.districtIndex % W.DISTRICTS.length].name +
        ' · HULL ' + fly.lives;
    } else {
      el.district.classList.add('hidden');
    }
    syncInvHud();
    syncBeamUi();
  }

  function syncInvHud() {
    // Cassette hunt removed — theme starts from title stereo insert.
  }

  /** Beam touch control + fly-only HUD bits — hidden until fly. */
  function syncBeamUi() {
    const flying = mode === 'fly';
    if (el.btnBeam) el.btnBeam.classList.toggle('hidden', !flying);
    if (el.btnDestruct) el.btnDestruct.classList.toggle('hidden', !flying);
    if (el.hudDestruct) el.hudDestruct.classList.toggle('hidden', !flying);
    if (el.beamed) {
      const wrap = document.getElementById('beamed-label');
      if (wrap) wrap.classList.toggle('hidden', !flying);
    }
  }

  function setPrompt(text) {
    el.prompt.textContent = text || '';
  }

  function showScreen(name) {
    el.title.classList.toggle('hidden', name !== 'title');
    el.results.classList.toggle('hidden', name !== 'results');
    const playing = name === 'play';
    el.hud.classList.toggle('hidden', !playing);
    el.touch.classList.toggle('hidden', !playing);
    syncBeamUi();
  }

  function makeAvatar(x, y) {
    // Hitbox sized for CHAR_SCALE ~1.48 sprites
    return { x, y, vx: 0, vy: 0, facing: 1, onGround: true, w: 28, h: 70 };
  }

  function gestureUnlock() {
    Audio.unlock();
    Audio.warm();
  }

  // ——— Mode transitions ———

  // ——— Global play count (increments every START) ———
  const PLAY_COUNT_TALLY = 'https://tally.yuki.sh/hits/retrofit/mothership-plays.json';
  const PLAY_COUNT_KEY = 'retrofit_mothership_plays_v1';
  const PLAY_COUNT_API = 'https://countapi.mileshilliard.com/api/v1';
  let lastPlayCount = null;

  function formatPlays(n) {
    const num = Number(n);
    if (!Number.isFinite(num) || num < 0) return 'Plays: …';
    if (num === 1) return '1 play';
    return num.toLocaleString('en-CA') + ' plays';
  }

  function setPlayCountLabel(n) {
    if (!el.playCount) return;
    if (Number.isFinite(Number(n))) lastPlayCount = Number(n);
    el.playCount.textContent = formatPlays(n);
  }

  async function fetchPlayCount() {
    // Prefer Tally read (no increment)
    try {
      const res = await fetch(PLAY_COUNT_TALLY + '?mode=read', { cache: 'no-store', mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        const v = Number(data.visit);
        if (Number.isFinite(v)) {
          setPlayCountLabel(v);
          return v;
        }
      }
    } catch (_) { /* try fallback */ }

    try {
      const res = await fetch(PLAY_COUNT_API + '/get/' + PLAY_COUNT_KEY, { cache: 'no-store', mode: 'cors' });
      if (!res.ok) throw new Error('get failed');
      const data = await res.json();
      const v = Number(data.value);
      if (Number.isFinite(v)) {
        setPlayCountLabel(v);
        return v;
      }
    } catch (_) { /* ignore */ }

    if (el.playCount && (el.playCount.textContent.includes('…') || el.playCount.textContent.includes('—'))) {
      el.playCount.textContent = lastPlayCount != null ? formatPlays(lastPlayCount) : 'Plays: —';
    }
    return lastPlayCount;
  }

  async function recordPlay() {
    // Optimistic bump so the UI moves even if the network is slow
    if (lastPlayCount != null) setPlayCountLabel(lastPlayCount + 1);
    else if (el.playCount) el.playCount.textContent = 'Plays: …';

    // Primary: Tally hit (GET without mode=read increments)
    try {
      const res = await fetch(PLAY_COUNT_TALLY, { cache: 'no-store', mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        const v = Number(data.visit);
        if (Number.isFinite(v)) {
          setPlayCountLabel(v);
          return v;
        }
      }
    } catch (_) { /* fallback */ }

    // Fallback: Miles CountAPI hit
    try {
      const res = await fetch(PLAY_COUNT_API + '/hit/' + PLAY_COUNT_KEY, { cache: 'no-store', mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        const v = Number(data.value);
        if (Number.isFinite(v)) {
          setPlayCountLabel(v);
          return v;
        }
      }
    } catch (_) { /* ignore */ }

    await fetchPlayCount();
    return lastPlayCount;
  }

  function resetStereoTitleUI() {
    titleInserting = false;
    if (el.carStereo) {
      el.carStereo.classList.remove('inserting', 'inserted', 'playing');
    }
    if (el.stereoDisplay) {
      el.stereoDisplay.innerHTML =
        '<span class="stereo-eq" aria-hidden="true"></span><span class="stereo-lcd">INSERT TAPE</span>';
    }
    if (el.slotHint) el.slotHint.classList.remove('hidden');
  }

  function setStereoPlayingUI() {
    if (el.carStereo) {
      el.carStereo.classList.add('inserted', 'playing');
      el.carStereo.classList.remove('inserting');
    }
    if (el.stereoDisplay) {
      el.stereoDisplay.innerHTML =
        '<span class="stereo-eq" aria-hidden="true"></span><span class="stereo-lcd">▶ MOTHERSHIP</span>';
    }
  }

  /**
   * Title cassette insert — same user gesture starts theme (iOS-safe) + begins the run.
   * recordPlay fires on insert/start.
   */
  function insertCassetteAndStart() {
    if (mode !== 'title' || titleInserting) return;
    titleInserting = true;
    gestureUnlock();
    Audio.warm();
    // Must stay in this gesture stack:
    Audio.playTheme();
    Audio.play('cassette');
    Audio.play('ui');
    recordPlay();
    if (el.carStereo) {
      el.carStereo.classList.add('inserting');
      el.carStereo.classList.remove('inserted', 'playing');
    }
    if (el.stereoDisplay) {
      el.stereoDisplay.innerHTML =
        '<span class="stereo-eq" aria-hidden="true"></span><span class="stereo-lcd">LOADING…</span>';
    }
    setTimeout(function () {
      setStereoPlayingUI();
      beginRun(true);
    }, 520);
  }

  /** Start / restart a run. Theme already playing when fromTitleInsert. */
  function beginRun(fromTitleInsert) {
    if (!fromTitleInsert) {
      gestureUnlock();
      Audio.warm();
      Audio.playTheme();
      Audio.play('ui');
      recordPlay();
    }
    score = 0;
    beamed = 0;
    particles = [];
    floaters = [];
    flashMsg = null;
    fly = null;
    landing = null;
    boardSit = null;
    tapeInStereo = true;
    smoking = false;
    smokeProgress = 0;
    smokeDone = false;
    windowUfo = 0;
    jointStage = null;
    jointPhase = null;
    jointStepIndex = 0;
    jointTimer = 0;
    ufoLanding = false;
    puffTimer = 0;
    prevUpHeld = false;
    titleInserting = false;
    syncInvHud();
    enterShed();
  }

  /** Results "FLY AGAIN" — gesture-safe theme restart */
  function startGame() {
    beginRun(false);
  }

  function enterShed() {
    mode = 'shed';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    camX = 0;
    // Spawn in the shed by the El Camino
    avatar = makeAvatar(220, GROUND);
    tayler = { x: 940, y: GROUND };
    showScreen('play');
    syncHud();
    syncInteractBtn();
    setPrompt('Walk up to Tayler — get high with T');
    showFlash('Theme on. Hang with Tayler by the Camino.', 130);
  }

  /** From backyard — re-enter shed without resetting sesh / landing progress */
  function returnToShed() {
    mode = 'shed';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    boardSit = null;
    Audio.play('ui');
    if (!tayler) tayler = { x: 940, y: GROUND };
    avatar = makeAvatar(Math.max(80, W.SHED_DOOR_X - 55), GROUND);
    camX = Math.max(0, Math.min(Math.max(0, W.SHED_WORLD_W - CW), avatar.x - CW * 0.4));
    showScreen('play');
    syncHud();
    syncInteractBtn();
    showFlash('Back in the shed.', 80);
    if (ufoLanded()) setPrompt('← → walk · EXIT → out back');
    else if (ufoLanding) setPrompt('Watch the window — wait for it to land…');
    else setPrompt('Hang in the shed · EXIT → when ready');
  }

  function enterYard() {
    mode = 'yard';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    boardSit = null;
    tayler = { x: 240, y: GROUND };
    Audio.play('ui');
    camX = 0;
    avatar = makeAvatar(280, GROUND);

    // Door only opens after land — mothership already waiting in backyard
    const targetY = GROUND - 86;
    landing = {
      phase: 'landed',
      x: 720,
      y: targetY,
      targetY: targetY,
      scale: 2.28,
      lights: true,
      timer: 0,
      legExtend: 1,
      showPilots: false,
    };
    Audio.play('landing');
    showFlash('Mothership waiting. Walk up and board the mothership.', 130);
    setPrompt('Walk to the UFO — board the mothership');
    showScreen('play');
    syncHud();
  }


  function enterShip() {
    mode = 'ship';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    boardSit = null;
    landing = null;
    tayler = null;
    Audio.play('ui');
    Audio.play('power');
    camX = 0;
    avatar = makeAvatar(140, GROUND);
    showFlash('Welcome aboard — walk to the aliens / take the driver\'s seat.', 130);
    setPrompt("Walk to the aliens — take the driver's seat");
    showScreen('play');
    syncHud();
    syncInteractBtn();
  }

  function enterFly() {
    selfDestructing = false;
    destructTimer = 0;
    mode = 'fly';
    interactQueued = false;
    beamQueued = false;
    prevBeamHeld = false;
    boardSit = null;
    landing = null;

    fly = {
      scrollX: 0,
      ufoX: CW * 0.35,
      ufoY: CH * 0.32,
      vx: 0,
      vy: 0,
      districtIndex: 0,
      districtTimer: 0,
      lives: 3,
      targets: [],
      props: [],
      spawnTimer: 40,
      propTimer: 10,
      beaming: false,
      beamTimer: 0,
      beamWide: false,
      moonJuice: 0,
      invuln: 0,
      hitFlash: 0,
      shake: 0,
      shakeX: 0,
      shakeY: 0,
      controlsUnlocked: true,
      /** Landing legs tucked for flight */
      legExtend: 0,
    };
    for (let i = 0; i < 30; i++) spawnProp(60 + i * 68);
    for (let i = 0; i < 5; i++) spawnFlyTarget(300 + i * 200);
    showScreen('play');
    syncHud();
    setPrompt('←→↑↓ fly · Space/USE beam · 💥 self destruct · Enter end');
    showFlash('Free flight over Chilliwack. Beam humans — not pets!', 140);
  }

  function endMission() {
    Audio.play('gameOver');
    mode = 'results';
    const high = getHigh();
    const isNew = score > high;
    if (isNew) setHigh(score);
    el.resBeamed.textContent = String(beamed);
    el.resScore.textContent = String(score);
    el.resHigh.textContent = String(Math.max(high, score));
    el.resLiner.textContent = isNew
      ? 'NEW HIGH SCORE! The band is proud (and still green).'
      : W.pick(W.RESULTS_LINERS);
    showScreen('results');
    el.titleHigh.textContent = 'High Score: ' + getHigh();
    setPrompt('');
  }

  let selfDestructing = false;
  let destructTimer = 0;

  function goToTitleMenu() {
    Audio.stopTheme();
    selfDestructing = false;
    destructTimer = 0;
    mode = 'title';
    fly = null;
    landing = null;
    boardSit = null;
    avatar = null;
    tayler = null;
    smoking = false;
    smokeProgress = 0;
    smokeDone = false;
    windowUfo = 0;
    jointStage = null;
    jointPhase = null;
    jointStepIndex = 0;
    jointTimer = 0;
    ufoLanding = false;
    puffTimer = 0;
    prevUpHeld = false;
    tapeInStereo = true;
    particles = [];
    floaters = [];
    flashMsg = null;
    syncInvHud();
    resetStereoTitleUI();
    showScreen('title');
    el.titleHigh.textContent = 'High Score: ' + getHigh();
    fetchPlayCount();
    setPrompt('');
  }

  function triggerSelfDestruct() {
    if (mode !== 'fly' || !fly || selfDestructing) return;
    selfDestructing = true;
    destructTimer = 0;
    Audio.play('explode');
    showFlash('SELF DESTRUCT — see you in the tape deck', 90);
    setPrompt('💥 BOOM');
    // big explosion FX
    for (let i = 0; i < 5; i++) {
      W.burst(particles, fly.ufoX + (Math.random() - 0.5) * 40, fly.ufoY + (Math.random() - 0.5) * 30, '#ff6622', 18);
      W.burst(particles, fly.ufoX, fly.ufoY, '#ffe088', 12);
    }
    fly.shake = 40;
    fly.hitFlash = 50;
  }


  function districtPropKinds() {
    const id = W.DISTRICTS[fly.districtIndex % W.DISTRICTS.length].id;
    if (id === 'downtown') return ['shop', 'plaza', 'apt', 'streetlight', 'car', 'shop', 'tree', 'apt', 'car'];
    if (id === 'farm') return ['barn', 'corn', 'tree', 'house', 'corn', 'tree', 'car'];
    if (id === 'cultus') return ['tree', 'house', 'tree', 'car', 'streetlight', 'tree', 'house'];
    if (id === 'south') return ['house', 'apt', 'tree', 'car', 'streetlight', 'house', 'shop'];
    return ['house', 'tree', 'streetlight', 'car', 'house', 'tree', 'streetlight', 'car'];
  }

  function spawnProp(atX) {
    if (!fly) return;
    const kinds = districtPropKinds();
    const x0 = atX != null ? atX : fly.scrollX + CW + W.rand(16, 90);
    fly.props.push({ x: x0, kind: W.pick(kinds) });
    if (Math.random() < 0.62) {
      fly.props.push({ x: x0 + W.rand(28, 64), kind: W.pick(kinds) });
    }
  }

  function spawnFlyTarget(atX) {
    if (!fly) return;
    const human = Math.random() < 0.65;
    const kind = human ? W.pick(W.PEOPLE_KINDS) : W.pick(W.HAZARD_KINDS);
    fly.targets.push({
      x: atX != null ? atX : fly.scrollX + CW + W.rand(80, 280),
      kind: kind,
      wobble: W.rand(0, Math.PI * 2),
      beamed: false,
    });
  }

  // ——— Input ———
  function inputX() {
    let v = 0;
    if (keys['arrowleft'] || keys['a'] || touchDirs.left) v -= 1;
    if (keys['arrowright'] || keys['d'] || touchDirs.right) v += 1;
    return v;
  }

  function inputY() {
    let v = 0;
    if (keys['arrowup'] || keys['w'] || touchDirs.up) v -= 1;
    if (keys['arrowdown'] || keys['s'] || touchDirs.down) v += 1;
    return v;
  }

  function wantsJump() {
    if (jumpQueued) { jumpQueued = false; return true; }
    return false;
  }

  function upHeld() {
    return !!(keys['arrowup'] || keys['w'] || touchDirs.up);
  }

  /** Zakk holds a lit joint — Up drives mouth-puff instead of generic interact */
  function canPuffJoint() {
    if (mode !== 'shed') return false;
    if (smokeDone || ufoLanding) return true;
    // After light complete: awaiting / in smoke step
    if (jointStage === 'smoke') {
      if (jointPhase === 'anim') {
        const idx = jointStageIndex('smoke');
        const dur = idx >= 0 ? JOINT_STEPS[idx].dur : 64;
        // After handoff (~70% of smoke anim)
        return jointTimer / Math.max(1, dur) >= 0.7;
      }
      return true;
    }
    if (jointPhase === 'await' && jointStepIndex >= 3) return true;
    return false;
  }

  function zakkPuffing() {
    return puffTimer > 0 && canPuffJoint();
  }

  function puffProg() {
    if (puffTimer <= 0) return 0;
    // Count-down timer: strong at start, soft fade at end
    return Math.max(0, Math.min(1, puffTimer / 22));
  }

  function interactHeld() {
    const useKeys = !!(keys['e'] || keys['enter']);
    const upKeys = upHeld();
    // While holding lit joint (and not at open exit door), Up is for puffing
    if (canPuffJoint() && !(nearDoor() && ufoLanded())) {
      return useKeys;
    }
    return !!(useKeys || upKeys);
  }

  function wantsInteract() {
    if (interactQueued) { interactQueued = false; return true; }
    const held = interactHeld();
    const edge = held && !prevInteractHeld;
    prevInteractHeld = held;
    return edge;
  }

  /** Tick / edge-start mouth puff from Up while Zakk has lit joint */
  function updatePuffInput() {
    if (puffTimer > 0) puffTimer--;
    if (!canPuffJoint()) {
      prevUpHeld = upHeld();
      return;
    }
    // At open exit door, Up stays interact — skip puff steal
    if (nearDoor() && ufoLanded()) {
      prevUpHeld = upHeld();
      return;
    }
    const up = upHeld();
    if (up) {
      if (!prevUpHeld) {
        puffTimer = 32;
        Audio.play('smoke');
      } else if (puffTimer < 6) {
        // sustain while held
        puffTimer = 28;
        if (Math.random() < 0.35) Audio.play('smoke');
      }
    }
    prevUpHeld = up;
  }

  function beamHeld() {
    return !!(keys[' '] || keys['space'] || keys['b']);
  }

  function wantsBeamEdge() {
    if (beamQueued) { beamQueued = false; return true; }
    const held = beamHeld();
    const edge = held && !prevBeamHeld;
    prevBeamHeld = held;
    return edge;
  }

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) || e.code === 'Space') {
      e.preventDefault();
    }
    if (k === 'm') {
      gestureUnlock();
      Audio.toggle();
      updateMuteUI();
    }
    if ((k === 'enter' || k === ' ') && mode === 'title') insertCassetteAndStart();
    if ((k === 'enter' || k === ' ') && mode === 'results') startGame();

    if (k === 'e' || k === 'enter') {
      if (mode === 'fly') {
        if (k === 'e') beamQueued = true;
      } else if (mode === 'shed' || mode === 'yard' || mode === 'ship') {
        interactQueued = true;
      }
    }
    if ((k === 'arrowup' || k === 'w') && (mode === 'shed' || mode === 'yard' || mode === 'ship')) {
      // Lit-joint Up → mouth puff (handled in updatePuffInput); keep Up-as-interact otherwise
      if (!(mode === 'shed' && canPuffJoint() && !(nearDoor() && ufoLanded()))) {
        interactQueued = true;
      }
    }

    if ((e.code === 'Space' || k === ' ')) {
      if (mode === 'fly') beamQueued = true;
      else if (mode === 'shed' || mode === 'yard' || mode === 'ship') jumpQueued = true;
    }

    if (k === 'b' && mode === 'fly') beamQueued = true;

    if (k === 'enter' && mode === 'fly') {
      endMission();
    }
    if ((k === 'x' || k === 'delete' || k === 'backspace') && mode === 'fly') {
      triggerSelfDestruct();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  canvas.addEventListener('click', () => {
    if (mode === 'title') insertCassetteAndStart();
    else if (mode === 'shed' || mode === 'yard' || mode === 'ship') interactQueued = true;
  });

  function bindTitleInsert(node) {
    if (!node) return;
    const go = (e) => {
      e.preventDefault();
      insertCassetteAndStart();
    };
    node.addEventListener('click', go);
    node.addEventListener('touchstart', go, { passive: false });
  }
  bindTitleInsert(el.menuCassette);
  bindTitleInsert(el.cassetteSlot);

  el.btnAgain.addEventListener('click', startGame);
  el.btnTitle.addEventListener('click', () => {
    Audio.play('ui');
    Audio.stopTheme();
    mode = 'title';
    tapeInStereo = true;
    smoking = false;
    smokeProgress = 0;
    smokeDone = false;
    windowUfo = 0;
    jointStage = null;
    jointPhase = null;
    jointStepIndex = 0;
    jointTimer = 0;
    ufoLanding = false;
    puffTimer = 0;
    prevUpHeld = false;
    boardSit = null;
    syncInvHud();
    resetStereoTitleUI();
    showScreen('title');
    el.titleHigh.textContent = 'High Score: ' + getHigh();
    fetchPlayCount();
  });
  el.muteBtn.addEventListener('click', () => {
    gestureUnlock();
    Audio.toggle();
    updateMuteUI();
  });

  function bindTouchBtn(btn, dir) {
    const on = (e) => { e.preventDefault(); touchDirs[dir] = true; };
    const off = (e) => { e.preventDefault(); touchDirs[dir] = false; };
    btn.addEventListener('touchstart', on, { passive: false });
    btn.addEventListener('touchend', off, { passive: false });
    btn.addEventListener('touchcancel', off, { passive: false });
    btn.addEventListener('mousedown', on);
    btn.addEventListener('mouseup', off);
    btn.addEventListener('mouseleave', off);
  }
  document.querySelectorAll('#pad-left [data-dir]').forEach((btn) => {
    bindTouchBtn(btn, btn.getAttribute('data-dir'));
  });

  el.btnBeam.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (mode === 'fly') beamQueued = true;
    else if (mode === 'shed' || mode === 'yard' || mode === 'ship') interactQueued = true;
  }, { passive: false });
  el.btnBeam.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (mode === 'fly') beamQueued = true;
    else if (mode === 'shed' || mode === 'yard' || mode === 'ship') interactQueued = true;
  });

  function onInteractPointer(e) {
    e.preventDefault();
    if (mode === 'fly') {
      beamQueued = true;
      return;
    }
    interactQueued = true;
  }
  el.btnInteract.addEventListener('touchstart', onInteractPointer, { passive: false });
  el.btnInteract.addEventListener('mousedown', onInteractPointer);

  function onDestructPointer(e) {
    e.preventDefault();
    triggerSelfDestruct();
  }
  if (el.btnDestruct) {
    el.btnDestruct.addEventListener('touchstart', onDestructPointer, { passive: false });
    el.btnDestruct.addEventListener('mousedown', onDestructPointer);
  }
  if (el.hudDestruct) {
    el.hudDestruct.addEventListener('click', () => triggerSelfDestruct());
  }

  // ——— Physics ———
  function updateSideScroller(worldW) {
    // ~1.8× prior walk feel — still controllable in shed/yard
    const accel = 0.95;
    const maxSpd = 7.6;
    const friction = 0.80;
    const grav = 0.62;
    const jumpV = -11.4;

    const ix = inputX();
    avatar.vx += ix * accel;
    avatar.vx *= friction;
    if (Math.abs(avatar.vx) > maxSpd) avatar.vx = Math.sign(avatar.vx) * maxSpd;
    if (ix !== 0) avatar.facing = ix > 0 ? 1 : -1;

    if (avatar.onGround) {
      const touchJump = touchDirs.up && !nearInteract();
      if (wantsJump() || touchJump) {
        avatar.vy = jumpV;
        avatar.onGround = false;
        jumpQueued = false;
      }
    }

    avatar.vy += grav;
    avatar.x += avatar.vx;
    avatar.y += avatar.vy;

    if (avatar.y >= GROUND) {
      avatar.y = GROUND;
      avatar.vy = 0;
      avatar.onGround = true;
    }

    avatar.x = Math.max(40, Math.min(worldW - 40, avatar.x));
    camX = Math.max(0, Math.min(Math.max(0, worldW - CW), avatar.x - CW * 0.4));
  }

  function nearDoor() {
    if (mode !== 'shed' || !avatar) return false;
    return Math.abs(avatar.x - W.SHED_DOOR_X) < 50;
  }

  function nearYardShedDoor() {
    if (mode !== 'yard' || !avatar) return false;
    return Math.abs(avatar.x - W.YARD_SHED_DOOR_X) < 55;
  }

  function nearTaylerSesh() {
    if (mode !== 'shed' || !avatar || !tayler) return false;
    if (smokeDone || ufoLanding) return false;
    if (jointPhase === 'anim') return false;
    // Allow starting / advancing steps while near Tayler
    return Math.abs(avatar.x - tayler.x) < 72;
  }

  function ufoLanded() {
    return windowUfo >= 0.98;
  }

  function nearInteract() {
    if (mode === 'shed') {
      return nearTaylerSesh() || nearDoor();
    }
    if (mode === 'yard' && landing && landing.phase === 'landed') {
      return Math.abs(avatar.x - landing.x) < 110;
    }
    if (mode === 'ship' && !boardSit && avatar) {
      return Math.abs(avatar.x - W.SHIP_HELM_X) < 90;
    }
    return false;
  }

  function beginJointStep(step) {
    smoking = true;
    jointPhase = 'anim';
    jointStage = step.id;
    jointTimer = 0;
    Audio.play('ui');
    showFlash(step.prompt, 90);
    W.burst(particles, tayler.x - camX, GROUND - 50, '#c8e8a0', 10);
    W.addFloater(floaters, tayler.x - camX, GROUND - 80, step.prompt, '#c8e8a0');
    if (step.id === 'light') {
      // sfx during anim
    }
    if (step.id === 'smoke') {
      Audio.play('smoke');
    }
    syncInteractBtn();
  }

  // ——— Updates ———
  function updateShed() {
    updatePuffInput();
    // Press-to-advance joint: get high → roll → light → smoke → UFO lands
    if (jointPhase === 'anim' && jointStage && !smokeDone) {
      jointTimer++;
      const idx = jointStageIndex(jointStage);
      const stage = JOINT_STEPS[idx];
      const stageProg = Math.min(1, jointTimer / Math.max(1, stage.dur));
      smokeProgress = jointOverallProgress();
      setPrompt(stage.prompt + ' — ' + stage.label);

      if (jointStage === 'light' && jointTimer === 8) Audio.play('smoke');
      if (jointStage === 'roll' && jointTimer === 4) Audio.play('ui');
      if (jointStage === 'smoke' && jointTimer === 10) Audio.play('smoke');
      if (jointStage === 'smoke' && Math.random() < 0.03) Audio.play('smoke');

      if (jointTimer >= stage.dur) {
        if (idx >= JOINT_STEPS.length - 1) {
          // After Smoke — UFO appears / lands in the shed window
          jointPhase = null;
          jointStage = 'smoke';
          smoking = true;
          ufoLanding = true;
          windowUfo = 0.02;
          Audio.play('landing');
          showFlash('Dude… the window! Mothership inbound!', 120);
          W.addFloater(floaters, tayler.x - camX, GROUND - 90, 'UFO!', '#7dff3a');
        } else {
          jointStepIndex = idx + 1;
          jointPhase = 'await';
          jointStage = JOINT_STEPS[jointStepIndex].id;
          jointTimer = 0;
          const next = JOINT_STEPS[jointStepIndex];
          showFlash('▲ ' + next.prompt, 80);
          syncInteractBtn();
        }
      }

      avatar.vx *= 0.45;
      updateSideScroller(W.SHED_WORLD_W);
      syncInteractBtn();
      return;
    }

    // Auto UFO land after smoke step (door unlocks when landed)
    if (ufoLanding && !smokeDone) {
      windowUfo = Math.min(1, windowUfo + 0.012);
      smokeProgress = jointOverallProgress();
      if (Math.random() < 0.03) Audio.play('smoke');
      setPrompt('Watch the window — mothership landing…');
      if (windowUfo >= 0.98) {
        windowUfo = 1;
        ufoLanding = false;
        smokeDone = true;
        smoking = false;
        smokeProgress = 1;
        jointStage = null;
        jointPhase = null;
        Audio.play('landing');
        Audio.play('power');
        showFlash('Mothership landed! Head for EXIT →', 130);
        W.addFloater(floaters, tayler.x - camX, GROUND - 90, 'LANDED', '#7dff3a');
      }
      avatar.vx *= 0.55;
      updateSideScroller(W.SHED_WORLD_W);
      syncInteractBtn();
      return;
    }

    updateSideScroller(W.SHED_WORLD_W);

    if (tayler && Math.abs(avatar.x - tayler.x) < 60 && Math.random() < 0.01 && jointPhase == null && !smokeDone) {
      showFlash(W.pick(W.SHED_GAGS), 100);
    }

    if (nearTaylerSesh()) {
      const step = currentJointPrompt();
      if (step) {
        if (canPuffJoint() && step.id === 'smoke') {
          setPrompt('↑ puff · E / USE — ' + step.prompt);
        } else {
          setPrompt('↑ / E / USE — ' + step.prompt);
        }
        if (wantsInteract()) {
          beginJointStep(step);
        }
      }
    } else if (nearDoor()) {
      if (!ufoLanded()) {
        let msg;
        if (!smokeDone && !ufoLanding) {
          msg = 'Hang with Tayler first — then the mothership lands';
        } else {
          msg = 'Wait for it to land…';
        }
        setPrompt(msg);
        prevInteractHeld = interactHeld();
        if (wantsInteract()) {
          showFlash(!smokeDone ? 'get high with T first!' : 'Wait for it to land…', 100);
          Audio.play('hit');
        }
      } else {
        setPrompt('↑ / E / USE — Leave the shed');
        if (wantsInteract()) {
          enterYard();
          return;
        }
      }
    } else {
      prevInteractHeld = interactHeld();
      if (canPuffJoint() && !smokeDone && !ufoLanding) {
        const step = currentJointPrompt();
        setPrompt(step ? '↑ puff · walk to Tayler — ' + step.prompt : '↑ puff');
      } else if (!smokeDone && !ufoLanding) {
        const step = currentJointPrompt();
        setPrompt(step ? 'Walk to Tayler — ' + step.prompt : 'Walk up to Tayler');
      } else if (!ufoLanded()) {
        setPrompt(canPuffJoint() ? '↑ puff · watch the window — landing…' : 'Watch the window — wait for it to land…');
      } else {
        setPrompt(canPuffJoint() ? '↑ puff · ← → walk · EXIT →' : '← → walk · UFO landed · EXIT →');
      }
    }
    syncInteractBtn();
  }

  function updateYard() {
    updateSideScroller(1200);
    if (landing) landing.timer++;

    if (tayler && landing && landing.phase === 'landed') {
      const tx = landing.x - 50;
      if (tayler.x < tx - 4) tayler.x += 1.2;
      else if (tayler.x > tx + 4) tayler.x -= 1.2;
    }

    // Prefer shed door when near it (left side) over boarding
    if (nearYardShedDoor()) {
      setPrompt('↑ / E / USE — enter the shed');
      if (wantsInteract()) {
        returnToShed();
        return;
      }
      syncInteractBtn();
      return;
    }

    if (landing && landing.phase === 'landed') {
      if (nearInteract()) {
        setPrompt('↑ / E / USE — board the mothership');
        if (wantsInteract()) {
          Audio.play('power');
          Audio.play('ui');
          showFlash('Boarding the mothership…', 80);
          enterShip();
          return;
        }
      } else {
        prevInteractHeld = interactHeld();
        setPrompt('← shed · mothership →  Walk to board');
      }
    } else {
      prevInteractHeld = interactHeld();
      setPrompt('← → walk · enter shed on the left');
    }
    syncInteractBtn();
  }

  function updateShip() {
    if (boardSit) {
      boardSit.timer++;
      if (!boardSit.phase || boardSit.phase === 'yield') {
        setPrompt('Aliens yield the controls…');
        boardSit.alienYield = Math.min(1, boardSit.timer / 24);
        if (boardSit.timer > 26) {
          boardSit.phase = 'sit';
          boardSit.timer = 0;
          boardSit.seatTaken = true;
          boardSit.alienYield = 1;
          Audio.play('ui');
          showFlash("Taking the driver's seat…", 80);
        }
        return;
      }
      if (boardSit.phase === 'sit') {
        setPrompt("Sitting in the driver's seat…");
        boardSit.seatTaken = true;
        boardSit.alienYield = 1;
        if (boardSit.timer > 22) {
          boardSit.phase = 'takeoff';
          boardSit.timer = 0;
          Audio.play('power');
          showFlash('Legs tucking — liftoff!', 90);
        }
        return;
      }
      // Brief takeoff beat then free flight
      setPrompt('Landing legs tucking in — liftoff…');
      boardSit.seatTaken = true;
      boardSit.alienYield = 1;
      boardSit.tuck = Math.min(1, boardSit.timer / 36);
      if (boardSit.timer > 40) {
        enterFly();
        return;
      }
      return;
    }

    updateSideScroller(W.SHIP_WORLD_W);

    if (nearInteract()) {
      setPrompt("↑ / E / USE — take the driver's seat");
      if (wantsInteract()) {
        Audio.play('power');
        Audio.play('ui');
        boardSit = { timer: 0, phase: 'yield', alienYield: 0, seatTaken: false };
        showFlash('Excuse me, green dudes — mind if I drive?', 100);
        return;
      }
    } else {
      prevInteractHeld = interactHeld();
      setPrompt("Walk to the aliens / take the driver's seat");
    }
    syncInteractBtn();
  }

  function updateFly() {
    const ix = inputX();
    const iy = inputY();

    fly.vx += ix * 0.45;
    fly.vy += iy * 0.35;
    fly.vx *= 0.88;
    fly.vy *= 0.88;
    fly.vx = Math.max(-5.5, Math.min(5.5, fly.vx));
    fly.vy = Math.max(-4, Math.min(4, fly.vy));

    fly.ufoX += fly.vx;
    fly.ufoY += fly.vy;
    // Soft edge push: near screen edge, convert leftover intent into scroll
    const edgeL = 90;
    const edgeR = CW - 90;
    let scrollDelta = 0;
    if (fly.ufoX < edgeL && fly.vx < 0) {
      scrollDelta += fly.vx * 1.35;
      fly.ufoX = edgeL;
    } else if (fly.ufoX > edgeR && fly.vx > 0) {
      scrollDelta += fly.vx * 1.35;
      fly.ufoX = edgeR;
    } else {
      // Player-driven world scroll from horizontal flight (no auto-advance)
      scrollDelta = fly.vx * 1.05;
    }
    fly.ufoX = Math.max(50, Math.min(CW - 50, fly.ufoX));
    fly.ufoY = Math.max(50, Math.min(CH * 0.62, fly.ufoY));

    fly.scrollX = Math.max(0, fly.scrollX + scrollDelta);

    // District from how far south you've flown (scrollX), not a free timer
    const newDistrict = Math.min(
      W.DISTRICTS.length - 1,
      Math.floor(fly.scrollX / 900)
    );
    if (newDistrict !== fly.districtIndex) {
      fly.districtIndex = newDistrict;
      syncHud();
      showFlash(W.DISTRICTS[fly.districtIndex].name, 90);
    }

    if (fly.moonJuice > 0) {
      fly.moonJuice--;
      fly.beamWide = true;
    } else {
      fly.beamWide = false;
    }

    if (Math.random() < 0.0015 && fly.moonJuice <= 0) {
      fly.moonJuice = 280;
      Audio.play('power');
      showFlash('MOON JUICE! Wider beam!', 100);
    }

    fly.propTimer--;
    if (fly.propTimer <= 0) {
      // Spawn ahead of travel direction (player-driven reveal)
      if (scrollDelta >= 0) spawnProp(fly.scrollX + CW + W.rand(20, 100));
      else spawnProp(fly.scrollX - W.rand(40, 120));
      fly.propTimer = W.rand(16, 36);
    }
    fly.props = fly.props.filter((p) => p.x > fly.scrollX - 220 && p.x < fly.scrollX + CW + 320);

    fly.spawnTimer--;
    if (fly.spawnTimer <= 0) {
      if (scrollDelta >= 0) spawnFlyTarget(fly.scrollX + CW + W.rand(80, 280));
      else spawnFlyTarget(fly.scrollX - W.rand(60, 200));
      fly.spawnTimer = W.rand(45, 95);
    }
    fly.targets = fly.targets.filter((tg) => tg.x > fly.scrollX - 160 && tg.x < fly.scrollX + CW + 280 && !tg.beamed);

    const fireEdge = wantsBeamEdge();
    const holdBeam = beamHeld();
    if ((fireEdge || holdBeam) && fly.beamTimer <= 5) {
      if (!fly.beaming) Audio.play('beam');
      fly.beaming = true;
      fly.beamTimer = 18;
      tryFlyBeam();
    }
    if (fly.beamTimer > 0) {
      fly.beamTimer--;
      if (fly.beamTimer < 8) fly.beaming = false;
    } else {
      fly.beaming = false;
      prevBeamHeld = holdBeam;
    }

    if (fly.invuln > 0) fly.invuln--;
    if (fly.hitFlash > 0) fly.hitFlash--;
    if (fly.shake > 0) {
      fly.shake--;
      fly.shakeX = (Math.random() - 0.5) * fly.shake * 0.7;
      fly.shakeY = (Math.random() - 0.5) * fly.shake * 0.7;
    } else {
      fly.shakeX = 0;
      fly.shakeY = 0;
    }

    if ((t / 16 | 0) % 40 === 0) {
      score += 1;
      syncHud();
    }

    setPrompt('←→↑↓ fly · Space / USE beam · green=people · red=DON\'T · Enter end');
    syncHud();
  }

  function tryFlyBeam() {
    if (!fly) return;
    const half = (fly.beamWide ? 96 : 64) / 2;
    const beamWorldX = fly.scrollX + fly.ufoX;
    let hit = false;
    for (const tg of fly.targets) {
      if (tg.beamed) continue;
      if (Math.abs(tg.x - beamWorldX) < half + 16) {
        tg.beamed = true;
        hit = true;
        if (tg.kind.human) {
          const pts = tg.kind.points + (fly.beamWide ? 40 : 0);
          score += pts;
          beamed++;
          W.burst(particles, fly.ufoX, CH * 0.7, '#7dff3a', 14);
          W.addFloater(floaters, fly.ufoX, CH * 0.55, '+' + pts, '#7dff3a');
          Audio.play('score');
          if (Math.random() < 0.45) showFlash(W.pick(W.ONE_LINERS), 130);
          else showFlash('Beamed: ' + tg.kind.label + '!', 70);
        } else {
          if (fly.invuln <= 0) {
            fly.lives--;
            fly.invuln = 50;
            fly.hitFlash = 32;
            fly.shake = 26;
            score = Math.max(0, score - 50);
            W.burst(particles, fly.ufoX, fly.ufoY + 20, '#ff6644', 16);
            W.addFloater(floaters, fly.ufoX, fly.ufoY, '-HULL', '#ff6644');
            Audio.play('hit');
            showFlash(W.pick(W.BAD_BEAM_LINERS), 120);
            if (fly.lives <= 0) {
              showFlash('Ship too toasted — emergency debrief!', 120);
              setTimeout(function () {
                if (mode === 'fly') endMission();
              }, 700);
            }
          }
        }
      }
    }
    if (!hit) {
      W.burst(particles, fly.ufoX, fly.ufoY + 40, '#88ffaa', 3);
    }
    syncHud();
  }

  function update() {
    if (selfDestructing) {
      destructTimer++;
      if (fly) {
        fly.shake = Math.max(fly.shake, 28);
        fly.hitFlash = Math.max(fly.hitFlash, 24);
        if (destructTimer % 4 === 0) {
          W.burst(particles, fly.ufoX + (Math.random() - 0.5) * 80, fly.ufoY + (Math.random() - 0.5) * 50, '#ff4422', 10);
          W.burst(particles, fly.ufoX, fly.ufoY, '#ffcc66', 8);
        }
      }
      if (destructTimer > 55) goToTitleMenu();
      return;
    }
    if (mode === 'shed') updateShed();
    else if (mode === 'yard') updateYard();
    else if (mode === 'ship') updateShip();
    else if (mode === 'fly') updateFly();

    W.updateFx(particles, floaters);
    if (flashTimer > 0) flashTimer--;
    else flashMsg = null;
  }

  function drawFlash() {
    if (!flashMsg || flashTimer <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, flashTimer / 20);
    ctx.font = 'bold 14px Segoe UI, sans-serif';
    const tw = ctx.measureText(flashMsg).width;
    const x = (CW - tw) / 2;
    const y = 70;
    ctx.fillStyle = 'rgba(10,30,16,0.85)';
    ctx.fillRect(x - 12, y - 18, tw + 24, 28);
    ctx.strokeStyle = '#7dff3a';
    ctx.strokeRect(x - 12, y - 18, tw + 24, 28);
    ctx.fillStyle = '#e8ffe0';
    ctx.fillText(flashMsg, x, y);
    ctx.restore();
  }

  function draw() {
    if (mode === 'title') {
      W.drawTitleBackdrop(ctx, CW, CH, t);
      return;
    }
    if (mode === 'results') {
      W.drawTitleBackdrop(ctx, CW, CH, t);
      ctx.fillStyle = 'rgba(5,20,10,0.45)';
      ctx.fillRect(0, 0, CW, CH);
      return;
    }

    if (mode === 'shed') {
      // Lit only after mid light progress, or smoke / done / landing
      let lightProg = 0;
      if (jointStage === 'light' && jointPhase === 'anim') {
        const li = jointStageIndex('light');
        const ld = li >= 0 ? JOINT_STEPS[li].dur : 42;
        lightProg = Math.min(1, jointTimer / Math.max(1, ld));
      }
      const jointLit = smokeDone || ufoLanding || jointStage === 'smoke' ||
        (jointStage === 'light' && lightProg >= 0.45) ||
        (jointPhase === 'await' && jointStepIndex >= 3);
      // Mute ashtray ambient during active unlit sesh (reads as joint smoke)
      const inUnlitSesh = !jointLit && (smoking || jointPhase === 'await' || jointPhase === 'anim');
      W.drawShed(ctx, CW, CH, camX, t, {
        cassetteTaken: true,
        tapeInStereo: true,
        windowUfo: windowUfo,
        doorLocked: !ufoLanded(),
        smoking: smoking || ufoLanding,
        smokeProgress: smokeProgress,
        jointLit: jointLit,
        ashSmoke: !inUnlitSesh,
      });
      // Sesh anim owns the joint prop — avoid double-drawing on characters
      const seshOwnsJoint = (jointPhase === 'anim' || ufoLanding) && !!jointStage &&
        (jointStage === 'gethigh' || jointStage === 'roll' || jointStage === 'light' || jointStage === 'smoke');
      // During late smoke anim (post-handoff), let Zakk draw joint for Up-puff
      const smokeAnimLate = jointStage === 'smoke' && jointPhase === 'anim' && (() => {
        const idx = jointStageIndex('smoke');
        const dur = idx >= 0 ? JOINT_STEPS[idx].dur : 64;
        return jointTimer / Math.max(1, dur) >= 0.7;
      })();
      const showCharJoint = (!seshOwnsJoint || smokeAnimLate) && (
        smokeDone || ufoLanding || smokeAnimLate ||
        (jointPhase === 'await' && jointStepIndex >= 2) ||
        (jointStage === 'smoke' && jointPhase !== 'anim')
      );
      const isPuffing = zakkPuffing();
      const pProg = puffProg();
      if (tayler) {
        // Tayler holds through roll/light await; after pass Zakk has it (no free plumes)
        const taylerHolds = showCharJoint && !smokeAnimLate &&
          !(smokeDone || ufoLanding || jointStage === 'smoke' || jointStepIndex >= 3);
        W.drawTayler(ctx, tayler.x - camX, tayler.y, 1, false, t, {
          seated: true,
          smoking: taylerHolds,
          jointLit: jointLit,
          puffing: false,
          heavySmoke: false,
        });
      }
      W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, {
        smoking: showCharJoint && (smokeDone || ufoLanding || jointStage === 'smoke' || jointStepIndex >= 3 || smokeAnimLate),
        jointLit: jointLit,
        puffing: isPuffing,
        puffProg: pProg,
        heavySmoke: false,
      });
      if ((jointPhase === 'anim' || ufoLanding) && jointStage && tayler && !smokeAnimLate) {
        const idx = jointStageIndex(jointStage);
        const stage = idx >= 0 ? JOINT_STEPS[idx] : { dur: 64 };
        const stageProg = jointPhase === 'anim'
          ? Math.min(1, jointTimer / Math.max(1, stage.dur))
          : 1;
        const drawStage = jointStage === 'gethigh' ? 'paper' : jointStage;
        W.drawJointSesh(
          ctx,
          tayler.x - camX,
          tayler.y,
          avatar.x - camX,
          avatar.y,
          drawStage,
          stageProg,
          t
        );
      }
      if (nearTaylerSesh()) {
        const step = currentJointPrompt();
        if (step) {
          const bob = Math.sin(t * 0.01) * 3;
          ctx.fillStyle = '#7dff3a';
          ctx.font = 'bold 15px Segoe UI, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('▲ ' + step.prompt, tayler.x - camX, GROUND - 118 + bob);
          // On-canvas button chip
          const label = step.btn;
          ctx.font = 'bold 13px Segoe UI, sans-serif';
          const tw = ctx.measureText(label).width;
          const bx = tayler.x - camX - tw / 2 - 14;
          const by = GROUND - 108 + bob;
          ctx.fillStyle = 'rgba(10,30,16,0.88)';
          ctx.strokeStyle = '#7dff3a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          const rw = tw + 28, rh = 28, rr = 8;
          ctx.moveTo(bx + rr, by);
          ctx.arcTo(bx + rw, by, bx + rw, by + rh, rr);
          ctx.arcTo(bx + rw, by + rh, bx, by + rh, rr);
          ctx.arcTo(bx, by + rh, bx, by, rr);
          ctx.arcTo(bx, by, bx + rw, by, rr);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#e8ffe0';
          ctx.fillText(label, tayler.x - camX, by + 19);
          ctx.textAlign = 'left';
        }
      }
      if ((smoking || ufoLanding || jointPhase === 'await') && !smokeDone) {
        const step = jointStage ? JOINT_STEPS[jointStageIndex(jointStage)] : currentJointPrompt();
        const banner = jointPhase === 'await' && currentJointPrompt()
          ? ('▲ ' + currentJointPrompt().prompt)
          : (step ? (step.prompt + ' — ' + step.label) : '…');
        ctx.fillStyle = 'rgba(10,30,16,0.78)';
        ctx.fillRect(CW / 2 - 170, 44, 340, 36);
        ctx.strokeStyle = '#c8e8a0';
        ctx.strokeRect(CW / 2 - 170, 44, 340, 36);
        ctx.fillStyle = '#e8ffe0';
        ctx.font = 'bold 13px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(banner, CW / 2, 67);
        ctx.textAlign = 'left';
        const chips = ['get high', 'roll', 'light', 'smoke'];
        const chipMap = { gethigh: 0, roll: 1, light: 2, smoke: 3 };
        const active = chipMap[jointStage] != null ? chipMap[jointStage] : jointStepIndex;
        for (let i = 0; i < chips.length; i++) {
          const cx = CW / 2 - 150 + i * 76;
          ctx.fillStyle = i === active ? '#9dff6a' : 'rgba(80,100,70,0.7)';
          ctx.fillRect(cx, 86, 70, 14);
          ctx.fillStyle = i === active ? '#102010' : '#c8e0b8';
          ctx.font = 'bold 9px Segoe UI, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(chips[i], cx + 35, 96);
        }
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(CW / 2 - 80, 106, 160, 7);
        ctx.fillStyle = '#9dff6a';
        ctx.fillRect(CW / 2 - 80, 106, 160 * smokeProgress, 7);
      }
      if (nearDoor()) {
        ctx.fillStyle = ufoLanded() ? '#7dff3a' : '#ff8866';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        let doorLabel = '▲ ENTER';
        if (!ufoLanded()) {
          if (!smokeDone && !ufoLanding) doorLabel = '▲ get high with T';
          else doorLabel = '▲ WAIT FOR LANDING';
        }
        ctx.fillText(doorLabel, W.SHED_DOOR_X - camX, GROUND - 170);
        ctx.textAlign = 'left';
      }
    } else if (mode === 'yard') {
      W.drawYard(ctx, CW, CH, camX, t, landing);
      if (tayler) {
        const tMoving = landing && landing.phase === 'landed';
        W.drawTayler(ctx, tayler.x - camX, tayler.y, 1, tMoving, t, {});
      }
      W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, {});
      if (nearYardShedDoor()) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ ENTER SHED', W.YARD_SHED_DOOR_X - camX, GROUND - 100);
        ctx.textAlign = 'left';
      } else if (landing && landing.phase === 'landed' && nearInteract()) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ BOARD MOTHERSHIP', landing.x - camX, landing.y - 70);
        ctx.textAlign = 'left';
      }
    } else if (mode === 'ship') {
      const yieldAmt = boardSit && boardSit.alienYield != null ? boardSit.alienYield : 0;
      const seatTaken = !!(boardSit && boardSit.seatTaken);
      W.drawShipInterior(ctx, CW, CH, camX, t, {
        alienYield: yieldAmt,
        seatTaken: seatTaken,
      });
      if (!boardSit || boardSit.phase === 'yield') {
        W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, {});
      }
      if (!boardSit && nearInteract()) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("▲ DRIVER'S SEAT", W.SHIP_HELM_X - camX, GROUND - 120);
        ctx.textAlign = 'left';
      }
      if (boardSit) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 18px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        if (boardSit.phase === 'takeoff') {
          ctx.fillText('Landing legs tucking in…', CW / 2, 90);
          const ext = 1 - (boardSit.tuck != null ? boardSit.tuck : 0);
          ctx.fillStyle = 'rgba(10,30,16,0.75)';
          ctx.fillRect(CW / 2 - 70, 102, 140, 12);
          ctx.fillStyle = '#88c8ff';
          ctx.fillRect(CW / 2 - 68, 104, 136 * ext, 8);
          ctx.fillStyle = '#c8e0ff';
          ctx.font = 'bold 10px Segoe UI, sans-serif';
          ctx.fillText(ext > 0.5 ? 'GEAR DOWN' : 'GEAR UP', CW / 2, 126);
        } else if (boardSit.phase === 'sit') {
          ctx.fillText("Taking the driver's seat…", CW / 2, 90);
        } else {
          ctx.fillText('Aliens step aside…', CW / 2, 90);
        }
        ctx.textAlign = 'left';
      }
    } else if (mode === 'fly') {
      W.drawFlyScene(ctx, CW, CH, fly, t);
    }

    W.drawFx(ctx, particles, floaters);
    drawFlash();

    if (mode === 'fly' && fly && fly.moonJuice > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(CW / 2 - 60, 36, 120, 8);
      ctx.fillStyle = '#44ddff';
      ctx.fillRect(CW / 2 - 60, 36, 120 * (fly.moonJuice / 280), 8);
    }
  }

  function frame(ts) {
    const dt = Math.min(50, ts - lastTs || 16);
    lastTs = ts;
    t += dt;

    if (mode !== 'title' && mode !== 'results') {
      update();
    }

    draw();
    requestAnimationFrame(frame);
  }

  el.titleHigh.textContent = 'High Score: ' + getHigh();
  updateMuteUI();
  showScreen('title');
  syncBeamUi();
  fetchPlayCount();
  // Warm theme element on load (fetch only — play still needs a gesture)
  if (Audio && Audio.warm) Audio.warm();
  requestAnimationFrame(frame);

  function fitCanvas() {
    const wrap = document.getElementById('game-wrap');
    const maxW = wrap.clientWidth;
    const maxH = wrap.clientHeight;
    const scale = Math.min(maxW / CW, maxH / CH);
    canvas.style.width = Math.floor(CW * scale) + 'px';
    canvas.style.height = Math.floor(CH * scale) + 'px';
  }
  window.addEventListener('resize', fitCanvas);
  fitCanvas();
})();
