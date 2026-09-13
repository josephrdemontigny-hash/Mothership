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

  // shared run stats
  let score = 0;
  let beamed = 0;

  // side-scroller avatar (shed / yard)
  let avatar = null;
  let camX = 0;

  // landing state (yard)
  let landing = null;

  // cockpit flight
  let fly = null;

  // beam mode
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
      el.district.textContent = W.DISTRICTS[fly.districtIndex % W.DISTRICTS.length].name;
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
    Audio.play('ui');
    score = 0;
    beamed = 0;
    particles = [];
    floaters = [];
    flashMsg = null;
    enterShed();
  }

  function enterShed() {
    mode = 'shed';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true; // require fresh press

    camX = 0;
    avatar = makeAvatar(120, GROUND);
    showScreen('play');
    syncHud();
    setPrompt('← → walk · Space jump · ↑/E leave shed');
    showFlash(W.pick(W.SHED_GAGS), 140);
  }

  function enterYard() {
    mode = 'yard';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true; // require fresh press

    Audio.play('ui');
    camX = 0;
    avatar = makeAvatar(280, GROUND);
    landing = {
      phase: 'approach', // approach | descend | landed
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
    prevInteractHeld = true; // require fresh press

    Audio.play('power');
    avatar = null;
    landing = null;
    fly = {
      scrollX: 0,
      speed: 2.2,
      districtIndex: 0,
      districtTimer: 0,
      moonJuice: 0,
      tilt: 0,
    };
    showScreen('play');
    syncHud();
    setPrompt('← → steer · B Beam Mode · Enter end mission');
    showFlash('Welcome aboard, Zakk & T. Clay UFO online.', 120);
  }

  function enterBeam() {
    mode = 'beam';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true; // require fresh press

    Audio.play('ui');
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
    // seed a few targets
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
    syncHud();
    setPrompt('← → steer · B Beam Mode · Enter end mission');
    showFlash('Back in the cockpit.', 80);
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

  // ——— Input ———
  function inputX() {
    let v = 0;
    if (keys['arrowleft'] || keys['a'] || touchDirs.left) v -= 1;
    if (keys['arrowright'] || keys['d'] || touchDirs.right) v += 1;
    return v;
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
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) || e.code === 'Space') {
      e.preventDefault();
    }
    if (k === 'm') {
      Audio.toggle();
      updateMuteUI();
    }
    if ((k === 'enter' || k === ' ') && mode === 'title') startGame();
    if ((k === 'enter' || k === ' ') && mode === 'results') startGame();

    // interact
    if (k === 'e' || k === 'enter') interactQueued = true;

    // beam mode toggle / fire
    if (k === 'b') {
      if (mode === 'cockpit') enterBeam();
      else if (mode === 'beam') exitBeamToCockpit();
    }
    if (k === 'escape' && mode === 'beam') exitBeamToCockpit();

    if ((e.code === 'Space' || k === ' ')) {
      if (mode === 'beam') beamQueued = true;
      else if (mode === 'shed' || mode === 'yard') jumpQueued = true;
    }

    // end mission from cockpit
    if (k === 'enter' && mode === 'cockpit') {
      endMission();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  el.btnStart.addEventListener('click', startGame);
  el.btnAgain.addEventListener('click', startGame);
  el.btnTitle.addEventListener('click', () => {
    Audio.play('ui');
    mode = 'title';
    showScreen('title');
    el.titleHigh.textContent = 'High Score: ' + getHigh();
  });
  el.muteBtn.addEventListener('click', () => {
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

    // Jump: Space (queued) or touch ▲ when not standing at an interactable
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
    camX = Math.max(0, Math.min(worldW - CW, avatar.x - CW * 0.4));
  }

  function nearInteract() {
    if (mode === 'shed') {
      const doorX = 860;
      return Math.abs(avatar.x - doorX) < 55;
    }
    if (mode === 'yard' && landing && landing.phase === 'landed') {
      return Math.abs(avatar.x - landing.x) < 70;
    }
    return false;
  }

  // ——— Update modes ———
  function updateShed() {
    updateSideScroller(1000);

    // gag near table
    if (Math.abs(avatar.x - 650) < 40 && Math.random() < 0.01) {
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
      setPrompt('← → walk · Space jump · walk to EXIT →');
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
      // fog particles
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
    fly.speed = 2.0 + Math.abs(ix) * 1.5 + (fly.moonJuice > 0 ? 0.8 : 0);
    // steer: left scrolls "backward" feel, right forward — always drifts forward a bit
    fly.scrollX += fly.speed + ix * 1.8;
    fly.tilt = ix * 0.05;

    fly.districtTimer += fly.speed;
    if (fly.districtTimer > 600) {
      fly.districtTimer = 0;
      fly.districtIndex++;
      syncHud();
      showFlash(W.DISTRICTS[fly.districtIndex % W.DISTRICTS.length].name, 90);
    }

    if (fly.moonJuice > 0) fly.moonJuice--;

    // random moon juice pickup while flying (cheesy)
    if (Math.random() < 0.002 && fly.moonJuice <= 0) {
      fly.moonJuice = 300;
      Audio.play('power');
      showFlash('MOON JUICE! Beam Mode will be wider.', 100);
    }

    if (consumeBeamKey()) {
      // beam button from cockpit already handled via B
    }

    setPrompt('← → steer view · B Beam Mode · Enter = debrief');
  }

  function updateBeam() {
    const ix = inputX();
    beam.ufoX += ix * 5;
    beam.ufoX = Math.max(60, Math.min(CW - 60, beam.ufoX));
    beam.scrollX += 1.6 + Math.abs(ix) * 0.5;

    // move targets with scroll
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

    // fire beam
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

    // long-press B handled on keydown for exit; touch USE exits
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

    // auto-offer results after enough beamed (optional continue)
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

    // clear one-shot interact edge for held keys — use rising edge-ish
    // (held E would re-trigger; clear interactQueued only; key held is ok once per press via keydown)
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
      W.drawHuman(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t);
      // interact sparkle on door
      if (nearInteract()) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ ENTER', 890 - camX, GROUND - 160);
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

    // moon juice bar in beam
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
    } else if (mode === 'title') {
      // idle anim only
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
