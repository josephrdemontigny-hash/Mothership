/**
 * Mothership — Chilliwack skies
 * Flow: title → shed → yard → cockpit (insert tape) → seat → fly → results
 * (no boarding cutscene). Pilots: Zakk (char-ref-2) & Tayler (char-ref-1)
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

  // title | shed | yard | cockpit | fly | results
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
  let cassette = null;
  let fly = null;
  let hasCassette = false;
  let tapeInDeck = false;
  /** 0..1 UFO fly-in seen through shed window; continues into yard settle */
  let windowUfo = 0;

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
      cockpit: 'COCKPIT',
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
    const show = hasCassette && mode !== 'title' && mode !== 'results';
    el.invCassette.classList.toggle('hidden', !show);
    el.invCassette.classList.toggle('used', !!tapeInDeck);
    el.invCassette.textContent = tapeInDeck ? '📼 In deck' : '📼 Cassette';
  }

  /** Beam touch control + fly-only HUD bits — hidden until fly after driver’s seat. */
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
    cassette = null;
    landing = null;
    hasCassette = false;
    tapeInDeck = false;
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
    avatar = makeAvatar(200, GROUND);
    tayler = { x: 420, y: GROUND };
    showScreen('play');
    syncHud();
    setPrompt('Grab the cassette, then leave through EXIT');
    showFlash('Find & grab the cassette — UFO landing out back!', 150);
  }

  function enterYard() {
    mode = 'yard';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    tayler = { x: 240, y: GROUND };
    Audio.play('ui');
    camX = 0;
    avatar = makeAvatar(280, GROUND);

    // Outside: UFO already landed or finishing a short settle (no long wait)
    const targetY = GROUND - 72;
    if (windowUfo >= 0.92) {
      landing = {
        phase: 'landed',
        x: 720,
        y: targetY,
        targetY: targetY,
        scale: 1.85,
        lights: true,
        timer: 0,
      };
      Audio.play('landing');
      showFlash('Mothership waiting. Walk up and ENTER.', 120);
      setPrompt('Walk to the UFO and ENTER');
    } else {
      const remain = 1 - windowUfo;
      landing = {
        phase: 'descend',
        x: 720,
        y: targetY - Math.max(18, remain * 70),
        targetY: targetY,
        scale: 1.85,
        lights: true,
        timer: 0,
      };
      setPrompt("UFO finishing landing — then walk up and ENTER");
      showFlash('Short settle — then hop aboard.', 110);
    }
    showScreen('play');
    syncHud();
  }

  function enterCockpit() {
    mode = 'cockpit';
    interactQueued = false;
    prevInteractHeld = true;
    landing = null;
    cassette = {
      inserted: false,
      insertProgress: 0,
      inserting: false,
      seated: false,
      seatTimer: 0,
      hasTape: !!hasCassette,
      musicStarted: false,
    };
    Audio.play('ui');
    showScreen('play');
    syncHud();
    if (hasCassette) {
      setPrompt('E / Space / USE — insert cassette into deck');
      showFlash('Cockpit online. Slide the tape into the deck.', 120);
    } else {
      setPrompt('No cassette — somehow empty-handed');
      showFlash('…you forgot the cassette?!', 120);
    }
  }

  function enterFly() {
    mode = 'fly';
    interactQueued = false;
    beamQueued = false;
    prevBeamHeld = false;
    cassette = null;

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
    for (let i = 0; i < 12; i++) spawnProp(200 + i * 160);
    for (let i = 0; i < 5; i++) spawnFlyTarget(300 + i * 200);
    showScreen('play');
    syncHud();
    setPrompt('←→↑↓ fly · Space / BEAM abduct · Enter end');
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

  function spawnProp(atX) {
    if (!fly) return;
    const kinds = ['house', 'shop', 'barn', 'corn', 'tree', 'apt', 'house', 'corn'];
    fly.props.push({
      x: atX != null ? atX : fly.scrollX + CW + W.rand(40, 180),
      kind: W.pick(kinds),
    });
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

    if (k === 'e' || k === 'enter') interactQueued = true;

    if (mode === 'cockpit' && (k === 'e' || k === ' ' || k === 'enter')) {
      interactQueued = true;
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
    if (mode === 'cockpit' && cassette) interactQueued = true;
    else if (mode === 'title') startGame();
  });

  el.btnStart.addEventListener('click', startGame);
  el.btnAgain.addEventListener('click', startGame);
  el.btnTitle.addEventListener('click', () => {
    Audio.play('ui');
    Audio.stopTheme();
    mode = 'title';
    hasCassette = false;
    tapeInDeck = false;
    cassette = null;
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
    else if (mode === 'cockpit') interactQueued = true;
    else if (mode === 'shed' || mode === 'yard') interactQueued = true;
  }, { passive: false });
  el.btnBeam.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (mode === 'fly') beamQueued = true;
    else if (mode === 'cockpit') interactQueued = true;
    else if (mode === 'shed' || mode === 'yard') interactQueued = true;
  });

  el.btnInteract.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (mode === 'fly') endMission();
    else interactQueued = true;
  }, { passive: false });
  el.btnInteract.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (mode === 'fly') endMission();
    else interactQueued = true;
  });

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
    if (mode !== 'shed' || !avatar || hasCassette) return false;
    return Math.abs(avatar.x - W.SHED_CASSETTE_X) < 48;
  }

  function nearDoor() {
    if (mode !== 'shed' || !avatar) return false;
    return Math.abs(avatar.x - W.SHED_DOOR_X) < 50;
  }

  function nearInteract() {
    if (mode === 'shed') {
      return nearCassetteProp() || nearDoor();
    }
    if (mode === 'yard' && landing && landing.phase === 'landed') {
      return Math.abs(avatar.x - landing.x) < 80;
    }
    return false;
  }

  // ——— Updates ———
  function updateShed() {
    // UFO progresses through shed window while hanging out
    windowUfo = Math.min(1, windowUfo + 0.00135);
    updateSideScroller(W.SHED_WORLD_W);

    if (tayler && Math.abs(avatar.x - tayler.x) < 60 && Math.random() < 0.012) {
      showFlash(W.pick(W.SHED_GAGS), 100);
    }

    if (nearCassetteProp()) {
      setPrompt('↑ / E / USE — Grab cassette tape');
      if (wantsInteract()) {
        hasCassette = true;
        gestureUnlock();
        Audio.warm();
        Audio.play('ui');
        Audio.play('cassette');
        showFlash('Cassette acquired!', 130);
        syncInvHud();
        W.burst(particles, W.SHED_CASSETTE_X - camX, GROUND - 42, '#7dff3a', 10);
        W.addFloater(floaters, W.SHED_CASSETTE_X - camX, GROUND - 60, '📼 GOT IT', '#7dff3a');
      }
    } else if (nearDoor()) {
      if (!hasCassette) {
        setPrompt('Need the cassette first! Grab it near the amp');
        prevInteractHeld = interactHeld();
        if (wantsInteract()) {
          showFlash('Door locked vibe — grab the cassette first!', 100);
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
      if (!hasCassette) {
        setPrompt('← → walk · find cassette near amp · watch the window · EXIT →');
      } else {
        setPrompt('← → walk · Space jump · hang with Tayler · EXIT →');
      }
    }
  }

  function updateYard() {
    updateSideScroller(1200);
    landing.timer++;
    windowUfo = Math.min(1, windowUfo + 0.01);

    if (tayler && landing.phase === 'landed') {
      const tx = landing.x - 50;
      if (tayler.x < tx - 4) tayler.x += 1.2;
      else if (tayler.x > tx + 4) tayler.x -= 1.2;
    }

    if (landing.phase === 'descend') {
      // Fast settle — no long wait
      landing.y += 2.4;
      landing.lights = true;
      if (landing.timer % 6 === 0) {
        W.burst(particles, landing.x - camX, GROUND - 10, '#c8d8e0', 3);
      }
      if (landing.y >= landing.targetY) {
        landing.y = landing.targetY;
        landing.phase = 'landed';
        windowUfo = 1;
        Audio.play('landing');
        Audio.play('power');
        showFlash('Mothership ready. Walk up and ENTER.', 130);
      }
    }

    if (landing.phase === 'landed') {
      if (nearInteract()) {
        setPrompt('↑ / E / USE — Enter UFO');
        if (wantsInteract()) {
          Audio.play('power');
          enterCockpit();
          return;
        }
      } else {
        prevInteractHeld = interactHeld();
        setPrompt('Walk to the UFO and ENTER');
      }
    }
  }

  function updateCockpit() {
    cassette.hasTape = !!hasCassette;

    if (!hasCassette) {
      setPrompt('No cassette held — restart and grab it in the shed');
      prevInteractHeld = interactHeld() || beamHeld();
      return;
    }

    // Insert: music MUST start on this same gesture tick (iOS/Safari)
    if (!cassette.inserted) {
      setPrompt('E / Space / USE — insert cassette into deck');
      if (wantsInteract()) {
        cassette.inserting = true;
        cassette.inserted = true;
        cassette.insertProgress = 0;
        Audio.play('cassette');
        // Same tick as user press — unlock + playTheme for gesture-tied HTMLAudioElement.play()
        gestureUnlock();
        Audio.playTheme();
        cassette.musicStarted = true;
        tapeInDeck = true;
        showFlash('Click. Clunk. Theme engaged.', 90);
        syncInvHud();
      } else {
        prevInteractHeld = interactHeld() || beamHeld();
      }
    }

    if (cassette.inserting) {
      cassette.insertProgress = Math.min(1, cassette.insertProgress + 0.05);
      if (cassette.insertProgress >= 1) {
        cassette.inserting = false;
        // Theme already started on gesture; reinforce play in case of flaky resume
        if (!cassette.musicStarted) {
          gestureUnlock();
          Audio.playTheme();
          cassette.musicStarted = true;
        } else {
          Audio.playTheme();
        }
        Audio.play('power');
        showFlash('Tape locked. Sit in the driver’s seat to fly.', 120);
        syncInvHud();
      }
    }

    // After insert animation: sit in driver’s seat → unlock flight
    if (cassette.inserted && cassette.insertProgress >= 1 && !cassette.seated) {
      setPrompt('E / Space / USE — sit in the driver’s seat');
      if (wantsInteract()) {
        cassette.seated = true;
        cassette.seatTimer = 1;
        Audio.play('ui');
        Audio.play('power');
        showFlash('Driver’s seat — flight controls unlocked!', 100);
      } else {
        prevInteractHeld = interactHeld() || beamHeld();
      }
    }

    if (cassette.seated) {
      cassette.seatTimer++;
      setPrompt('Launching…');
      if (cassette.seatTimer > 40) {
        enterFly();
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
    fly.ufoX = Math.max(50, Math.min(CW - 50, fly.ufoX));
    fly.ufoY = Math.max(50, Math.min(CH * 0.62, fly.ufoY));

    const scrollSpeed = 1.8 + Math.max(0, ix) * 2.8 + Math.max(0, fly.vx) * 0.35;
    fly.scrollX += scrollSpeed;

    fly.districtTimer += scrollSpeed;
    if (fly.districtTimer > 520) {
      fly.districtTimer = 0;
      fly.districtIndex++;
      syncHud();
      showFlash(W.DISTRICTS[fly.districtIndex % W.DISTRICTS.length].name, 90);
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
      spawnProp();
      fly.propTimer = W.rand(40, 90);
    }
    fly.props = fly.props.filter((p) => p.x > fly.scrollX - 100);

    fly.spawnTimer--;
    if (fly.spawnTimer <= 0) {
      spawnFlyTarget();
      fly.spawnTimer = W.rand(45, 95);
    }
    fly.targets = fly.targets.filter((tg) => tg.x > fly.scrollX - 60 && !tg.beamed);

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

    setPrompt('←→↑↓ fly · hold Space beam · green=people · red=DON\'T · Enter end');
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
    else if (mode === 'cockpit') updateCockpit();
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
        cassetteTaken: hasCassette,
        windowUfo: windowUfo,
      });
      if (tayler) {
        W.drawTayler(ctx, tayler.x - camX, tayler.y, 1, false, t, { seated: true, smoking: true });
      }
      const smoking = Math.abs(avatar.vx) < 0.5;
      W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, { smoking: smoking });
      if (nearDoor()) {
        ctx.fillStyle = hasCassette ? '#7dff3a' : '#ff8866';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(hasCassette ? '▲ ENTER' : '▲ NEED CASSETTE', W.SHED_DOOR_X - camX, GROUND - 170);
        ctx.textAlign = 'left';
      }
    } else if (mode === 'yard') {
      W.drawYard(ctx, CW, CH, camX, t, landing);
      if (tayler) {
        const tMoving = landing && landing.phase === 'landed';
        W.drawTayler(ctx, tayler.x - camX, tayler.y, 1, tMoving, t, {});
      }
      W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, {});
      if (landing && landing.phase === 'landed' && nearInteract()) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ ENTER', landing.x - camX, landing.y - 70);
        ctx.textAlign = 'left';
      }
    } else if (mode === 'cockpit') {
      W.drawCassetteScene(ctx, CW, CH, cassette, t);
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
