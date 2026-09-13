/**
 * Mothership — Chilliwack scenes, drawing helpers, flavour copy.
 * Acts: Shed / Yard / Cockpit backdrop / Beam ground.
 */
(function (global) {
  const DISTRICTS = [
    { id: 'downtown', name: 'Downtown / Yale Road', ground: '#5a8f3a', accent: '#c4a35a' },
    { id: 'farm', name: 'Farmland / Corn', ground: '#7cb342', accent: '#e8c84a' },
    { id: 'vedder', name: 'Vedder River', ground: '#5e9e4a', accent: '#3a9ccc' },
    { id: 'cultus', name: 'Cultus Lake Direction', ground: '#4a9e5a', accent: '#2a8fcc' },
    { id: 'cheam', name: 'Cheam Peak / Coast Mountains', ground: '#6a8a4a', accent: '#8a9aaa' },
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
    'Mom\'s shed called. It wants its vibe back.',
    'Dry ice budget: exceeded. Worth it.',
  ];

  const RESULTS_LINERS = [
    'The mothership needs more fried chicken.',
    'Back to the shed for a debrief (and snacks).',
    'Zakk & Taylor will debrief over moon juice.',
    'Chilliwack will remember this. Probably.',
    'Clay UFO integrity: surprisingly intact.',
  ];

  const SHED_GAGS = [
    'Getting high in mom\'s shed. Peak Chilliwack.',
    'Lawnmower judges you silently.',
    'Is that… moon juice? Or just apple juice?',
    'Taylor: "We should go outside. The UFO is landing."',
  ];

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  function burst(list, x, y, color, n) {
    for (let i = 0; i < n; i++) {
      list.push({
        x, y,
        vx: rand(-3, 3),
        vy: rand(-4, 1),
        life: rand(20, 45),
        color,
        r: rand(2, 5),
      });
    }
  }

  function addFloater(list, x, y, text, color) {
    list.push({ x, y, text, color: color || '#7dff3a', life: 90, vy: -0.6 });
  }

  function updateFx(particles, floaters) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i];
      f.y += f.vy;
      f.life--;
      if (f.life <= 0) floaters.splice(i, 1);
    }
  }

  function drawFx(ctx, particles, floaters) {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / 40);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.font = 'bold 13px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    for (const f of floaters) {
      ctx.globalAlpha = Math.min(1, f.life / 30);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  // ——— Shared mountains / sky ———
  function drawSky(ctx, w, h, t) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1a3a6a');
    g.addColorStop(0.45, '#4a90c8');
    g.addColorStop(0.75, '#7ec8f0');
    g.addColorStop(1, '#b8e0a0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // stars / dusk dots
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 18; i++) {
      const sx = ((i * 137 + t * 0.02) % w);
      const sy = 20 + (i * 47) % (h * 0.35);
      ctx.fillRect(sx, sy, 2, 2);
    }
  }

  function drawMountains(ctx, w, groundY, scrollX) {
    const base = groundY;
    ctx.fillStyle = '#3a4a5a';
    ctx.beginPath();
    ctx.moveTo(0, base);
    for (let i = 0; i <= 12; i++) {
      const x = ((i * 110 - (scrollX * 0.3) % 110) );
      const peak = base - 60 - ((i * 37) % 50);
      ctx.lineTo(x, peak);
    }
    ctx.lineTo(w + 40, base);
    ctx.closePath();
    ctx.fill();

    // snowcaps
    ctx.fillStyle = '#d8e8f0';
    for (let i = 0; i < 6; i++) {
      const x = ((i * 180 - (scrollX * 0.3) % 180) + 40);
      const peak = base - 90 - (i % 3) * 15;
      ctx.beginPath();
      ctx.moveTo(x - 18, peak + 28);
      ctx.lineTo(x, peak);
      ctx.lineTo(x + 18, peak + 28);
      ctx.closePath();
      ctx.fill();
    }

    // nearer ridge
    ctx.fillStyle = '#4a6a4a';
    ctx.beginPath();
    ctx.moveTo(0, base);
    for (let i = 0; i <= 10; i++) {
      const x = i * 120 - (scrollX * 0.55) % 120;
      ctx.lineTo(x, base - 28 - (i % 4) * 12);
    }
    ctx.lineTo(w + 40, base);
    ctx.closePath();
    ctx.fill();
  }

  // ——— Act 1: Shed ———
  function drawShed(ctx, w, h, camX, t) {
    // interior walls
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(0, 0, w, h);

    // back wall wood planks
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(0, 0, w, h * 0.72);
    ctx.strokeStyle = '#2a1810';
    ctx.lineWidth = 2;
    for (let y = 0; y < h * 0.72; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // window (night / dusk outside)
    const wx = 180 - camX * 0.1;
    ctx.fillStyle = '#1a3048';
    ctx.fillRect(wx, 60, 120, 80);
    ctx.fillStyle = '#6ec8ff';
    ctx.globalAlpha = 0.35;
    ctx.fillRect(wx, 60, 120, 80);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#8a6a40';
    ctx.lineWidth = 6;
    ctx.strokeRect(wx, 60, 120, 80);
    ctx.beginPath();
    ctx.moveTo(wx + 60, 60);
    ctx.lineTo(wx + 60, 140);
    ctx.moveTo(wx, 100);
    ctx.lineTo(wx + 120, 100);
    ctx.stroke();

    // shelves
    drawShelf(ctx, 40 - camX, 100, t);
    drawShelf(ctx, 40 - camX, 200, t);

    // lawnmower
    drawLawnmower(ctx, 320 - camX, h * 0.72 - 8);

    // fridge / cooler
    drawFridge(ctx, 480 - camX, h * 0.72 - 100);

    // joint gag table (optional comedy prop)
    drawTable(ctx, 620 - camX, h * 0.72 - 4, t);

    // floor
    const floorY = h * 0.72;
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(0, floorY, w, h - floorY);
    ctx.strokeStyle = '#4a3020';
    for (let x = -((camX | 0) % 40); x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // exit door (right)
    const doorX = 860 - camX;
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(doorX, floorY - 140, 70, 140);
    ctx.fillStyle = '#8a6030';
    ctx.fillRect(doorX + 4, floorY - 136, 62, 132);
    ctx.fillStyle = '#c4a35a';
    ctx.beginPath();
    ctx.arc(doorX + 55, floorY - 70, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7dff3a';
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.fillText('EXIT →', doorX + 8, floorY - 150);

    // hanging lightbulb
    const lx = 480;
    ctx.strokeStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, 40);
    ctx.stroke();
    ctx.fillStyle = '#ffe88a';
    ctx.beginPath();
    ctx.arc(lx, 52, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,230,120,0.12)';
    ctx.beginPath();
    ctx.arc(lx, 80, 120, 0, Math.PI * 2);
    ctx.fill();

    // title plaque
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(w / 2 - 90, 12, 180, 22);
    ctx.fillStyle = '#c8e0b8';
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Mom's Shed — Chilliwack", w / 2, 27);
    ctx.textAlign = 'left';
  }

  function drawShelf(ctx, x, y, t) {
    ctx.fillStyle = '#8a6a40';
    ctx.fillRect(x, y, 100, 8);
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(x + 5, y - 40, 18, 40);
    ctx.fillRect(x + 40, y - 30, 14, 30);
    ctx.fillStyle = '#44aa66';
    ctx.fillRect(x + 70, y - 28, 16, 28); // mystery bottle
    // tiny "moon juice?" label flicker
    if (Math.sin(t * 0.004) > 0.7) {
      ctx.fillStyle = '#44ddff';
      ctx.font = '9px Segoe UI, sans-serif';
      ctx.fillText('?', x + 74, y - 32);
    }
  }

  function drawLawnmower(ctx, x, y) {
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(x, y - 28, 55, 22);
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x + 10, y, 10, 0, Math.PI * 2);
    ctx.arc(x + 45, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 55, y - 20);
    ctx.lineTo(x + 80, y - 45);
    ctx.stroke();
  }

  function drawFridge(ctx, x, y) {
    ctx.fillStyle = '#9a9aaa';
    ctx.fillRect(x, y, 50, 100);
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(x + 4, y + 8, 42, 40);
    ctx.fillRect(x + 4, y + 54, 42, 40);
    ctx.fillStyle = '#ccc';
    ctx.fillRect(x + 40, y + 25, 4, 16);
  }

  function drawTable(ctx, x, y, t) {
    ctx.fillStyle = '#6a4a30';
    ctx.fillRect(x, y - 36, 70, 8);
    ctx.fillRect(x + 6, y - 28, 6, 28);
    ctx.fillRect(x + 58, y - 28, 6, 28);
    // optional joint gag — tiny stick + smoke puffs (cheesy, not graphic)
    ctx.strokeStyle = '#c4a070';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 20, y - 42);
    ctx.lineTo(x + 48, y - 48);
    ctx.stroke();
    ctx.fillStyle = 'rgba(200,220,180,0.35)';
    const puff = 4 + Math.sin(t * 0.005) * 2;
    ctx.beginPath();
    ctx.arc(x + 52, y - 55 - Math.sin(t * 0.004) * 6, puff, 0, Math.PI * 2);
    ctx.arc(x + 60, y - 68 - Math.cos(t * 0.003) * 5, puff * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // ——— Act 2: Yard ———
  function drawYard(ctx, w, h, camX, t, landing) {
    drawSky(ctx, w, h, t);
    const groundY = h * 0.72;
    drawMountains(ctx, w, groundY, camX);

    // grass
    ctx.fillStyle = '#4a9a3a';
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = '#3a7a2a';
    for (let x = -((camX | 0) % 16); x < w; x += 16) {
      ctx.fillRect(x, groundY, 3, 8);
    }

    // house left
    const hx = 40 - camX * 0.4;
    ctx.fillStyle = '#8a6050';
    ctx.fillRect(hx, groundY - 160, 160, 160);
    ctx.fillStyle = '#5a3030';
    ctx.beginPath();
    ctx.moveTo(hx - 10, groundY - 160);
    ctx.lineTo(hx + 80, groundY - 220);
    ctx.lineTo(hx + 170, groundY - 160);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffe88a';
    ctx.fillRect(hx + 30, groundY - 100, 36, 40);
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(hx + 100, groundY - 70, 36, 70);
    ctx.fillStyle = '#c8e0b8';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.fillText("Mom's house", hx + 20, groundY - 170);

    // shed behind (left-ish) — where we came from
    const sx = 220 - camX;
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(sx, groundY - 90, 90, 90);
    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.moveTo(sx - 5, groundY - 90);
    ctx.lineTo(sx + 45, groundY - 120);
    ctx.lineTo(sx + 95, groundY - 90);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(sx + 30, groundY - 50, 30, 50);
    ctx.fillStyle = '#9bc87a';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.fillText('SHED', sx + 28, groundY - 95);

    // fence
    ctx.strokeStyle = '#8a6a40';
    ctx.lineWidth = 3;
    for (let x = -((camX | 0) % 40); x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, groundY - 40);
      ctx.lineTo(x, groundY);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, groundY - 30);
    ctx.lineTo(w, groundY - 30);
    ctx.stroke();

    // fog / dry ice vibe during landing
    if (landing && landing.phase !== 'idle') {
      ctx.fillStyle = 'rgba(200,220,230,0.18)';
      for (let i = 0; i < 8; i++) {
        const fx = ((i * 140 + t * 0.04) % (w + 100)) - 50;
        const fy = groundY - 20 - Math.sin(t * 0.002 + i) * 10;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 80, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // mothership
    if (landing) {
      drawClayUFO(ctx, landing.x - camX, landing.y, landing.scale || 1, t, landing.lights);
    }

    // Yale Rd sign far right flavour
    const signX = 1100 - camX;
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(signX, groundY - 70, 6, 70);
    ctx.fillStyle = '#2a5a2a';
    ctx.fillRect(signX - 40, groundY - 95, 90, 28);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.fillText('YALE RD →', signX - 32, groundY - 76);
  }

  function drawClayUFO(ctx, x, y, scale, t, lightsOn) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // landing lights / beams
    if (lightsOn) {
      const pulse = 0.35 + Math.sin(t * 0.01) * 0.15;
      ctx.fillStyle = 'rgba(125,255,58,' + pulse + ')';
      ctx.beginPath();
      ctx.moveTo(-20, 10);
      ctx.lineTo(20, 10);
      ctx.lineTo(70, 120);
      ctx.lineTo(-70, 120);
      ctx.closePath();
      ctx.fill();
    }

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(4, 22, 40, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // clay body
    ctx.fillStyle = '#8a9a3a';
    ctx.beginPath();
    ctx.ellipse(0, 6, 48, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b8d050';
    ctx.beginPath();
    ctx.ellipse(0, 0, 52, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // dome
    ctx.fillStyle = 'rgba(160, 230, 255, 0.9)';
    ctx.beginPath();
    ctx.ellipse(0, -12, 22, 18, 0, Math.PI, 0);
    ctx.fill();

    // green alien heads (band costumes)
    ctx.fillStyle = '#5dcc3a';
    ctx.beginPath();
    ctx.arc(-7, -14, 6, 0, Math.PI * 2);
    ctx.arc(7, -14, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-8.5, -15, 1.8, 0, Math.PI * 2);
    ctx.arc(-5.5, -15, 1.8, 0, Math.PI * 2);
    ctx.arc(5.5, -15, 1.8, 0, Math.PI * 2);
    ctx.arc(8.5, -15, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // rim lights
    const cols = ['#ff4466', '#44ff88', '#4488ff', '#ffcc22', '#ff4466'];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = lightsOn && Math.floor(t / 120 + i) % 2 === 0 ? '#fff' : cols[i];
      ctx.beginPath();
      ctx.arc(-28 + i * 14, 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // door hatch underside
    ctx.fillStyle = '#3a4a20';
    ctx.fillRect(-10, 12, 20, 6);

    ctx.restore();
  }

  // ——— Act 3: Cockpit ———
  function drawCockpit(ctx, w, h, fly, t) {
    // outside through windows (side-scrolling Chilliwack)
    drawSky(ctx, w, h, t);
    const horizon = h * 0.55;
    drawMountains(ctx, w, horizon, fly.scrollX);

    // farmland / road scrolling
    ctx.fillStyle = '#5a9a3a';
    ctx.fillRect(0, horizon, w, h - horizon);

    // Yale Road stripe
    const roadY = horizon + 40;
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, roadY, w, 36);
    ctx.strokeStyle = '#e8e8a0';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 18]);
    ctx.beginPath();
    ctx.moveTo(-((fly.scrollX | 0) % 38), roadY + 18);
    ctx.lineTo(w, roadY + 18);
    ctx.stroke();
    ctx.setLineDash([]);

    // corn / houses scrolling
    for (let i = 0; i < 8; i++) {
      const bx = ((i * 160 - fly.scrollX * 0.9) % (w + 160)) - 40;
      if (i % 3 === 0) {
        ctx.fillStyle = '#8a6050';
        ctx.fillRect(bx, horizon - 36, 40, 36);
        ctx.fillStyle = '#5a3030';
        ctx.beginPath();
        ctx.moveTo(bx - 4, horizon - 36);
        ctx.lineTo(bx + 20, horizon - 55);
        ctx.lineTo(bx + 44, horizon - 36);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#c8c040';
        for (let c = 0; c < 5; c++) {
          ctx.fillRect(bx + c * 10, horizon - 22, 6, 22);
        }
      }
    }

    // district label floating outside
    const d = DISTRICTS[fly.districtIndex % DISTRICTS.length];
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.font = 'bold 14px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.name, w / 2, horizon - 70);
    ctx.textAlign = 'left';

    // interior frame / dashboard
    // side pillars
    ctx.fillStyle = '#1a2818';
    ctx.fillRect(0, 0, 70, h);
    ctx.fillRect(w - 70, 0, 70, h);
    // top beam
    ctx.fillRect(0, 0, w, 48);
    // bottom dash
    ctx.fillStyle = '#243828';
    ctx.fillRect(0, h - 110, w, 110);
    ctx.fillStyle = '#1a2818';
    ctx.fillRect(0, h - 118, w, 10);

    // window frames
    ctx.strokeStyle = '#3a5a3a';
    ctx.lineWidth = 8;
    ctx.strokeRect(80, 56, w - 160, h - 180);
    ctx.beginPath();
    ctx.moveTo(w / 2, 56);
    ctx.lineTo(w / 2, h - 124);
    ctx.stroke();

    // green alien pilots (Zakk & T) reflected in dash
    ctx.fillStyle = '#5dcc3a';
    ctx.beginPath();
    ctx.arc(w / 2 - 50, h - 70, 16, 0, Math.PI * 2);
    ctx.arc(w / 2 + 50, h - 70, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(w / 2 - 54, h - 72, 3, 0, Math.PI * 2);
    ctx.arc(w / 2 - 46, h - 72, 3, 0, Math.PI * 2);
    ctx.arc(w / 2 + 46, h - 72, 3, 0, Math.PI * 2);
    ctx.arc(w / 2 + 54, h - 72, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9bc87a';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Zakk', w / 2 - 50, h - 45);
    ctx.fillText('T', w / 2 + 50, h - 45);

    // instruments
    ctx.fillStyle = '#0a1a0f';
    ctx.fillRect(w / 2 - 80, h - 100, 160, 36);
    ctx.strokeStyle = '#7dff3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 80, h - 100, 160, 36);
    ctx.fillStyle = '#7dff3a';
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.fillText('CLAY UFO — ONLINE', w / 2, h - 78);

    // moon juice gauge
    ctx.fillStyle = '#0a1a0f';
    ctx.fillRect(100, h - 90, 100, 14);
    ctx.fillStyle = '#44ddff';
    ctx.fillRect(100, h - 90, 100 * (fly.moonJuice / 300), 14);
    ctx.fillStyle = '#88eeff';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MOON JUICE', 100, h - 96);

    // beam mode hint on dash
    ctx.fillStyle = '#c8e0b8';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Press B — BEAM MODE', w - 100, h - 70);
    ctx.textAlign = 'left';

    // rivets
    ctx.fillStyle = '#5a7a4a';
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(20 + i * ((w - 40) / 9), 24, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ——— Act 4: Beam mode side-scroller ———
  function drawBeamScene(ctx, w, h, beam, t) {
    drawSky(ctx, w, h * 0.55, t);
    drawMountains(ctx, w, h * 0.5, beam.scrollX);

    // ground strip
    const gy = h * 0.78;
    ctx.fillStyle = '#5a9a3a';
    ctx.fillRect(0, gy, w, h - gy);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, gy + 20, w, 28);
    ctx.strokeStyle = '#e8e8a0';
    ctx.setLineDash([16, 14]);
    ctx.beginPath();
    ctx.moveTo(-((beam.scrollX | 0) % 30), gy + 34);
    ctx.lineTo(w, gy + 34);
    ctx.stroke();
    ctx.setLineDash([]);

    // UFO at top (positioned)
    drawClayUFO(ctx, beam.ufoX, 70, 0.85, t, true);

    // targets
    for (const tg of beam.targets) {
      if (tg.beamed) continue;
      drawTarget(ctx, tg.x, gy - 4, tg, t);
    }

    // active beam cone
    if (beam.beaming) {
      const bw = beam.wide ? 100 : 56;
      const grad = ctx.createLinearGradient(beam.ufoX, 90, beam.ufoX, gy);
      grad.addColorStop(0, 'rgba(125,255,58,0.55)');
      grad.addColorStop(1, 'rgba(125,255,58,0.05)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(beam.ufoX - 12, 90);
      ctx.lineTo(beam.ufoX + 12, 90);
      ctx.lineTo(beam.ufoX + bw / 2, gy);
      ctx.lineTo(beam.ufoX - bw / 2, gy);
      ctx.closePath();
      ctx.fill();
    }

    // exit hint
    ctx.fillStyle = 'rgba(10,30,16,0.7)';
    ctx.fillRect(w / 2 - 110, 8, 220, 22);
    ctx.fillStyle = '#7dff3a';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BEAM MODE — B / ESC to return to cockpit', w / 2, 23);
    ctx.textAlign = 'left';
  }

  function drawTarget(ctx, x, y, tg, t) {
    const bob = Math.sin(t * 0.008 + tg.wobble) * 3;
    // body
    ctx.fillStyle = tg.kind.color;
    ctx.beginPath();
    ctx.arc(x, y - 22 + bob, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = tg.kind.color;
    ctx.fillRect(x - 8, y - 14 + bob, 16, 18);
    // legs
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 4 + bob);
    ctx.lineTo(x - 6, y + 14 + bob);
    ctx.moveTo(x + 4, y + 4 + bob);
    ctx.lineTo(x + 8, y + 14 + bob);
    ctx.stroke();
    // label
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = '9px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tg.kind.label, x, y - 36 + bob);
    ctx.textAlign = 'left';
  }

  // ——— Human avatar (Zakk) ———
  function drawHuman(ctx, x, y, facing, moving, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const leg = moving ? Math.sin(t * 0.02) * 6 : 0;

    // legs
    ctx.strokeStyle = '#2a3a6a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-4, -8);
    ctx.lineTo(-4 - leg * 0.3, 0);
    ctx.moveTo(4, -8);
    ctx.lineTo(4 + leg * 0.3, 0);
    ctx.stroke();

    // body
    ctx.fillStyle = '#3a6aaa';
    ctx.fillRect(-10, -36, 20, 28);

    // head
    ctx.fillStyle = '#e8c4a0';
    ctx.beginPath();
    ctx.arc(0, -46, 10, 0, Math.PI * 2);
    ctx.fill();

    // hair
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(0, -50, 9, Math.PI, 0);
    ctx.fill();

    // arm
    ctx.strokeStyle = '#e8c4a0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, -30);
    ctx.lineTo(16, -18 + (moving ? leg * 0.2 : 0));
    ctx.stroke();

    ctx.restore();

    // name tag
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.font = 'bold 10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Zakk', x, y + 16);
    ctx.textAlign = 'left';
  }

  function drawTitleBackdrop(ctx, w, h, t) {
    drawSky(ctx, w, h, t);
    drawMountains(ctx, w, h * 0.7, t * 0.02);
    ctx.fillStyle = '#4a9a3a';
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
    drawClayUFO(ctx, w / 2 + Math.sin(t * 0.001) * 40, 140 + Math.cos(t * 0.0007) * 12, 1.2, t, true);
    ctx.fillStyle = 'rgba(5,20,10,0.35)';
    ctx.fillRect(0, 0, w, h);
  }

  global.MothershipWorld = {
    DISTRICTS,
    TARGET_KINDS,
    ONE_LINERS,
    RESULTS_LINERS,
    SHED_GAGS,
    rand,
    pick,
    burst,
    addFloater,
    updateFx,
    drawFx,
    drawShed,
    drawYard,
    drawCockpit,
    drawBeamScene,
    drawHuman,
    drawClayUFO,
    drawTitleBackdrop,
  };
})(window);
