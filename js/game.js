/**
 * Mothership — Chilliwack skies
 * Flow: title → shed (grab→stereo→smoke with Tayler→land) → yard (board/sit) → fly → results
 * (no cockpit cassette / boarding cutscene). Pilots: Zakk & Tayler
 * Fly scroll is player-driven (no auto-scroll).
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
    resBeamed: document.getElementById('res-beamed'),
    resScore: document.getElementById('res-score'),
    resHigh: document.getElementById('res-high'),
    resLiner: document.getElementById('res-liner'),
    muteBtn: document.getElementById('mute-btn'),
    touch: document.getElementById('touch'),
    btnStart: document.getElementById('btn-start'),
    btnAgain: document.getElementById('btn-again'),
    btnTitle: document.getElementById('btn-title'),
    btnBeam: document.getElementById('btn-beam'),
    btnInteract: document.getElementById('btn-interact'),
    invCassette: document.getElementById('inv-cassette'),
  };

  const keys = Object.create(null);
  const touchDirs = Object.create(null);
  let interactQueued = false;
  let beamQueued = false;
  let jumpQueued = false;
  let prevInteractHeld = false;
  let prevBeamHeld = false;

  // title | shed | yard | fly | results
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
  let hasCassette = false;
  /** Cassette inserted in shed stereo — theme playing */
  let tapeInStereo = false;
  /** Shared sesh with Tayler active */
  let smoking = false;
  /** 0..1 smoke beat progress (joint + puffs); UFO lands during this */
  let smokeProgress = 0;
  /** Finished smoking with Tayler (UFO land gate complete) */
  let smokeDone = false;
  /** 0..1 UFO fly-in in shed window; advances during smoke beat only */
  let windowUfo = 0;
  /** Brief sit-in-driver delay after boarding in yard */
  let boardSit = null;

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
    if (!el.invCassette) return;
    // Holding cassette until inserted in stereo; then show playing briefly / hide after fly
    const holding = hasCassette && !tapeInStereo;
    const playing = tapeInStereo && (mode === 'shed' || mode === 'yard');
    const show = (holding || playing) && mode !== 'title' && mode !== 'results';
    el.invCassette.classList.toggle('hidden', !show);
    el.invCassette.classList.toggle('used', !!tapeInStereo);
    el.invCassette.textContent = tapeInStereo ? '📼 Playing' : '📼 Cassette';
  }

  /** Beam touch control + fly-only HUD bits — hidden until fly. */
  function syncBeamUi() {
    const flying = mode === 'fly';
    if (el.btnBeam) el.btnBeam.classList.toggle('hidden', !flying);
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
  function startGame() {
    gestureUnlock();
    Audio.warm();
    Audio.stopTheme();
    Audio.play('ui');
    score = 0;
    beamed = 0;
    particles = [];
    floaters = [];
    flashMsg = null;
    fly = null;
    landing = null;
    boardSit = null;
    hasCassette = false;
    tapeInStereo = false;
    smoking = false;
    smokeProgress = 0;
    smokeDone = false;
    windowUfo = 0;
    syncInvHud();
    enterShed();
  }

  function enterShed() {
    mode = 'shed';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    camX = 0;
    // Start at Camino nose — walk past life-sized car → cassette → stereo → exit
    avatar = makeAvatar(200, GROUND);
    tayler = { x: 940, y: GROUND };
    showScreen('play');
    syncHud();
    setPrompt('Grab the cassette · play it on the stereo · then smoke with Tayler');
    showFlash('Grab the cassette and play it on the stereo!', 150);
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
    };
    Audio.play('landing');
    showFlash("Mothership waiting. Walk up and sit in the driver's seat.", 130);
    setPrompt("Walk to the UFO — ENTER driver's seat");
    showScreen('play');
    syncHud();
  }

  function enterFly() {
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
    };
    for (let i = 0; i < 30; i++) spawnProp(60 + i * 68);
    for (let i = 0; i < 5; i++) spawnFlyTarget(300 + i * 200);
    showScreen('play');
    syncHud();
    setPrompt('←→↑↓ fly (you drive the scroll) · Space / USE beam · Enter end');
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

  function interactHeld() {
    return !!(keys['e'] || keys['enter'] || keys['arrowup'] || keys['w'] || touchDirs.up);
  }

  function wantsInteract() {
    if (interactQueued) { interactQueued = false; return true; }
    const held = interactHeld();
    const edge = held && !prevInteractHeld;
    prevInteractHeld = held;
    return edge;
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
    if ((k === 'enter' || k === ' ') && mode === 'title') startGame();
    if ((k === 'enter' || k === ' ') && mode === 'results') startGame();

    if (k === 'e' || k === 'enter' || k === 'arrowup' || k === 'w') {
      tryPlayStereoFromGesture();
    }
    if (k === 'e' || k === 'enter') {
      if (mode === 'fly') {
        if (k === 'e') beamQueued = true;
      } else {
        interactQueued = true;
      }
    }

    if ((e.code === 'Space' || k === ' ')) {
      if (mode === 'fly') beamQueued = true;
      else if (mode === 'shed' || mode === 'yard') jumpQueued = true;
    }

    if (k === 'b' && mode === 'fly') beamQueued = true;

    if (k === 'enter' && mode === 'fly') {
      endMission();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  canvas.addEventListener('click', () => {
    if (mode === 'title') startGame();
    else if (mode === 'shed' || mode === 'yard') {
      if (!tryPlayStereoFromGesture()) interactQueued = true;
    }
  });

  el.btnStart.addEventListener('click', startGame);
  el.btnAgain.addEventListener('click', startGame);
  el.btnTitle.addEventListener('click', () => {
    Audio.play('ui');
    Audio.stopTheme();
    mode = 'title';
    hasCassette = false;
    tapeInStereo = false;
    smoking = false;
    smokeProgress = 0;
    smokeDone = false;
    windowUfo = 0;
    boardSit = null;
    syncInvHud();
    showScreen('title');
    el.titleHigh.textContent = 'High Score: ' + getHigh();
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
    else if (mode === 'shed' || mode === 'yard') interactQueued = true;
  }, { passive: false });
  el.btnBeam.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (mode === 'fly') beamQueued = true;
    else if (mode === 'shed' || mode === 'yard') interactQueued = true;
  });

  function onInteractPointer(e) {
    e.preventDefault();
    if (mode === 'fly') {
      beamQueued = true;
      return;
    }
    if (!tryPlayStereoFromGesture()) interactQueued = true;
  }
  el.btnInteract.addEventListener('touchstart', onInteractPointer, { passive: false });
  el.btnInteract.addEventListener('mousedown', onInteractPointer);

  // ——— Physics ———
  function updateSideScroller(worldW) {
    const accel = 0.55;
    const maxSpd = 4.2;
    const friction = 0.78;
    const grav = 0.55;
    const jumpV = -9.5;

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

  function nearCassetteProp() {
    if (mode !== 'shed' || !avatar || hasCassette || tapeInStereo) return false;
    return Math.abs(avatar.x - W.SHED_CASSETTE_X) < 48;
  }

  function nearStereo() {
    if (mode !== 'shed' || !avatar || !hasCassette || tapeInStereo) return false;
    return Math.abs(avatar.x - W.SHED_STEREO_X) < 55;
  }

  /**
   * Must run inside the user-gesture stack (keydown / touchstart / mousedown).
   * playTheme() calls el.play() synchronously — do not defer to rAF / wantsInteract.
   */
  function tryPlayStereoFromGesture() {
    if (mode !== 'shed' || !avatar || !hasCassette || tapeInStereo) return false;
    if (Math.abs(avatar.x - W.SHED_STEREO_X) >= 55) return false;
    hasCassette = false;
    tapeInStereo = true;
    // Music starts here (iOS gesture-safe). UFO does NOT land until smoke with Tayler.
    Audio.unlock();
    Audio.playTheme();
    Audio.play('cassette');
    showFlash('Theme on! Smoke with Tayler — watch the window…', 130);
    syncInvHud();
    W.burst(particles, W.SHED_STEREO_X - camX + 30, GROUND - 50, '#7dff3a', 12);
    W.addFloater(floaters, W.SHED_STEREO_X - camX + 30, GROUND - 70, '♪ PLAYING', '#7dff3a');
    return true;
  }

  function nearDoor() {
    if (mode !== 'shed' || !avatar) return false;
    return Math.abs(avatar.x - W.SHED_DOOR_X) < 50;
  }

  function nearTaylerSesh() {
    if (mode !== 'shed' || !avatar || !tayler) return false;
    if (!tapeInStereo || smokeDone || smoking) return false;
    return Math.abs(avatar.x - tayler.x) < 72;
  }

  function ufoLanded() {
    return windowUfo >= 0.98;
  }

  function nearInteract() {
    if (mode === 'shed') {
      return nearCassetteProp() || nearStereo() || nearTaylerSesh() || nearDoor();
    }
    if (mode === 'yard' && landing && landing.phase === 'landed' && !boardSit) {
      return Math.abs(avatar.x - landing.x) < 110;
    }
    return false;
  }

  // ——— Updates ———
  function updateShed() {
    // Smoke beat: joint + puffs while mothership descends in the window
    if (smoking && !smokeDone) {
      smokeProgress = Math.min(1, smokeProgress + 0.0065);
      windowUfo = Math.min(1, smokeProgress);
      if (Math.random() < 0.04) Audio.play('smoke');
      if (smokeProgress >= 1) {
        smoking = false;
        smokeDone = true;
        windowUfo = 1;
        smokeProgress = 1;
        Audio.play('landing');
        Audio.play('power');
        showFlash('Mothership landed! Head for EXIT →', 130);
        W.addFloater(floaters, tayler.x - camX, GROUND - 90, 'LANDED', '#7dff3a');
      }
      setPrompt('Smoking with Tayler… mothership inbound');
      // Soft lock movement a bit during automatic smoke scene
      avatar.vx *= 0.5;
      updateSideScroller(W.SHED_WORLD_W);
      return;
    }

    updateSideScroller(W.SHED_WORLD_W);

    if (tayler && Math.abs(avatar.x - tayler.x) < 60 && Math.random() < 0.012 && !tapeInStereo) {
      showFlash(W.pick(W.SHED_GAGS), 100);
    }

    if (nearCassetteProp()) {
      setPrompt('↑ / E / USE — GRAB cassette');
      if (wantsInteract()) {
        hasCassette = true;
        gestureUnlock();
        Audio.warm();
        Audio.play('ui');
        Audio.play('cassette');
        showFlash('Cassette acquired — play it on the stereo!', 130);
        syncInvHud();
        W.burst(particles, W.SHED_CASSETTE_X - camX, GROUND - 42, '#7dff3a', 10);
        W.addFloater(floaters, W.SHED_CASSETTE_X - camX, GROUND - 60, '📼 GOT IT', '#7dff3a');
      }
    } else if (nearStereo()) {
      setPrompt('↑ / E / USE — PLAY ON STEREO');
      if (wantsInteract()) {
        // Fallback if gesture helper missed (e.g. held ↑ after walking into range)
        if (!tapeInStereo) tryPlayStereoFromGesture();
      }
    } else if (nearTaylerSesh()) {
      setPrompt('↑ / E / USE — SMOKE WITH TAYLER');
      if (wantsInteract()) {
        smoking = true;
        smokeProgress = Math.max(smokeProgress, 0.02);
        windowUfo = Math.max(windowUfo, 0.02);
        Audio.play('ui');
        Audio.play('smoke');
        showFlash('Shared sesh — look out the window…', 120);
        W.burst(particles, tayler.x - camX, GROUND - 50, '#c8e8a0', 10);
        W.addFloater(floaters, tayler.x - camX, GROUND - 80, 'SMOKE', '#c8e8a0');
      }
    } else if (nearDoor()) {
      if (!ufoLanded()) {
        let msg;
        if (!tapeInStereo) {
          msg = hasCassette
            ? 'Play the cassette on the stereo first!'
            : 'Grab the cassette · play it on the stereo';
        } else if (!smokeDone && !smoking) {
          msg = 'Smoke with Tayler first — then the mothership lands';
        } else {
          msg = 'Wait for it to land…';
        }
        setPrompt(msg);
        prevInteractHeld = interactHeld();
        if (wantsInteract()) {
          showFlash(
            !tapeInStereo
              ? (hasCassette ? 'Stereo first — insert the tape!' : 'Grab the cassette first!')
              : (!smokeDone ? 'SMOKE WITH TAYLER first!' : 'Wait for it to land…'),
            100
          );
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
      if (!hasCassette && !tapeInStereo) {
        setPrompt('← → walk · GRAB cassette · PLAY ON STEREO');
      } else if (hasCassette && !tapeInStereo) {
        setPrompt('Take the cassette to the stereo — PLAY ON STEREO');
      } else if (!smokeDone) {
        setPrompt('SMOKE WITH TAYLER · then watch the window');
      } else if (!ufoLanded()) {
        setPrompt('Watch the window — wait for it to land…');
      } else {
        setPrompt('← → walk · UFO landed · EXIT →');
      }
    }
  }

  function updateYard() {
    if (boardSit) {
      boardSit.timer++;
      setPrompt("Sitting in the driver's seat…");
      if (boardSit.timer > 36) {
        enterFly();
        return;
      }
      return;
    }

    updateSideScroller(1200);
    if (landing) landing.timer++;

    if (tayler && landing && landing.phase === 'landed') {
      const tx = landing.x - 50;
      if (tayler.x < tx - 4) tayler.x += 1.2;
      else if (tayler.x > tx + 4) tayler.x -= 1.2;
    }

    if (landing && landing.phase === 'landed') {
      if (nearInteract()) {
        setPrompt("↑ / E / USE — sit in the driver's seat");
        if (wantsInteract()) {
          Audio.play('power');
          Audio.play('ui');
          boardSit = { timer: 0 };
          showFlash("Driver's seat — flight controls unlocked!", 100);
          return;
        }
      } else {
        prevInteractHeld = interactHeld();
        setPrompt("Walk to the UFO — ENTER driver's seat");
      }
    }
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
    if (mode === 'shed') updateShed();
    else if (mode === 'yard') updateYard();
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
      W.drawShed(ctx, CW, CH, camX, t, {
        cassetteTaken: hasCassette || tapeInStereo,
        tapeInStereo: tapeInStereo,
        windowUfo: windowUfo,
        doorLocked: !ufoLanded(),
        smoking: smoking,
        smokeProgress: smokeProgress,
      });
      if (tayler) {
        const taylerSmoking = true;
        W.drawTayler(ctx, tayler.x - camX, tayler.y, 1, false, t, {
          seated: true,
          smoking: taylerSmoking,
          heavySmoke: smoking || smokeDone,
        });
      }
      const zakkIdle = Math.abs(avatar.vx) < 0.5;
      W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, {
        smoking: smoking || (zakkIdle && tapeInStereo),
        heavySmoke: smoking,
      });
      if (nearTaylerSesh()) {
        const bob = Math.sin(t * 0.01) * 3;
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 15px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ SMOKE WITH TAYLER', tayler.x - camX, GROUND - 118 + bob);
        ctx.textAlign = 'left';
      }
      if (smoking) {
        ctx.fillStyle = 'rgba(10,30,16,0.72)';
        ctx.fillRect(CW / 2 - 140, 48, 280, 28);
        ctx.strokeStyle = '#c8e8a0';
        ctx.strokeRect(CW / 2 - 140, 48, 280, 28);
        ctx.fillStyle = '#e8ffe0';
        ctx.font = 'bold 13px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Shared sesh — mothership descending…', CW / 2, 67);
        ctx.textAlign = 'left';
        // progress bar
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(CW / 2 - 80, 82, 160, 8);
        ctx.fillStyle = '#9dff6a';
        ctx.fillRect(CW / 2 - 80, 82, 160 * smokeProgress, 8);
      }
      if (nearDoor()) {
        ctx.fillStyle = ufoLanded() ? '#7dff3a' : '#ff8866';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        let doorLabel = '▲ ENTER';
        if (!ufoLanded()) {
          if (!tapeInStereo) doorLabel = '▲ LOCKED';
          else if (!smokeDone) doorLabel = '▲ SMOKE WITH TAYLER';
          else doorLabel = '▲ WAIT FOR LANDING';
        }
        ctx.fillText(doorLabel, W.SHED_DOOR_X - camX, GROUND - 170);
        ctx.textAlign = 'left';
      }
    } else if (mode === 'yard') {
      W.drawYard(ctx, CW, CH, camX, t, landing);
      if (tayler) {
        const tMoving = landing && landing.phase === 'landed' && !boardSit;
        W.drawTayler(ctx, tayler.x - camX, tayler.y, 1, tMoving, t, {});
      }
      if (!boardSit) {
        W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, {});
      }
      if (landing && landing.phase === 'landed' && nearInteract()) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ DRIVER SEAT', landing.x - camX, landing.y - 70);
        ctx.textAlign = 'left';
      }
      if (boardSit && landing) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 18px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Taking the driver's seat…", CW / 2, 90);
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
