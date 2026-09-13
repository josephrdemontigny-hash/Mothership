/**
 * Chilliwack / Fraser Valley scrolling world for Mothership.
 * Procedural districts, landmarks, targets, hazards — tweak copy freely.
 */
(function (global) {
  const WORLD_W = 960;
  const SCROLL_BASE = 1.35;

  /** Ordered districts the player flies through (loops). */
  const DISTRICTS = [
    {
      id: 'downtown',
      name: 'Downtown / Yale Road',
      ground: '#5a8f3a',
      road: '#4a4a4a',
      accent: '#c4a35a',
      features: 'yale',
    },
    {
      id: 'highway',
      name: 'Highway / Suburban Blocks',
      ground: '#6a9e45',
      road: '#555555',
      accent: '#8bbf5a',
      features: 'suburb',
    },
    {
      id: 'farm',
      name: 'Farmland / Corn',
      ground: '#7cb342',
      road: '#8b7355',
      accent: '#e8c84a',
      features: 'corn',
    },
    {
      id: 'vedder',
      name: 'Vedder River',
      ground: '#5e9e4a',
      road: '#6b6b6b',
      accent: '#3a9ccc',
      features: 'river',
    },
    {
      id: 'cultus',
      name: 'Cultus Lake Direction',
      ground: '#4a9e5a',
      road: '#5a5a5a',
      accent: '#2a8fcc',
      features: 'lake',
    },
    {
      id: 'cheam',
      name: 'Cheam Peak / Coast Mountains',
      ground: '#6a8a4a',
      road: '#555555',
      accent: '#8a9aaa',
      features: 'mountains',
    },
  ];

  const TARGET_KINDS = [
    { id: 'local', label: 'Local', points: 100, color: '#ffcc88' },
    { id: 'tourist', label: 'Tourist', points: 120, color: '#88ccff' },
    { id: 'chicken', label: 'Fried Chicken Fan', points: 200, color: '#ff9944' },
    { id: 'farmer', label: 'Corn Farmer', points: 150, color: '#ddaa44' },
    { id: 'hiker', label: 'Cheam Hiker', points: 180, color: '#aadd88' },
    { id: 'riverkid', label: 'Vedder Floater', points: 140, color: '#66bbdd' },
  ];

  const ONE_LINERS = [
    'Beam complete. Subject smells like fried chicken.',
    'Acquired: one tourist who thought this was Cultus Lake UFO tours.',
    'Moon juice levels: suspicious.',
    'Microplastics detected. Leaving those behind. Mostly.',
    'Zakk: "Nice beam, T!"',
    'Taylor: "Is that a corn maze or a landing strip?"',
    'Subject requested the chicken operating table. Denied… for now.',
    'Fraser Valley vibes: absorbed.',
    'Yale Road traffic: slightly improved.',
    'Cheam Peak called. Wants its silhouette back.',
    'Band costume integrity: 12%. Still green.',
    'Beamed a guy holding Tim\'s. Classic Chilliwack.',
  ];

  const RESULTS_LINERS = [
    'The mothership needs more fried chicken.',
    'Garage intro pending. Guitar shred: optional DLC.',
    'Zakk & Taylor will debrief over moon juice.',
    'Chilliwack will remember this. Probably.',
    'Next stop: chicken operating table. (Suggested feature.)',
  ];

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  function createWorld() {
    return {
      scrollY: 0,
      speed: SCROLL_BASE,
      districtIndex: 0,
      districtProgress: 0,
      segmentHeight: 900,
      targets: [],
      hazards: [],
      powerups: [],
      particles: [],
      floaters: [], // funny floating labels
      spawnTimer: 0,
      hazardTimer: 40,
      powerTimer: 400,
      seed: Math.random() * 10000,
    };
  }

  function currentDistrict(world) {
    return DISTRICTS[world.districtIndex % DISTRICTS.length];
  }

  function advanceDistrict(world) {
    world.districtProgress += world.speed;
    if (world.districtProgress >= world.segmentHeight) {
      world.districtProgress -= world.segmentHeight;
      world.districtIndex++;
    }
  }

  function spawnTarget(world, canvasH) {
    const kind = pick(TARGET_KINDS);
    const d = currentDistrict(world);
    // Bias kinds by district a bit
    let k = kind;
    if (d.id === 'farm' && Math.random() < 0.4) k = TARGET_KINDS[3];
    if (d.id === 'vedder' && Math.random() < 0.35) k = TARGET_KINDS[5];
    if (d.id === 'cheam' && Math.random() < 0.35) k = TARGET_KINDS[4];
    if (d.id === 'downtown' && Math.random() < 0.25) k = TARGET_KINDS[2];

    world.targets.push({
      x: rand(60, WORLD_W - 60),
      y: -rand(20, 80),
      r: 14,
      kind: k,
      wobble: rand(0, Math.PI * 2),
      beamed: false,
    });
  }

  function spawnHazard(world) {
    const types = ['bird', 'tower', 'ufo', 'mountain'];
    const d = currentDistrict(world);
    let type = pick(types);
    if (d.id === 'cheam') type = Math.random() < 0.5 ? 'mountain' : pick(['bird', 'ufo']);
    if (d.id === 'downtown' || d.id === 'highway') type = Math.random() < 0.45 ? 'tower' : pick(['bird', 'ufo']);
    if (d.id === 'farm' || d.id === 'vedder') type = Math.random() < 0.55 ? 'bird' : pick(['ufo', 'tower']);

    const h = {
      type,
      x: rand(40, WORLD_W - 40),
      y: -rand(30, 120),
      vx: 0,
      vy: world.speed + rand(0.2, 1.2),
    };

    if (type === 'bird') {
      h.r = 12;
      h.vx = rand(-1.5, 1.5);
      h.flap = 0;
    } else if (type === 'tower') {
      h.r = 18;
      h.w = 22;
      h.h = 70;
      h.vy = world.speed;
    } else if (type === 'ufo') {
      h.r = 20;
      h.vx = rand(-2, 2);
      h.hostile = true;
    } else if (type === 'mountain') {
      h.r = 40;
      h.w = rand(80, 140);
      h.h = rand(50, 90);
      h.vy = world.speed * 0.9;
    }

    world.hazards.push(h);
  }

  function spawnPowerup(world) {
    world.powerups.push({
      x: rand(80, WORLD_W - 80),
      y: -40,
      r: 16,
      bob: 0,
      kind: 'moonjuice',
    });
  }

  function updateSpawns(world, canvasH, difficulty) {
    world.spawnTimer--;
    world.hazardTimer--;
    world.powerTimer--;

    const targetRate = Math.max(35, 70 - difficulty * 3);
    const hazardRate = Math.max(45, 100 - difficulty * 4);

    if (world.spawnTimer <= 0) {
      spawnTarget(world, canvasH);
      if (Math.random() < 0.3) spawnTarget(world, canvasH);
      world.spawnTimer = targetRate + rand(0, 20);
    }
    if (world.hazardTimer <= 0) {
      spawnHazard(world);
      world.hazardTimer = hazardRate + rand(0, 30);
    }
    if (world.powerTimer <= 0) {
      spawnPowerup(world);
      world.powerTimer = 450 + rand(0, 200);
    }
  }

  function updateEntities(world, canvasH) {
    const sy = world.speed;

    for (const t of world.targets) {
      t.y += sy;
      t.wobble += 0.08;
      t.x += Math.sin(t.wobble) * 0.3;
    }
    world.targets = world.targets.filter((t) => t.y < canvasH + 40 && !t.beamed);

    for (const h of world.hazards) {
      h.y += h.vy;
      h.x += h.vx || 0;
      if (h.type === 'bird') {
        h.flap += 0.25;
        h.x += Math.sin(h.flap) * 0.8;
      }
      if (h.type === 'ufo') {
        h.x += Math.sin(h.y * 0.02) * 1.2;
      }
      if (h.x < 20) h.vx = Math.abs(h.vx || 1);
      if (h.x > WORLD_W - 20) h.vx = -Math.abs(h.vx || 1);
    }
    world.hazards = world.hazards.filter((h) => h.y < canvasH + 100);

    for (const p of world.powerups) {
      p.y += sy;
      p.bob += 0.1;
    }
    world.powerups = world.powerups.filter((p) => p.y < canvasH + 40);

    for (const f of world.floaters) {
      f.y -= 0.8;
      f.life--;
    }
    world.floaters = world.floaters.filter((f) => f.life > 0);

    for (const p of world.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.vy += 0.05;
    }
    world.particles = world.particles.filter((p) => p.life > 0);
  }

  function addFloater(world, x, y, text, color) {
    world.floaters.push({
      x, y, text, color: color || '#7dff3a', life: 90,
    });
  }

  function burst(world, x, y, color, n) {
    for (let i = 0; i < (n || 12); i++) {
      world.particles.push({
        x, y,
        vx: rand(-3, 3),
        vy: rand(-4, 1),
        life: 20 + (Math.random() * 20) | 0,
        color: color || '#7dff3a',
        r: rand(2, 5),
      });
    }
  }

  // ——— Drawing ———

  function drawSky(ctx, w, h, world) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#3a8fd4');
    g.addColorStop(0.45, '#6ec8ff');
    g.addColorStop(0.7, '#a8dff8');
    g.addColorStop(1, '#c8e8b0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // distant Coast Mountains / Cheam silhouette always on horizon
    ctx.fillStyle = '#5a6a7a';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.38);
    const peaks = [
      [0.05, 0.28], [0.12, 0.32], [0.18, 0.22], [0.25, 0.30],
      [0.35, 0.18], [0.42, 0.26], [0.5, 0.15], [0.58, 0.24],
      [0.68, 0.20], [0.78, 0.28], [0.88, 0.22], [1.0, 0.30],
    ];
    for (const [px, py] of peaks) {
      ctx.lineTo(w * px, h * py);
    }
    ctx.lineTo(w, h * 0.4);
    ctx.lineTo(0, h * 0.4);
    ctx.fill();

    // snowcaps on Cheam-ish peak
    ctx.fillStyle = '#e8eef5';
    ctx.beginPath();
    ctx.moveTo(w * 0.48, h * 0.15);
    ctx.lineTo(w * 0.5, h * 0.155);
    ctx.lineTo(w * 0.52, h * 0.15);
    ctx.lineTo(w * 0.5, h * 0.12);
    ctx.fill();

    // soft clouds
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    const cy = ((world.scrollY * 0.15) % (h + 80)) - 40;
    for (let i = 0; i < 4; i++) {
      const cx = (i * 240 + world.scrollY * 0.05) % (w + 100) - 50;
      cloud(ctx, cx, 40 + i * 30 + (cy % 20), 40 + i * 5);
    }
  }

  function cloud(ctx, x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
    ctx.arc(x + s * 0.4, y - s * 0.15, s * 0.4, 0, Math.PI * 2);
    ctx.arc(x + s * 0.8, y, s * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGroundStrip(ctx, w, h, world) {
    const d = currentDistrict(world);
    const groundY = h * 0.55;

    // scrolling ground band
    ctx.fillStyle = d.ground;
    ctx.fillRect(0, groundY, w, h - groundY);

    const offset = world.scrollY % 80;

    if (d.features === 'yale' || d.features === 'suburb') {
      // Yale Road / highway stripe
      ctx.fillStyle = d.road;
      ctx.fillRect(w * 0.35, groundY, w * 0.3, h - groundY);
      ctx.strokeStyle = '#e8e050';
      ctx.setLineDash([20, 20]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, groundY - offset);
      ctx.lineTo(w * 0.5, h + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // building blocks
      for (let i = 0; i < 8; i++) {
        const bx = (i % 2 === 0 ? 40 : w - 120) + (i * 7) % 30;
        const by = groundY + ((i * 70 + world.scrollY) % (h - groundY + 60)) - 30;
        ctx.fillStyle = i % 3 === 0 ? '#8a7a6a' : '#6a7a8a';
        ctx.fillRect(bx, by, 70, 50);
        ctx.fillStyle = '#ffe080';
        for (let wy = 8; wy < 45; wy += 14) {
          for (let wx = 8; wx < 60; wx += 16) {
            ctx.fillRect(bx + wx, by + wy, 8, 8);
          }
        }
      }

      // Yale Road label plaque
      if (d.features === 'yale') {
        drawSign(ctx, w * 0.12, groundY + 40 + (world.scrollY % 200), 'YALE RD');
      }
    }

    if (d.features === 'corn') {
      ctx.fillStyle = '#c9a227';
      for (let row = 0; row < 12; row++) {
        for (let col = 0; col < 28; col++) {
          const cx = 20 + col * 34 + (row % 2) * 10;
          const cy = groundY + 10 + ((row * 40 + world.scrollY * 1.2) % (h - groundY + 40));
          // corn stalk
          ctx.fillStyle = '#5a8a20';
          ctx.fillRect(cx, cy, 4, 28);
          ctx.fillStyle = '#e8c84a';
          ctx.beginPath();
          ctx.ellipse(cx + 2, cy, 6, 10, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      drawSign(ctx, w * 0.7, groundY + 60, 'CORN ★ U-PICK');
    }

    if (d.features === 'river') {
      // Vedder River winding
      ctx.fillStyle = '#2a8fcc';
      ctx.beginPath();
      ctx.moveTo(0, groundY + 20);
      for (let x = 0; x <= w; x += 20) {
        const yy = groundY + 40 + Math.sin((x + world.scrollY) * 0.02) * 30;
        ctx.lineTo(x, yy);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();
      // foam
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 20) {
        const yy = groundY + 40 + Math.sin((x + world.scrollY) * 0.02) * 30;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
      drawSign(ctx, w * 0.15, groundY + 10, 'VEDDER RIVER');
    }

    if (d.features === 'lake') {
      ctx.fillStyle = '#1a7ab8';
      ctx.beginPath();
      ctx.ellipse(w * 0.55, groundY + (h - groundY) * 0.55, w * 0.35, (h - groundY) * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.ellipse(w * 0.48, groundY + (h - groundY) * 0.4, w * 0.12, 20, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // beach
      ctx.fillStyle = '#e8d4a0';
      ctx.fillRect(w * 0.2, groundY, w * 0.15, 30);
      drawSign(ctx, w * 0.22, groundY + 50, '→ CULTUS LAKE');
    }

    if (d.features === 'mountains') {
      ctx.fillStyle = '#6a7a5a';
      ctx.fillRect(0, groundY, w, h - groundY);
      // rocky foothills scrolling
      ctx.fillStyle = '#7a8a9a';
      for (let i = 0; i < 5; i++) {
        const mx = i * 200 - (world.scrollY * 0.5) % 200;
        const mh = 60 + i * 15;
        ctx.beginPath();
        ctx.moveTo(mx, h);
        ctx.lineTo(mx + 60, groundY + 20);
        ctx.lineTo(mx + 120, h);
        ctx.fill();
        ctx.fillStyle = '#d0d8e0';
        ctx.beginPath();
        ctx.moveTo(mx + 50, groundY + 30);
        ctx.lineTo(mx + 60, groundY + 18);
        ctx.lineTo(mx + 70, groundY + 30);
        ctx.fill();
        ctx.fillStyle = '#7a8a9a';
      }
      drawSign(ctx, w * 0.6, groundY + 30, 'CHEAM PEAK ↑');
    }

    if (d.features === 'suburb') {
      drawSign(ctx, w * 0.75, groundY + 80, 'SUBURBS');
    }
  }

  function drawSign(ctx, x, y, text) {
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(20,40,20,0.75)';
    ctx.fillRect(x - 6, y - 14, tw + 12, 20);
    ctx.strokeStyle = '#7dff3a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 6, y - 14, tw + 12, 20);
    ctx.fillStyle = '#c8ff90';
    ctx.fillText(text, x, y);
  }

  function drawTarget(ctx, t) {
    const bob = Math.sin(t.wobble) * 2;
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(t.x, t.y + 16 + bob, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    ctx.fillStyle = t.kind.color;
    ctx.beginPath();
    ctx.arc(t.x, t.y + bob, t.r * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // head
    ctx.fillStyle = '#ffddbb';
    ctx.beginPath();
    ctx.arc(t.x, t.y - 10 + bob, 8, 0, Math.PI * 2);
    ctx.fill();

    // chicken bucket for chicken fan
    if (t.kind.id === 'chicken') {
      ctx.fillStyle = '#cc4422';
      ctx.fillRect(t.x + 8, t.y - 4 + bob, 14, 12);
      ctx.fillStyle = '#fff';
      ctx.font = '8px sans-serif';
      ctx.fillText('🍗', t.x + 9, t.y + 5 + bob);
    }

    // label
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = '9px Segoe UI, sans-serif';
    const lab = t.kind.label;
    const tw = ctx.measureText(lab).width;
    ctx.fillText(lab, t.x - tw / 2, t.y + 26 + bob);
  }

  function drawHazard(ctx, h) {
    if (h.type === 'bird') {
      ctx.fillStyle = '#333';
      const wing = Math.sin(h.flap) * 8;
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(h.x - 14, h.y + wing);
      ctx.lineTo(h.x, h.y);
      ctx.lineTo(h.x + 14, h.y - wing);
      ctx.stroke();
    } else if (h.type === 'tower') {
      ctx.fillStyle = '#888';
      ctx.fillRect(h.x - h.w / 2, h.y - h.h, h.w, h.h);
      ctx.fillStyle = '#cc3333';
      ctx.beginPath();
      ctx.moveTo(h.x, h.y - h.h - 15);
      ctx.lineTo(h.x - 8, h.y - h.h);
      ctx.lineTo(h.x + 8, h.y - h.h);
      ctx.fill();
      // lights
      ctx.fillStyle = (Math.floor(Date.now() / 300) % 2) ? '#ff2222' : '#440000';
      ctx.beginPath();
      ctx.arc(h.x, h.y - h.h - 8, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (h.type === 'ufo') {
      // rival UFO (other costume aliens)
      ctx.fillStyle = '#aa44cc';
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dd88ff';
      ctx.beginPath();
      ctx.arc(h.x, h.y - 6, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#ff4488';
      ctx.beginPath();
      ctx.arc(h.x - 8, h.y + 2, 3, 0, Math.PI * 2);
      ctx.arc(h.x, h.y + 3, 3, 0, Math.PI * 2);
      ctx.arc(h.x + 8, h.y + 2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (h.type === 'mountain') {
      ctx.fillStyle = '#6a7a8a';
      ctx.beginPath();
      ctx.moveTo(h.x - h.w / 2, h.y);
      ctx.lineTo(h.x, h.y - h.h);
      ctx.lineTo(h.x + h.w / 2, h.y);
      ctx.fill();
      ctx.fillStyle = '#e8eef5';
      ctx.beginPath();
      ctx.moveTo(h.x - 10, h.y - h.h + 18);
      ctx.lineTo(h.x, h.y - h.h);
      ctx.lineTo(h.x + 10, h.y - h.h + 18);
      ctx.fill();
    }
  }

  function drawPowerup(ctx, p) {
    const bob = Math.sin(p.bob) * 4;
    ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(p.x, p.y + bob, p.r + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#44ddff';
    ctx.beginPath();
    ctx.arc(p.x, p.y + bob, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MOON', p.x, p.y + bob - 2);
    ctx.fillText('JUICE', p.x, p.y + bob + 8);
    ctx.textAlign = 'left';
  }

  function drawWorld(ctx, w, h, world) {
    drawSky(ctx, w, h, world);
    drawGroundStrip(ctx, w, h, world);

    for (const t of world.targets) drawTarget(ctx, t);
    for (const hz of world.hazards) drawHazard(ctx, hz);
    for (const p of world.powerups) drawPowerup(ctx, p);

    for (const p of world.particles) {
      ctx.globalAlpha = Math.max(0, p.life / 30);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (const f of world.floaters) {
      ctx.globalAlpha = Math.min(1, f.life / 30);
      ctx.fillStyle = f.color;
      ctx.font = 'bold 13px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  }

  global.MothershipWorld = {
    WORLD_W,
    DISTRICTS,
    TARGET_KINDS,
    ONE_LINERS,
    RESULTS_LINERS,
    createWorld,
    currentDistrict,
    advanceDistrict,
    updateSpawns,
    updateEntities,
    addFloater,
    burst,
    drawWorld,
    pick,
    rand,
  };
})(window);
