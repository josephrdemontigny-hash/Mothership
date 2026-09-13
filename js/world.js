/**
 * Mothership — Chilliwack scenes, drawing helpers, flavour copy.
 * Modes: Shed / Yard / Cockpit / Fly (side-scroller + beam).
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
    { id: 'local', label: 'Local', points: 100, color: '#ffcc88', human: true },
    { id: 'tourist', label: 'Tourist', points: 120, color: '#88ccff', human: true },
    { id: 'chicken', label: 'Fried Chicken Fan', points: 200, color: '#ff9944', human: true },
    { id: 'farmer', label: 'Corn Farmer', points: 150, color: '#ddaa44', human: true },
    { id: 'hiker', label: 'Cheam Hiker', points: 180, color: '#aadd88', human: true },
    { id: 'riverkid', label: 'Vedder Floater', points: 140, color: '#66bbdd', human: true },
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
    'Clay UFO integrity: surprisingly intact.',
  ];

  const SHED_GAGS = [
    'Chilling with Tayler in mom\'s shed. Peak Chilliwack.',
    'Zakk & Tayler: smoking, snacking, waiting for the UFO.',
    'Lawnmower judges the sesh silently.',
    'Tayler: "Pass it — wait, is that the mothership?"',
    'Tiny shed. Big plans. Questionable life choices.',
    'Is that… moon juice? Or just apple juice?',
  ];

  const SHED_WORLD_W = 560;
  const SHED_DOOR_X = 490;
  /** Visible cassette prop in shed (on clutter near amp) */
  const SHED_CASSETTE_X = 318;
  const SHED_CASSETTE_Y_OFF = 42; // above floor
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
    // Far western foothills drift slowly (right side flavour only)
    const westOff = (scrollX * 0.08) % 120;

    // Far Cascade backdrop — denser on the east (left)
    ctx.fillStyle = '#3a4a5c';
    ctx.beginPath();
    ctx.moveTo(-40, base);
    for (let i = 0; i <= 18; i++) {
      const x = i * (w / 16) - 20;
      // Higher peaks toward the east (left); lower toward west (right)
      const eastBias = 1 - i / 18;
      const peak = base - 40 - eastBias * 55 - ((i * 37) % 28) * (0.4 + eastBias * 0.6);
      ctx.lineTo(x, peak);
    }
    ctx.lineTo(w + 60, base);
    ctx.closePath();
    ctx.fill();

    // Cheam Range companions (Lady Peak / Knight / Welch) — secondary ridges LEFT of Cheam
    const cheamX = w * 0.22; // fixed EAST = LEFT; tiny parallax only
    const cheamParallax = Math.sin(scrollX * 0.00035) * 6; // stays on-screen
    const cx = cheamX + cheamParallax;

    // Companion ridges (west of Cheam on the range = further left / slightly lower)
    ctx.fillStyle = '#354858';
    // Lady Peak-ish (left companion)
    ctx.beginPath();
    ctx.moveTo(cx - 165, base);
    ctx.lineTo(cx - 125, base - 78);
    ctx.lineTo(cx - 95, base - 62);
    ctx.lineTo(cx - 70, base);
    ctx.closePath();
    ctx.fill();
    // Knight / Welch-ish hump
    ctx.beginPath();
    ctx.moveTo(cx - 95, base);
    ctx.lineTo(cx - 60, base - 70);
    ctx.lineTo(cx - 25, base - 55);
    ctx.lineTo(cx + 10, base);
    ctx.closePath();
    ctx.fill();
    // small snow on companions
    ctx.fillStyle = '#d8e4f0';
    ctx.beginPath();
    ctx.moveTo(cx - 132, base - 68);
    ctx.lineTo(cx - 125, base - 78);
    ctx.lineTo(cx - 116, base - 66);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 68, base - 60);
    ctx.lineTo(cx - 60, base - 70);
    ctx.lineTo(cx - 50, base - 58);
    ctx.closePath();
    ctx.fill();

    // Mt. Cheam — iconic pyramidal Cascade peak, snow-capped, always LEFT
    ctx.fillStyle = '#2a3a4c';
    ctx.beginPath();
    ctx.moveTo(cx - 95, base);
    ctx.lineTo(cx - 48, base - 100);
    ctx.lineTo(cx - 8, base - 155); // summit
    ctx.lineTo(cx + 42, base - 92);
    ctx.lineTo(cx + 100, base);
    ctx.closePath();
    ctx.fill();
    // darker east face
    ctx.fillStyle = '#243444';
    ctx.beginPath();
    ctx.moveTo(cx - 8, base - 155);
    ctx.lineTo(cx + 42, base - 92);
    ctx.lineTo(cx + 100, base);
    ctx.lineTo(cx - 8, base - 155);
    ctx.closePath();
    ctx.fill();
    // snow cap — pyramidal
    ctx.fillStyle = '#eef4fa';
    ctx.beginPath();
    ctx.moveTo(cx - 28, base - 122);
    ctx.lineTo(cx - 8, base - 155);
    ctx.lineTo(cx + 22, base - 118);
    ctx.lineTo(cx + 6, base - 112);
    ctx.lineTo(cx - 10, base - 128);
    ctx.lineTo(cx - 18, base - 118);
    ctx.closePath();
    ctx.fill();
    // snow highlight
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.moveTo(cx - 18, base - 130);
    ctx.lineTo(cx - 8, base - 155);
    ctx.lineTo(cx - 2, base - 132);
    ctx.closePath();
    ctx.fill();

    // Occasional label (readable, not every frame spam — tied to scroll phase)
    const labelPulse = (Math.floor(scrollX / 180) % 5) !== 0;
    if (labelPulse) {
      ctx.fillStyle = 'rgba(220,230,240,0.7)';
      ctx.font = 'bold 10px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Mt. Cheam', cx - 8, base - 164);
      ctx.font = '8px Segoe UI, sans-serif';
      ctx.fillStyle = 'rgba(200,210,220,0.45)';
      ctx.fillText('Lhílheqey', cx - 8, base - 152);
      ctx.textAlign = 'left';
    }

    // Near foothills — scroll with world; lower on west (right)
    ctx.fillStyle = '#4a6a48';
    ctx.beginPath();
    ctx.moveTo(0, base);
    for (let i = 0; i <= 14; i++) {
      const x = i * (w / 12) - (scrollX * 0.4) % (w / 12);
      const hMul = i < 6 ? 1.15 : 0.75; // taller near east
      ctx.lineTo(x, base - (18 + (i % 4) * 9) * hMul);
    }
    ctx.lineTo(w + 40, base);
    ctx.closePath();
    ctx.fill();

    // Soft western haze (right) — no Cheam here
    const haze = ctx.createLinearGradient(w * 0.55, 0, w, 0);
    haze.addColorStop(0, 'rgba(180,200,220,0)');
    haze.addColorStop(1, 'rgba(200,210,180,0.12)');
    ctx.fillStyle = haze;
    ctx.fillRect(w * 0.55, base - 120, w * 0.45, 120);
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
      drawSmokePuffs(ctx, jx + facing * 14, jy - 6, t, 1.4);
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
      drawSmokePuffs(ctx, jx + facing * 14, jy - 6, t, 0.8);
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

  function drawShed(ctx, w, h, camX, t, opts) {
    opts = opts || {};
    const floorY = h * 0.72;
    const cassetteTaken = !!opts.cassetteTaken;
    // 0..1 fly-in progress for backyard window mini-scene (from game)
    const ufoProg = opts.windowUfo != null ? opts.windowUfo : Math.min(1, (t % 14000) / 14000);

    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(0, 0, w, h);

    // wood planks
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(0, 0, w, floorY);
    ctx.strokeStyle = '#2a1810';
    ctx.lineWidth = 2;
    for (let y = 0; y < floorY; y += 26) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // backyard window — animated UFO fly-in / landing mini-scene
    const wx = 55 - camX * 0.12;
    const wy = 36;
    const ww = 112;
    const wh = 88;
    ctx.fillStyle = '#1a3048';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.save();
    ctx.beginPath();
    ctx.rect(wx + 4, wy + 4, ww - 8, wh - 8);
    ctx.clip();
    // sky peek
    const skyG = ctx.createLinearGradient(0, wy, 0, wy + wh);
    skyG.addColorStop(0, '#6eb8ff');
    skyG.addColorStop(1, '#b8e0ff');
    ctx.fillStyle = skyG;
    ctx.fillRect(wx + 4, wy + 4, ww - 8, wh - 8);
    // grass
    ctx.fillStyle = '#4a9a3a';
    ctx.fillRect(wx + 4, wy + wh - 28, ww - 8, 24);
    // tiny Mt. Cheam on EAST = left of window peek
    ctx.fillStyle = '#2a3a4c';
    ctx.beginPath();
    ctx.moveTo(wx + 8, wy + wh - 28);
    ctx.lineTo(wx + 28, wy + 18);
    ctx.lineTo(wx + 52, wy + wh - 28);
    ctx.fill();
    ctx.fillStyle = '#eef6ff';
    ctx.beginPath();
    ctx.moveTo(wx + 22, wy + 32);
    ctx.lineTo(wx + 28, wy + 18);
    ctx.lineTo(wx + 36, wy + 34);
    ctx.fill();
    // companion ridge
    ctx.fillStyle = '#354858';
    ctx.beginPath();
    ctx.moveTo(wx + 4, wy + wh - 28);
    ctx.lineTo(wx + 14, wy + 40);
    ctx.lineTo(wx + 22, wy + wh - 28);
    ctx.fill();
    // mini UFO: approaches from upper-left, settles on grass
    const ufoX = wx + 18 + ufoProg * 52;
    const ufoY = wy + 12 + Math.min(1, ufoProg * 1.15) * (wh - 48);
    const ufoS = 0.28 + ufoProg * 0.08;
    const lights = ufoProg > 0.25;
    drawClayUFO(ctx, ufoX, ufoY, ufoS, t, lights);
    if (ufoProg > 0.55) {
      ctx.fillStyle = 'rgba(200,220,230,0.25)';
      ctx.beginPath();
      ctx.ellipse(ufoX, wy + wh - 26, 22, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // window frame
    ctx.strokeStyle = '#8a6a40';
    ctx.lineWidth = 5;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy);
    ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh / 2);
    ctx.lineTo(wx + ww, wy + wh / 2);
    ctx.stroke();
    if (ufoProg < 0.95) {
      ctx.fillStyle = '#7dff3a';
      ctx.font = 'bold 9px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ufoProg < 0.7 ? 'UFO inbound…' : 'Landing…', wx + ww / 2, wy - 4);
      ctx.textAlign = 'left';
    }

    // posters (slightly smaller footprint)
    drawPoster(ctx, 178 - camX, 52, 'RETROFIT', '#3a1a4a');
    drawPoster(ctx, 232 - camX, 58, 'UFO?', '#1a3a4a');

    // props — scaled down around floor so characters read taller in-room
    function propAt(ax, drawFn) {
      ctx.save();
      ctx.translate(ax, floorY);
      ctx.scale(PROP_SCALE, PROP_SCALE);
      ctx.translate(-ax, -floorY);
      drawFn();
      ctx.restore();
    }
    propAt(18 - camX, function () {
      drawShelf(ctx, 18 - camX, 130);
      drawShelf(ctx, 18 - camX, 210);
    });
    propAt(105 - camX, function () { drawTools(ctx, 105 - camX, floorY); });
    propAt(145 - camX, function () { drawLawnmower(ctx, 145 - camX, floorY - 8); });
    propAt(230 - camX, function () { drawFridge(ctx, 230 - camX, floorY - 95); });
    propAt(290 - camX, function () { drawAmp(ctx, 290 - camX, floorY); });
    propAt(360 - camX, function () { drawCouch(ctx, 360 - camX, floorY); });
    propAt(400 - camX, function () { drawChillTable(ctx, 400 - camX, floorY - 4, t); });

    // clutter boxes (cassette sits on these until grabbed)
    ctx.fillStyle = '#8a6a40';
    ctx.fillRect(320 - camX, floorY - 22, 28, 22);
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(335 - camX, floorY - 36, 22, 14);

    if (!cassetteTaken) {
      const cx = SHED_CASSETTE_X - camX;
      const cy = floorY - SHED_CASSETTE_Y_OFF;
      drawCassetteProp(ctx, cx, cy, { glow: true, label: 'CASSETTE' });
      const bob = Math.sin(t * 0.008) * 3;
      ctx.fillStyle = '#7dff3a';
      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('▲ GRAB', cx, cy - 28 + bob);
      ctx.textAlign = 'left';
    }

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

    // exit door (taller so scaled characters fit under lintel)
    const doorX = SHED_DOOR_X - camX;
    const doorH = 155;
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(doorX - 30, floorY - doorH, 60, doorH);
    ctx.fillStyle = '#8a6030';
    ctx.fillRect(doorX - 26, floorY - doorH + 4, 52, doorH - 4);
    ctx.fillStyle = '#c4a35a';
    ctx.beginPath();
    ctx.arc(doorX + 16, floorY - 70, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7dff3a';
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT →', doorX, floorY - doorH - 10);
    ctx.textAlign = 'left';

    // bulb
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
    ctx.fillStyle = 'rgba(255,230,120,0.12)';
    ctx.beginPath();
    ctx.arc(lx, 70, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(w / 2 - 110, 8, 220, 22);
    ctx.fillStyle = '#c8e0b8';
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Mom's Shed — Zakk & Tayler", w / 2, 23);
    ctx.textAlign = 'left';
  }

  // ——— Sci-fi clay/chrome mothership (side-readable) ———
  function drawClayUFO(ctx, x, y, scale, t, lightsOn, opts) {
    opts = opts || {};
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const pulse = 0.55 + Math.sin(t * 0.01) * 0.25;
    const spin = t * 0.004;

    // Atmospheric glow halo
    if (lightsOn) {
      const halo = ctx.createRadialGradient(0, 4, 10, 0, 8, 95);
      halo.addColorStop(0, 'rgba(120,255,180,' + (0.22 * pulse) + ')');
      halo.addColorStop(0.45, 'rgba(60,200,255,0.1)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 6, 95, 0, Math.PI * 2);
      ctx.fill();

      // Underside tractor / landing wash
      const wash = ctx.createLinearGradient(0, 16, 0, 110);
      wash.addColorStop(0, 'rgba(100,255,170,' + (0.35 * pulse) + ')');
      wash.addColorStop(0.55, 'rgba(80,220,255,0.12)');
      wash.addColorStop(1, 'rgba(80,220,255,0)');
      ctx.fillStyle = wash;
      ctx.beginPath();
      ctx.moveTo(-22, 18);
      ctx.lineTo(22, 18);
      ctx.lineTo(70, 115);
      ctx.lineTo(-70, 115);
      ctx.closePath();
      ctx.fill();
    }

    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(4, 34, 70, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lower thruster ring (chrome)
    ctx.fillStyle = '#2a3238';
    ctx.beginPath();
    ctx.ellipse(0, 20, 52, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    const chromeLow = ctx.createLinearGradient(-55, 14, 55, 28);
    chromeLow.addColorStop(0, '#6a7888');
    chromeLow.addColorStop(0.35, '#d8e4f0');
    chromeLow.addColorStop(0.65, '#8898a8');
    chromeLow.addColorStop(1, '#4a5868');
    ctx.fillStyle = chromeLow;
    ctx.beginPath();
    ctx.ellipse(0, 18, 50, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer clay saucer disk — wide presence
    const body = ctx.createLinearGradient(-80, -18, 80, 28);
    body.addColorStop(0, '#5a7a28');
    body.addColorStop(0.25, '#b8e048');
    body.addColorStop(0.5, '#e8ff70');
    body.addColorStop(0.75, '#a0c838');
    body.addColorStop(1, '#4a6820');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 4, 78, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soft clay rim highlight
    ctx.strokeStyle = 'rgba(255,255,220,0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 72, 16, 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();

    // Mid chrome band / structural ring
    const band = ctx.createLinearGradient(-70, -2, 70, 14);
    band.addColorStop(0, '#3a4858');
    band.addColorStop(0.3, '#c8d8e8');
    band.addColorStop(0.5, '#ffffff');
    band.addColorStop(0.7, '#98a8b8');
    band.addColorStop(1, '#2a3848');
    ctx.fillStyle = band;
    ctx.beginPath();
    ctx.ellipse(0, 6, 68, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,40,30,0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 6, 68, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner energy ring (animated dashes)
    ctx.save();
    ctx.rotate(spin * 0.15);
    ctx.strokeStyle = lightsOn ? 'rgba(80,255,200,' + (0.55 + pulse * 0.35) + ')' : 'rgba(80,255,200,0.25)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 10]);
    ctx.lineDashOffset = -spin * 18;
    ctx.beginPath();
    ctx.ellipse(0, 5, 54, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Upper deck plate
    const deck = ctx.createLinearGradient(-48, -16, 48, 8);
    deck.addColorStop(0, '#6a9028');
    deck.addColorStop(0.5, '#d0f050');
    deck.addColorStop(1, '#5a8020');
    ctx.fillStyle = deck;
    ctx.beginPath();
    ctx.ellipse(0, -2, 48, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Side fin / wing stubs (sci-fi silhouette)
    ctx.fillStyle = '#3a4a58';
    ctx.beginPath();
    ctx.moveTo(-78, 2);
    ctx.lineTo(-98, -6);
    ctx.lineTo(-92, 8);
    ctx.lineTo(-74, 12);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(78, 2);
    ctx.lineTo(98, -6);
    ctx.lineTo(92, 8);
    ctx.lineTo(74, 12);
    ctx.closePath();
    ctx.fill();
    // fin glow tips
    if (lightsOn) {
      ctx.fillStyle = 'rgba(80,220,255,' + pulse + ')';
      ctx.shadowColor = '#44ddff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-98, -6, 3.5, 0, Math.PI * 2);
      ctx.arc(98, -6, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Dome — layered glass + chrome collar
    ctx.fillStyle = '#2a3848';
    ctx.beginPath();
    ctx.ellipse(0, -8, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const dome = ctx.createRadialGradient(-8, -28, 4, 0, -12, 34);
    dome.addColorStop(0, 'rgba(230, 255, 255, 0.98)');
    dome.addColorStop(0.35, 'rgba(140, 220, 255, 0.85)');
    dome.addColorStop(0.75, 'rgba(60, 140, 190, 0.75)');
    dome.addColorStop(1, 'rgba(30, 70, 110, 0.9)');
    ctx.fillStyle = dome;
    ctx.beginPath();
    ctx.ellipse(0, -14, 28, 26, 0, Math.PI, 0);
    ctx.fill();
    // dome rim chrome
    ctx.strokeStyle = 'rgba(220,235,255,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -8, 29, 7, 0, Math.PI, 0);
    ctx.stroke();
    // glass specular
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-8, -24, 9, 7, -0.4, 0, Math.PI * 1.2);
    ctx.stroke();

    // Antenna mast + dish
    ctx.strokeStyle = '#8899aa';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(0, -54);
    ctx.stroke();
    ctx.fillStyle = '#a8b8c8';
    ctx.beginPath();
    ctx.ellipse(0, -52, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = lightsOn ? '#ff4466' : '#882222';
    ctx.shadowColor = '#ff4466';
    ctx.shadowBlur = lightsOn ? 12 : 0;
    ctx.beginPath();
    ctx.arc(0, -58, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Running lights around outer rim
    const cols = ['#ff4466', '#44ffaa', '#44aaff', '#ffcc22', '#ff66cc', '#66ffff', '#aaff44', '#ff8844'];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + spin;
      const lx = Math.cos(a) * 70;
      const ly = Math.sin(a) * 14 + 6;
      const blink = lightsOn && ((Math.floor(t / 90 + i) % 3) !== 0);
      ctx.fillStyle = blink ? '#ffffff' : cols[i % cols.length];
      ctx.shadowColor = cols[i % cols.length];
      ctx.shadowBlur = blink ? 14 : (lightsOn ? 6 : 0);
      ctx.beginPath();
      ctx.arc(lx, ly, 4.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Secondary ring lights (inner)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - spin * 1.3;
      const lx = Math.cos(a) * 42;
      const ly = Math.sin(a) * 7 + 4;
      ctx.fillStyle = lightsOn ? 'rgba(180,255,255,0.9)' : '#668888';
      ctx.beginPath();
      ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hatch / boarding bay under hull
    ctx.fillStyle = '#1a2818';
    ctx.beginPath();
    ctx.moveTo(-16, 16);
    ctx.lineTo(16, 16);
    ctx.lineTo(12, 24);
    ctx.lineTo(-12, 24);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = lightsOn ? 'rgba(125,255,58,' + (0.45 + pulse * 0.35) + ')' : '#3a5a30';
    ctx.shadowColor = '#7dff3a';
    ctx.shadowBlur = lightsOn ? 10 : 0;
    ctx.fillRect(-8, 17, 16, 5);
    ctx.shadowBlur = 0;

    // Underside thruster pods
    for (const px of [-36, 0, 36]) {
      ctx.fillStyle = '#2a343c';
      ctx.beginPath();
      ctx.ellipse(px, 22, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      if (lightsOn) {
        const tg = ctx.createRadialGradient(px, 24, 1, px, 26, 10);
        tg.addColorStop(0, 'rgba(180,255,255,0.9)');
        tg.addColorStop(0.5, 'rgba(80,200,255,0.45)');
        tg.addColorStop(1, 'rgba(80,200,255,0)');
        ctx.fillStyle = tg;
        ctx.beginPath();
        ctx.arc(px, 28, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Tiny alien glyph on hull
    ctx.strokeStyle = 'rgba(30,60,20,0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(22, -2, 5, 0, Math.PI * 2);
    ctx.moveTo(19, -2);
    ctx.lineTo(25, -2);
    ctx.moveTo(22, -5);
    ctx.lineTo(22, 1);
    ctx.stroke();

    if (opts.showPilots) {
      // silhouette heads in dome
      ctx.fillStyle = 'rgba(20,24,28,0.85)';
      ctx.beginPath();
      ctx.arc(-9, -16, 5.5, 0, Math.PI * 2);
      ctx.arc(9, -16, 5.5, 0, Math.PI * 2);
      ctx.fill();
      // flat cap hint / maroon cap hint
      ctx.fillStyle = '#5a4a3a';
      ctx.fillRect(-13, -22, 8, 3);
      ctx.fillStyle = '#8a2040';
      ctx.fillRect(5, -22, 8, 3);
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
      drawClayUFO(ctx, landing.x - camX, landing.y, landing.scale || 1.85, t, landing.lights);
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
      scale: 1.4,
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
  function drawBuilding(ctx, x, groundY, kind) {
    if (kind === 'house') {
      ctx.fillStyle = '#8a6050';
      ctx.fillRect(x, groundY - 48, 50, 48);
      ctx.fillStyle = '#5a3030';
      ctx.beginPath();
      ctx.moveTo(x - 4, groundY - 48);
      ctx.lineTo(x + 25, groundY - 72);
      ctx.lineTo(x + 54, groundY - 48);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffe88a';
      ctx.fillRect(x + 10, groundY - 30, 12, 14);
    } else if (kind === 'shop') {
      ctx.fillStyle = '#a04040';
      ctx.fillRect(x, groundY - 60, 70, 60);
      ctx.fillStyle = '#ccc';
      ctx.fillRect(x, groundY - 70, 70, 12);
      ctx.fillStyle = '#88ccff';
      ctx.fillRect(x + 8, groundY - 45, 24, 28);
      ctx.fillStyle = '#fff';
      ctx.font = '8px Segoe UI, sans-serif';
      ctx.fillText('YALE', x + 22, groundY - 62);
    } else if (kind === 'barn') {
      ctx.fillStyle = '#8a3030';
      ctx.fillRect(x, groundY - 55, 64, 55);
      ctx.fillStyle = '#5a2020';
      ctx.beginPath();
      ctx.moveTo(x - 4, groundY - 55);
      ctx.lineTo(x + 32, groundY - 85);
      ctx.lineTo(x + 68, groundY - 55);
      ctx.closePath();
      ctx.fill();
    } else if (kind === 'corn') {
      ctx.fillStyle = '#c8c040';
      for (let c = 0; c < 7; c++) {
        ctx.fillRect(x + c * 8, groundY - 32, 5, 32);
      }
    } else if (kind === 'tree') {
      ctx.fillStyle = '#5a3a20';
      ctx.fillRect(x + 10, groundY - 20, 8, 20);
      ctx.fillStyle = '#2a5a28';
      ctx.beginPath();
      ctx.arc(x + 14, groundY - 35, 18, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // apartment
      ctx.fillStyle = '#5a6a7a';
      ctx.fillRect(x, groundY - 90, 44, 90);
      ctx.fillStyle = '#ffe88a';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
          ctx.fillRect(x + 8 + c * 16, groundY - 80 + r * 18, 10, 10);
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
      // green halo = good
      ctx.strokeStyle = 'rgba(125,255,58,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y - 2, 14, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = tg.kind.color;
      ctx.beginPath();
      ctx.arc(x, y - 26, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 7, y - 18, 14, 16);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 2);
      ctx.lineTo(x - 6, y + 8);
      ctx.moveTo(x + 4, y - 2);
      ctx.lineTo(x + 6, y + 8);
      ctx.stroke();
      ctx.fillStyle = '#7dff3a';
      ctx.font = 'bold 8px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tg.kind.label, x, y - 38);
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
    drawClayUFO(ctx, ufoScreenX, ufoScreenY, 1.28, t, true, { showPilots: true });

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
    drawClayUFO(ctx, w / 2 + Math.sin(t * 0.001) * 40, 130 + Math.cos(t * 0.0007) * 12, 1.55, t, true, { showPilots: true });
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
    CHAR_SCALE,
    drawCassetteProp,
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
    drawTitleBackdrop,
  };
})(window);
