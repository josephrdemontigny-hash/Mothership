/**
 * Mothership — main game loop
 * Pilots: Zakk & Taylor (T). Aliens = the band in bad costumes.
 * Chilliwack / Fraser Valley arcade flyer.
 */
(function () {
  const W = MothershipWorld;
  const Audio = window.MothershipAudio;

  const HS_KEY = 'mothership_highscore';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const CW = canvas.width;
  const CH = canvas.height;

  // DOM
  const el = {
    hud: document.getElementById('hud'),
    score: document.getElementById('score'),
    beamed: document.getElementById('beamed'),
    lives: document.getElementById('lives'),
    district: document.getElementById('district'),
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
  };

  const keys = Object.create(null);
  const touchDirs = Object.create(null);

  let state = 'title'; // title | play | results
  let world = null;
  let player = null;
  let invuln = 0;
  let beamCooldown = 0;
  let flashMsg = null;
  let flashTimer = 0;
  let lastTs = 0;
  let animId = 0;

  function getHigh() {
    return parseInt(localStorage.getItem(HS_KEY) || '0', 10) || 0;
  }

  function setHigh(n) {
    localStorage.setItem(HS_KEY, String(n));
  }

  function updateMuteUI() {
    el.muteBtn.textContent = Audio.isMuted() ? '🔇' : '🔊';
  }

  function showScreen(name) {
    el.title.classList.toggle('hidden', name !== 'title');
    el.results.classList.toggle('hidden', name !== 'results');
    el.hud.classList.toggle('hidden', name !== 'play');
    el.touch.classList.toggle('hidden', name !== 'play');
  }

  function makePlayer() {
    return {
      x: CW / 2,
      y: CH * 0.28,
      vx: 0,
      vy: 0,
      w: 56,
      h: 28,
      beamActive: false,
      beamWide: false,
      moonJuice: 0,
      score: 0,
      lives: 3,
      beamed: 0,
      tilt: 0,
    };
  }

  function startGame() {
    Audio.unlock();
    Audio.play('ui');
    world = W.createWorld();
    player = makePlayer();
    invuln = 0;
    beamCooldown = 0;
    flashMsg = null;
    state = 'play';
    showScreen('play');
    el.district.textContent = W.currentDistrict(world).name;
    syncHud();
  }

  function endGame() {
    Audio.play('gameOver');
    state = 'results';
    const high = getHigh();
    const isNew = player.score > high;
    if (isNew) setHigh(player.score);
    el.resBeamed.textContent = String(player.beamed);
    el.resScore.textContent = String(player.score);
    el.resHigh.textContent = String(Math.max(high, player.score));
    el.resLiner.textContent = isNew
      ? 'NEW HIGH SCORE! The band is proud (and still green).'
      : W.pick(W.RESULTS_LINERS);
    showScreen('results');
    el.titleHigh.textContent = 'High Score: ' + getHigh();
  }

  function syncHud() {
    el.score.textContent = String(player.score);
    el.beamed.textContent = String(player.beamed);
    el.lives.textContent = String(player.lives);
  }

  function showFlash(msg, ms) {
    flashMsg = msg;
    flashTimer = ms || 120;
  }

  // ——— Input ———
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase()) ||
        e.code === 'Space') {
      e.preventDefault();
    }
    if (k === 'm') {
      Audio.toggle();
      updateMuteUI();
    }
    if (e.code === 'Space' || k === ' ') {
      if (state === 'play') tryBeam();
    }
    if ((k === 'enter' || k === ' ') && state === 'title') startGame();
    if ((k === 'enter' || k === ' ') && state === 'results') startGame();
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  el.btnStart.addEventListener('click', startGame);
  el.btnAgain.addEventListener('click', startGame);
  el.btnTitle.addEventListener('click', () => {
    Audio.play('ui');
    state = 'title';
    showScreen('title');
    el.titleHigh.textContent = 'High Score: ' + getHigh();
  });

  el.muteBtn.addEventListener('click', () => {
    Audio.toggle();
    updateMuteUI();
  });

  // Touch pad
  function bindTouchBtn(btn, dir) {
    const on = (e) => {
      e.preventDefault();
      touchDirs[dir] = true;
    };
    const off = (e) => {
      e.preventDefault();
      touchDirs[dir] = false;
    };
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

  const beamBtn = document.getElementById('btn-beam');
  beamBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    tryBeam();
  }, { passive: false });
  beamBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    tryBeam();
  });

  // Canvas tap to beam (play mode)
  canvas.addEventListener('pointerdown', (e) => {
    if (state !== 'play') return;
    // if touch controls visible, ignore canvas tap for movement — beam only on right half
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CW;
    if (x > CW * 0.55) tryBeam();
  });

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

  // ——— Beam ———
  function beamWidth() {
    return player.beamWide || player.moonJuice > 0 ? 90 : 48;
  }

  function tryBeam() {
    if (state !== 'play' || beamCooldown > 0) return;
    player.beamActive = true;
    beamCooldown = 18;
    Audio.play('beam');

    const half = beamWidth() / 2;
    const bx = player.x;
    let hit = false;

    for (const t of world.targets) {
      if (t.beamed) continue;
      if (Math.abs(t.x - bx) < half + t.r && t.y > player.y && t.y < CH * 0.95) {
        t.beamed = true;
        hit = true;
        const pts = t.kind.points + (player.moonJuice > 0 ? 50 : 0);
        player.score += pts;
        player.beamed++;
        W.burst(world, t.x, t.y, '#7dff3a', 16);
        W.addFloater(world, t.x, t.y - 20, '+' + pts, '#7dff3a');
        Audio.play('score');

        if (Math.random() < 0.45) {
          const line = W.pick(W.ONE_LINERS);
          showFlash(line, 150);
        } else {
          showFlash('Beamed: ' + t.kind.label + '!', 80);
        }
      }
    }

    // power-up pickup via beam or proximity handled in update
    if (!hit) {
      // still look cool
      W.burst(world, bx, player.y + 40, '#88ffaa', 4);
    }
    syncHud();
  }

  // ——— Collision ———
  function playerHitbox() {
    return { x: player.x, y: player.y, r: 18 };
  }

  function checkHazards() {
    if (invuln > 0) return;
    const p = playerHitbox();
    for (const h of world.hazards) {
      let hit = false;
      if (h.type === 'bird' || h.type === 'ufo') {
        const dx = h.x - p.x;
        const dy = h.y - p.y;
        hit = dx * dx + dy * dy < (p.r + h.r) * (p.r + h.r);
      } else if (h.type === 'tower') {
        hit =
          p.x > h.x - h.w / 2 - p.r &&
          p.x < h.x + h.w / 2 + p.r &&
          p.y > h.y - h.h - p.r &&
          p.y < h.y + p.r;
      } else if (h.type === 'mountain') {
        // rough triangle hit
        const top = h.y - h.h;
        if (p.y > top && p.y < h.y) {
          const progress = (p.y - top) / h.h;
          const halfW = (h.w / 2) * progress;
          hit = Math.abs(p.x - h.x) < halfW + p.r;
        }
      }
      if (hit) {
        player.lives--;
        invuln = 90;
        Audio.play('hit');
        W.burst(world, player.x, player.y, '#ff6b3d', 20);
        showFlash('Ouch! Watch the ' + h.type + 's!', 70);
        syncHud();
        if (player.lives <= 0) endGame();
        return;
      }
    }
  }

  function checkPowerups() {
    for (let i = world.powerups.length - 1; i >= 0; i--) {
      const p = world.powerups[i];
      const dx = p.x - player.x;
      const dy = p.y - player.y;
      if (dx * dx + dy * dy < 40 * 40) {
        world.powerups.splice(i, 1);
        player.moonJuice = 300; // frames ~5s at 60fps
        player.beamWide = true;
        Audio.play('power');
        showFlash('MOON JUICE! Wider beam + boost!', 100);
        W.burst(world, p.x, p.y, '#44ddff', 18);
        W.addFloater(world, p.x, p.y, 'MOON JUICE!', '#44ddff');
      }
    }
  }

  // ——— Update ———
  function update(dt) {
    if (state !== 'play') return;

    const accel = 0.55;
    const maxSpd = player.moonJuice > 0 ? 6.5 : 4.5;
    const friction = 0.85;

    player.vx += inputX() * accel;
    player.vy += inputY() * accel * 0.7;
    player.vx *= friction;
    player.vy *= friction;

    const spd = Math.hypot(player.vx, player.vy);
    if (spd > maxSpd) {
      player.vx = (player.vx / spd) * maxSpd;
      player.vy = (player.vy / spd) * maxSpd;
    }

    player.x += player.vx;
    player.y += player.vy;
    player.x = Math.max(40, Math.min(CW - 40, player.x));
    player.y = Math.max(50, Math.min(CH * 0.45, player.y));
    player.tilt = player.vx * 0.04;

    // scroll / difficulty
    const difficulty = Math.min(20, Math.floor(player.score / 500) + player.beamed / 5);
    world.speed = 1.35 + difficulty * 0.08 + (player.moonJuice > 0 ? 0.4 : 0);
    world.scrollY += world.speed;
    W.advanceDistrict(world);
    el.district.textContent = W.currentDistrict(world).name;

    W.updateSpawns(world, CH, difficulty);
    W.updateEntities(world, CH);

    if (beamCooldown > 0) beamCooldown--;
    if (player.beamActive && beamCooldown < 12) player.beamActive = false;

    if (player.moonJuice > 0) {
      player.moonJuice--;
      if (player.moonJuice <= 0) player.beamWide = false;
    }

    if (invuln > 0) invuln--;
    if (flashTimer > 0) flashTimer--;
    else flashMsg = null;

    checkPowerups();
    checkHazards();
  }

  // ——— Draw player UFO (clay / cartoon) ———
  function drawUFO(ctx) {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.tilt);

    if (invuln > 0 && Math.floor(invuln / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // beam
    if (player.beamActive || (beamCooldown > 10)) {
      const bw = beamWidth();
      const grad = ctx.createLinearGradient(0, 10, 0, CH);
      grad.addColorStop(0, 'rgba(125,255,58,0.55)');
      grad.addColorStop(1, 'rgba(125,255,58,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-bw * 0.25, 8);
      ctx.lineTo(bw * 0.25, 8);
      ctx.lineTo(bw * 0.55, CH - player.y);
      ctx.lineTo(-bw * 0.55, CH - player.y);
      ctx.closePath();
      ctx.fill();
    }

    // saucer shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(4, 18, 30, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // clay saucer body
    ctx.fillStyle = '#8a9a3a';
    ctx.beginPath();
    ctx.ellipse(0, 4, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b8d050';
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // dome (Zakk & Taylor inside — green costumes)
    ctx.fillStyle = 'rgba(160, 230, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(0, -8, 16, 14, 0, Math.PI, 0);
    ctx.fill();

    // two tiny green alien heads
    ctx.fillStyle = '#5dcc3a';
    ctx.beginPath();
    ctx.arc(-5, -10, 5, 0, Math.PI * 2);
    ctx.arc(5, -10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-6, -11, 1.5, 0, Math.PI * 2);
    ctx.arc(-4, -11, 1.5, 0, Math.PI * 2);
    ctx.arc(4, -11, 1.5, 0, Math.PI * 2);
    ctx.arc(6, -11, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // lights
    const lights = ['#ff4466', '#44ff88', '#4488ff', '#ffcc22'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = lights[i];
      ctx.beginPath();
      ctx.arc(-18 + i * 12, 6, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // moon juice glow
    if (player.moonJuice > 0) {
      ctx.strokeStyle = 'rgba(68,221,255,0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 42, 16, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // name tag cheeky
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.font = 'bold 8px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Zakk & T', 0, 22);
    ctx.textAlign = 'left';

    ctx.restore();
  }

  function drawFlash(ctx) {
    if (!flashMsg || flashTimer <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, flashTimer / 20);
    ctx.fillStyle = 'rgba(10,30,16,0.8)';
    ctx.font = 'bold 14px Segoe UI, sans-serif';
    const tw = ctx.measureText(flashMsg).width;
    const x = (CW - tw) / 2;
    const y = 70;
    ctx.fillRect(x - 12, y - 18, tw + 24, 28);
    ctx.strokeStyle = '#7dff3a';
    ctx.strokeRect(x - 12, y - 18, tw + 24, 28);
    ctx.fillStyle = '#e8ffe0';
    ctx.fillText(flashMsg, x, y);
    ctx.restore();
  }

  function drawTitleBackdrop(ctx) {
    // subtle animated sky behind title
    W.drawWorld(ctx, CW, CH, world || W.createWorld());
    // dim
    ctx.fillStyle = 'rgba(5,20,10,0.35)';
    ctx.fillRect(0, 0, CW, CH);
    // floating UFO deco
    const t = Date.now() / 1000;
    ctx.save();
    ctx.translate(CW / 2 + Math.sin(t) * 40, 100 + Math.cos(t * 0.7) * 10);
    ctx.fillStyle = '#b8d050';
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(160,230,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(0, -10, 18, 14, 0, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  }

  // ——— Frame ———
  function frame(ts) {
    const dt = Math.min(50, ts - lastTs || 16);
    lastTs = ts;

    if (state === 'play') {
      update(dt);
      W.drawWorld(ctx, CW, CH, world);
      drawUFO(ctx);
      drawFlash(ctx);

      // moon juice bar
      if (player.moonJuice > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(CW / 2 - 60, 12, 120, 8);
        ctx.fillStyle = '#44ddff';
        ctx.fillRect(CW / 2 - 60, 12, 120 * (player.moonJuice / 300), 8);
      }
    } else if (state === 'title') {
      if (!world) world = W.createWorld();
      world.scrollY += 0.4;
      W.advanceDistrict(world);
      drawTitleBackdrop(ctx);
    } else if (state === 'results') {
      if (world) {
        W.drawWorld(ctx, CW, CH, world);
        ctx.fillStyle = 'rgba(5,20,10,0.4)';
        ctx.fillRect(0, 0, CW, CH);
      }
    }

    animId = requestAnimationFrame(frame);
  }

  // Boot
  el.titleHigh.textContent = 'High Score: ' + getHigh();
  updateMuteUI();
  showScreen('title');
  world = W.createWorld();
  requestAnimationFrame(frame);

  // Resize canvas CSS — keep internal resolution
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
