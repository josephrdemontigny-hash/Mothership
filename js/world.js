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
    'Chilling with Taylor in mom\'s shed. Peak Chilliwack.',
    'Zakk & T: smoking, snacking, waiting for the UFO.',
    'Lawnmower judges the sesh silently.',
    'Taylor: "Pass it — wait, is that the mothership?"',
    'Tiny shed. Big plans. Questionable life choices.',
    'Is that… moon juice? Or just apple juice?',
  ];

  /** Tight shed interior world width (px). */
  const SHED_WORLD_W = 500;
  /** Door center X in shed world space. */
  const SHED_DOOR_X = 430;

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
      const x = ((i * 110 - (scrollX * 0.3) % 110));
      const peak = base - 60 - ((i * 37) % 50);
      ctx.lineTo(x, peak);
    }
    ctx.lineTo(w + 40, base);
    ctx.closePath();
    ctx.fill();

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

  // ——— Smoke puffs (cheesy comedy) ———
  function drawSmokePuffs(ctx, x, y, t, seed) {
    ctx.fillStyle = 'rgba(200,220,180,0.4)';
    for (let i = 0; i < 3; i++) {
      const ox = Math.sin(t * 0.003 + seed + i * 1.7) * 6;
      const oy = -8 - i * 10 - Math.sin(t * 0.004 + i + seed) * 4;
      const r = 5 + i * 2 + Math.sin(t * 0.005 + i) * 1.5;
      ctx.beginPath();
      ctx.arc(x + ox + i * 4, y + oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawJoint(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || -0.4);
    ctx.strokeStyle = '#c4a070';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();
    // ember tip
    ctx.fillStyle = '#ff8844';
    ctx.beginPath();
    ctx.arc(18, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ——— Act 1: Shed (tight interior) ———
  function drawShed(ctx, w, h, camX, t) {
    const floorY = h * 0.72;

    // interior walls
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(0, 0, w, h);

    // back wall wood planks
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(0, 0, w, floorY);
    ctx.strokeStyle = '#2a1810';
    ctx.lineWidth = 2;
    for (let y = 0; y < floorY; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // small window
    const wx = 70 - camX * 0.15;
    ctx.fillStyle = '#1a3048';
    ctx.fillRect(wx, 50, 90, 70);
    ctx.fillStyle = '#6ec8ff';
    ctx.globalAlpha = 0.35;
    ctx.fillRect(wx, 50, 90, 70);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#8a6a40';
    ctx.lineWidth = 5;
    ctx.strokeRect(wx, 50, 90, 70);
    ctx.beginPath();
    ctx.moveTo(wx + 45, 50);
    ctx.lineTo(wx + 45, 120);
    ctx.moveTo(wx, 85);
    ctx.lineTo(wx + 90, 85);
    ctx.stroke();

    // compact shelves (left)
    drawShelf(ctx, 20 - camX, 110, t);
    drawShelf(ctx, 20 - camX, 190, t);

    // lawnmower crammed in
    drawLawnmower(ctx, 160 - camX, floorY - 8);

    // mini fridge
    drawFridge(ctx, 250 - camX, floorY - 90);

    // couch / chill area (where Taylor hangs)
    drawCouch(ctx, 300 - camX, floorY);

    // tiny table with ashtray vibe
    drawChillTable(ctx, 340 - camX, floorY - 4, t);

    // floor
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(0, floorY, w, h - floorY);
    ctx.strokeStyle = '#4a3020';
    for (let x = -((camX | 0) % 40); x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // exit door — close, right side of tiny shed
    const doorX = SHED_DOOR_X - camX;
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(doorX - 28, floorY - 130, 56, 130);
    ctx.fillStyle = '#8a6030';
    ctx.fillRect(doorX - 24, floorY - 126, 48, 122);
    ctx.fillStyle = '#c4a35a';
    ctx.beginPath();
    ctx.arc(doorX + 14, floorY - 65, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7dff3a';
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT →', doorX, floorY - 140);
    ctx.textAlign = 'left';

    // hanging lightbulb (center of small shed)
    const lx = w / 2;
    ctx.strokeStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, 36);
    ctx.stroke();
    ctx.fillStyle = '#ffe88a';
    ctx.beginPath();
    ctx.arc(lx, 48, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,230,120,0.14)';
    ctx.beginPath();
    ctx.arc(lx, 70, 90, 0, Math.PI * 2);
    ctx.fill();

    // title plaque
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(w / 2 - 100, 10, 200, 22);
    ctx.fillStyle = '#c8e0b8';
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Mom's Shed — chill with T", w / 2, 25);
    ctx.textAlign = 'left';
  }

  function drawShelf(ctx, x, y, t) {
    ctx.fillStyle = '#8a6a40';
    ctx.fillRect(x, y, 80, 7);
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(x + 5, y - 36, 16, 36);
    ctx.fillRect(x + 32, y - 26, 12, 26);
    ctx.fillStyle = '#44aa66';
    ctx.fillRect(x + 55, y - 24, 14, 24);
    if (Math.sin(t * 0.004) > 0.7) {
      ctx.fillStyle = '#44ddff';
      ctx.font = '9px Segoe UI, sans-serif';
      ctx.fillText('?', x + 58, y - 28);
    }
  }

  function drawLawnmower(ctx, x, y) {
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(x, y - 24, 48, 18);
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x + 8, y, 8, 0, Math.PI * 2);
    ctx.arc(x + 38, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 48, y - 16);
    ctx.lineTo(x + 68, y - 38);
    ctx.stroke();
  }

  function drawFridge(ctx, x, y) {
    ctx.fillStyle = '#9a9aaa';
    ctx.fillRect(x, y, 42, 90);
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(x + 3, y + 6, 36, 36);
    ctx.fillRect(x + 3, y + 48, 36, 36);
    ctx.fillStyle = '#ccc';
    ctx.fillRect(x + 34, y + 22, 3, 14);
  }

  function drawCouch(ctx, x, y) {
    // low couch / bench
    ctx.fillStyle = '#5a3a4a';
    ctx.fillRect(x, y - 28, 90, 28);
    ctx.fillStyle = '#4a2a3a';
    ctx.fillRect(x - 4, y - 48, 14, 48);
    ctx.fillRect(x + 80, y - 48, 14, 48);
    ctx.fillStyle = '#6a4a5a';
    ctx.fillRect(x + 8, y - 40, 74, 14);
  }

  function drawChillTable(ctx, x, y, t) {
    ctx.fillStyle = '#6a4a30';
    ctx.fillRect(x, y - 32, 54, 7);
    ctx.fillRect(x + 4, y - 25, 5, 25);
    ctx.fillRect(x + 44, y - 25, 5, 25);
    // ashtray blob
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.ellipse(x + 27, y - 36, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // spare joint on table
    drawJoint(ctx, x + 12, y - 40, -0.2);
    drawSmokePuffs(ctx, x + 40, y - 42, t, 2.1);
  }

  /**
   * Taylor companion NPC — labelled, sitting near chill area, smoking.
   * sx/sy are screen coords (already cam-adjusted), feet at ground.
   */
  function drawTaylor(ctx, sx, sy, t) {
    ctx.save();
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(sx, sy, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // seated pose — legs tucked
    ctx.strokeStyle = '#2a4a3a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sx - 6, sy - 10);
    ctx.lineTo(sx - 14, sy - 2);
    ctx.moveTo(sx + 4, sy - 10);
    ctx.lineTo(sx + 16, sy - 4);
    ctx.stroke();

    // body (hoodie green-ish)
    ctx.fillStyle = '#3a8a5a';
    ctx.fillRect(sx - 11, sy - 38, 22, 28);

    // head
    ctx.fillStyle = '#e0b890';
    ctx.beginPath();
    ctx.arc(sx, sy - 48, 10, 0, Math.PI * 2);
    ctx.fill();

    // hair (lighter / different from Zakk)
    ctx.fillStyle = '#6a4a28';
    ctx.beginPath();
    ctx.arc(sx, sy - 52, 9, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(sx - 10, sy - 52, 4, 12);

    // arm holding joint
    ctx.strokeStyle = '#e0b890';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx + 11, sy - 30);
    ctx.lineTo(sx + 20, sy - 22);
    ctx.stroke();
    drawJoint(ctx, sx + 18, sy - 24, -0.55);
    drawSmokePuffs(ctx, sx + 32, sy - 28, t, 0.8);

    // label
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = 'bold 10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Taylor', sx, sy + 14);
    ctx.fillStyle = '#9bc87a';
    ctx.font = '9px Segoe UI, sans-serif';
    ctx.fillText('T', sx, sy + 26);
    ctx.textAlign = 'left';
    ctx.restore();
  }

  // ——— Act 2: Yard ———
  function drawYard(ctx, w, h, camX, t, landing) {
    drawSky(ctx, w, h, t);
    const groundY = h * 0.72;
    drawMountains(ctx, w, groundY, camX);

    ctx.fillStyle = '#4a9a3a';
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = '#3a7a2a';
    for (let x = -((camX | 0) % 16); x < w; x += 16) {
      ctx.fillRect(x, groundY, 3, 8);
    }

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

    // tiny shed outside
    const sx = 220 - camX;
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(sx, groundY - 70, 70, 70);
    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.moveTo(sx - 4, groundY - 70);
    ctx.lineTo(sx + 35, groundY - 95);
    ctx.lineTo(sx + 74, groundY - 70);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(sx + 22, groundY - 40, 24, 40);
    ctx.fillStyle = '#9bc87a';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.fillText('SHED', sx + 18, groundY - 76);

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

    if (landing) {
      drawClayUFO(ctx, landing.x - camX, landing.y, landing.scale || 1, t, landing.lights);
    }

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

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(4, 22, 40, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8a9a3a';
    ctx.beginPath();
    ctx.ellipse(0, 6, 48, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b8d050';
    ctx.beginPath();
    ctx.ellipse(0, 0, 52, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(160, 230, 255, 0.9)';
    ctx.beginPath();
    ctx.ellipse(0, -12, 22, 18, 0, Math.PI, 0);
    ctx.fill();

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

    const cols = ['#ff4466', '#44ff88', '#4488ff', '#ffcc22', '#ff4466'];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = lightsOn && Math.floor(t / 120 + i) % 2 === 0 ? '#fff' : cols[i];
      ctx.beginPath();
      ctx.arc(-28 + i * 14, 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#3a4a20';
    ctx.fillRect(-10, 12, 20, 6);

    ctx.restore();
  }

  // ——— Hazards for cockpit ———
  function drawHazardSprite(ctx, hz, t) {
    if (hz.kind === 'bird') {
      const flap = Math.sin(t * 0.022 + hz.phase) * 8;
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-14, flap);
      ctx.quadraticCurveTo(-5, -6, 0, 0);
      ctx.quadraticCurveTo(5, -6, 14, flap);
      ctx.stroke();
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (hz.kind === 'tower') {
      const hgt = 55 + hz.size * 45;
      ctx.fillStyle = '#555560';
      ctx.fillRect(-6, -hgt, 12, hgt);
      ctx.fillStyle = '#e84444';
      ctx.beginPath();
      ctx.arc(0, -hgt, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#777';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, -hgt * 0.4);
      ctx.lineTo(-18, 0);
      ctx.moveTo(6, -hgt * 0.4);
      ctx.lineTo(18, 0);
      ctx.stroke();
    } else if (hz.kind === 'powerline') {
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-80, 4);
      ctx.quadraticCurveTo(0, 16, 80, 4);
      ctx.stroke();
      ctx.fillStyle = '#4a3520';
      ctx.fillRect(-84, 0, 10, 50);
      ctx.fillRect(74, 0, 10, 50);
    }
  }

  // ——— Act 3: Cockpit (reactive flying view) ———
  function drawCockpit(ctx, w, h, fly, t) {
    const bank = fly.bank || 0;
    const alt = fly.alt != null ? fly.alt : 0.45;
    const scrollX = fly.scrollX || 0;
    const speed = fly.speed || 2;
    const shakeX = fly.shakeX || 0;
    const shakeY = fly.shakeY || 0;

    const winX = 80;
    const winY = 56;
    const winW = w - 160;
    const winH = h - 180;

    // Clip to window, then draw tilted world
    ctx.save();
    ctx.beginPath();
    ctx.rect(winX, winY, winW, winH);
    ctx.clip();

    ctx.save();
    ctx.translate(w / 2 + shakeX, h * 0.45 + shakeY);
    ctx.rotate(bank);
    ctx.translate(-w / 2, -h * 0.45);

    drawSky(ctx, w, h, t);

    // Horizon shifts with altitude (higher alt = more sky)
    const horizon = h * (0.42 + (1 - alt) * 0.28);
    drawMountains(ctx, w, horizon, scrollX);

    ctx.fillStyle = '#5a9a3a';
    ctx.fillRect(-40, horizon, w + 80, h);

    const d = DISTRICTS[fly.districtIndex % DISTRICTS.length];
    if (d.id === 'vedder' || d.id === 'cultus') {
      ctx.fillStyle = d.accent;
      ctx.globalAlpha = 0.55;
      const wy = horizon + 55 + Math.sin(scrollX * 0.01) * 8;
      ctx.fillRect(-40, wy, w + 80, 28);
      ctx.globalAlpha = 1;
    }

    // Yale Road
    const roadY = horizon + 38 + (1 - alt) * 20;
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-40, roadY, w + 80, 40);
    ctx.strokeStyle = '#e8e8a0';
    ctx.lineWidth = 3;
    ctx.setLineDash([22, 16]);
    ctx.beginPath();
    const dashOff = -((scrollX * 1.2) % 38);
    ctx.moveTo(dashOff - 40, roadY + 20);
    ctx.lineTo(w + 40, roadY + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Parallax Chilliwack props
    for (let i = 0; i < 10; i++) {
      const bx = ((i * 140 - scrollX * 0.95) % (w + 180)) - 60;
      if (i % 4 === 0) {
        ctx.fillStyle = '#8a6050';
        ctx.fillRect(bx, horizon - 40, 44, 40);
        ctx.fillStyle = '#5a3030';
        ctx.beginPath();
        ctx.moveTo(bx - 4, horizon - 40);
        ctx.lineTo(bx + 22, horizon - 62);
        ctx.lineTo(bx + 48, horizon - 40);
        ctx.closePath();
        ctx.fill();
      } else if (i % 4 === 1) {
        ctx.fillStyle = '#c8c040';
        for (let c = 0; c < 6; c++) {
          ctx.fillRect(bx + c * 9, horizon - 26, 5, 26);
        }
      } else if (i % 4 === 2) {
        ctx.fillStyle = '#3a5a28';
        ctx.beginPath();
        ctx.moveTo(bx + 10, horizon);
        ctx.lineTo(bx + 28, horizon - 45);
        ctx.lineTo(bx + 46, horizon);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#5a3a20';
        ctx.fillRect(bx + 24, horizon - 12, 8, 12);
      } else {
        ctx.fillStyle = '#a04040';
        ctx.fillRect(bx, horizon - 34, 50, 34);
        ctx.fillStyle = '#ccc';
        ctx.beginPath();
        ctx.moveTo(bx - 4, horizon - 34);
        ctx.lineTo(bx + 25, horizon - 55);
        ctx.lineTo(bx + 54, horizon - 34);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.fillStyle = '#3a7a2a';
    for (let i = 0; i < 20; i++) {
      const gx = ((i * 60 - scrollX * 1.6) % (w + 80)) - 40;
      ctx.fillRect(gx, horizon + 90, 4, 14);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.font = 'bold 14px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.name, w / 2, horizon - 50);
    ctx.textAlign = 'left';

    // Hazards
    if (fly.hazards) {
      for (const hz of fly.hazards) {
        const hx = hz.x - scrollX;
        if (hx < -100 || hx > w + 100) continue;
        ctx.save();
        if (hz.kind === 'tower') {
          ctx.translate(hx, horizon);
        } else if (hz.kind === 'powerline') {
          ctx.translate(hx, horizon - hz.alt * (horizon - 80));
        } else {
          // birds float by altitude
          ctx.translate(hx, horizon - hz.alt * (horizon - 50));
        }
        drawHazardSprite(ctx, hz, t);
        ctx.restore();
      }
    }

    ctx.restore(); // un-tilt
    ctx.restore(); // un-clip

    // Interior frame / dashboard
    ctx.fillStyle = '#1a2818';
    ctx.fillRect(0, 0, 70, h);
    ctx.fillRect(w - 70, 0, 70, h);
    ctx.fillRect(0, 0, w, 48);
    ctx.fillStyle = '#243828';
    ctx.fillRect(0, h - 110, w, 110);
    ctx.fillStyle = '#1a2818';
    ctx.fillRect(0, h - 118, w, 10);

    ctx.strokeStyle = '#3a5a3a';
    ctx.lineWidth = 8;
    ctx.strokeRect(winX, winY, winW, winH);
    ctx.beginPath();
    ctx.moveTo(w / 2, winY);
    ctx.lineTo(w / 2, h - 124);
    ctx.stroke();

    // Artificial horizon (bank)
    ctx.save();
    ctx.translate(w / 2, 30);
    ctx.rotate(bank);
    ctx.fillStyle = '#4a90c8';
    ctx.fillRect(-40, -10, 80, 10);
    ctx.fillStyle = '#5a9a3a';
    ctx.fillRect(-40, 0, 80, 10);
    ctx.strokeStyle = '#7dff3a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-40, -10, 80, 20);
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.stroke();
    ctx.restore();

    // Pilots
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

    // Instruments: alt / speed / lives
    ctx.fillStyle = '#0a1a0f';
    ctx.fillRect(w / 2 - 100, h - 105, 200, 42);
    ctx.strokeStyle = '#7dff3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 100, h - 105, 200, 42);
    ctx.fillStyle = '#7dff3a';
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    const altFt = Math.round(200 + alt * 1800);
    const spd = Math.round(40 + speed * 28);
    ctx.fillText('ALT ' + altFt + ' ft   SPD ' + spd, w / 2, h - 88);
    ctx.fillStyle = '#9bc87a';
    ctx.font = '10px Segoe UI, sans-serif';
    const lives = fly.lives | 0;
    ctx.fillText(lives > 0 ? ('LIVES ' + '♥'.repeat(lives)) : 'CRASH?', w / 2, h - 72);

    ctx.fillStyle = '#0a1a0f';
    ctx.fillRect(100, h - 90, 100, 14);
    ctx.fillStyle = '#44ddff';
    ctx.fillRect(100, h - 90, 100 * Math.min(1, (fly.moonJuice || 0) / 300), 14);
    ctx.fillStyle = '#88eeff';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MOON JUICE', 100, h - 96);
    if (fly.boosting) {
      ctx.fillStyle = '#ffcc44';
      ctx.fillText('BOOST!', 100, h - 70);
    }

    ctx.fillStyle = '#c8e0b8';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('B — BEAM   Enter — debrief', w - 100, h - 70);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#5a7a4a';
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(20 + i * ((w - 40) / 9), 24, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (fly.hitFlash > 0) {
      ctx.fillStyle = 'rgba(255,40,40,' + Math.min(0.45, fly.hitFlash / 40) + ')';
      ctx.fillRect(winX, winY, winW, winH);
    }
  }

  // ——— Act 4: Beam mode ———
  function drawBeamScene(ctx, w, h, beam, t) {
    drawSky(ctx, w, h * 0.55, t);
    drawMountains(ctx, w, h * 0.5, beam.scrollX);

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

    drawClayUFO(ctx, beam.ufoX, 70, 0.85, t, true);

    for (const tg of beam.targets) {
      if (tg.beamed) continue;
      drawTarget(ctx, tg.x, gy - 4, tg, t);
    }

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
    ctx.fillStyle = tg.kind.color;
    ctx.beginPath();
    ctx.arc(x, y - 22 + bob, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = tg.kind.color;
    ctx.fillRect(x - 8, y - 14 + bob, 16, 18);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 4 + bob);
    ctx.lineTo(x - 6, y + 14 + bob);
    ctx.moveTo(x + 4, y + 4 + bob);
    ctx.lineTo(x + 8, y + 14 + bob);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = '9px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tg.kind.label, x, y - 36 + bob);
    ctx.textAlign = 'left';
  }

  // ——— Human avatar (Zakk) ———
  function drawHuman(ctx, x, y, facing, moving, t, opts) {
    opts = opts || {};
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const leg = moving ? Math.sin(t * 0.02) * 6 : 0;

    ctx.strokeStyle = '#2a3a6a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-4, -8);
    ctx.lineTo(-4 - leg * 0.3, 0);
    ctx.moveTo(4, -8);
    ctx.lineTo(4 + leg * 0.3, 0);
    ctx.stroke();

    ctx.fillStyle = '#3a6aaa';
    ctx.fillRect(-10, -36, 20, 28);

    ctx.fillStyle = '#e8c4a0';
    ctx.beginPath();
    ctx.arc(0, -46, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.arc(0, -50, 9, Math.PI, 0);
    ctx.fill();

    ctx.strokeStyle = '#e8c4a0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, -30);
    ctx.lineTo(16, -18 + (moving ? leg * 0.2 : 0));
    ctx.stroke();

    ctx.restore();

    // smoking gag when idle-ish in shed
    if (opts.smoking) {
      drawJoint(ctx, x + facing * 14, y - 28, facing > 0 ? -0.5 : Math.PI + 0.5);
      drawSmokePuffs(ctx, x + facing * 28, y - 34, t, 1.4);
    }

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
    SHED_WORLD_W,
    SHED_DOOR_X,
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
    drawTaylor,
    drawClayUFO,
    drawTitleBackdrop,
  };
})(window);
