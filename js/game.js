/**
 * Mothership — Chilliwack skies
 * Acts: Shed → Yard (landing) → Cockpit → Beam Mode
 * Pilots: Zakk & Taylor (T). Cheesy clay UFO comedy.
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
  };

  const keys = Object.create(null);
  const touchDirs = Object.create(null);
  let interactQueued = false;
  let beamQueued = false;
  let jumpQueued = false;
  let prevInteractHeld = false;

  // title | shed | yard | cockpit | beam | results
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
  let taylor = null; // shed companion

  let landing = null;
  let fly = null;
  let beam = null;

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
      beam: 'BEAM',
    };
    el.modeLabel.textContent = labels[mode] || '';
    if (mode === 'cockpit' && fly) {
      el.district.classList.remove('hidden');
      const altFt = Math.round(200 + fly.alt * 1800);
      const spd = Math.round(40 + fly.speed * 28);
      el.district.textContent =
        W.DISTRICTS[fly.districtIndex % W.DISTRICTS.length].name +
        ' · ' + altFt + 'ft · ' + spd;
    } else if (mode === 'beam') {
      el.district.classList.remove('hidden');
      el.district.textContent = 'Align & beam';
    } else {
      el.district.classList.add('hidden');
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
  }

  function makeAvatar(x, y) {
    return {
      x, y,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: true,
      w: 20,
      h: 48,
    };
  }

  // ——— Mode transitions ———
  function startGame() {
    Audio.unlock();
    Audio.stopTheme();
    Audio.play('ui');
    score = 0;
    beamed = 0;
    particles = [];
    floaters = [];
    flashMsg = null;
    fly = null;
    beam = null;
    enterShed();
  }

  function enterShed() {
    mode = 'shed';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;

    camX = 0;
    // Start near the chill couch with Taylor — both visible
    avatar = makeAvatar(200, GROUND);
    taylor = { x: 355, y: GROUND }; // near couch / table
    showScreen('play');
    syncHud();
    setPrompt('← → walk · Space jump · ↑/E leave shed');
    showFlash(W.pick(W.SHED_GAGS), 160);
  }

  function enterYard() {
    mode = 'yard';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    taylor = null;

    Audio.play('ui');
    camX = 0;
    avatar = makeAvatar(280, GROUND);
    landing = {
      phase: 'approach',
      x: 720,
      y: -80,
      targetY: GROUND - 50,
      scale: 1.3,
      lights: true,
      timer: 0,
    };
    showScreen('play');
    syncHud();
    setPrompt('Something\'s landing in the backyard…');
    showFlash('UFO inbound — dry ice budget approved!', 130);
  }

  function enterCockpit() {
    mode = 'cockpit';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;

    Audio.play('power');
    Audio.unlock();
    Audio.playTheme();

    avatar = null;
    landing = null;
    fly = {
      scrollX: 0,
      speed: 2.4,
      targetSpeed: 2.4,
      alt: 0.5,
      bank: 0,
      vy: 0,
      districtIndex: 0,
      districtTimer: 0,
      moonJuice: 0,
      boosting: false,
      lives: 3,
      hazards: [],
      spawnTimer: 90,
      invuln: 0,
      hitFlash: 0,
      shakeX: 0,
      shakeY: 0,
      shake: 0,
    };
    // seed a couple hazards ahead
    for (let i = 0; i < 3; i++) spawnHazard(400 + i * 280);
    showScreen('play');
    syncHud();
    setPrompt('←→ bank · ↑↓ climb/dive · Shift boost · B Beam · Enter end');
    showFlash('Welcome aboard, Zakk & T. Theme song: ON. Fly!', 130);
  }

  function enterBeam() {
    mode = 'beam';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;

    Audio.play('ui');
    // theme keeps looping while aboard
    if (Audio.isThemeWanted) Audio.playTheme();

    beam = {
      ufoX: CW / 2,
      scrollX: fly ? fly.scrollX : 0,
      targets: [],
      spawnTimer: 30,
      beaming: false,
      beamTimer: 0,
      wide: fly && fly.moonJuice > 0,
      moonJuice: fly ? fly.moonJuice : 0,
    };
    for (let i = 0; i < 4; i++) spawnBeamTarget(200 + i * 180);
    showScreen('play');
    syncHud();
    setPrompt('← → align · Space / BEAM to abduct · B exit');
    showFlash('BEAM MODE engaged. Find soft targets.', 100);
  }

  function exitBeamToCockpit() {
    if (fly && beam) {
      fly.scrollX = beam.scrollX;
      fly.moonJuice = beam.moonJuice;
    }
    mode = 'cockpit';
    beam = null;
    Audio.play('ui');
    Audio.playTheme();
    syncHud();
    setPrompt('←→ bank · ↑↓ climb/dive · Shift boost · B Beam · Enter end');
    showFlash('Back in the cockpit. Fly!', 80);
  }

  function endMission() {
    Audio.play('gameOver');
    Audio.stopTheme();
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

  function spawnBeamTarget(x) {
    const kind = W.pick(W.TARGET_KINDS);
    beam.targets.push({
      x: x != null ? x : CW + W.rand(40, 200),
      kind,
      wobble: W.rand(0, Math.PI * 2),
      beamed: false,
      vx: W.rand(-0.3, 0.3),
    });
  }

  function spawnHazard(atX) {
    if (!fly) return;
    const kinds = ['bird', 'bird', 'tower', 'powerline', 'bird'];
    const kind = W.pick(kinds);
    let alt;
    if (kind === 'bird') alt = W.rand(0.35, 0.9);
    else if (kind === 'tower') alt = W.rand(0.05, 0.35);
    else alt = W.rand(0.25, 0.55); // powerline mid-low
    fly.hazards.push({
      x: atX != null ? atX : fly.scrollX + CW + W.rand(40, 220),
      kind,
      alt,
      size: W.rand(0.4, 1),
      phase: W.rand(0, Math.PI * 2),
      hit: false,
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
    if (keys['arrowup'] || keys['w'] || touchDirs.up) v -= 1; // up = climb
    if (keys['arrowdown'] || keys['s'] || touchDirs.down) v += 1; // down = dive
    return v;
  }

  function wantsBoost() {
    return !!(keys['shift'] || keys['shiftleft'] || keys['shiftright']);
  }

  function wantsJump() {
    if (jumpQueued) {
      jumpQueued = false;
      return true;
    }
    return false;
  }

  function interactHeld() {
    return !!(keys['e'] || keys['enter'] || keys['arrowup'] || keys['w'] || touchDirs.up);
  }

  function wantsInteract() {
    if (interactQueued) {
      interactQueued = false;
      return true;
    }
    const held = interactHeld();
    const edge = held && !prevInteractHeld;
    prevInteractHeld = held;
    return edge;
  }

  function consumeBeamKey() {
    if (beamQueued) {
      beamQueued = false;
      return true;
    }
    return false;
  }

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (e.key === 'Shift') keys['shift'] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) || e.code === 'Space') {
      e.preventDefault();
    }
    if (k === 'm') {
      Audio.toggle();
      updateMuteUI();
    }
    if ((k === 'enter' || k === ' ') && mode === 'title') startGame();
    if ((k === 'enter' || k === ' ') && mode === 'results') startGame();

    if (k === 'e' || k === 'enter') interactQueued = true;

    if (k === 'b') {
      if (mode === 'cockpit') enterBeam();
      else if (mode === 'beam') exitBeamToCockpit();
    }
    if (k === 'escape' && mode === 'beam') exitBeamToCockpit();

    if ((e.code === 'Space' || k === ' ')) {
      if (mode === 'beam') beamQueued = true;
      else if (mode === 'shed' || mode === 'yard') jumpQueued = true;
    }

    if (k === 'enter' && mode === 'cockpit') {
      endMission();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.key === 'Shift') keys['shift'] = false;
  });

  el.btnStart.addEventListener('click', startGame);
  el.btnAgain.addEventListener('click', startGame);
  el.btnTitle.addEventListener('click', () => {
    Audio.play('ui');
    Audio.stopTheme();
    mode = 'title';
    showScreen('title');
    el.titleHigh.textContent = 'High Score: ' + getHigh();
  });
  el.muteBtn.addEventListener('click', () => {
    Audio.unlock();
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
    if (mode === 'cockpit') enterBeam();
    else if (mode === 'beam') beamQueued = true;
    else if (mode === 'shed' || mode === 'yard') interactQueued = true;
  }, { passive: false });
  el.btnBeam.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (mode === 'cockpit') enterBeam();
    else if (mode === 'beam') beamQueued = true;
    else if (mode === 'shed' || mode === 'yard') interactQueued = true;
  });

  el.btnInteract.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (mode === 'beam') exitBeamToCockpit();
    else if (mode === 'cockpit') endMission();
    else interactQueued = true;
  }, { passive: false });
  el.btnInteract.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (mode === 'beam') exitBeamToCockpit();
    else if (mode === 'cockpit') endMission();
    else interactQueued = true;
  });

  // ——— Physics helpers ———
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

  function nearInteract() {
    if (mode === 'shed') {
      return Math.abs(avatar.x - W.SHED_DOOR_X) < 50;
    }
    if (mode === 'yard' && landing && landing.phase === 'landed') {
      return Math.abs(avatar.x - landing.x) < 70;
    }
    return false;
  }

  // ——— Update modes ———
  function updateShed() {
    updateSideScroller(W.SHED_WORLD_W);

    // gag near chill table / Taylor
    if (taylor && Math.abs(avatar.x - taylor.x) < 55 && Math.random() < 0.012) {
      showFlash(W.pick(W.SHED_GAGS), 100);
    }

    if (nearInteract()) {
      setPrompt('↑ / E / USE — Leave the shed');
      if (wantsInteract()) {
        enterYard();
        return;
      }
    } else {
      prevInteractHeld = interactHeld();
      setPrompt('← → walk · Space jump · hang with T · EXIT →');
    }
  }

  function updateYard() {
    updateSideScroller(1200);
    landing.timer++;

    if (landing.phase === 'approach') {
      landing.x = 700 + Math.sin(t * 0.003) * 20;
      landing.y += 1.2;
      if (landing.y >= landing.targetY - 80) landing.phase = 'descend';
    } else if (landing.phase === 'descend') {
      landing.y += 0.8;
      landing.lights = true;
      if (landing.timer % 8 === 0) {
        W.burst(particles, landing.x, GROUND - 10, '#c8d8e0', 3);
      }
      if (landing.y >= landing.targetY) {
        landing.y = landing.targetY;
        landing.phase = 'landed';
        Audio.play('landing');
        Audio.play('power');
        showFlash('Mothership landed. Walk up and ENTER.', 140);
      }
    }

    if (landing.phase === 'landed') {
      if (nearInteract()) {
        setPrompt('↑ / E / USE — Enter the mothership');
        if (wantsInteract()) {
          enterCockpit();
          return;
        }
      } else {
        prevInteractHeld = interactHeld();
        setPrompt('Walk to the UFO door and enter');
      }
    }
  }

  function updateCockpit() {
    const ix = inputX();
    const iy = inputY();

    // Bank toward input; snappy
    const bankTarget = ix * 0.28;
    fly.bank += (bankTarget - fly.bank) * 0.12;

    // Climb / dive
    fly.vy += (-iy) * 0.0045; // up key => climb (alt up)
    // slight auto-level
    fly.vy *= 0.92;
    fly.alt += fly.vy;
    // also bank slightly affects "slide"
    fly.alt += -fly.bank * 0.002;
    fly.alt = Math.max(0.08, Math.min(0.95, fly.alt));

    // Speed: base + lateral throttle feel + boost
    const boost = wantsBoost() || (fly.moonJuice > 0 && wantsBoost());
    fly.boosting = wantsBoost() && (fly.moonJuice > 0 || true);
    // Moon Juice enables stronger boost; Shift always gives mild boost
    let boostAmt = 0;
    if (wantsBoost()) {
      boostAmt = fly.moonJuice > 0 ? 2.2 : 0.9;
    } else if (fly.moonJuice > 0) {
      boostAmt = 0.5; // passive sip of juice
    }
    fly.boosting = boostAmt > 0.8;
    const targetSpd = 2.2 + Math.abs(ix) * 1.4 + boostAmt + (1 - Math.abs(fly.alt - 0.5)) * 0.3;
    fly.speed += (targetSpd - fly.speed) * 0.18;

    // Always advance; bank adds lateral "strafe" to scroll feel
    fly.scrollX += fly.speed + ix * 0.6;

    fly.districtTimer += fly.speed;
    if (fly.districtTimer > 550) {
      fly.districtTimer = 0;
      fly.districtIndex++;
      syncHud();
      showFlash(W.DISTRICTS[fly.districtIndex % W.DISTRICTS.length].name, 90);
    }

    if (fly.moonJuice > 0) fly.moonJuice--;

    if (Math.random() < 0.0018 && fly.moonJuice <= 0) {
      fly.moonJuice = 300;
      Audio.play('power');
      showFlash('MOON JUICE! Hold Shift for BOOST.', 100);
    }

    // Spawn hazards
    fly.spawnTimer--;
    if (fly.spawnTimer <= 0) {
      spawnHazard();
      fly.spawnTimer = W.rand(50, 110) - Math.min(40, fly.speed * 5);
    }

    // Move / cull hazards; collision vs ship "nose" at center alt
    const shipWorldX = fly.scrollX + CW * 0.55;
    for (const hz of fly.hazards) {
      // birds drift a bit
      if (hz.kind === 'bird') {
        hz.alt += Math.sin(t * 0.01 + hz.phase) * 0.0015;
        hz.alt = Math.max(0.2, Math.min(0.95, hz.alt));
      }
    }
    fly.hazards = fly.hazards.filter((hz) => hz.x > fly.scrollX - 120);

    if (fly.invuln > 0) fly.invuln--;
    if (fly.hitFlash > 0) fly.hitFlash--;
    if (fly.shake > 0) {
      fly.shake--;
      fly.shakeX = (Math.random() - 0.5) * fly.shake * 0.6;
      fly.shakeY = (Math.random() - 0.5) * fly.shake * 0.6;
    } else {
      fly.shakeX = 0;
      fly.shakeY = 0;
    }

    if (fly.invuln <= 0) {
      for (const hz of fly.hazards) {
        if (hz.hit) continue;
        const dx = hz.x - shipWorldX;
        // collision window in front of ship view
        if (dx < -30 || dx > 90) continue;
        const dAlt = Math.abs(hz.alt - fly.alt);
        let thresh = hz.kind === 'bird' ? 0.12 : hz.kind === 'powerline' ? 0.1 : 0.18;
        // towers only hit if flying low
        if (hz.kind === 'tower' && fly.alt > 0.4) continue;
        if (hz.kind === 'tower') thresh = 0.22;
        if (dAlt < thresh) {
          hz.hit = true;
          fly.lives--;
          fly.invuln = 55;
          fly.hitFlash = 35;
          fly.shake = 28;
          score = Math.max(0, score - 75);
          Audio.play('hit');
          W.burst(particles, CW / 2, CH * 0.4, '#ff6644', 14);
          W.addFloater(floaters, CW / 2, CH * 0.35, '-75', '#ff6644');
          showFlash(hz.kind === 'bird' ? 'Bird strike! Watch the altitude!' :
            hz.kind === 'tower' ? 'Tower! Pull up!' : 'Power lines! Climb!', 100);
          syncHud();
          if (fly.lives <= 0) {
            showFlash('Ship too toasted — emergency debrief!', 120);
            setTimeout(function () {
              if (mode === 'cockpit') endMission();
            }, 700);
          }
          break;
        }
      }
    }

    // passive score for flying
    if ((t / 16 | 0) % 30 === 0) {
      score += 1;
      syncHud();
    }

    setPrompt('←→ bank · ↑↓ climb/dive · Shift boost · B Beam · Enter end');
    syncHud();
  }

  function updateBeam() {
    const ix = inputX();
    beam.ufoX += ix * 5;
    beam.ufoX = Math.max(60, Math.min(CW - 60, beam.ufoX));
    beam.scrollX += 1.6 + Math.abs(ix) * 0.5;

    for (const tg of beam.targets) {
      tg.x -= 1.6;
      tg.x += tg.vx;
    }
    beam.targets = beam.targets.filter((tg) => tg.x > -40 && !tg.beamed);

    beam.spawnTimer--;
    if (beam.spawnTimer <= 0) {
      spawnBeamTarget();
      beam.spawnTimer = W.rand(50, 100);
    }

    const fire = consumeBeamKey() || keys[' '] || keys['space'];
    if (fire && beam.beamTimer <= 0) {
      beam.beaming = true;
      beam.beamTimer = 20;
      Audio.play('beam');
      tryBeamHit();
    }
    if (beam.beamTimer > 0) {
      beam.beamTimer--;
      if (beam.beamTimer < 10) beam.beaming = false;
    }

    if (beam.moonJuice > 0) {
      beam.moonJuice--;
      beam.wide = true;
    } else {
      beam.wide = false;
    }

    setPrompt('Align over targets · Space/BEAM · USE/B exit');
  }

  function tryBeamHit() {
    const half = (beam.wide ? 100 : 56) / 2;
    let hit = false;
    for (const tg of beam.targets) {
      if (tg.beamed) continue;
      if (Math.abs(tg.x - beam.ufoX) < half + 12) {
        tg.beamed = true;
        hit = true;
        const pts = tg.kind.points + (beam.wide ? 50 : 0);
        score += pts;
        beamed++;
        W.burst(particles, tg.x, CH * 0.78 - 20, '#7dff3a', 16);
        W.addFloater(floaters, tg.x, CH * 0.78 - 40, '+' + pts, '#7dff3a');
        Audio.play('score');
        if (Math.random() < 0.5) showFlash(W.pick(W.ONE_LINERS), 140);
        else showFlash('Beamed: ' + tg.kind.label + '!', 80);
      }
    }
    if (!hit) {
      W.burst(particles, beam.ufoX, 120, '#88ffaa', 4);
    }
    syncHud();

    if (beamed > 0 && beamed % 8 === 0) {
      showFlash('Nice haul! Enter from cockpit to debrief anytime.', 120);
    }
  }

  function update() {
    if (mode === 'shed') updateShed();
    else if (mode === 'yard') updateYard();
    else if (mode === 'cockpit') updateCockpit();
    else if (mode === 'beam') updateBeam();

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
      W.drawShed(ctx, CW, CH, camX, t);
      // Taylor first (behind / beside), then Zakk
      if (taylor) {
        W.drawTaylor(ctx, taylor.x - camX, taylor.y, t);
      }
      const smoking = Math.abs(avatar.vx) < 0.5;
      W.drawHuman(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, { smoking: smoking });
      if (nearInteract()) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ ENTER', W.SHED_DOOR_X - camX, GROUND - 150);
        ctx.textAlign = 'left';
      }
    } else if (mode === 'yard') {
      W.drawYard(ctx, CW, CH, camX, t, landing);
      W.drawHuman(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t);
      if (landing && landing.phase === 'landed' && nearInteract()) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ BOARD', landing.x - camX, landing.y - 60);
        ctx.textAlign = 'left';
      }
    } else if (mode === 'cockpit') {
      W.drawCockpit(ctx, CW, CH, fly, t);
    } else if (mode === 'beam') {
      W.drawBeamScene(ctx, CW, CH, beam, t);
    }

    W.drawFx(ctx, particles, floaters);
    drawFlash();

    if (mode === 'beam' && beam.moonJuice > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(CW / 2 - 60, 36, 120, 8);
      ctx.fillStyle = '#44ddff';
      ctx.fillRect(CW / 2 - 60, 36, 120 * (beam.moonJuice / 300), 8);
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

  // Boot
  el.titleHigh.textContent = 'High Score: ' + getHigh();
  updateMuteUI();
  showScreen('title');
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
