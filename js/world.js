/**
 * Mothership — Chilliwack scenes, drawing helpers, flavour copy.
 * Modes: Shed / Yard / Fly (side-scroller + beam). Stereo starts theme; smoke with Tayler lands UFO.
 * Fly scroll is player-driven. No cockpit cassette.
 * Flight: North→South Chilliwack; Mt. Cheam (Lhílheqey) fixed EAST = LEFT of skyline.
 * Characters: Zakk (char-ref-2 all-black) & Tayler (char-ref-1 backwards cap).
 */
(function (global) {
  const DISTRICTS = [
    { id: 'north', name: 'North Chilliwack', ground: '#5a8f3a', accent: '#c4a35a' },
    { id: 'downtown', name: 'Downtown / Yale Road', ground: '#5a8f3a', accent: '#b8944a' },
    { id: 'farm', name: 'Vedder Farmland', ground: '#7cb342', accent: '#e8c84a' },
    { id: 'south', name: 'South Chilliwack', ground: '#5e9e4a', accent: '#3a9ccc' },
    { id: 'cultus', name: 'Cultus Lake Direction', ground: '#4a9e5a', accent: '#2a8fcc' },
  ];

  /** Good beam targets — humans */
  const PEOPLE_KINDS = [
    { id: 'local', label: 'Local', points: 100, color: '#ffcc88', human: true, look: 'denim' },
    { id: 'tourist', label: 'Tourist', points: 120, color: '#88ccff', human: true, look: 'blazer' },
    { id: 'chicken', label: 'Fried Chicken Fan', points: 200, color: '#ff9944', human: true, look: 'graphic' },
    { id: 'farmer', label: 'Corn Farmer', points: 150, color: '#ddaa44', human: true, look: 'western' },
    { id: 'hiker', label: 'Cheam Hiker', points: 180, color: '#aadd88', human: true, look: 'plaid' },
    { id: 'riverkid', label: 'Vedder Floater', points: 140, color: '#66bbdd', human: true, look: 'raglan' },
  ];

  /** Bad beam targets — pets & junk = hull damage */
  const HAZARD_KINDS = [
    { id: 'dog', label: 'Dog', color: '#c49a6c', human: false, shape: 'dog' },
    { id: 'cat', label: 'Cat', color: '#e8a060', human: false, shape: 'cat' },
    { id: 'chicken_pet', label: 'Chicken', color: '#f0e0a0', human: false, shape: 'chicken' },
    { id: 'lawnmower', label: 'Lawnmower', color: '#cc3333', human: false, shape: 'mower' },
    { id: 'trash', label: 'Trash Can', color: '#6a6a70', human: false, shape: 'trash' },
    { id: 'mailbox', label: 'Mailbox', color: '#4466aa', human: false, shape: 'mailbox' },
  ];

  // Legacy alias
  const TARGET_KINDS = PEOPLE_KINDS;

  const ONE_LINERS = [
    'Beam complete. Subject smells like fried chicken.',
    'Acquired: one tourist who thought this was Cultus Lake UFO tours.',
    'Moon juice levels: suspicious.',
    'Microplastics detected. Leaving those behind. Mostly.',
    'Zakk: "Nice beam, Tayler!"',
    'Tayler: "Is that a corn maze or a landing strip?"',
    'Subject requested the chicken operating table. Denied… for now.',
    'Fraser Valley vibes: absorbed.',
    'Yale Road traffic: slightly improved.',
    'Mt. Cheam called. Wants its silhouette back.',
    'Band costume integrity: 12%. Still green.',
    'Beamed a guy holding Tim\'s. Classic Chilliwack.',
    'Mom\'s shed called. It wants its vibe back.',
    'Dry ice budget: exceeded. Worth it.',
  ];

  const BAD_BEAM_LINERS = [
    'WRONG TARGET! Hull integrity down!',
    'That was a dog. The mothership does NOT want dogs.',
    'Tayler: "Zakk… that was the lawnmower."',
    'Trash can acquired. Hull hates microplastics AND trash.',
    'Cat beam rejected by galactic ethics committee.',
    'Chicken? Farm chicken ≠ fried chicken fan. Damage!',
  ];

  const RESULTS_LINERS = [
    'The mothership needs more fried chicken.',
    'Back to the shed for a debrief (and snacks).',
    'Zakk & Tayler will debrief over moon juice.',
    'Chilliwack will remember this. Probably.',
    'Mothership integrity: surprisingly intact.',
  ];

  const SHED_GAGS = [
    'Chilling with Tayler in mom\'s shed. Peak Chilliwack.',
    'Zakk & Tayler: smoking, snacking, waiting for the UFO.',
    'Lawnmower judges the sesh silently.',
    'Tayler: "Pass it — wait, is that the mothership?"',
    'Tiny shed. Big plans. Questionable life choices.',
    'Is that… moon juice? Or just apple juice?',
  ];

  const SHED_WORLD_W = 1520;
  const SHED_DOOR_X = 1420;
  /** Visible cassette prop in shed (on clutter near stereo) */
  const SHED_CASSETTE_X = 600;
  const SHED_CASSETTE_Y_OFF = 42; // above floor
  /** Boombox / stereo deck — far from cassette; walk across the shed to play */
  const SHED_STEREO_X = 1180;
  /** Barn-find El Camino (side view) center X — walk path in FRONT of the car */
  const SHED_CAMINO_X = 360;
  /** Large framed backyard window on back wall (world X of glass left edge) */
  const SHED_WINDOW_X = 720;
  const SHED_WINDOW_W = 380;
  const SHED_WINDOW_Y = 32;
  const SHED_WINDOW_H = 168;
  /** Default human sprite scale — taller vs shed interior (~1.48×). */
  const CHAR_SCALE = 1.48;
  /** Slightly shrink shed furniture so characters dominate room height. */
  const PROP_SCALE = 0.88;

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

  // ——— Sky / mountains (Mt. Cheam readable) ———
  function drawSky(ctx, w, h, t) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1a2a4a');
    g.addColorStop(0.35, '#4a88c0');
    g.addColorStop(0.7, '#7ec8f0');
    g.addColorStop(1, '#b8e0a0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // soft sun
    ctx.fillStyle = 'rgba(255, 230, 160, 0.55)';
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.13, 30, 0, Math.PI * 2); // west when facing south
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 14; i++) {
      const sx = ((i * 137 + t * 0.015) % w);
      const sy = 18 + (i * 47) % (h * 0.28);
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Coast / Cascade skyline. Camera faces roughly SOUTH while scrolling RIGHT
   * (North Chilliwack → South / Cultus). EAST is LEFT of frame — Mt. Cheam
   * (Lhílheqey) stays pinned there with slow parallax and never leaves screen.
   * West (RIGHT) has no Cheam — softer foothills / afternoon light only.
   */
  function drawMountains(ctx, w, groundY, scrollX) {
    const base = groundY;
    // Far Cascade backdrop — denser / taller on the east (left)
    ctx.fillStyle = '#3a4a5c';
    ctx.beginPath();
    ctx.moveTo(-40, base);
    for (let i = 0; i <= 18; i++) {
      const x = i * (w / 16) - 20;
      const eastBias = 1 - i / 18;
      const peak = base - 42 - eastBias * 70 - ((i * 37) % 28) * (0.4 + eastBias * 0.7);
      ctx.lineTo(x, peak);
    }
    ctx.lineTo(w + 60, base);
    ctx.closePath();
    ctx.fill();

    // Cheam Range: Welch / Lady / Knight as secondary silhouettes LEFT of Cheam
    const cheamX = w * 0.20; // fixed EAST = LEFT
    const cheamParallax = Math.sin(scrollX * 0.00035) * 5;
    const cx = cheamX + cheamParallax;

    function peak(x0, h, half, col) {
      const pg = ctx.createLinearGradient(x0 - half, base - h, x0 + half, base);
      pg.addColorStop(0, col);
      pg.addColorStop(0.55, col);
      pg.addColorStop(1, '#1a2834');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.moveTo(x0 - half, base);
      ctx.lineTo(x0 - half * 0.22, base - h * 0.62);
      ctx.lineTo(x0, base - h);
      ctx.lineTo(x0 + half * 0.28, base - h * 0.55);
      ctx.lineTo(x0 + half, base);
      ctx.closePath();
      ctx.fill();
      // lit west face
      ctx.fillStyle = 'rgba(180,200,220,0.08)';
      ctx.beginPath();
      ctx.moveTo(x0 - half, base);
      ctx.lineTo(x0 - half * 0.22, base - h * 0.62);
      ctx.lineTo(x0, base - h);
      ctx.closePath();
      ctx.fill();
      // east face shade
      ctx.fillStyle = 'rgba(8,12,20,0.32)';
      ctx.beginPath();
      ctx.moveTo(x0, base - h);
      ctx.lineTo(x0 + half * 0.28, base - h * 0.55);
      ctx.lineTo(x0 + half, base);
      ctx.closePath();
      ctx.fill();
    }

    // Welch Peak (furthest left, lower ridge)
    peak(cx - 210, 92, 70, '#3a4c5c');
    // Lady Peak
    peak(cx - 138, 118, 62, '#334656');
    // Knight Peak (closer to Cheam)
    peak(cx - 72, 128, 58, '#2e4252');

    // snow nubs on companions
    ctx.fillStyle = '#e8eef4';
    ctx.beginPath();
    ctx.moveTo(cx - 150, base - 100);
    ctx.lineTo(cx - 138, base - 118);
    ctx.lineTo(cx - 124, base - 96);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 84, base - 110);
    ctx.lineTo(cx - 72, base - 128);
    ctx.lineTo(cx - 58, base - 106);
    ctx.closePath();
    ctx.fill();

    // Mt. Cheam — sharp pyramidal Cascade, snow cap, always LEFT/EAST
    ctx.fillStyle = '#2a3a4c';
    ctx.beginPath();
    ctx.moveTo(cx - 108, base);
    ctx.lineTo(cx - 38, base - 128);
    ctx.lineTo(cx, base - 198);
    ctx.lineTo(cx + 36, base - 118);
    ctx.lineTo(cx + 118, base);
    ctx.closePath();
    ctx.fill();
    // darker east face (right side when facing south)
    ctx.fillStyle = '#1e2c3a';
    ctx.beginPath();
    ctx.moveTo(cx, base - 198);
    ctx.lineTo(cx + 36, base - 118);
    ctx.lineTo(cx + 118, base);
    ctx.closePath();
    ctx.fill();
    // west face highlight
    ctx.fillStyle = 'rgba(90,110,130,0.22)';
    ctx.beginPath();
    ctx.moveTo(cx - 108, base);
    ctx.lineTo(cx - 38, base - 128);
    ctx.lineTo(cx, base - 198);
    ctx.closePath();
    ctx.fill();
    // snow cap
    ctx.fillStyle = '#eef4fa';
    ctx.beginPath();
    ctx.moveTo(cx - 26, base - 154);
    ctx.lineTo(cx, base - 198);
    ctx.lineTo(cx + 22, base - 148);
    ctx.lineTo(cx + 8, base - 140);
    ctx.lineTo(cx - 4, base - 162);
    ctx.lineTo(cx - 16, base - 146);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(cx - 14, base - 168);
    ctx.lineTo(cx, base - 198);
    ctx.lineTo(cx + 4, base - 164);
    ctx.closePath();
    ctx.fill();
    // snow fingers
    ctx.fillStyle = '#d8e4ee';
    ctx.beginPath();
    ctx.moveTo(cx - 10, base - 150);
    ctx.lineTo(cx - 4, base - 128);
    ctx.lineTo(cx + 2, base - 148);
    ctx.closePath();
    ctx.fill();


    // Near foothills
    ctx.fillStyle = '#4a6a48';
    ctx.beginPath();
    ctx.moveTo(0, base);
    for (let i = 0; i <= 14; i++) {
      const x = i * (w / 12) - (scrollX * 0.4) % (w / 12);
      const hMul = i < 6 ? 1.15 : 0.75;
      ctx.lineTo(x, base - (18 + (i % 4) * 9) * hMul);
    }
    ctx.lineTo(w + 40, base);
    ctx.closePath();
    ctx.fill();

    const haze = ctx.createLinearGradient(w * 0.55, 0, w, 0);
    haze.addColorStop(0, 'rgba(180,200,220,0)');
    haze.addColorStop(1, 'rgba(200,210,180,0.12)');
    ctx.fillStyle = haze;
    ctx.fillRect(w * 0.55, base - 140, w * 0.45, 140);
  }

  function drawSmokePuffs(ctx, x, y, t, seed) {
    ctx.fillStyle = 'rgba(200,220,180,0.42)';
    for (let i = 0; i < 4; i++) {
      const ox = Math.sin(t * 0.003 + seed + i * 1.7) * 7;
      const oy = -8 - i * 11 - Math.sin(t * 0.004 + i + seed) * 4;
      const r = 5 + i * 2.2 + Math.sin(t * 0.005 + i) * 1.5;
      ctx.beginPath();
      ctx.arc(x + ox + i * 3, y + oy, r, 0, Math.PI * 2);
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
    ctx.fillStyle = '#ff8844';
    ctx.beginPath();
    ctx.arc(18, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ——— Characters (comic / pop-art readable) ———

  /**
   * Zakk — char-ref-2: grey-brown flat cap, dark aviators, handlebar mustache,
   * all-black western shirt (teal embroidery), black pants, combat boots, tattoos.
   * Feet at (x,y). facing: 1 right / -1 left.
   */
  function drawZakk(ctx, x, y, facing, moving, t, opts) {
    opts = opts || {};
    const scale = opts.scale != null ? opts.scale : CHAR_SCALE;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing * scale, scale);

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const leg = moving ? Math.sin(t * 0.02) * 7 : 0;
    const skin = '#d4a882';

    // boots
    ctx.fillStyle = '#111114';
    ctx.fillRect(-11, -6, 10, 7);
    ctx.fillRect(2, -6 + leg * 0.15, 10, 7);
    // black pants
    ctx.fillStyle = '#1a1a1e';
    ctx.fillRect(-10, -28, 9, 24);
    ctx.fillRect(1, -28 + leg * 0.1, 9, 24 - leg * 0.05);

    // torso — black western short-sleeve
    ctx.fillStyle = '#121214';
    ctx.fillRect(-12, -50, 24, 24);
    // teal embroidery on placket
    ctx.fillStyle = '#2ec4a0';
    ctx.fillRect(-1.5, -48, 3, 20);
    // collar tips teal
    ctx.beginPath();
    ctx.moveTo(-12, -50);
    ctx.lineTo(-6, -46);
    ctx.lineTo(-12, -44);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -50);
    ctx.lineTo(6, -46);
    ctx.lineTo(12, -44);
    ctx.closePath();
    ctx.fill();
    // alien pocket patches (tiny green heads)
    ctx.fillStyle = '#1a3a28';
    ctx.fillRect(-10, -42, 7, 7);
    ctx.fillRect(3, -42, 7, 7);
    ctx.fillStyle = '#4dff6a';
    ctx.beginPath();
    ctx.arc(-6.5, -38.5, 2.2, 0, Math.PI * 2);
    ctx.arc(6.5, -38.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // short sleeves
    ctx.fillStyle = '#121214';
    ctx.fillRect(-18, -48, 7, 12);
    ctx.fillRect(11, -48, 7, 12);

    // tattooed forearms
    ctx.fillStyle = skin;
    ctx.fillRect(-19, -36, 6, 14);
    ctx.fillRect(13, -36, 6, 14);
    ctx.strokeStyle = '#2a1a30';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-17, -34); ctx.lineTo(-15, -26); ctx.lineTo(-18, -24);
    ctx.moveTo(15, -34); ctx.lineTo(17, -28); ctx.lineTo(14, -24);
    ctx.stroke();

    // hand / joint arm
    if (opts.smoking) {
      ctx.strokeStyle = skin;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(16, -28);
      ctx.lineTo(22, -20);
      ctx.stroke();
    }

    // neck + tattoos
    ctx.fillStyle = skin;
    ctx.fillRect(-4, -56, 8, 8);
    ctx.strokeStyle = '#2a1a30';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-3, -54); ctx.lineTo(-1, -50);
    ctx.moveTo(2, -55); ctx.lineTo(3, -49);
    ctx.stroke();

    // head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -64, 11, 0, Math.PI * 2);
    ctx.fill();

    // handlebar mustache
    ctx.fillStyle = '#1a1210';
    ctx.beginPath();
    ctx.ellipse(-5, -58, 5, 2.2, -0.2, 0, Math.PI * 2);
    ctx.ellipse(5, -58, 5, 2.2, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-3, -59, 6, 2.5);

    // dark aviator sunglasses
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath();
    ctx.ellipse(-5, -65, 5.5, 4, -0.1, 0, Math.PI * 2);
    ctx.ellipse(5, -65, 5.5, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-0.5, -65);
    ctx.lineTo(0.5, -65);
    ctx.stroke();
    // temple arms
    ctx.beginPath();
    ctx.moveTo(-10.5, -65);
    ctx.lineTo(-13, -64);
    ctx.moveTo(10.5, -65);
    ctx.lineTo(13, -64);
    ctx.stroke();

    // grey-brown flat / newsboy cap
    ctx.fillStyle = '#6a5a48';
    ctx.beginPath();
    ctx.ellipse(0, -72, 13, 6, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath();
    ctx.ellipse(1, -70, 14, 4, 0, 0, Math.PI);
    ctx.fill();
    // cap button
    ctx.fillStyle = '#4a3a2a';
    ctx.beginPath();
    ctx.arc(0, -76, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (opts.smoking) {
      const jx = x + facing * 22 * scale;
      const jy = y - 20 * scale;
      drawJoint(ctx, jx, jy, facing > 0 ? -0.5 : Math.PI + 0.5);
      const smokeMul = opts.heavySmoke ? 2.2 : 1.4;
      drawSmokePuffs(ctx, jx + facing * 14, jy - 6, t, smokeMul);
      if (opts.heavySmoke) {
        drawSmokePuffs(ctx, jx + facing * 8, jy - 18, t + 400, 1.6);
      }
    }

    if (!opts.noLabel) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 10px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Zakk', x, y + 14);
      ctx.textAlign = 'left';
    }
  }

  /**
   * Tayler — char-ref-1: backwards maroon baseball cap, dark aviators,
   * light stubble, plaid short-sleeve, dark jeans, brown boots.
   */
  function drawTayler(ctx, x, y, facing, moving, t, opts) {
    opts = opts || {};
    const scale = opts.scale != null ? opts.scale : CHAR_SCALE;
    const seated = !!opts.seated;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing * scale, scale);

    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const leg = (!seated && moving) ? Math.sin(t * 0.02) * 7 : 0;
    const skin = '#d8b090';

    // brown boots
    ctx.fillStyle = '#6a3a20';
    if (seated) {
      ctx.fillRect(-14, -4, 12, 6);
      ctx.fillRect(4, -4, 12, 6);
    } else {
      ctx.fillRect(-11, -6, 10, 7);
      ctx.fillRect(2, -6 + leg * 0.15, 10, 7);
    }

    // dark jeans
    ctx.fillStyle = '#2a3a5a';
    if (seated) {
      ctx.fillRect(-12, -22, 24, 18);
      ctx.fillRect(-16, -10, 12, 8);
      ctx.fillRect(4, -10, 12, 8);
    } else {
      ctx.fillRect(-10, -28, 9, 24);
      ctx.fillRect(1, -28 + leg * 0.1, 9, 24);
    }

    // plaid short-sleeve (blue/yellow grid)
    const bodyTop = seated ? -44 : -50;
    const bodyH = seated ? 24 : 24;
    ctx.fillStyle = '#3a5a78';
    ctx.fillRect(-12, bodyTop, 24, bodyH);
    // plaid lines
    ctx.strokeStyle = 'rgba(230, 200, 80, 0.7)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-12, bodyTop + 4 + i * 5);
      ctx.lineTo(12, bodyTop + 4 + i * 5);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(180, 210, 240, 0.5)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-10 + i * 5, bodyTop);
      ctx.lineTo(-10 + i * 5, bodyTop + bodyH);
      ctx.stroke();
    }
    // chest pockets
    ctx.strokeStyle = '#2a4058';
    ctx.strokeRect(-10, bodyTop + 8, 7, 8);
    ctx.strokeRect(3, bodyTop + 8, 7, 8);

    // sleeves
    ctx.fillStyle = '#3a5a78';
    ctx.fillRect(-18, bodyTop + 2, 7, 12);
    ctx.fillRect(11, bodyTop + 2, 7, 12);
    ctx.fillStyle = skin;
    ctx.fillRect(-19, bodyTop + 14, 6, 12);
    ctx.fillRect(13, bodyTop + 14, 6, 12);

    if (opts.smoking) {
      ctx.strokeStyle = skin;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(16, bodyTop + 20);
      ctx.lineTo(22, bodyTop + 28);
      ctx.stroke();
    }

    // neck
    ctx.fillStyle = skin;
    ctx.fillRect(-4, bodyTop - 6, 8, 8);

    // head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, bodyTop - 14, 11, 0, Math.PI * 2);
    ctx.fill();

    // light stubble
    ctx.fillStyle = 'rgba(60,40,30,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, bodyTop - 8, 8, 5, 0, 0, Math.PI);
    ctx.fill();

    // dark aviator sunglasses
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath();
    ctx.ellipse(-5, bodyTop - 15, 5.5, 4, -0.1, 0, Math.PI * 2);
    ctx.ellipse(5, bodyTop - 15, 5.5, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-0.5, bodyTop - 15);
    ctx.lineTo(0.5, bodyTop - 15);
    ctx.moveTo(-10.5, bodyTop - 15);
    ctx.lineTo(-13, bodyTop - 14);
    ctx.moveTo(10.5, bodyTop - 15);
    ctx.lineTo(13, bodyTop - 14);
    ctx.stroke();

    // backwards maroon / burgundy baseball cap
    // brim at back (left when facing right = negative x for "back")
    ctx.fillStyle = '#6a2038';
    ctx.beginPath();
    ctx.ellipse(0, bodyTop - 22, 12, 5.5, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#5a1830';
    ctx.beginPath();
    ctx.ellipse(0, bodyTop - 20, 12.5, 4, 0, 0, Math.PI);
    ctx.fill();
    // brim pointing BACK (behind head)
    ctx.fillStyle = '#7a2840';
    ctx.beginPath();
    ctx.ellipse(-11, bodyTop - 18, 8, 3.2, -0.15, 0, Math.PI * 2);
    ctx.fill();
    // adjustment strap hint at forehead
    ctx.strokeStyle = '#8a3850';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(4, bodyTop - 18);
    ctx.lineTo(10, bodyTop - 18);
    ctx.stroke();

    ctx.restore();

    if (opts.smoking) {
      const jx = x + facing * 22 * scale;
      const jy = y - (seated ? 16 : 20) * scale;
      drawJoint(ctx, jx, jy, facing > 0 ? -0.55 : Math.PI + 0.55);
      const smokeMul = opts.heavySmoke ? 2.0 : 0.8;
      drawSmokePuffs(ctx, jx + facing * 14, jy - 6, t, smokeMul);
      if (opts.heavySmoke) {
        drawSmokePuffs(ctx, jx + facing * 6, jy - 16, t + 300, 1.5);
      }
    }

    if (!opts.noLabel) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 10px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Tayler', x, y + 14);
      ctx.textAlign = 'left';
    }
  }

  // Legacy aliases used by older call sites
  function drawHuman(ctx, x, y, facing, moving, t, opts) {
    drawZakk(ctx, x, y, facing, moving, t, opts);
  }
  function drawTaylor(ctx, sx, sy, t) {
    drawTayler(ctx, sx, sy, 1, false, t, { seated: true, smoking: true });
  }

  // ——— Shed props ———
  /** Compact cassette tape prop (world or screen coords) */
  function drawCassetteProp(ctx, x, y, opts) {
    opts = opts || {};
    const s = opts.scale || 1;
    const glow = !!opts.glow;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (glow) {
      ctx.fillStyle = 'rgba(125,255,58,0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 2, 28, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#2a1a3a';
    ctx.fillRect(-22, -12, 44, 24);
    ctx.strokeStyle = '#7dff3a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-22, -12, 44, 24);
    ctx.fillStyle = '#c4a35a';
    ctx.fillRect(-18, -8, 36, 10);
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-8, 4, 5, 0, Math.PI * 2);
    ctx.arc(8, 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7dff3a';
    ctx.font = 'bold 7px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MOTHERSHIP', 0, -1);
    if (opts.label) {
      ctx.fillStyle = '#e8ffe0';
      ctx.font = 'bold 10px Segoe UI, sans-serif';
      ctx.fillText(opts.label, 0, -18);
    }
    ctx.restore();
    ctx.textAlign = 'left';
  }


  /** Boombox / stereo deck on a stand (screen/world coords at floor contact via propAt) */
  function drawStereo(ctx, x, y, opts) {
    opts = opts || {};
    const playing = !!opts.playing;
    const glow = !!opts.glow;
    // stand / crate under deck
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(x - 6, y - 18, 72, 18);
    ctx.fillStyle = '#4a3828';
    ctx.fillRect(x - 4, y - 16, 68, 6);
    // main boombox body
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(x, y - 58, 60, 42);
    ctx.fillStyle = '#2a2a35';
    ctx.fillRect(x + 2, y - 56, 56, 38);
    // left / right speakers
    ctx.fillStyle = '#0e0e14';
    ctx.beginPath();
    ctx.arc(x + 14, y - 36, 10, 0, Math.PI * 2);
    ctx.arc(x + 46, y - 36, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + 14, y - 36, 7, 0, Math.PI * 2);
    ctx.arc(x + 46, y - 36, 7, 0, Math.PI * 2);
    ctx.stroke();
    // cassette slot / deck window
    ctx.fillStyle = '#050508';
    ctx.fillRect(x + 22, y - 48, 16, 10);
    ctx.strokeStyle = playing ? '#7dff3a' : '#666';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 22, y - 48, 16, 10);
    if (playing) {
      drawCassetteProp(ctx, x + 30, y - 43, { scale: 0.35 });
    }
    // knobs + LED
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(x + 26, y - 28, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 34, y - 28, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 42, y - 28, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = playing ? '#7dff3a' : '#334433';
    ctx.beginPath();
    ctx.arc(x + 52, y - 52, 3, 0, Math.PI * 2);
    ctx.fill();
    if (playing) {
      // equalizer bars
      ctx.fillStyle = '#7dff3a';
      for (let i = 0; i < 5; i++) {
        const bh = 4 + ((Math.sin((opts.t || 0) * 0.02 + i) + 1) * 5);
        ctx.fillRect(x + 8 + i * 5, y - 22 - bh, 3, bh);
      }
    }
    if (glow && !playing) {
      ctx.fillStyle = 'rgba(125,255,58,0.2)';
      ctx.beginPath();
      ctx.ellipse(x + 30, y - 40, 40, 28, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = playing ? '#7dff3a' : '#c8e0b8';
    ctx.font = 'bold 8px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(playing ? 'PLAYING' : 'STEREO', x + 30, y - 62);
    ctx.textAlign = 'left';
  }

  function drawShelf(ctx, x, y) {
    ctx.fillStyle = '#8a6a40';
    ctx.fillRect(x, y, 80, 7);
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(x + 5, y - 36, 16, 36);
    ctx.fillRect(x + 28, y - 28, 14, 28);
    ctx.fillStyle = '#44aa66';
    ctx.fillRect(x + 52, y - 24, 14, 24);
    ctx.fillStyle = '#c4a35a';
    ctx.fillRect(x + 68, y - 18, 8, 18);
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
    ctx.fillRect(x, y, 44, 95);
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(x + 3, y + 6, 38, 38);
    ctx.fillRect(x + 3, y + 50, 38, 38);
    ctx.fillStyle = '#ccc';
    ctx.fillRect(x + 36, y + 22, 3, 14);
    // stickers
    ctx.fillStyle = '#7dff3a';
    ctx.font = '8px Segoe UI, sans-serif';
    ctx.fillText('BEER', x + 8, y + 28);
    ctx.fillStyle = '#ff6644';
    ctx.fillText('MOON', x + 8, y + 68);
  }

  function drawAmp(ctx, x, y) {
    // combo amp + cables
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y - 50, 56, 50);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x + 4, y - 46, 48, 28);
    ctx.fillStyle = '#ff8844';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x + 8, y - 40, 40, 8);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#444';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(x + 12 + i * 10, y - 22, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // cables
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 56, y - 10);
    ctx.quadraticCurveTo(x + 80, y - 30, x + 70, y);
    ctx.stroke();
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(x + 50, y);
    ctx.quadraticCurveTo(x + 90, y + 10, x + 100, y - 5);
    ctx.stroke();
  }

  function drawPoster(ctx, x, y, title, col) {
    ctx.fillStyle = col || '#2a4a3a';
    ctx.fillRect(x, y, 48, 64);
    ctx.strokeStyle = '#c4a35a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 48, 64);
    ctx.fillStyle = '#e8ffe0';
    ctx.font = 'bold 8px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + 24, y + 36);
    ctx.textAlign = 'left';
  }

  function drawTools(ctx, x, y) {
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 3;
    // rake
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 4, y - 70);
    ctx.stroke();
    ctx.strokeStyle = '#666';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 4, y - 70);
      ctx.lineTo(x - 8 + i * 5, y - 80);
      ctx.stroke();
    }
    // shovel
    ctx.strokeStyle = '#8a6a40';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 22, y);
    ctx.lineTo(x + 22, y - 55);
    ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(x + 14, y - 55);
    ctx.lineTo(x + 30, y - 55);
    ctx.lineTo(x + 22, y - 70);
    ctx.closePath();
    ctx.fill();
  }

  function drawCouch(ctx, x, y) {
    ctx.fillStyle = '#5a3a4a';
    ctx.fillRect(x, y - 28, 100, 28);
    ctx.fillStyle = '#4a2a3a';
    ctx.fillRect(x - 4, y - 48, 14, 48);
    ctx.fillRect(x + 90, y - 48, 14, 48);
    ctx.fillStyle = '#6a4a5a';
    ctx.fillRect(x + 8, y - 40, 84, 14);
  }

  function drawChillTable(ctx, x, y, t) {
    ctx.fillStyle = '#6a4a30';
    ctx.fillRect(x, y - 32, 58, 7);
    ctx.fillRect(x + 4, y - 25, 5, 25);
    ctx.fillRect(x + 48, y - 25, 5, 25);
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.ellipse(x + 29, y - 36, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // butts in ashtray
    ctx.fillStyle = '#333';
    ctx.fillRect(x + 24, y - 40, 3, 5);
    ctx.fillRect(x + 30, y - 39, 3, 4);
    drawJoint(ctx, x + 10, y - 40, -0.2);
    drawSmokePuffs(ctx, x + 42, y - 44, t, 2.1);
  }

  /** Classic copper/bronze El Camino — barn-find project car (side view) */
  function drawElCamino(ctx, x, y, t, opts) {
    opts = opts || {};
    const dusty = opts.dusty !== false;
    ctx.save();
    ctx.translate(x, y);
    const s = opts.scale != null ? opts.scale : 1;
    ctx.scale(s, s);

    // Ground contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.beginPath();
    ctx.ellipse(6, 5, 248, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Metallic copper / bronze body palette (ref: barn-find El Camino)
    const copperHi = dusty ? '#c88858' : '#e0a060';
    const copperMid = dusty ? '#9a6038' : '#b87440';
    const copperLo = dusty ? '#6a3a22' : '#7a4428';
    const copperDeep = dusty ? '#4a2818' : '#5a301c';

    function bodyPaint(x0, y0, x1, y1) {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, copperDeep);
      g.addColorStop(0.22, copperLo);
      g.addColorStop(0.45, copperMid);
      g.addColorStop(0.62, copperHi);
      g.addColorStop(0.8, copperMid);
      g.addColorStop(1, copperLo);
      return g;
    }

    // —— Rear bed / cargo ——
    ctx.fillStyle = bodyPaint(48, -90, 230, -30);
    ctx.beginPath();
    ctx.moveTo(42, -40);
    ctx.lineTo(48, -88);
    ctx.lineTo(228, -86);
    ctx.lineTo(236, -38);
    ctx.closePath();
    ctx.fill();
    // bed rail lip
    ctx.fillStyle = copperDeep;
    ctx.fillRect(52, -90, 172, 6);
    // inner bed shadow
    ctx.fillStyle = 'rgba(20,12,8,0.55)';
    ctx.fillRect(58, -84, 160, 28);
    // clutter in bed
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(72, -106, 52, 24);
    ctx.fillStyle = '#2a4a22';
    ctx.fillRect(138, -100, 40, 18);
    // bed cover shadow / tarp hint
    ctx.fillStyle = 'rgba(30,28,40,0.45)';
    ctx.beginPath();
    ctx.moveTo(56, -88);
    ctx.lineTo(100, -118);
    ctx.lineTo(220, -104);
    ctx.lineTo(220, -88);
    ctx.closePath();
    ctx.fill();

    // —— Cabin body ——
    ctx.fillStyle = bodyPaint(-210, -90, 70, -20);
    ctx.beginPath();
    ctx.moveTo(-210, -36);
    ctx.lineTo(-198, -72);
    ctx.lineTo(-48, -90);
    ctx.lineTo(54, -88);
    ctx.lineTo(64, -38);
    ctx.closePath();
    ctx.fill();

    // Black vinyl roof
    const roofG = ctx.createLinearGradient(-160, -110, 40, -80);
    roofG.addColorStop(0, '#0a0a0c');
    roofG.addColorStop(0.4, '#2a2a30');
    roofG.addColorStop(0.7, '#141418');
    roofG.addColorStop(1, '#08080a');
    ctx.fillStyle = roofG;
    ctx.beginPath();
    ctx.moveTo(-162, -82);
    ctx.lineTo(-148, -108);
    ctx.lineTo(-10, -110);
    ctx.lineTo(36, -88);
    ctx.lineTo(-42, -88);
    ctx.closePath();
    ctx.fill();
    // roof seam
    ctx.strokeStyle = 'rgba(80,80,90,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-150, -100);
    ctx.lineTo(20, -98);
    ctx.stroke();

    // Glass (windshield + side) with chrome trim
    const glassG = ctx.createLinearGradient(-150, -108, -10, -80);
    glassG.addColorStop(0, dusty ? 'rgba(120,150,170,0.55)' : 'rgba(140,180,210,0.65)');
    glassG.addColorStop(0.5, 'rgba(200,220,235,0.35)');
    glassG.addColorStop(1, dusty ? 'rgba(80,110,130,0.5)' : 'rgba(60,100,130,0.55)');
    ctx.fillStyle = glassG;
    ctx.beginPath();
    ctx.moveTo(-152, -84);
    ctx.lineTo(-140, -104);
    ctx.lineTo(-18, -106);
    ctx.lineTo(-12, -88);
    ctx.closePath();
    ctx.fill();
    // vent window triangle
    ctx.fillStyle = dusty ? 'rgba(100,130,150,0.4)' : 'rgba(120,160,190,0.45)';
    ctx.beginPath();
    ctx.moveTo(-152, -84);
    ctx.lineTo(-140, -104);
    ctx.lineTo(-136, -84);
    ctx.closePath();
    ctx.fill();
    // rear cab glass
    ctx.fillStyle = dusty ? 'rgba(100,130,150,0.38)' : 'rgba(130,170,200,0.48)';
    ctx.fillRect(-8, -104, 36, 16);
    // chrome window trim
    ctx.strokeStyle = '#d8d8e0';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-152, -84);
    ctx.lineTo(-140, -104);
    ctx.lineTo(-18, -106);
    ctx.lineTo(-12, -88);
    ctx.closePath();
    ctx.stroke();

    // —— Long hood ——
    ctx.fillStyle = bodyPaint(-260, -74, -180, -20);
    ctx.beginPath();
    ctx.moveTo(-210, -36);
    ctx.lineTo(-210, -70);
    ctx.lineTo(-252, -72);
    ctx.lineTo(-268, -64);
    ctx.lineTo(-272, -28);
    ctx.lineTo(-210, -28);
    ctx.closePath();
    ctx.fill();
    // hood center highlight (sky reflection)
    ctx.fillStyle = dusty ? 'rgba(180,200,220,0.12)' : 'rgba(160,200,230,0.18)';
    ctx.beginPath();
    ctx.moveTo(-248, -70);
    ctx.lineTo(-214, -68);
    ctx.lineTo(-214, -48);
    ctx.lineTo(-250, -46);
    ctx.closePath();
    ctx.fill();
    // hood crease
    ctx.strokeStyle = 'rgba(255,220,180,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-266, -58);
    ctx.lineTo(-212, -56);
    ctx.stroke();

    // —— Chrome grille + dual headlights + bumper ——
    // bumper wrap
    const chrome = ctx.createLinearGradient(-280, -40, -240, -10);
    chrome.addColorStop(0, '#6a6a72');
    chrome.addColorStop(0.25, '#f0f0f6');
    chrome.addColorStop(0.5, '#ffffff');
    chrome.addColorStop(0.75, '#b0b0b8');
    chrome.addColorStop(1, '#505058');
    ctx.fillStyle = chrome;
    ctx.beginPath();
    ctx.moveTo(-278, -36);
    ctx.lineTo(-248, -38);
    ctx.lineTo(-246, -14);
    ctx.lineTo(-280, -16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(-274, -32, 22, 3);

    // grille housing
    ctx.fillStyle = '#1a1a1e';
    ctx.fillRect(-252, -62, 28, 26);
    // horizontal chrome bars
    ctx.strokeStyle = '#d0d0d8';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(-250, -60 + i * 4);
      ctx.lineTo(-226, -60 + i * 4);
      ctx.stroke();
    }
    // dual stacked headlights
    function headlamp(hx, hy) {
      const hg = ctx.createRadialGradient(hx - 2, hy - 2, 1, hx, hy, 9);
      hg.addColorStop(0, '#fff8e0');
      hg.addColorStop(0.45, '#ffe8a0');
      hg.addColorStop(0.8, '#c8a860');
      hg.addColorStop(1, '#6a5a30');
      ctx.fillStyle = '#c8c8d0';
      ctx.beginPath();
      ctx.arc(hx, hy, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(hx, hy, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.arc(hx - 2, hy - 2, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    headlamp(-256, -66);
    headlamp(-256, -42);
    // headlight glow in shed gloom
    ctx.fillStyle = 'rgba(255,230,160,0.16)';
    ctx.beginPath();
    ctx.arc(-268, -54, 22, 0, Math.PI * 2);
    ctx.fill();

    // —— Rocker + chrome strip ——
    ctx.fillStyle = copperDeep;
    ctx.fillRect(-240, -40, 470, 16);
    const strip = ctx.createLinearGradient(-230, -36, 220, -28);
    strip.addColorStop(0, '#808088');
    strip.addColorStop(0.3, '#e8e8f0');
    strip.addColorStop(0.6, '#a8a8b0');
    strip.addColorStop(1, '#707078');
    ctx.fillStyle = strip;
    ctx.fillRect(-234, -34, 458, 3.5);
    // rear bumper chrome
    ctx.fillStyle = chrome;
    ctx.fillRect(224, -36, 22, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(226, -32, 16, 3);

    // wheel-arch chrome eyebrows
    ctx.strokeStyle = '#c8c8d0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-142, -28, 32, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(142, -28, 32, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // —— Wheels / tires ——
    function wheel(wx) {
      // tire
      ctx.fillStyle = '#0c0c0e';
      ctx.beginPath();
      ctx.arc(wx, -26, 28, 0, Math.PI * 2);
      ctx.fill();
      // sidewall
      ctx.strokeStyle = '#2a2a30';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(wx, -26, 24, 0, Math.PI * 2);
      ctx.stroke();
      // tread notches
      ctx.strokeStyle = '#1a1a1e';
      ctx.lineWidth = 2;
      for (let a = 0; a < 12; a++) {
        const ang = a * (Math.PI / 6) + (t || 0) * 0.00015;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(ang) * 22, -26 + Math.sin(ang) * 22);
        ctx.lineTo(wx + Math.cos(ang) * 27, -26 + Math.sin(ang) * 27);
        ctx.stroke();
      }
      // chrome trim ring
      ctx.strokeStyle = '#d8d8e0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(wx, -26, 18, 0, Math.PI * 2);
      ctx.stroke();
      // hubcap
      const hub = ctx.createRadialGradient(wx - 3, -29, 1, wx, -26, 14);
      hub.addColorStop(0, '#f0f0f6');
      hub.addColorStop(0.4, '#a0a0a8');
      hub.addColorStop(1, '#3a3a42');
      ctx.fillStyle = hub;
      ctx.beginPath();
      ctx.arc(wx, -26, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a20';
      ctx.beginPath();
      ctx.arc(wx, -26, 4.5, 0, Math.PI * 2);
      ctx.fill();
      // spokes
      ctx.strokeStyle = 'rgba(220,220,230,0.7)';
      ctx.lineWidth = 1.5;
      for (let a = 0; a < 5; a++) {
        const ang = a * 1.256 + 0.2;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(ang) * 5, -26 + Math.sin(ang) * 5);
        ctx.lineTo(wx + Math.cos(ang) * 12, -26 + Math.sin(ang) * 12);
        ctx.stroke();
      }
    }
    wheel(-142);
    wheel(142);

    // Ambient occlusion under rocker
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(-230, -26, 450, 6);

    if (dusty) {
      // shed dust film
      ctx.fillStyle = 'rgba(180,160,120,0.12)';
      ctx.fillRect(-272, -118, 510, 100);
      // dusty mottling
      for (let i = 0; i < 18; i++) {
        ctx.fillStyle = 'rgba(160,140,100,' + (0.04 + (i % 3) * 0.02) + ')';
        ctx.beginPath();
        ctx.arc(-200 + i * 24, -70 - (i % 5) * 8, 6 + (i % 4), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EL CAMINO (project)', 0, 28);
    ctx.textAlign = 'left';
    ctx.restore();
  }

  function drawGardenWagon(ctx, x, y) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y - 28, 50, 18);
    ctx.fillStyle = '#333';
    ctx.fillRect(x + 2, y - 26, 46, 6);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 50, y - 22);
    ctx.lineTo(x + 68, y - 34);
    ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(x + 10, y - 6, 6, 0, Math.PI * 2);
    ctx.arc(x + 40, y - 6, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTrashBin(ctx, x, y) {
    ctx.fillStyle = '#8a8a92';
    ctx.fillRect(x, y - 40, 28, 40);
    ctx.fillStyle = '#6a6a72';
    ctx.fillRect(x - 2, y - 44, 32, 6);
    ctx.fillStyle = '#aaa';
    ctx.fillRect(x + 8, y - 48, 12, 5);
  }

  function drawSoilBag(ctx, x, y, col, label) {
    ctx.fillStyle = col || '#c8a030';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 6, y - 36);
    ctx.lineTo(x + 34, y - 36);
    ctx.lineTo(x + 40, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 7px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label || 'SOIL', x + 20, y - 18);
    ctx.textAlign = 'left';
  }

  function drawHoseCoil(ctx, x, y) {
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x, y - 12, 10 + i * 5, 0, Math.PI * 1.8);
      ctx.stroke();
    }
  }

  function drawSeedTrays(ctx, x, y) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y - 10, 36, 10);
    ctx.fillRect(x + 2, y - 18, 36, 10);
    ctx.fillStyle = '#3a6a3a';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 4 + i * 8, y - 16, 5, 4);
    }
  }

  function drawJar(ctx, x, y, col) {
    ctx.fillStyle = col || 'rgba(180,200,160,0.7)';
    ctx.fillRect(x, y - 16, 10, 16);
    ctx.fillStyle = '#888';
    ctx.fillRect(x - 1, y - 18, 12, 3);
  }

  function drawOrangeSled(ctx, x, y) {
    ctx.fillStyle = '#e85a20';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 40, y - 8, x + 80, y);
    ctx.lineTo(x + 76, y + 10);
    ctx.quadraticCurveTo(x + 40, y + 4, x + 4, y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c04010';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawPaintCan(ctx, x, y, col) {
    ctx.fillStyle = col || '#4466aa';
    ctx.fillRect(x, y - 16, 14, 16);
    ctx.fillStyle = '#ddd';
    ctx.fillRect(x - 1, y - 18, 16, 4);
    ctx.fillStyle = '#888';
    ctx.fillRect(x + 4, y - 20, 6, 3);
  }

  function drawMilkCrate(ctx, x, y) {
    ctx.fillStyle = '#2a5a8a';
    ctx.fillRect(x, y - 22, 28, 22);
    ctx.strokeStyle = '#1a3a5a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(x + 3 + i * 8, y - 18, 6, 14);
    }
  }

  function drawToolbox(ctx, x, y) {
    ctx.fillStyle = '#c04020';
    ctx.fillRect(x, y - 18, 36, 18);
    ctx.fillStyle = '#a03018';
    ctx.fillRect(x + 2, y - 14, 32, 6);
    ctx.fillStyle = '#888';
    ctx.fillRect(x + 14, y - 22, 8, 5);
  }

  function drawGuitarCase(ctx, x, y) {
    ctx.fillStyle = '#2a1810';
    ctx.beginPath();
    ctx.ellipse(x + 10, y - 55, 12, 18, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 4, y - 40, 14, 40);
    ctx.fillStyle = '#c4a35a';
    ctx.fillRect(x + 8, y - 28, 6, 4);
  }

  function drawPlantPot(ctx, x, y) {
    ctx.fillStyle = '#8a5030';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 4, y - 14);
    ctx.lineTo(x + 16, y - 14);
    ctx.lineTo(x + 20, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3a8a3a';
    ctx.beginPath();
    ctx.ellipse(x + 10, y - 20, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPegboard(ctx, x, y, ww, hh) {
    ctx.fillStyle = '#7a5a40';
    ctx.fillRect(x, y, ww, hh);
    ctx.fillStyle = '#5a4030';
    for (let py = y + 6; py < y + hh - 4; py += 10) {
      for (let px = x + 6; px < x + ww - 4; px += 10) {
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // hanging tools
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 12);
    ctx.lineTo(x + 14, y + 40);
    ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.fillRect(x + 10, y + 38, 8, 6);
    ctx.strokeStyle = '#aaa';
    ctx.beginPath();
    ctx.moveTo(x + 32, y + 16);
    ctx.lineTo(x + 48, y + 36);
    ctx.stroke();
    ctx.fillStyle = '#c4a35a';
    ctx.fillRect(x + 44, y + 34, 10, 5);
  }

  function drawLawnChair(ctx, x, y) {
    ctx.fillStyle = '#2a6aaa';
    ctx.fillRect(x, y - 22, 34, 6);
    ctx.fillRect(x + 2, y - 40, 30, 18);
    ctx.strokeStyle = '#1a3a5a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 4, y - 22);
    ctx.moveTo(x + 30, y);
    ctx.lineTo(x + 30, y - 22);
    ctx.moveTo(x + 4, y - 40);
    ctx.lineTo(x + 4, y - 22);
    ctx.stroke();
  }

  function drawBikeParts(ctx, x, y) {
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + 16, y - 16, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 16, y - 16);
    ctx.lineTo(x + 40, y - 28);
    ctx.lineTo(x + 52, y - 12);
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.fillRect(x + 38, y - 32, 16, 6);
  }

  function drawExtensionCord(ctx, x, y, t) {
    ctx.strokeStyle = '#ff8844';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 30, y - 18 + Math.sin((t || 0) * 0.001) * 2, x + 55, y - 4);
    ctx.quadraticCurveTo(x + 80, y + 8, x + 95, y - 10);
    ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 92, y - 14, 10, 8);
  }

  function drawJunkPile(ctx, x, y) {
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(x, y - 12, 40, 12);
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(x + 6, y - 22, 28, 12);
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(x + 12, y - 30, 18, 10);
    ctx.fillStyle = '#888';
    ctx.fillRect(x + 4, y - 16, 10, 6);
    ctx.fillStyle = '#3a5a2a';
    ctx.fillRect(x + 24, y - 18, 12, 8);
  }

  function drawShed(ctx, w, h, camX, t, opts) {
    opts = opts || {};
    const floorY = h * 0.72;
    const cassetteTaken = !!opts.cassetteTaken;
    const tapeInStereo = !!opts.tapeInStereo;
    const doorLocked = !!opts.doorLocked;
    const ufoProg = opts.windowUfo != null ? opts.windowUfo : 0;

    // plywood back wall — darker, dusty, subtle panel shading
    const wallG = ctx.createLinearGradient(0, 0, 0, floorY);
    wallG.addColorStop(0, '#5a482e');
    wallG.addColorStop(0.4, '#6a5436');
    wallG.addColorStop(1, '#4a3a26');
    ctx.fillStyle = wallG;
    ctx.fillRect(0, 0, w, floorY);
    ctx.strokeStyle = '#4a3a22';
    ctx.lineWidth = 2;
    for (let x = -((camX | 0) % 90); x < w + 40; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, floorY);
      ctx.stroke();
      // panel grain hint
      ctx.strokeStyle = 'rgba(90,70,40,0.25)';
      ctx.lineWidth = 1;
      for (let gy = 20; gy < floorY; gy += 28) {
        ctx.beginPath();
        ctx.moveTo(x + 4, gy);
        ctx.lineTo(x + 80, gy + (gy % 40) * 0.05);
        ctx.stroke();
      }
      ctx.strokeStyle = '#4a3a22';
      ctx.lineWidth = 2;
    }
    // exposed studs
    ctx.fillStyle = '#4a3824';
    for (let x = -((camX | 0) % 72) + 18; x < w + 40; x += 72) {
      ctx.fillRect(x, 0, 8, floorY);
    }
    ctx.fillStyle = '#3a2a1c';
    ctx.fillRect(0, 0, w, 22);
    for (let x = -((camX | 0) % 55); x < w + 40; x += 55) {
      ctx.fillStyle = '#5a4030';
      ctx.fillRect(x, 14, 10, 16);
    }
    // silver insulation peek between rafters
    ctx.fillStyle = 'rgba(180,190,200,0.35)';
    for (let x = -((camX | 0) % 55) + 12; x < w; x += 55) {
      ctx.fillRect(x, 4, 40, 10);
    }

    // orange sled in the rafters (ref vibe)
    drawOrangeSled(ctx, 140 - camX * 0.3, 8);

    // ——— LARGE framed backyard window (attached to back wall, world-locked) ———
    const wx = SHED_WINDOW_X - camX;
    const wy = SHED_WINDOW_Y;
    const ww = SHED_WINDOW_W;
    const wh = SHED_WINDOW_H;
    const frameT = 14; // solid wood frame thickness
    const mullion = 8;
    const glassX = wx + frameT;
    const glassY = wy + frameT;
    const glassW = ww - frameT * 2;
    const glassH = wh - frameT * 2;

    // sill / header boards that sit ON the plywood wall (reads attached)
    ctx.fillStyle = '#3a2a1c';
    ctx.fillRect(wx - 10, wy - 10, ww + 20, 10); // header board
    ctx.fillStyle = '#4a3424';
    ctx.fillRect(wx - 14, wy + wh - 4, ww + 28, 16); // deep sill
    ctx.fillStyle = '#6a4e34';
    ctx.fillRect(wx - 12, wy + wh + 2, ww + 24, 8);
    // side trim into studs
    ctx.fillStyle = '#4a3424';
    ctx.fillRect(wx - 8, wy - 2, 8, wh + 6);
    ctx.fillRect(wx + ww, wy - 2, 8, wh + 6);

    // outer wood frame (solid)
    const frameGrad = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
    frameGrad.addColorStop(0, '#5a4030');
    frameGrad.addColorStop(0.35, '#7a5a40');
    frameGrad.addColorStop(0.7, '#5a4030');
    frameGrad.addColorStop(1, '#3a2a1c');
    ctx.fillStyle = frameGrad;
    ctx.fillRect(wx, wy, ww, wh);
    // inner bevel
    ctx.fillStyle = '#8a6a48';
    ctx.fillRect(wx + 3, wy + 3, ww - 6, wh - 6);
    ctx.fillStyle = '#4a3424';
    ctx.fillRect(glassX - 2, glassY - 2, glassW + 4, glassH + 4);

    // glass + backyard + Cheam + UFO — clipped cleanly inside glass rect
    ctx.save();
    ctx.beginPath();
    ctx.rect(glassX, glassY, glassW, glassH);
    ctx.clip();

    const skyG = ctx.createLinearGradient(0, glassY, 0, glassY + glassH);
    skyG.addColorStop(0, '#4a9ae8');
    skyG.addColorStop(0.35, '#7ebef0');
    skyG.addColorStop(0.7, '#b8daf8');
    skyG.addColorStop(1, '#d8ecff');
    ctx.fillStyle = skyG;
    ctx.fillRect(glassX, glassY, glassW, glassH);

    // soft cloud wisps
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 4; i++) {
      const cx = glassX + 40 + i * 70 + Math.sin(t * 0.0004 + i) * 6;
      const cy = glassY + 18 + (i % 2) * 14;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 28, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mt. Cheam east/left (unlabeled) + companions
    const groundLine = glassY + glassH - 34;
    ctx.fillStyle = '#2e4254';
    ctx.beginPath();
    ctx.moveTo(glassX - 4, groundLine);
    ctx.lineTo(glassX + 36, glassY + 58);
    ctx.lineTo(glassX + 70, groundLine);
    ctx.fill();
    ctx.fillStyle = '#243848';
    ctx.beginPath();
    ctx.moveTo(glassX + 20, groundLine);
    ctx.lineTo(glassX + 78, glassY + 22);
    ctx.lineTo(glassX + 148, groundLine);
    ctx.fill();
    // Cheam pyramid
    ctx.fillStyle = '#1e3040';
    ctx.beginPath();
    ctx.moveTo(glassX + 48, groundLine);
    ctx.lineTo(glassX + 108, glassY + 10);
    ctx.lineTo(glassX + 178, groundLine);
    ctx.fill();
    // snow cap
    ctx.fillStyle = '#eef6ff';
    ctx.beginPath();
    ctx.moveTo(glassX + 92, glassY + 36);
    ctx.lineTo(glassX + 108, glassY + 10);
    ctx.lineTo(glassX + 128, glassY + 40);
    ctx.closePath();
    ctx.fill();
    // east face shade
    ctx.fillStyle = 'rgba(8,14,22,0.35)';
    ctx.beginPath();
    ctx.moveTo(glassX + 108, glassY + 10);
    ctx.lineTo(glassX + 178, groundLine);
    ctx.lineTo(glassX + 108, groundLine);
    ctx.closePath();
    ctx.fill();

    // tree line
    for (let i = 0; i < 11; i++) {
      const tx = glassX + 12 + i * 32;
      const trunkG = ctx.createLinearGradient(tx, groundLine - 40, tx, groundLine);
      trunkG.addColorStop(0, '#2a5a28');
      trunkG.addColorStop(1, '#1a3a1a');
      ctx.fillStyle = '#4a3020';
      ctx.fillRect(tx + 4, groundLine - 28, 5, 22);
      ctx.fillStyle = trunkG;
      ctx.beginPath();
      ctx.moveTo(tx - 6, groundLine - 18);
      ctx.lineTo(tx + 6, groundLine - 48);
      ctx.lineTo(tx + 18, groundLine - 18);
      ctx.closePath();
      ctx.fill();
    }
    // lawn / yard
    const lawn = ctx.createLinearGradient(0, groundLine, 0, glassY + glassH);
    lawn.addColorStop(0, '#3a8a2a');
    lawn.addColorStop(1, '#2a6a1a');
    ctx.fillStyle = lawn;
    ctx.fillRect(glassX, groundLine, glassW, glassY + glassH - groundLine);
    ctx.fillStyle = 'rgba(255,255,200,0.08)';
    ctx.fillRect(glassX, groundLine, glassW, 6);

    // UFO landing (clipped inside glass)
    if (ufoProg > 0.01) {
      const ufoX = glassX + 55 + ufoProg * (glassW * 0.38);
      const ufoY = glassY + 14 + Math.min(1, ufoProg) * (glassH - 62);
      const ufoS = 0.48 + ufoProg * 0.32;
      drawClayUFO(ctx, ufoX, ufoY, ufoS, t, ufoProg > 0.18);
      if (ufoProg > 0.45) {
        ctx.fillStyle = 'rgba(200,220,230,' + (0.12 + ufoProg * 0.28) + ')';
        ctx.beginPath();
        ctx.ellipse(ufoX, groundLine + 4, 28 + ufoProg * 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // glass reflection sheen
    const sheen = ctx.createLinearGradient(glassX, glassY, glassX + glassW * 0.4, glassY + glassH);
    sheen.addColorStop(0, 'rgba(255,255,255,0.18)');
    sheen.addColorStop(0.35, 'rgba(255,255,255,0.02)');
    sheen.addColorStop(1, 'rgba(20,40,60,0.08)');
    ctx.fillStyle = sheen;
    ctx.fillRect(glassX, glassY, glassW, glassH);
    ctx.restore();

    // mullions ON TOP of glass (2×2 panes) — solid wood, not broken
    ctx.fillStyle = '#6a4e34';
    // vertical center mullion
    ctx.fillRect(wx + ww / 2 - mullion / 2, glassY - 1, mullion, glassH + 2);
    // horizontal center mullion
    ctx.fillRect(glassX - 1, wy + wh / 2 - mullion / 2, glassW + 2, mullion);
    // outer frame highlight edge
    ctx.strokeStyle = 'rgba(200,170,120,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(wx + 2, wy + 2, ww - 4, wh - 4);
    // shadow under sill
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(wx - 8, wy + wh + 10, ww + 16, 4);

    if (ufoProg > 0.02 && ufoProg < 0.98) {
      ctx.fillStyle = '#1a4a1a';
      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ufoProg < 0.65 ? 'UFO INBOUND…' : 'LANDING…', wx + ww / 2, wy - 14);
      ctx.textAlign = 'left';
    } else if (ufoProg >= 0.98) {
      ctx.fillStyle = '#1a4a1a';
      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LANDED — EXIT →', wx + ww / 2, wy - 14);
      ctx.textAlign = 'left';
    }

    // long shelves with jars / chemicals / seed trays (ref)
    function wallShelf(sx, sy, len) {
      ctx.fillStyle = '#8a6a40';
      ctx.fillRect(sx, sy, len, 7);
      ctx.fillStyle = '#666';
      ctx.fillRect(sx + 4, sy + 7, 4, 14);
      ctx.fillRect(sx + len - 10, sy + 7, 4, 14);
    }
    wallShelf(20 - camX, 55, 160);
    wallShelf(20 - camX, 100, 160);
    wallShelf(20 - camX, 145, 160);
    // jars & bottles on shelves
    const jarCols = ['rgba(160,200,140,0.75)', 'rgba(200,180,100,0.7)', 'rgba(140,160,200,0.7)', '#c04030', '#2a6aaa'];
    for (let row = 0; row < 3; row++) {
      for (let j = 0; j < 7; j++) {
        drawJar(ctx, 28 - camX + j * 20, 55 + row * 45, jarCols[(j + row) % jarCols.length]);
      }
    }
    drawSeedTrays(ctx, 130 - camX, 100);
    drawSeedTrays(ctx, 100 - camX, 145);
    // red watering can
    ctx.fillStyle = '#c03020';
    ctx.fillRect(155 - camX, 82, 18, 14);
    ctx.fillRect(170 - camX, 86, 12, 6);

    // pegboard
    drawPegboard(ctx, 195 - camX, 50, 70, 110);

    // posters flanking the big window
    drawPoster(ctx, 640 - camX, 48, 'RETROFIT', '#3a1a4a');
    drawPoster(ctx, 1120 - camX, 44, 'UFO?', '#1a3a4a');
    drawPoster(ctx, 1170 - camX, 52, 'BEER', '#4a2a1a');

    function propAt(ax, drawFn) {
      ctx.save();
      ctx.translate(ax, floorY);
      ctx.scale(PROP_SCALE, PROP_SCALE);
      ctx.translate(-ax, -floorY);
      drawFn();
      ctx.restore();
    }

    // Life-sized El Camino — NOT furniture-scaled; path walks in FRONT
    drawElCamino(ctx, SHED_CAMINO_X - camX, floorY, t, { dusty: true });

    // LEFT clutter at Camino nose / behind (path stays clear in front)
    propAt(36 - camX, function () { drawGardenWagon(ctx, 36 - camX, floorY); });
    propAt(88 - camX, function () { drawTrashBin(ctx, 88 - camX, floorY); });
    propAt(55 - camX, function () { drawHoseCoil(ctx, 68 - camX, floorY); });
    drawSoilBag(ctx, 108 - camX, floorY, '#c8a030', 'JIFFY');
    propAt(24 - camX, function () { drawJunkPile(ctx, 24 - camX, floorY); });

    // Cassette lives in the Camino-end clutter (far from stereo)
    propAt(640 - camX, function () { drawGuitarCase(ctx, 640 - camX, floorY); });
    propAt(655 - camX, function () { drawToolbox(ctx, 655 - camX, floorY); });
    drawPaintCan(ctx, 668 - camX, floorY, '#4466aa');
    drawPaintCan(ctx, 686 - camX, floorY, '#aa4444');

    // Mid-shed walk: mostly open (Camino tail → stereo)
    propAt(820 - camX, function () { drawLawnmower(ctx, 820 - camX, floorY - 8); });
    propAt(900 - camX, function () { drawCouch(ctx, 900 - camX, floorY); });
    propAt(950 - camX, function () { drawChillTable(ctx, 950 - camX, floorY - 4, t); });
    propAt(1020 - camX, function () { drawLawnChair(ctx, 1020 - camX, floorY); });
    propAt(1080 - camX, function () { drawAmp(ctx, 1080 - camX, floorY); });

    // Stereo lives toward EXIT, a long walk from the cassette
    propAt(SHED_STEREO_X - camX, function () {
      drawStereo(ctx, SHED_STEREO_X - camX, floorY, {
        playing: tapeInStereo,
        glow: cassetteTaken && !tapeInStereo,
        t: t,
      });
    });
    propAt(1120 - camX, function () {
      drawMilkCrate(ctx, 1120 - camX, floorY);
      drawMilkCrate(ctx, 1124 - camX, floorY - 20);
    });
    propAt(1240 - camX, function () { drawFridge(ctx, 1240 - camX, floorY - 95); });
    propAt(1300 - camX, function () { drawBikeParts(ctx, 1300 - camX, floorY); });
    propAt(1340 - camX, function () { drawJunkPile(ctx, 1340 - camX, floorY); });
    drawExtensionCord(ctx, 1140 - camX, floorY - 2, t);

    // cassette crate
    ctx.fillStyle = '#8a6a40';
    ctx.fillRect(SHED_CASSETTE_X - 8 - camX, floorY - 22, 28, 22);
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(SHED_CASSETTE_X + 6 - camX, floorY - 36, 22, 14);

    if (!cassetteTaken) {
      const cx = SHED_CASSETTE_X - camX;
      const cy = floorY - SHED_CASSETTE_Y_OFF;
      drawCassetteProp(ctx, cx, cy, { glow: true, label: 'CASSETTE' });
      const bob = Math.sin(t * 0.008) * 3;
      ctx.fillStyle = '#1a5a1a';
      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('▲ GRAB', cx, cy - 28 + bob);
      ctx.textAlign = 'left';
    } else if (!tapeInStereo) {
      const sx = SHED_STEREO_X + 30 - camX;
      const sy = floorY - 78;
      const bob = Math.sin(t * 0.01) * 3;
      ctx.fillStyle = '#1a5a1a';
      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('▲ PLAY ON STEREO', sx, sy + bob);
      ctx.textAlign = 'left';
    }

    // dusty concrete / dirt floor
    ctx.fillStyle = '#4a4034';
    ctx.fillRect(0, floorY, w, h - floorY);
    ctx.fillStyle = 'rgba(60,50,40,0.15)';
    for (let i = 0; i < 40; i++) {
      const fx = ((i * 97 - (camX | 0)) % (w + 80)) - 20;
      ctx.fillRect(fx, floorY + 8 + (i % 7) * 9, 3 + (i % 4), 2);
    }
    ctx.strokeStyle = '#5a4a38';
    for (let x = -((camX | 0) % 48); x < w; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // exit door
    const doorX = SHED_DOOR_X - camX;
    const doorH = 155;
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(doorX - 30, floorY - doorH, 60, doorH);
    ctx.fillStyle = doorLocked ? '#6a5040' : '#8a6030';
    ctx.fillRect(doorX - 26, floorY - doorH + 4, 52, doorH - 4);
    // plywood door grain
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    for (let gy = floorY - doorH + 10; gy < floorY - 8; gy += 12) {
      ctx.beginPath();
      ctx.moveTo(doorX - 24, gy);
      ctx.lineTo(doorX + 24, gy);
      ctx.stroke();
    }
    if (doorLocked) {
      ctx.fillStyle = '#333';
      ctx.fillRect(doorX + 8, floorY - 78, 12, 16);
      ctx.fillStyle = '#c4a35a';
      ctx.beginPath();
      ctx.arc(doorX + 14, floorY - 72, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#c4a35a';
      ctx.beginPath();
      ctx.arc(doorX + 16, floorY - 70, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = doorLocked ? '#aa4422' : '#1a5a1a';
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(doorLocked ? 'LOCKED' : 'EXIT →', doorX, floorY - doorH - 10);
    ctx.textAlign = 'left';

    // hanging bulb
    const lx = w * 0.55;
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(lx, 22);
    ctx.lineTo(lx, 36);
    ctx.stroke();
    ctx.fillStyle = '#d4b85a';
    ctx.beginPath();
    ctx.arc(lx, 46, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,210,90,0.08)';
    ctx.beginPath();
    ctx.arc(lx, 62, 70, 0, Math.PI * 2);
    ctx.fill();

    // Soft volumetric haze / dust (skip bright window)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.rect(glassX, glassY, glassW, glassH);
    ctx.clip('evenodd');
    const haze = ctx.createLinearGradient(0, 0, 0, floorY);
    haze.addColorStop(0, 'rgba(18, 12, 6, 0.34)');
    haze.addColorStop(0.45, 'rgba(50, 38, 20, 0.14)');
    haze.addColorStop(1, 'rgba(12, 8, 4, 0.28)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, w, floorY);
    const shaft = ctx.createRadialGradient(wx + ww / 2, wy + wh, 10, wx + ww / 2, wy + wh + 40, 210);
    shaft.addColorStop(0, 'rgba(200, 190, 140, 0.10)');
    shaft.addColorStop(1, 'rgba(200, 190, 140, 0)');
    ctx.fillStyle = shaft;
    ctx.fillRect(0, 0, w, floorY);
    ctx.restore();
    for (let i = 0; i < 32; i++) {
      const mx = ((i * 137 + camX * 0.12 + t * 0.011 * ((i % 3) + 1)) % (w + 40)) - 20;
      const my = 36 + ((i * 53 + t * 0.007) % (floorY - 50));
      const a = 0.1 + (Math.sin(t * 0.002 + i) * 0.07);
      ctx.fillStyle = 'rgba(220, 200, 150,' + a + ')';
      ctx.beginPath();
      ctx.arc(mx, my, 0.7 + (i % 3) * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(20,14,8,0.62)';
    ctx.fillRect(w / 2 - 130, 4, 260, 18);
    ctx.fillStyle = '#f0e0c0';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Mom's Shed — plywood · El Camino · stereo", w / 2, 16);
    ctx.textAlign = 'left';
  }

  // ——— Sci-fi clay/chrome mothership (side-readable) ———
  function drawClayUFO(ctx, x, y, scale, t, lightsOn, opts) {
    opts = opts || {};
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const pulse = 0.62 + Math.sin(t * 0.008) * 0.18;
    const spin = t * 0.003;
    if (lightsOn) {
      const halo = ctx.createRadialGradient(0, 2, 14, 0, 8, 118);
      halo.addColorStop(0, 'rgba(170,220,255,' + (0.16 * pulse) + ')');
      halo.addColorStop(0.5, 'rgba(80,180,220,0.06)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(0, 4, 118, 0, Math.PI * 2); ctx.fill();
      const wash = ctx.createLinearGradient(0, 20, 0, 108);
      wash.addColorStop(0, 'rgba(140,230,255,' + (0.2 * pulse) + ')');
      wash.addColorStop(0.55, 'rgba(80,200,180,0.06)');
      wash.addColorStop(1, 'rgba(80,200,180,0)');
      ctx.fillStyle = wash;
      ctx.beginPath();
      ctx.moveTo(-20, 18); ctx.lineTo(20, 18); ctx.lineTo(62, 108); ctx.lineTo(-62, 108);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    ctx.beginPath(); ctx.ellipse(3, 40, 86, 10, 0, 0, Math.PI * 2); ctx.fill();
    const lower = ctx.createLinearGradient(-96, 10, 96, 30);
    lower.addColorStop(0, '#1a2228'); lower.addColorStop(0.35, '#4a5864');
    lower.addColorStop(0.5, '#6a7884'); lower.addColorStop(0.72, '#3a4850'); lower.addColorStop(1, '#141a20');
    ctx.fillStyle = lower;
    ctx.beginPath(); ctx.ellipse(0, 16, 90, 16, 0, 0, Math.PI * 2); ctx.fill();
    const body = ctx.createLinearGradient(-102, -16, 102, 22);
    body.addColorStop(0, '#2a3238'); body.addColorStop(0.18, '#8a96a0');
    body.addColorStop(0.38, '#d8e0e8'); body.addColorStop(0.5, '#f4f7fa');
    body.addColorStop(0.62, '#a8b4be'); body.addColorStop(0.82, '#4a545c'); body.addColorStop(1, '#1c2428');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0, 2, 96, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, -2, 90, 14, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.strokeStyle = 'rgba(20,28,32,0.32)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, 3, 76, 14, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 4, 56, 10, 0, 0, Math.PI * 2); ctx.stroke();
    const band = ctx.createLinearGradient(-84, 0, 84, 14);
    band.addColorStop(0, '#2a3038'); band.addColorStop(0.25, '#c8d4de');
    band.addColorStop(0.5, '#ffffff'); band.addColorStop(0.75, '#90a0ac'); band.addColorStop(1, '#222830');
    ctx.fillStyle = band;
    ctx.beginPath(); ctx.ellipse(0, 7, 82, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = lightsOn ? 'rgba(80,220,140,0.5)' : 'rgba(60,120,80,0.3)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(0, 7, 82, 7, 0, 0, Math.PI * 2); ctx.stroke();
    const deck = ctx.createLinearGradient(-52, -14, 52, 6);
    deck.addColorStop(0, '#3a444c'); deck.addColorStop(0.45, '#b8c4cc'); deck.addColorStop(1, '#3a444c');
    ctx.fillStyle = deck;
    ctx.beginPath(); ctx.ellipse(0, -4, 52, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a3238';
    ctx.beginPath(); ctx.ellipse(0, -8, 33, 7, 0, 0, Math.PI * 2); ctx.fill();
    const dome = ctx.createRadialGradient(-8, -28, 3, 0, -10, 32);
    dome.addColorStop(0, 'rgba(240,252,255,0.95)');
    dome.addColorStop(0.3, 'rgba(160,210,230,0.72)');
    dome.addColorStop(0.7, 'rgba(50,90,120,0.7)');
    dome.addColorStop(1, 'rgba(20,40,60,0.88)');
    ctx.fillStyle = dome;
    ctx.beginPath(); ctx.ellipse(0, -12, 30, 24, 0, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.ellipse(-9, -24, 8, 6, -0.45, 0, Math.PI * 1.1); ctx.stroke();
    ctx.strokeStyle = '#9aa8b4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -36); ctx.lineTo(0, -50); ctx.stroke();
    ctx.fillStyle = lightsOn ? '#ff3355' : '#661822';
    ctx.shadowColor = '#ff3355'; ctx.shadowBlur = lightsOn ? 10 : 0;
    ctx.beginPath(); ctx.arc(0, -52, 3, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + spin;
      const on = lightsOn && ((Math.floor(t / 110 + i) % 4) !== 3);
      ctx.fillStyle = on ? '#e8ffff' : '#3a6070';
      ctx.shadowColor = '#66e8ff'; ctx.shadowBlur = on ? 10 : 0;
      ctx.beginPath(); ctx.arc(Math.cos(a) * 88, Math.sin(a) * 15 + 4, 3.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - spin * 0.6;
      ctx.fillStyle = lightsOn ? 'rgba(120,255,220,0.85)' : '#3a5550';
      ctx.beginPath(); ctx.arc(Math.cos(a) * 60, Math.sin(a) * 9 + 5, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#0c1014';
    ctx.beginPath(); ctx.moveTo(-14, 16); ctx.lineTo(14, 16); ctx.lineTo(10, 24); ctx.lineTo(-10, 24); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lightsOn ? 'rgba(80,255,180,' + (0.4 + pulse * 0.3) + ')' : '#1a3a2a';
    ctx.shadowColor = '#66ffaa'; ctx.shadowBlur = lightsOn ? 8 : 0;
    ctx.fillRect(-7, 17, 14, 4); ctx.shadowBlur = 0;
    ctx.fillStyle = '#2a3238';
    for (const px of [-42, 0, 42]) {
      ctx.fillRect(px - 2.5, 18, 5, 16);
      ctx.beginPath(); ctx.ellipse(px, 35, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
      if (lightsOn) {
        ctx.fillStyle = 'rgba(180,230,255,0.32)';
        ctx.beginPath(); ctx.ellipse(px, 36, 7, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2a3238';
      }
    }
    if (opts.showPilots) {
      ctx.fillStyle = 'rgba(16,20,24,0.88)';
      ctx.beginPath(); ctx.arc(-8, -16, 5, 0, Math.PI * 2); ctx.arc(8, -16, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5a4a3a'; ctx.fillRect(-12, -21, 8, 2.5);
      ctx.fillStyle = '#8a2040'; ctx.fillRect(4, -21, 8, 2.5);
    }
    ctx.restore();
  }

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

    // mom's house
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

    // shed exterior
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
      drawClayUFO(ctx, landing.x - camX, landing.y, landing.scale || 2.28, t, landing.lights);
      // ramp when landed
      if (landing.phase === 'landed' || landing.phase === 'boarding') {
        const rx = landing.x - camX;
        const ry = landing.y;
        const sc = landing.scale || 1.85;
        ctx.fillStyle = '#4a5a28';
        ctx.beginPath();
        ctx.moveTo(rx - 12 * sc / 1.5, ry + 22 * sc / 1.5);
        ctx.lineTo(rx + 12 * sc / 1.5, ry + 22 * sc / 1.5);
        ctx.lineTo(rx + 55, groundY);
        ctx.lineTo(rx - 55, groundY);
        ctx.closePath();
        ctx.fill();
        // ramp edge chrome
        ctx.strokeStyle = 'rgba(180,200,220,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rx - 10 * sc / 1.5, ry + 22 * sc / 1.5);
        ctx.lineTo(rx - 48, groundY);
        ctx.moveTo(rx + 10 * sc / 1.5, ry + 22 * sc / 1.5);
        ctx.lineTo(rx + 48, groundY);
        ctx.stroke();
      }
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

  /** Boarding cutscene: yard + UFO + both brothers walking up ramp */
  function drawBoardCutscene(ctx, w, h, cut, t) {
    // reuse yard backdrop with static cam
    const fakeLanding = {
      phase: 'boarding',
      x: cut.ufoX,
      y: cut.ufoY,
      scale: 2.05,
      lights: true,
    };
    drawYard(ctx, w, h, cut.camX, t, fakeLanding);

    // Tayler then Zakk walking
    if (cut.tayler) {
      drawTayler(ctx, cut.tayler.x - cut.camX, cut.tayler.y, 1, cut.walking, t, { noLabel: cut.progress > 0.7 });
    }
    if (cut.zakk) {
      drawZakk(ctx, cut.zakk.x - cut.camX, cut.zakk.y, 1, cut.walking, t, { noLabel: cut.progress > 0.7 });
    }

    // vignette / title
    ctx.fillStyle = 'rgba(5,20,10,0.25)';
    ctx.fillRect(0, 0, w, 50);
    ctx.fillStyle = '#7dff3a';
    ctx.font = 'bold 14px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BOARDING THE MOTHERSHIP', w / 2, 28);
    ctx.fillStyle = '#c8e0b8';
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.fillText('Space / Enter / click — skip', w / 2, h - 24);
    ctx.textAlign = 'left';
  }

  /** Cockpit: cassette deck + driver’s seat. Insert tape then sit to fly. */
  function drawCassetteScene(ctx, w, h, cas, t) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0a1810');
    g.addColorStop(1, '#152818');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // windshield peek of Chilliwack
    ctx.save();
    ctx.beginPath();
    ctx.rect(80, 40, w - 160, h - 200);
    ctx.clip();
    drawSky(ctx, w, h, t);
    drawMountains(ctx, w, h * 0.55, 0);
    ctx.fillStyle = '#3a7a3a';
    ctx.fillRect(0, h * 0.55, w, h);
    ctx.restore();

    // frame
    ctx.fillStyle = '#1a2818';
    ctx.fillRect(0, 0, 70, h);
    ctx.fillRect(w - 70, 0, 70, h);
    ctx.fillRect(0, 0, w, 36);
    ctx.fillStyle = '#243828';
    ctx.fillRect(0, h - 150, w, 150);
    ctx.strokeStyle = '#3a5a3a';
    ctx.lineWidth = 8;
    ctx.strokeRect(80, 40, w - 160, h - 200);

    const dx = w / 2;
    const dy = h - 95;
    ctx.fillStyle = '#1a2e1c';
    ctx.fillRect(80, h - 150, w - 160, 28);
    for (let i = 0; i < 5; i++) {
      const kx = 110 + i * 40;
      ctx.fillStyle = '#0a140c';
      ctx.beginPath();
      ctx.arc(kx, h - 136, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4a6a4a';
      ctx.stroke();
    }
    for (let i = 0; i < 5; i++) {
      const kx = w - 110 - i * 40;
      ctx.fillStyle = '#0a140c';
      ctx.beginPath();
      ctx.arc(kx, h - 136, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // cassette player / deck housing (always visible)
    ctx.fillStyle = '#0e1a12';
    ctx.fillRect(dx - 100, dy - 38, 200, 68);
    ctx.strokeStyle = '#7dff3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(dx - 100, dy - 38, 200, 68);
    ctx.fillStyle = '#9bc87a';
    ctx.font = 'bold 9px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CASSETTE DECK', dx, dy - 24);
    ctx.fillStyle = cas.inserted ? '#7dff3a' : '#334433';
    ctx.beginPath();
    ctx.arc(dx + 78, dy - 24, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff6644';
    ctx.beginPath();
    ctx.arc(dx + 90, dy - 24, 4, 0, Math.PI * 2);
    ctx.fill();

    // slot
    ctx.fillStyle = '#050a06';
    ctx.fillRect(dx - 55, dy - 6, 80, 16);
    ctx.strokeStyle = '#4a6a4a';
    ctx.lineWidth = 2;
    ctx.strokeRect(dx - 55, dy - 6, 80, 16);
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(dx - 55, dy - 8, 80, 3);
    ctx.fillRect(dx - 55, dy + 8, 80, 3);

    const insert = cas.insertProgress || 0;
    const held = !!cas.hasTape && !cas.inserted;
    const inserting = !!cas.inserting || (cas.inserted && insert < 1);
    if (held || inserting || (cas.inserted && insert >= 1)) {
      let tapeX, tapeY, rot;
      if (cas.inserted && insert >= 1 && !cas.inserting) {
        tapeX = dx - 15;
        tapeY = dy + 2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(dx - 55, dy - 6, 80, 16);
        ctx.clip();
        drawCassetteProp(ctx, tapeX, tapeY, { scale: 0.85 });
        ctx.restore();
      } else {
        tapeX = dx - 40 + insert * 25;
        tapeY = (held && !inserting ? dy - 55 : dy - 40) + insert * 38;
        rot = -0.4 + insert * 0.4;
        ctx.save();
        ctx.translate(tapeX, tapeY);
        ctx.rotate(rot);
        drawCassetteProp(ctx, 0, 0, { scale: 1 });
        ctx.restore();
      }
    } else if (!cas.hasTape) {
      ctx.fillStyle = '#ff8866';
      ctx.font = '11px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('(no tape — go grab one in the shed)', dx, dy + 4);
    }

    // Driver’s seat (left) — highlight when ready to sit
    const seatX = dx - 160;
    const seatY = h - 55;
    const seatReady = !!cas.inserted && insert >= 1 && !cas.seated;
    ctx.fillStyle = seatReady ? '#2a4a28' : '#1a2a1c';
    ctx.fillRect(seatX - 28, seatY - 50, 56, 50);
    ctx.fillStyle = '#243828';
    ctx.fillRect(seatX - 24, seatY - 70, 48, 24);
    ctx.strokeStyle = seatReady ? '#7dff3a' : '#3a5a3a';
    ctx.lineWidth = seatReady ? 3 : 1;
    ctx.strokeRect(seatX - 28, seatY - 70, 56, 70);
    ctx.fillStyle = seatReady ? '#7dff3a' : '#6a8a6a';
    ctx.font = 'bold 10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DRIVER', seatX, seatY - 78);
    if (seatReady) {
      const bob = Math.sin(t * 0.01) * 2;
      ctx.fillText('▲ SIT', seatX, seatY - 88 + bob);
    }

    // Passenger seat (right) — Tayler
    const pSeatX = dx + 150;
    ctx.fillStyle = '#1a2a1c';
    ctx.fillRect(pSeatX - 28, seatY - 50, 56, 50);
    ctx.fillStyle = '#243828';
    ctx.fillRect(pSeatX - 24, seatY - 70, 48, 24);
    ctx.strokeStyle = '#3a5a3a';
    ctx.lineWidth = 1;
    ctx.strokeRect(pSeatX - 28, seatY - 70, 56, 70);

    // Characters: standing until seated, then Zakk in driver seat
    if (cas.seated) {
      drawZakk(ctx, seatX, seatY, 1, false, t, { scale: 1.15, seated: false, noLabel: false, smoking: false });
      drawTayler(ctx, pSeatX, seatY, -1, false, t, { scale: 1.15, seated: true, noLabel: false });
    } else {
      drawZakk(ctx, dx - 70, h - 40, 1, false, t, { scale: 1.15, noLabel: false, smoking: false });
      drawTayler(ctx, dx + 90, h - 40, -1, false, t, { scale: 1.15, noLabel: false });
    }

    // prompt banner
    ctx.fillStyle = 'rgba(10,30,16,0.85)';
    ctx.fillRect(w / 2 - 200, 55, 400, 36);
    ctx.strokeStyle = '#7dff3a';
    ctx.strokeRect(w / 2 - 200, 55, 400, 36);
    ctx.fillStyle = '#e8ffe0';
    ctx.font = 'bold 14px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    if (!cas.hasTape) {
      ctx.fillText('No cassette — you left it in the shed!', w / 2, 78);
    } else if (!cas.inserted) {
      ctx.fillText('E / Space / USE — insert cassette into deck', w / 2, 78);
    } else if (insert < 1) {
      ctx.fillText('Click. Clunk. Theme engaged…', w / 2, 78);
    } else if (!cas.seated) {
      ctx.fillText('E / Space / USE — sit in the driver’s seat', w / 2, 78);
    } else {
      ctx.fillText('Flight controls unlocked!', w / 2, 78);
    }
    ctx.textAlign = 'left';
  }

  // ——— Fly side-scroller ———
  function drawCitizen(ctx, x, y, look, t) {
    const s = 0.82;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const skin = '#d4a882';
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(-8, -22, 7, 18);
    ctx.fillRect(1, -22, 7, 18);
    ctx.fillStyle = '#111';
    ctx.fillRect(-9, -6, 8, 6);
    ctx.fillRect(1, -6, 8, 6);

    function head() {
      const hg = ctx.createRadialGradient(-2, -56, 1, 0, -54, 9);
      hg.addColorStop(0, '#e8c4a0');
      hg.addColorStop(0.55, skin);
      hg.addColorStop(1, '#a07858');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(0, -54, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    function aviators() {
      ctx.fillStyle = '#0a0a0c';
      ctx.beginPath();
      ctx.ellipse(-3.5, -55, 3.4, 2.6, -0.1, 0, Math.PI * 2);
      ctx.ellipse(3.5, -55, 3.4, 2.6, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-0.4, -55);
      ctx.lineTo(0.4, -55);
      ctx.stroke();
    }

    if (look === 'blazer') {
      ctx.fillStyle = '#8a5a32';
      ctx.fillRect(-11, -44, 22, 24);
      ctx.fillStyle = '#e8d8b8';
      ctx.fillRect(-4, -42, 8, 18);
      head();
      ctx.fillStyle = '#6a4a2a';
      ctx.beginPath();
      ctx.ellipse(0, -58, 9, 7, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-9, -58, 3, 13);
      ctx.fillRect(6, -58, 3, 13);
      ctx.fillStyle = '#4a3020';
      ctx.fillRect(-4, -50, 8, 2);
      ctx.strokeStyle = '#c9a227';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-6.2, -57, 5, 3.6);
      ctx.strokeRect(1.2, -57, 5, 3.6);
    } else if (look === 'graphic') {
      ctx.fillStyle = '#121214';
      ctx.fillRect(-10, -44, 20, 24);
      ctx.fillStyle = '#ff8ab8';
      ctx.beginPath();
      ctx.arc(0, -34, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#eee';
      ctx.font = 'bold 5px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HK', 0, -28);
      ctx.textAlign = 'left';
      head();
      ctx.fillStyle = '#2a1a16';
      ctx.fillRect(-5, -51, 10, 3);
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(0, -62, 8, 4, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-8, -62, 16, 4);
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-6, -57, 5, 3.4);
      ctx.strokeRect(1, -57, 5, 3.4);
    } else if (look === 'denim') {
      ctx.fillStyle = '#2a5a8a';
      ctx.fillRect(-11, -44, 22, 24);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(-4, -40, 8, 14);
      head();
      ctx.fillStyle = '#2a1a14';
      ctx.beginPath();
      ctx.ellipse(0, -60, 8, 5, 0, Math.PI, 0);
      ctx.fill();
      aviators();
    } else if (look === 'raglan') {
      ctx.fillStyle = '#f4f4f0';
      ctx.fillRect(-10, -44, 20, 24);
      ctx.fillStyle = '#2a8a3a';
      ctx.fillRect(-13, -44, 5, 16);
      ctx.fillRect(8, -44, 5, 16);
      ctx.strokeStyle = '#c4a35a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.lineTo(0, -32);
      ctx.stroke();
      head();
      ctx.fillStyle = '#1a1210';
      ctx.beginPath();
      ctx.arc(-6, -56, 4, 0, Math.PI * 2);
      ctx.arc(6, -56, 4, 0, Math.PI * 2);
      ctx.arc(0, -60, 6, 0, Math.PI * 2);
      ctx.fill();
      aviators();
    } else if (look === 'western') {
      ctx.fillStyle = '#121214';
      ctx.fillRect(-11, -44, 22, 24);
      ctx.fillStyle = '#2ec4a0';
      ctx.fillRect(-1.5, -42, 3, 16);
      head();
      ctx.fillStyle = '#1a1210';
      ctx.fillRect(-4, -50, 8, 2);
      ctx.fillStyle = '#6a5a48';
      ctx.beginPath();
      ctx.ellipse(0, -62, 9, 5, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-9, -62, 18, 3);
      aviators();
    } else {
      ctx.fillStyle = '#6a3a2a';
      ctx.fillRect(-11, -44, 22, 24);
      ctx.fillStyle = '#c45a4a';
      ctx.fillRect(-8, -40, 5, 8);
      ctx.fillRect(3, -40, 5, 8);
      ctx.fillStyle = '#2a4a6a';
      ctx.fillRect(-8, -32, 16, 8);
      head();
      ctx.fillStyle = '#8a2040';
      ctx.beginPath();
      ctx.ellipse(0, -61, 8, 5, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(4, -60, 8, 3);
      aviators();
    }
    ctx.restore();
  }

  function drawStreetlight(ctx, x, groundY) {
    ctx.fillStyle = '#333';
    ctx.fillRect(x + 6, groundY - 62, 3, 62);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x, groundY - 66, 16, 5);
    ctx.fillStyle = '#ffe8a0';
    ctx.beginPath();
    ctx.arc(x + 8, groundY - 64, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,230,140,0.12)';
    ctx.beginPath();
    ctx.arc(x + 8, groundY - 40, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawParkedCar(ctx, x, groundY, col) {
    ctx.fillStyle = col || '#446688';
    ctx.fillRect(x, groundY - 16, 42, 12);
    ctx.fillRect(x + 8, groundY - 26, 22, 12);
    ctx.fillStyle = 'rgba(160,200,220,0.45)';
    ctx.fillRect(x + 10, groundY - 24, 8, 8);
    ctx.fillRect(x + 20, groundY - 24, 8, 8);
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(x + 10, groundY - 3, 4, 0, Math.PI * 2);
    ctx.arc(x + 32, groundY - 3, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBuilding(ctx, x, groundY, kind) {
    if (kind === 'streetlight') { drawStreetlight(ctx, x, groundY); return; }
    if (kind === 'car') {
      const cols = ['#446688', '#884444', '#555', '#c4a35a', '#2a5a3a'];
      drawParkedCar(ctx, x, groundY, cols[(Math.abs(x | 0) % cols.length)]);
      return;
    }
    if (kind === 'house') {
      ctx.fillStyle = '#7a5848';
      ctx.fillRect(x, groundY - 52, 54, 52);
      ctx.fillStyle = '#4a2828';
      ctx.beginPath();
      ctx.moveTo(x - 5, groundY - 52);
      ctx.lineTo(x + 27, groundY - 78);
      ctx.lineTo(x + 59, groundY - 52);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3a2010';
      ctx.fillRect(x + 22, groundY - 22, 12, 22);
      ctx.fillStyle = '#ffe88a';
      ctx.fillRect(x + 8, groundY - 36, 10, 10);
      ctx.fillRect(x + 36, groundY - 36, 10, 10);
      ctx.fillStyle = '#5a3030';
      ctx.fillRect(x + 42, groundY - 70, 6, 16);
    } else if (kind === 'shop') {
      ctx.fillStyle = '#a04040';
      ctx.fillRect(x, groundY - 64, 76, 64);
      ctx.fillStyle = '#ddd';
      ctx.fillRect(x - 2, groundY - 76, 80, 14);
      ctx.fillStyle = '#88ccff';
      ctx.fillRect(x + 6, groundY - 48, 28, 26);
      ctx.fillRect(x + 40, groundY - 48, 28, 26);
      ctx.fillStyle = '#3a2010';
      ctx.fillRect(x + 32, groundY - 22, 12, 22);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px Segoe UI, sans-serif';
      ctx.fillText('YALE', x + 24, groundY - 66);
    } else if (kind === 'plaza') {
      ctx.fillStyle = '#8a8a90';
      ctx.fillRect(x, groundY - 50, 110, 50);
      ctx.fillStyle = '#c03030';
      ctx.fillRect(x, groundY - 58, 110, 10);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#7ec8ff';
        ctx.fillRect(x + 6 + i * 36, groundY - 40, 28, 20);
        ctx.fillStyle = '#3a2010';
        ctx.fillRect(x + 14 + i * 36, groundY - 18, 10, 18);
      }
    } else if (kind === 'barn') {
      ctx.fillStyle = '#8a3030';
      ctx.fillRect(x, groundY - 58, 68, 58);
      ctx.fillStyle = '#5a2020';
      ctx.beginPath();
      ctx.moveTo(x - 4, groundY - 58);
      ctx.lineTo(x + 34, groundY - 90);
      ctx.lineTo(x + 72, groundY - 58);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3a1810';
      ctx.fillRect(x + 26, groundY - 28, 16, 28);
    } else if (kind === 'corn') {
      ctx.fillStyle = '#c8c040';
      for (let c = 0; c < 8; c++) ctx.fillRect(x + c * 7, groundY - 34, 5, 34);
    } else if (kind === 'tree') {
      ctx.fillStyle = '#5a3a20';
      ctx.fillRect(x + 10, groundY - 22, 8, 22);
      ctx.fillStyle = '#2a5a28';
      ctx.beginPath();
      ctx.arc(x + 14, groundY - 38, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a7a32';
      ctx.beginPath();
      ctx.arc(x + 6, groundY - 32, 10, 0, Math.PI * 2);
      ctx.arc(x + 22, groundY - 34, 11, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#5a6a7a';
      ctx.fillRect(x, groundY - 100, 50, 100);
      ctx.fillStyle = '#4a5460';
      ctx.fillRect(x, groundY - 106, 50, 8);
      ctx.fillStyle = '#ffe88a';
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 2; c++) {
          ctx.fillRect(x + 8 + c * 18, groundY - 92 + r * 16, 12, 10);
        }
      }
    }
  }

  function drawFlyGroundTarget(ctx, tg, groundY, t, scrollX) {
    const x = tg.x - scrollX;
    if (x < -40 || x > 1000) return;
    const bob = Math.sin(t * 0.008 + tg.wobble) * 2;
    const y = groundY + bob;

    if (tg.kind.human) {
      ctx.strokeStyle = 'rgba(125,255,58,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y - 2, 16, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      drawCitizen(ctx, x, y, tg.kind.look || 'denim', t);
      ctx.fillStyle = '#7dff3a';
      ctx.font = 'bold 8px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tg.kind.label, x, y - 56);
    } else {
      // red warning = hazard
      ctx.strokeStyle = 'rgba(255,80,60,0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y - 2, 14, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      const shape = tg.kind.shape;
      if (shape === 'dog') {
        ctx.fillStyle = tg.kind.color;
        ctx.fillRect(x - 10, y - 14, 22, 12);
        ctx.beginPath();
        ctx.arc(x + 12, y - 16, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 12, y - 4, 4, 8);
        ctx.fillRect(x + 6, y - 4, 4, 8);
      } else if (shape === 'cat') {
        ctx.fillStyle = tg.kind.color;
        ctx.beginPath();
        ctx.arc(x, y - 12, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 18);
        ctx.lineTo(x - 4, y - 26);
        ctx.lineTo(x - 1, y - 18);
        ctx.fill();
      } else if (shape === 'chicken') {
        ctx.fillStyle = tg.kind.color;
        ctx.beginPath();
        ctx.arc(x, y - 12, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff6644';
        ctx.fillRect(x + 6, y - 14, 6, 3);
      } else if (shape === 'mower') {
        ctx.fillStyle = '#cc3333';
        ctx.fillRect(x - 14, y - 16, 28, 12);
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - 8, y - 2, 5, 0, Math.PI * 2);
        ctx.arc(x + 8, y - 2, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape === 'trash') {
        ctx.fillStyle = '#6a6a70';
        ctx.fillRect(x - 10, y - 22, 20, 22);
        ctx.fillStyle = '#888';
        ctx.fillRect(x - 12, y - 26, 24, 6);
      } else {
        ctx.fillStyle = '#4466aa';
        ctx.fillRect(x - 6, y - 28, 12, 18);
        ctx.fillStyle = '#333';
        ctx.fillRect(x - 2, y - 10, 4, 12);
      }
      ctx.fillStyle = '#ff6644';
      ctx.font = 'bold 8px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ ' + tg.kind.label, x, y - 36);
    }
    ctx.textAlign = 'left';
  }

  function drawFlyScene(ctx, w, h, fly, t) {
    const scrollX = fly.scrollX || 0;
    const shakeX = fly.shakeX || 0;
    const shakeY = fly.shakeY || 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    drawSky(ctx, w, h, t);
    const groundY = h * 0.78;
    drawMountains(ctx, w, groundY - 40, scrollX);

    // ground bands
    ctx.fillStyle = '#5a9a3a';
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = '#8a8680';
    ctx.fillRect(0, groundY - 7, w, 7);
    ctx.fillStyle = '#6a6a68';
    ctx.fillRect(0, groundY - 1, w, 1);
    // Yale Rd
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, groundY + 8, w, 26);
    ctx.strokeStyle = '#e8e8a0';
    ctx.lineWidth = 2;
    ctx.setLineDash([18, 14]);
    ctx.beginPath();
    const dashOff = -((scrollX * 1.1) % 32);
    ctx.moveTo(dashOff, groundY + 21);
    ctx.lineTo(w + 20, groundY + 21);
    ctx.stroke();
    ctx.setLineDash([]);

    // buildings / farmland scrolling — UFO flies OVER them
    const props = fly.props || [];
    for (const p of props) {
      const px = p.x - scrollX;
      if (px < -80 || px > w + 80) continue;
      drawBuilding(ctx, px, groundY, p.kind);
    }

    // district flavour strip
    const d = DISTRICTS[fly.districtIndex % DISTRICTS.length];
    if (d.id === 'vedder' || d.id === 'cultus') {
      ctx.fillStyle = d.accent;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(0, groundY - 8, w, 10);
      ctx.globalAlpha = 1;
    }

    // ground targets
    for (const tg of fly.targets || []) {
      if (tg.beamed) continue;
      drawFlyGroundTarget(ctx, tg, groundY, t, scrollX);
    }

    // UFO
    const ufoScreenX = fly.ufoX;
    const ufoScreenY = fly.ufoY;
    drawClayUFO(ctx, ufoScreenX, ufoScreenY, 1.52, t, true, { showPilots: true });

    // beam reticle under ship
    ctx.strokeStyle = 'rgba(125,255,58,0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(ufoScreenX, groundY, fly.beamWide ? 48 : 32, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(ufoScreenX, ufoScreenY + 30);
    ctx.lineTo(ufoScreenX, groundY - 8);
    ctx.strokeStyle = 'rgba(125,255,58,0.2)';
    ctx.stroke();

    // active beam
    if (fly.beaming) {
      const bw = fly.beamWide ? 96 : 64;
      const grad = ctx.createLinearGradient(ufoScreenX, ufoScreenY + 20, ufoScreenX, groundY);
      grad.addColorStop(0, 'rgba(125,255,58,0.6)');
      grad.addColorStop(1, 'rgba(125,255,58,0.08)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ufoScreenX - 18, ufoScreenY + 28);
      ctx.lineTo(ufoScreenX + 18, ufoScreenY + 28);
      ctx.lineTo(ufoScreenX + bw / 2, groundY);
      ctx.lineTo(ufoScreenX - bw / 2, groundY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // HUD strip: hull
    ctx.fillStyle = 'rgba(10,30,16,0.75)';
    ctx.fillRect(12, h - 36, 160, 24);
    ctx.fillStyle = '#9bc87a';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.fillText('HULL', 18, h - 20);
    const lives = fly.lives | 0;
    ctx.fillStyle = lives <= 1 ? '#ff6644' : '#7dff3a';
    ctx.fillText('♥'.repeat(Math.max(0, lives)) + (lives <= 0 ? ' TOAST' : ''), 55, h - 20);

    ctx.fillStyle = 'rgba(10,30,16,0.75)';
    ctx.fillRect(w - 200, h - 36, 188, 24);
    ctx.fillStyle = '#c8e0b8';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('←→↑↓ fly · Space beam · Enter end', w - 18, h - 20);
    ctx.textAlign = 'left';

    if (fly.hitFlash > 0) {
      ctx.fillStyle = 'rgba(255,40,40,' + Math.min(0.5, fly.hitFlash / 35) + ')';
      ctx.fillRect(0, 0, w, h);
    }

    // district name
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.name, w / 2, 48);
    ctx.textAlign = 'left';
  }

  function drawTitleBackdrop(ctx, w, h, t) {
    drawSky(ctx, w, h, t);
    drawMountains(ctx, w, h * 0.7, t * 0.02);
    ctx.fillStyle = '#4a9a3a';
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
    drawClayUFO(ctx, w / 2 + Math.sin(t * 0.001) * 40, 118 + Math.cos(t * 0.0007) * 12, 1.72, t, true, { showPilots: true });
    // brothers on title
    drawZakk(ctx, w / 2 - 80, h * 0.7, 1, false, t, { smoking: true });
    drawTayler(ctx, w / 2 + 90, h * 0.7, -1, false, t, { smoking: true });
    ctx.fillStyle = 'rgba(5,20,10,0.35)';
    ctx.fillRect(0, 0, w, h);
  }

  global.MothershipWorld = {
    DISTRICTS,
    TARGET_KINDS,
    PEOPLE_KINDS,
    HAZARD_KINDS,
    ONE_LINERS,
    BAD_BEAM_LINERS,
    RESULTS_LINERS,
    SHED_GAGS,
    SHED_WORLD_W,
    SHED_DOOR_X,
    SHED_CASSETTE_X,
    SHED_STEREO_X,
    SHED_CAMINO_X,
    SHED_WINDOW_X,
    CHAR_SCALE,
    drawCassetteProp,
    drawStereo,
    drawElCamino,
    rand,
    pick,
    burst,
    addFloater,
    updateFx,
    drawFx,
    drawShed,
    drawYard,
    drawBoardCutscene,
    drawCassetteScene,
    drawFlyScene,
    drawHuman,
    drawZakk,
    drawTayler,
    drawTaylor,
    drawClayUFO,
    drawCitizen,
    drawTitleBackdrop,
  };
})(window);
