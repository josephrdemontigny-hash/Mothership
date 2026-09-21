/**
 * Mothership — Chilliwack scenes, drawing helpers, flavour copy.
 * Modes: Shed / Yard / Ship (interior) / Fly. Theme starts on title cassette insert; press-step joint with Tayler then UFO lands.
 * Fly scroll is player-driven. No cockpit cassette.
 * Flight: North→South Chilliwack; Mt. Cheam (Lhílheqey) fixed EAST = LEFT of skyline.
 * Characters: Zakk & Tayler — neon-noir ¾ walk profiles (flat cap / backwards cap), shed band gear.
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

  /** Good fly loot — beam for hull repair / score buffs (not hazards) */
  const LOOT_KINDS = [
    { id: 'microplastics', label: 'Microplastics', points: 60, color: '#9ef0ff', human: false, loot: 'plastics', shape: 'plastics' },
    { id: 'kfc', label: 'KFC Chicken', points: 280, color: '#ffb84a', human: false, loot: 'chicken', shape: 'kfc' },
  ];

  /** Holy Cow Easter egg — good beam target (NOT a hazard), grants 2× score for ~30s */
  const COW_KIND = {
    id: 'cow',
    label: 'Holy Cow',
    points: 320,
    color: '#f0e8d8',
    human: false,
    cow: true,
    shape: 'cow',
  };

  /** Operating table X on mothership bridge (surgery Easter egg) */
  const SHIP_TABLE_X = 380;

  /** Plastics needed per hull repair / upgrade */
  const MICROPLASTIC_THRESHOLD = 5;
  const MAX_LIVES_BASE = 3;
  const MAX_LIVES_UPGRADED = 4;

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

  const PLASTICS_LINERS = [
    'Sparkly bottle flakes — recycled into hull plating!',
    "Microplastics: the mothership's guilty pleasure.",
    'Tayler: "We\'re… collecting trash on purpose now?"',
    'Fraser Valley runoff → UFO armor. Science!',
  ];

  const CHICKEN_LINERS = [
    'KFC ACQUIRED — moon juice levels rising!',
    'Bucket secured. Zakk: "Finger lickin\' cosmic."',
    'Fried chicken lore: confirmed. Score multiplier online!',
    'Retrofit fuel: original recipe. Wider beam unlocked!',
    'Subject: drumstick. Destination: operating table (honored).',
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
  /** World X of shed exterior door in the yard (matches drawYard sx+34) */
  const YARD_SHED_DOOR_X = 254;
  /** Walkable mothership bridge / control deck */
  const SHIP_WORLD_W = 980;
  /** Driver's seat / helm interact X */
  const SHIP_HELM_X = 720;

  /** Retrofit band aboard mothership after van/bus beam (stylized via drawCitizen looks) */
  const BAND_SIZE = 6;
  const BAND_ROSTER = [
    { id: 'keys', look: 'blazer', x: 170, line: 'Keys guy nods — that van was paid off in 2009.' },
    { id: 'drums', look: 'graphic', x: 290, line: 'Drums check the viewport — "is that Yale Road?"' },
    { id: 'bass', look: 'denim', x: 410, line: 'Bass shrugs — "aliens got better monitors than Paramount."' },
    { id: 'guitar', look: 'raglan', x: 530, line: 'Guitar: "beam was clean. Keep the van yellow."' },
    { id: 'vox', look: 'western', x: 650, line: 'Vox: "welcome to the mothership, Chilliwack."' },
    { id: 'rhythm', look: 'plaid', x: 820, line: 'Rhythm (cap back): "BRAVE bus still smells like Molson."' },
  ];

  /** Landmark visit interiors (side-scroller rooms) — denser cinematic chambers */
  const LANDMARK_WORLD_W = 1040;
  const LANDMARK_HOTSPOT_X = 580;
  const LANDMARK_EXIT_X = 120;
  /** Visible cassette prop in shed (on clutter near stereo) */
  const SHED_CASSETTE_X = 600;
  const SHED_CASSETTE_Y_OFF = 42; // above floor
  /** Boombox / stereo deck — far from cassette; walk across the shed to play */
  const SHED_STEREO_X = 1180;
  /** Gold '67 El Camino (side view) center X — walk path in FRONT of the car */
  const SHED_CAMINO_X = 360;
  /** Driver door / seat offset from car center (local, nose-left space) */
  const CAMINO_DOOR_DX = -28;
  /** Approx half-length for exit / bounds checks (canvas car ~448px wide) */
  const CAMINO_HALF_W = 142;
  /** Interactive band gear in shed (world X) — game.js proximity / USE */
  const SHED_INSTRUMENTS = [
    { id: 'drums', x: 520, label: 'DRUMS', radius: 55 },
    { id: 'bass', x: 760, label: 'BASS', radius: 48 },
    { id: 'keys', x: 860, label: 'KEYS', radius: 48 },
    // Cream Eko teardrop — distinct X from cherry SG
    { id: 'eko', x: 990, label: 'EKO', radius: 40 },
    // Cherry SG eye guitar near amp; tight radius so stereo/joint win when closer
    { id: 'guitar', x: 1045, label: 'SG', radius: 42 },
  ];
  /** Side-window rect in local nose-left space — driver is clipped here */
  const CAMINO_WIN = { x: -44, y: -65, w: 53, h: 28 };
  /** Large framed backyard window on back wall (world X of glass left edge) */
  const SHED_WINDOW_X = 720;
  const SHED_WINDOW_W = 380;
  const SHED_WINDOW_Y = 32;
  const SHED_WINDOW_H = 168;
  /** Default human sprite scale — taller vs shed interior (~1.72×). */
  const CHAR_SCALE = 1.72;
  /** Shared on-screen standing height (px, feet→crown). All standing humans match this. */
  const VECTOR_LOCAL_H = 73; // go avatar feet→head-top in local units
  const STANDING_HEIGHT = Math.round(VECTOR_LOCAL_H * CHAR_SCALE); // ~125
  const SEATED_HEIGHT = Math.round(52 * CHAR_SCALE); // seated ok shorter
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

  // ——— Sky / mountains: misty layered silhouettes (user haze ref) ———
  function drawSky(ctx, w, h, t) {
    // Neon dusk sky — deep purple → magenta horizon (trading-card vibe)
    const gsky = ctx.createLinearGradient(0, 0, 0, h);
    gsky.addColorStop(0, '#1a0a38');
    gsky.addColorStop(0.35, '#3a1858');
    gsky.addColorStop(0.65, '#8a2868');
    gsky.addColorStop(0.85, '#c85840');
    gsky.addColorStop(1, '#e8a060');
    ctx.fillStyle = gsky;
    ctx.fillRect(0, 0, w, h);

    // Magenta / cyan rim lamps
    const mag = ctx.createRadialGradient(w * 0.15, h * 0.35, 6, w * 0.15, h * 0.4, w * 0.4);
    mag.addColorStop(0, 'rgba(255,40,180,0.28)');
    mag.addColorStop(1, 'rgba(255,40,180,0)');
    ctx.fillStyle = mag;
    ctx.fillRect(0, 0, w, h * 0.75);
    const cyan = ctx.createRadialGradient(w * 0.82, h * 0.22, 6, w * 0.82, h * 0.28, w * 0.35);
    cyan.addColorStop(0, 'rgba(60,200,255,0.22)');
    cyan.addColorStop(1, 'rgba(60,200,255,0)');
    ctx.fillStyle = cyan;
    ctx.fillRect(0, 0, w, h * 0.7);

    // Warm horizon haze
    const fog = ctx.createRadialGradient(w * 0.45, h * 0.55, 10, w * 0.45, h * 0.62, w * 0.5);
    fog.addColorStop(0, 'rgba(255,180,90,0.35)');
    fog.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, h * 0.35, w, h * 0.5);
  }

  /**
   * Atmospheric Cascade skyline matching misty silhouette photo.
   * Camera faces SOUTH; EAST = LEFT — Mt. Cheam pinned left, unlabeled.
   * Layers: pale distant peaks → mid grey ridges → dark tree slope → near charcoal.
   */
  function drawMountains(ctx, w, groundY, scrollX) {
    const base = groundY;
    const cheamX = w * 0.22 + Math.sin(scrollX * 0.0003) * 4;

    function fillPoly(pts, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      ctx.closePath();
      ctx.fill();
    }

    // Layer 1 — farthest pale mountains (mist-washed)
    ctx.fillStyle = '#cfd6dd';
    ctx.beginPath();
    ctx.moveTo(-30, base);
    ctx.lineTo(cheamX - 260, base - 70);
    ctx.lineTo(cheamX - 200, base - 118);
    ctx.lineTo(cheamX - 150, base - 88);
    ctx.lineTo(cheamX - 90, base - 145);
    ctx.lineTo(cheamX - 40, base - 100);
    ctx.lineTo(cheamX + 10, base - 175); // Cheam distant pale echo
    ctx.lineTo(cheamX + 70, base - 95);
    ctx.lineTo(cheamX + 160, base - 60);
    ctx.lineTo(w * 0.72, base - 48);
    ctx.lineTo(w + 40, base - 35);
    ctx.lineTo(w + 40, base);
    ctx.closePath();
    ctx.fill();

    // Valley fog wash over far peaks
    const mist1 = ctx.createLinearGradient(0, base - 180, 0, base - 40);
    mist1.addColorStop(0, 'rgba(243,244,246,0.15)');
    mist1.addColorStop(0.55, 'rgba(243,244,246,0.55)');
    mist1.addColorStop(1, 'rgba(243,244,246,0.75)');
    ctx.fillStyle = mist1;
    ctx.fillRect(0, base - 190, w, 160);

    // Layer 2 — mid blue-grey ridges (Cheam range readable)
    const mid = '#7a8896';
    ctx.fillStyle = mid;
    ctx.beginPath();
    ctx.moveTo(-20, base);
    // Welch / Lady / Knight / Cheam silhouettes — flat, no snow detail (haze style)
    ctx.lineTo(cheamX - 230, base);
    ctx.lineTo(cheamX - 210, base - 78);
    ctx.lineTo(cheamX - 175, base - 52);
    ctx.lineTo(cheamX - 155, base - 105);
    ctx.lineTo(cheamX - 120, base - 62);
    ctx.lineTo(cheamX - 95, base - 118);
    ctx.lineTo(cheamX - 55, base - 70);
    // Cheam — iconic pyramid, LEFT/EAST
    ctx.lineTo(cheamX - 28, base - 155);
    ctx.lineTo(cheamX, base - 210);
    ctx.lineTo(cheamX + 32, base - 148);
    ctx.lineTo(cheamX + 95, base - 55);
    ctx.lineTo(cheamX + 180, base - 42);
    ctx.lineTo(w * 0.85, base - 28);
    ctx.lineTo(w + 30, base - 22);
    ctx.lineTo(w + 30, base);
    ctx.closePath();
    ctx.fill();

    // Soft fog between mid and near
    const mist2 = ctx.createLinearGradient(0, base - 120, 0, base);
    mist2.addColorStop(0, 'rgba(209,213,219,0.35)');
    mist2.addColorStop(1, 'rgba(209,213,219,0.65)');
    ctx.fillStyle = mist2;
    ctx.fillRect(0, base - 130, w, 130);

    // Layer 3 — dark tree-covered slope (sawtooth evergreens), diagonal like ref
    const treeCol = '#3d4654';
    ctx.fillStyle = treeCol;
    ctx.beginPath();
    const slopeScroll = (scrollX * 0.12) % 40;
    ctx.moveTo(-40, base + 10);
    ctx.lineTo(-40, base - 20);
    // rising diagonal left→right mid, then trees
    for (let i = 0; i <= 28; i++) {
      const x = i * (w / 22) - slopeScroll;
      const ridge = base - 35 - (i < 14 ? i * 4.2 : (28 - i) * 1.2) - ((i * 17) % 11);
      const tree = (i % 2 === 0) ? 16 + (i % 5) * 3 : 10 + (i % 3) * 4;
      ctx.lineTo(x, ridge - tree);
      ctx.lineTo(x + w / 44, ridge - tree * 0.35);
    }
    ctx.lineTo(w + 50, base - 18);
    ctx.lineTo(w + 50, base + 10);
    ctx.closePath();
    ctx.fill();

    // Extra conifer spikes for texture
    ctx.fillStyle = '#2f3642';
    for (let i = 0; i < 22; i++) {
      const x = ((i * 73 - slopeScroll * 2) % (w + 60)) - 20;
      const y = base - 48 - (i % 7) * 5 - (x < w * 0.45 ? 25 : 8);
      ctx.beginPath();
      ctx.moveTo(x, y + 28);
      ctx.lineTo(x + 7, y);
      ctx.lineTo(x + 14, y + 28);
      ctx.closePath();
      ctx.fill();
    }

    // Layer 4 — near charcoal rocky foreground silhouette
    ctx.fillStyle = '#0a0c10';
    ctx.beginPath();
    ctx.moveTo(-30, base + 20);
    ctx.lineTo(-30, base - 8);
    for (let i = 0; i <= 16; i++) {
      const x = i * (w / 14) - (scrollX * 0.25) % (w / 14);
      const jag = base - 6 - ((i * 41) % 18) - (i % 3) * 4;
      ctx.lineTo(x, jag);
    }
    ctx.lineTo(w + 40, base - 4);
    ctx.lineTo(w + 40, base + 20);
    ctx.closePath();
    ctx.fill();

    // Final valley fog veil (ethereal)
    const mist3 = ctx.createLinearGradient(0, base - 90, 0, base + 5);
    mist3.addColorStop(0, 'rgba(243,244,246,0)');
    mist3.addColorStop(0.4, 'rgba(243,244,246,0.25)');
    mist3.addColorStop(1, 'rgba(229,233,238,0.4)');
    ctx.fillStyle = mist3;
    ctx.fillRect(0, base - 100, w, 110);
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

  function drawJoint(ctx, x, y, angle, opts) {
    opts = opts || {};
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || -0.4);
    const len = opts.len != null ? opts.len : 18;
    ctx.strokeStyle = opts.color || '#c4a070';
    ctx.lineWidth = opts.lineW || 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    // paper tip / filter
    ctx.fillStyle = '#e8d8b0';
    ctx.fillRect(-2, -2.2, 5, 4.4);
    // Cherry only when lit is explicitly truthy (false/0/undefined = unlit)
    if (opts.lit) {
      const glow = opts.lit === true ? 1 : Number(opts.lit);
      ctx.fillStyle = '#ff8844';
      ctx.shadowColor = '#ff6622';
      ctx.shadowBlur = 6 * glow;
      ctx.beginPath();
      ctx.arc(len, 0, 2.2 * (0.7 + glow * 0.3), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  function drawRollingPaper(ctx, x, y, openAmt) {
    const a = openAmt != null ? openAmt : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.15);
    // cream rolling paper sheet
    ctx.fillStyle = '#f2e6c8';
    ctx.strokeStyle = '#c8b890';
    ctx.lineWidth = 1;
    const w = 22 * a + 6;
    const h = 10;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);
    ctx.quadraticCurveTo(0, -h / 2 - 3 * a, w / 2, -h / 2);
    ctx.lineTo(w / 2, h / 2);
    ctx.quadraticCurveTo(0, h / 2 + 2 * a, -w / 2, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // gum strip
    ctx.fillStyle = 'rgba(180,220,160,0.55)';
    ctx.fillRect(-w / 2, -h / 2, w, 2.5);
    ctx.restore();
  }

  function drawWeedPinch(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#3a7a28';
    for (let i = 0; i < 5; i++) {
      const ox = Math.sin(i * 1.7 + (t || 0) * 0.01) * 3;
      const oy = Math.cos(i * 2.1) * 2;
      ctx.beginPath();
      ctx.ellipse(ox, oy, 3.2, 2.1, i * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#2a5a18';
    ctx.beginPath();
    ctx.arc(0, 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawLighterFlame(ctx, x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    // lighter body
    ctx.fillStyle = '#c0c8d0';
    ctx.fillRect(-4, 2, 8, 14);
    ctx.fillStyle = '#3a4048';
    ctx.fillRect(-3, 0, 6, 4);
    // flame
    const flicker = 0.85 + Math.sin((t || 0) * 0.04) * 0.15;
    const fg = ctx.createRadialGradient(0, -6, 1, 0, -8, 12);
    fg.addColorStop(0, 'rgba(255,255,200,' + (0.95 * flicker) + ')');
    fg.addColorStop(0.35, 'rgba(255,160,40,0.9)');
    fg.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.quadraticCurveTo(-6, -10 * flicker, 0, -16 * flicker);
    ctx.quadraticCurveTo(6, -10 * flicker, 4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Staged joint sesh props between Tayler (left/seated) and Zakk.
   * stage: 'paper' | 'gethigh' | 'roll' | 'light' | 'smoke' | 'pass' | 'watch'
   * stageProg: 0..1 within stage
   */
  function drawJointSesh(ctx, taylerX, taylerY, zakkX, zakkY, stage, stageProg, t) {
    const p = Math.max(0, Math.min(1, stageProg || 0));
    const midX = (taylerX + zakkX) / 2;
    const handY = taylerY - 48;

    if (stage === 'paper' || stage === 'gethigh') {
      drawRollingPaper(ctx, taylerX + 28, handY - 4, 0.55 + p * 0.35);
      drawWeedPinch(ctx, taylerX + 18, handY + 8, t);
      ctx.fillStyle = 'rgba(200,255,140,' + (0.35 + p * 0.4) + ')';
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stage === 'gethigh' ? 'get high with T' : '📄 + 🌿', taylerX + 24, handY - 22);
      ctx.textAlign = 'left';
    } else if (stage === 'roll') {
      // paper curling into joint (paper + weed animation)
      const curl = 1 - p;
      if (curl > 0.15) drawRollingPaper(ctx, taylerX + 26, handY, curl);
      drawJoint(ctx, taylerX + 22, handY + 2, -0.35, { len: 8 + p * 12, lit: false });
      drawWeedPinch(ctx, taylerX + 14, handY + 10 - p * 6, t);
      ctx.strokeStyle = 'rgba(232,255,224,' + (0.25 + p * 0.35) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(taylerX + 26, handY + 2, 14, -1.2, -1.2 + p * 2.4);
      ctx.stroke();
      ctx.fillStyle = '#e8ffe0';
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('roll joint', taylerX + 26, handY - 24);
      ctx.textAlign = 'left';
    } else if (stage === 'light') {
      // Zakk lights — lighter at Zakk; joint unlit until ~0.45 then cherry ramps
      // Smoke only after mid-light (litAmt); no pre-lit plumes
      const litAmt = p < 0.45 ? 0 : Math.min(1, (p - 0.45) / 0.55);
      drawJoint(ctx, taylerX + 24, handY, -0.45, { lit: litAmt > 0 ? litAmt : false });
      const zSide = zakkX < taylerX ? -1 : 1;
      drawLighterFlame(ctx, zakkX + zSide * 26, zakkY - 36, t);
      if (litAmt > 0.35) {
        // tiny tip ember plume only once actually lit — not mouth smoke
        drawSmokePuffs(ctx, taylerX + 42, handY - 8, t, 0.45 + litAmt * 0.55);
      }
      ctx.fillStyle = '#ffe8a0';
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Zakk lights it', (taylerX + zakkX) / 2, handY - 26);
      ctx.textAlign = 'left';
    } else if (stage === 'smoke' || stage === 'pass' || stage === 'watch') {
      // Smoke the joint — handoff; cherry + optional tip ember only.
      // Big mouth plumes are Up-driven on drawZakk (puffing), not free ambient here.
      const handoff = Math.min(1, p * 1.35);
      const jx = taylerX + 24 + (zakkX - taylerX - 10) * Math.min(1, handoff);
      const jy = handY - Math.sin(Math.min(1, handoff) * Math.PI) * 18;
      if (handoff < 0.95) {
        drawJoint(ctx, jx, jy, -0.3 + handoff * 0.2, { lit: true });
        // soft tip wisps during pass — not character mouth smoke
        drawSmokePuffs(ctx, jx + 14, jy - 6, t, 0.7);
      } else {
        drawJoint(ctx, zakkX + (zakkX < taylerX ? -22 : 22), zakkY - 32, -0.5, { lit: true });
        // idle hold after handoff: cherry only (mouth smoke via Up / puffing on Zakk)
      }
      ctx.fillStyle = '#e8ffe0';
      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Smoke the joint', midX, handY - 36);
      ctx.textAlign = 'left';
    }
  }

  // ——— Characters (Pokémon GO–style soft avatars; no IP) ———

  /** Soft volumetric capsule (sausage limb) from (x0,y0)→(x1,y1). */
  function goCapsule(ctx, x0, y0, x1, y1, r, hi, mid, lo, opts) {
    opts = opts || {};
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 0.001;
    const ang = Math.atan2(dy, dx);
    const r0 = opts.r0 != null ? opts.r0 : r;
    const r1 = opts.r1 != null ? opts.r1 : (opts.flatEnd ? Math.max(1.2, r * 0.72) : r);
    const flatEnd = !!opts.flatEnd;
    ctx.save();
    ctx.translate(x0, y0);
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(0, -Math.max(r0, r1), 0, Math.max(r0, r1));
    g.addColorStop(0, hi);
    g.addColorStop(0.42, mid);
    g.addColorStop(1, lo);
    ctx.fillStyle = g;
    ctx.beginPath();
    if (Math.abs(r0 - r1) < 0.05 && !flatEnd) {
      ctx.moveTo(0, -r0);
      ctx.lineTo(len, -r1);
      ctx.arc(len, 0, r1, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(0, r0);
      ctx.arc(0, 0, r0, Math.PI / 2, -Math.PI / 2);
    } else {
      // tapered / cuff end — flat or slightly rounded tip (not a fat sausage ball)
      ctx.moveTo(0, -r0);
      ctx.lineTo(len, -r1);
      if (flatEnd) {
        ctx.lineTo(len + 0.6, -r1 * 0.35);
        ctx.lineTo(len + 0.6, r1 * 0.35);
        ctx.lineTo(len, r1);
      } else {
        ctx.quadraticCurveTo(len + r1 * 0.55, 0, len, r1);
      }
      ctx.lineTo(0, r0);
      ctx.arc(0, 0, r0, Math.PI / 2, -Math.PI / 2);
    }
    ctx.closePath();
    ctx.fill();
    // soft specular ridge
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.ellipse(len * 0.32, -r0 * 0.35, Math.max(2, len * 0.28), r0 * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Small palm + finger hint so limbs never read as blunt sausages. */
  function goHand(ctx, hx, hy, ang, skinHi, skin, skinLo) {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(ang);
    const g = ctx.createRadialGradient(-0.5, -0.6, 0.3, 0.3, 0.15, 2.8);
    g.addColorStop(0, skinHi);
    g.addColorStop(0.55, skin);
    g.addColorStop(1, skinLo);
    ctx.fillStyle = g;
    ctx.beginPath();
    // small GO-avatar palm
    ctx.ellipse(0.45, 0.15, 2.05, 1.75, 0.12, 0, Math.PI * 2);
    ctx.fill();
    // short finger nubs — never a long thick digit
    ctx.fillStyle = skin;
    for (let i = 0; i < 3; i++) {
      const fx = 1.75 + i * 0.12;
      const fy = -1.15 + i * 1.05;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 0.78, 0.55, 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = skinLo;
    ctx.beginPath();
    ctx.ellipse(1.1, 1.55, 0.85, 0.55, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Fingertip in limb-local space (goHand fingers along handAng). */
  function smokeHandTip(end, a2) {
    const handAng = a2 + Math.PI / 2;
    return {
      lx: end.ex + Math.cos(handAng) * 2.4,
      ly: end.ey + Math.sin(handAng) * 2.4,
    };
  }

  /** Sleeve upper + shorter forearm + cuff line + hand (anti-sausage arms). */
  function goArmLimb(ctx, ax, ay, ang1, ang2, len1, len2, r1, r2, sleeveCols, skinCols) {
    const jx = ax + Math.sin(ang1) * len1;
    const jy = ay + Math.cos(ang1) * len1;
    const ex = jx + Math.sin(ang2) * len2;
    const ey = jy + Math.cos(ang2) * len2;
    // upper sleeve
    goCapsule(ctx, ax, ay, jx, jy, r1, sleeveCols[0], sleeveCols[1], sleeveCols[2]);
    // cuff band at elbow (clear sleeve vs forearm break)
    const cuffR = Math.max(r1, r2) * 1.05;
    const cg = ctx.createRadialGradient(jx - 0.8, jy - 0.8, 0.3, jx, jy, cuffR);
    cg.addColorStop(0, sleeveCols[0]);
    cg.addColorStop(0.55, sleeveCols[1]);
    cg.addColorStop(1, sleeveCols[2]);
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(jx, jy, cuffR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(jx, jy, cuffR * 0.78, -0.8, 2.2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(jx, jy, cuffR * 0.92, 0.4, 3.4);
    ctx.stroke();
    // shorter tapered forearm (flat cuff end — not fat rounded tip)
    goCapsule(ctx, jx, jy, ex, ey, r2, skinCols[0], skinCols[1], skinCols[2], {
      r0: r2 * 1.05,
      r1: r2 * 0.78,
      flatEnd: true,
    });
    // hand
    goHand(ctx, ex, ey, ang2 + Math.PI / 2, skinCols[0], skinCols[1], skinCols[2]);
    return { jx, jy, ex, ey };
  }

  /** Rounded soft torso / blob with clay gradient + specular. */
  function goTorso(ctx, cx, cy, w, h, rad, hi, mid, lo) {
    const x = cx - w / 2, y = cy - h / 2;
    const rr = Math.min(rad, w / 2, h / 2);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, rr);
    else {
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }
    const g = ctx.createLinearGradient(x, y, x + w * 0.85, y + h);
    g.addColorStop(0, hi);
    g.addColorStop(0.45, mid);
    g.addColorStop(1, lo);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.12, cy - h * 0.28, w * 0.28, h * 0.16, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Soft head — normal adult proportion, not balloon squash. */
  function goHead(ctx, hx, hy, rx, ry, skinHi, skin, skinLo) {
    const g = ctx.createRadialGradient(hx - rx * 0.22, hy - ry * 0.32, 1.2, hx, hy, rx * 1.12);
    g.addColorStop(0, skinHi);
    g.addColorStop(0.55, skin);
    g.addColorStop(1, skinLo);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(hx, hy, rx, ry, 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.ellipse(hx - rx * 0.18, hy - ry * 0.32, rx * 0.28, ry * 0.16, -0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Two-bone limb (thigh+calf or upper+fore) with overlapping joint sockets. */
  function goJointLimb(ctx, ax, ay, ang1, ang2, len1, len2, r1, r2, c1, c2) {
    const jx = ax + Math.sin(ang1) * len1;
    const jy = ay + Math.cos(ang1) * len1;
    const ex = jx + Math.sin(ang2) * len2;
    const ey = jy + Math.cos(ang2) * len2;
    goCapsule(ctx, ax, ay, jx, jy, r1, c1[0], c1[1], c1[2]);
    // joint socket overlap (subtle — avoid big clown balls)
    const jg = ctx.createRadialGradient(jx - 1, jy - 1, 0.4, jx, jy, r1 * 0.95);
    jg.addColorStop(0, c1[0]);
    jg.addColorStop(1, c1[2]);
    ctx.fillStyle = jg;
    ctx.beginPath();
    ctx.arc(jx, jy, r1 * 0.92, 0, Math.PI * 2);
    ctx.fill();
    goCapsule(ctx, jx, jy, ex, ey, r2, c2[0], c2[1], c2[2]);
    return { jx, jy, ex, ey };
  }

  function goWalkPose(moving, seated, t) {
    const tt = t || 0;
    if (seated) {
      return {
        bob: 0,
        sway: 0,
        lean: 0,
        nThigh: 1.32, nKnee: 1.05,
        fThigh: 1.18, fKnee: 0.95,
        nArm: 0.35, nElbow: 0.55,
        fArm: 0.25, fElbow: 0.45,
        plantN: true, plantF: true
      };
    }
    if (!moving) {
      // IDLE: completely still — no bob, sway, or lean (vector fallbacks match photos)
      return {
        bob: 0,
        sway: 0,
        lean: 0,
        nThigh: 0.02, nKnee: 0.12,
        fThigh: -0.02, fKnee: 0.12,
        nArm: 0.08, nElbow: 0.32,
        fArm: -0.06, fElbow: 0.28,
        plantN: true, plantF: true
      };
    }
    // Side-profile walk — forward lean, stride, opposite arm swing, bounce only while moving
    const phase = tt * 0.032;
    const s = Math.sin(phase);
    const liftN = Math.max(0, s);
    const liftF = Math.max(0, -s);
    return {
      bob: Math.abs(s) * 2.1,
      sway: s * 0.55,
      lean: 3.4 + Math.abs(s) * 0.55,
      nThigh: s * 0.48,
      nKnee: 0.14 + liftN * 0.55,
      fThigh: -s * 0.48,
      fKnee: 0.14 + liftF * 0.55,
      nArm: -s * 0.42,
      nElbow: 0.34 + Math.max(0, -s) * 0.28,
      fArm: s * 0.42,
      fElbow: 0.34 + Math.max(0, s) * 0.28,
      plantN: liftN < 0.15,
      plantF: liftF < 0.15
    };
  }

  function goAviator(ctx, hx, hy) {
    // Thin real aviators — translucent lenses (NOT solid black eye patches)
    // Soft eye hint under glass
    ctx.fillStyle = 'rgba(40,28,24,0.35)';
    ctx.beginPath();
    ctx.ellipse(hx - 2.8, hy + 0.4, 1.3, 1.5, 0, 0, Math.PI * 2);
    ctx.ellipse(hx + 5.0, hy + 0.5, 1.5, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();

    function lens(lx, ly, rx, ry, rot) {
      const g = ctx.createLinearGradient(lx - rx, ly - ry, lx + rx, ly + ry);
      g.addColorStop(0, 'rgba(180,230,255,0.28)');
      g.addColorStop(0.35, 'rgba(40,60,90,0.18)');
      g.addColorStop(0.7, 'rgba(255,120,200,0.12)');
      g.addColorStop(1, 'rgba(20,30,50,0.22)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(lx, ly, rx, ry, rot, 0, Math.PI * 2);
      ctx.fill();
      // thin metal rim
      ctx.strokeStyle = 'rgba(210,215,225,0.95)';
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      ctx.ellipse(lx, ly, rx, ry, rot, 0, Math.PI * 2);
      ctx.stroke();
      // specular dash
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(lx - rx * 0.25, ly - ry * 0.35, rx * 0.45, ry * 0.25, rot, Math.PI * 1.1, Math.PI * 1.85);
      ctx.stroke();
    }
    // teardrop aviator shapes (far smaller / foreshortened)
    lens(hx - 3.0, hy, 3.2, 2.6, -0.22);
    lens(hx + 5.4, hy, 4.6, 3.0, 0.1);
    // bridge + thin temples
    ctx.strokeStyle = 'rgba(200,205,215,0.9)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(hx - 0.1, hy - 0.2);
    ctx.lineTo(hx + 1.2, hy - 0.2);
    ctx.moveTo(hx - 6.0, hy);
    ctx.lineTo(hx - 9.5, hy + 1.0);
    ctx.moveTo(hx + 9.8, hy);
    ctx.lineTo(hx + 13.0, hy + 1.1);
    ctx.stroke();
  }

  function goBoot(ctx, ax, ay, toeX, cols, laceCol) {
    // soft rounded boot blob planted at ankle, toe toward +x
    const w = 11, h = 7;
    const bx = ax - 3, by = ay - 1;
    const g = ctx.createLinearGradient(bx, by, bx + w, by + h);
    g.addColorStop(0, cols[0]);
    g.addColorStop(0.5, cols[1]);
    g.addColorStop(1, cols[2]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(bx, by + 1);
    ctx.quadraticCurveTo(bx, by - 1, bx + 3, by - 1.2);
    ctx.lineTo(bx + w - 2, by - 0.8);
    ctx.quadraticCurveTo(bx + w + 2.5, by + 1.5, bx + w + 1.2, by + 4.2);
    ctx.quadraticCurveTo(bx + w - 1, by + h, bx + 1, by + h - 0.3);
    ctx.quadraticCurveTo(bx - 1, by + h - 1, bx, by + 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.ellipse(bx + 4, by + 1, 3.5, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = laceCol || '#666';
    ctx.lineWidth = 0.85;
    for (let i = 0; i < 3; i++) {
      const ly = by + 1.2 + i * 1.5;
      ctx.beginPath();
      ctx.moveTo(bx + 2.5, ly);
      ctx.lineTo(bx + w - 3, ly);
      ctx.stroke();
    }
  }

  function goClampFoot(end, plant, groundY) {
    if (end.ey > groundY) {
      end.ey = groundY;
    }
    if (plant && end.ey > groundY - 0.5) end.ey = groundY;
    return end;
  }

  /**
   * Zakk — GO soft avatar: flat/scally cap, mustache, aviators,
   * all-black outfit + teal trim/alien patches, black boots.
   * Feet at (x,y). facing: 1 right / -1 left. Local +x = forward after flip.
   */
  function drawZakk(ctx, x, y, facing, moving, t, opts) {
    opts = opts || {};
    const scale = opts.scale != null ? opts.scale : CHAR_SCALE;
    const seated = !!opts.seated;
    const f = facing >= 0 ? 1 : -1;
    const pose = goWalkPose(moving, seated, t);
    const skinHi = '#e8c4a4', skin = '#d4a882', skinLo = '#b07a58';
    const blkHi = '#3a3a44', blk = '#1a1a22', blkLo = '#060608';
    const pantHi = '#2e2e36', pant = '#16161c', pantLo = '#08080c';

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(f * scale, scale);

    if (!opts.noShadow) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(2 + pose.sway * 0.15, 0, seated ? 13 : 15 + Math.abs(pose.sway) * 0.2, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const bob = pose.bob;
    const lean = pose.lean;
    const sway = pose.sway;
    const hipY = (seated ? -17 : -27) - bob;
    const hipX = lean * 0.3 + sway * 0.12;
    const bodyCy = (seated ? -33 : -41) - bob;
    const bodyCx = lean * 0.45 + sway * 0.06;
    const ground = 0;
    const headY0 = seated ? -53 : -60;

    // ——— FAR LEG (behind) ———
    {
      const hx = hipX - 3.2 + sway * -0.15;
      const hy = hipY;
      const ang1 = pose.fThigh;
      const ang2 = pose.fThigh - pose.fKnee;
      const end = goJointLimb(ctx, hx, hy, ang1, ang2, 14, 13, 3.5, 3.0,
        [pantHi, pant, pantLo], [pant, pantLo, '#040406']);
      goClampFoot(end, pose.plantF, ground);
      // redraw calf/boot at clamped y if needed — approximate plant by drawing boot at clamped
      const footY = Math.min(end.ey, ground);
      goBoot(ctx, end.ex, footY, end.ex + 6, ['#2a2a30', '#141418', '#050506'], '#555');
    }

    // ——— FAR ARM ———
    if (!seated) {
      const sx = bodyCx - 9;
      const sy = bodyCy - 10;
      const a1 = 0.15 + pose.fArm;
      const a2 = a1 + pose.fElbow;
      const end = goArmLimb(ctx, sx, sy, a1, a2, 11, 8.2, 2.85, 2.35,
        [blkHi, blk, blkLo], [skinHi, skin, skinLo]);
      // tiny tattoo ticks on forearm
      ctx.strokeStyle = 'rgba(40,20,40,0.55)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(end.jx + 1.2, end.jy + 1.2); ctx.lineTo(end.ex - 1.5, end.ey - 1.5);
      ctx.stroke();
    }

    // ——— TORSO ———
    goTorso(ctx, bodyCx, bodyCy, 18, 23, 7.5, '#2a2a32', '#141418', '#050508');
    // teal placket + collar
    const tg = ctx.createLinearGradient(bodyCx, bodyCy - 10, bodyCx, bodyCy + 10);
    tg.addColorStop(0, '#2ec4a0');
    tg.addColorStop(0.5, '#1a8a7a');
    tg.addColorStop(1, '#c4a35a');
    ctx.fillStyle = tg;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bodyCx - 1.2, bodyCy - 9, 2.6, 18, 1.2);
    else ctx.fillRect(bodyCx - 1.2, bodyCy - 9, 2.6, 18);
    ctx.fill();
    ctx.fillStyle = '#4dffcc';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(bodyCx + 0.1, bodyCy - 6 + i * 4.2, 0.85, 0, Math.PI * 2);
      ctx.fill();
    }
    // collar flaps
    ctx.fillStyle = '#2ec4a0';
    ctx.beginPath();
    ctx.moveTo(bodyCx - 7, bodyCy - 11);
    ctx.quadraticCurveTo(bodyCx - 2, bodyCy - 6, bodyCx - 6, bodyCy - 4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bodyCx + 7, bodyCy - 11);
    ctx.quadraticCurveTo(bodyCx + 2, bodyCy - 6, bodyCx + 6, bodyCy - 4);
    ctx.closePath();
    ctx.fill();
    // alien patches
    zakkAlienPatch(ctx, bodyCx - 7.5, bodyCy - 1, 0.85);
    zakkAlienPatch(ctx, bodyCx + 3.5, bodyCy - 1, 1);
    // magenta rim on front
    ctx.strokeStyle = 'rgba(255,40,180,0.28)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(bodyCx + 9, bodyCy - 8);
    ctx.quadraticCurveTo(bodyCx + 10.5, bodyCy, bodyCx + 9, bodyCy + 9);
    ctx.stroke();

    // hip socket bridge
    goTorso(ctx, hipX, hipY - 2, 16, 10, 5, pantHi, pant, pantLo);

    // ——— NEAR LEG ———
    {
      const hx = hipX + 3.2 + sway * 0.25;
      const hy = hipY;
      let ang1 = pose.nThigh;
      let ang2 = pose.nThigh - pose.nKnee;
      if (seated) { ang1 = 1.2; ang2 = 1.65; }
      const end = goJointLimb(ctx, hx, hy, ang1, ang2, 13.5, 12.5, 4.5, 3.8,
        [pantHi, pant, pantLo], [pantHi, pant, pantLo]);
      const footY = Math.min(end.ey, ground);
      goBoot(ctx, end.ex, footY, end.ex + 6, ['#3a3a42', '#1a1a20', '#060608'], '#666');
    }

    // ——— NEAR ARM ———
    let smokeHand = null;
    {
      const sx = bodyCx + 9;
      const sy = bodyCy - 10;
      let a1 = 0.1 + pose.nArm;
      let a2 = a1 + pose.nElbow;
      if (seated) { a1 = 0.4; a2 = 0.95; }
      if (opts.smoking) { a1 = 0.55; a2 = 1.15; }
      const end = goArmLimb(ctx, sx, sy, a1, a2, 10.5, 8.0, 2.95, 2.4,
        [blkHi, blk, blkLo], [skinHi, skin, skinLo]);
      ctx.strokeStyle = 'rgba(40,20,40,0.55)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(end.jx + 1.2, end.jy + 1.2); ctx.lineTo(end.ex - 1.5, end.ey - 1.5);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,40,180,0.22)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(sx + 2.5, sy);
      ctx.lineTo(end.jx + 1, end.jy);
      ctx.stroke();
      if (opts.smoking) smokeHand = smokeHandTip(end, a2);
    }

    // ——— NECK + HEAD ———
    const nx = bodyCx + 1.5;
    const ny = bodyCy - 14;
    goCapsule(ctx, nx, ny + 4, nx, ny - 2, 3.4, skinHi, skin, skinLo);
    // neck tattoo
    ctx.strokeStyle = 'rgba(40,20,40,0.5)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(nx - 1.5, ny); ctx.lineTo(nx + 1, ny + 3);
    ctx.stroke();

    const hx = bodyCx + 2.5 + lean * 0.12;
    const hy = -62 - bob;
    // far ear
    ctx.fillStyle = skinLo;
    ctx.beginPath();
    ctx.ellipse(hx - 9.5, hy + 1, 2.5, 3.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    goHead(ctx, hx, hy, 9.6, 11.0, skinHi, skin, skinLo);
    // nose cue
    ctx.fillStyle = skinLo;
    ctx.beginPath();
    ctx.moveTo(hx + 5, hy);
    ctx.quadraticCurveTo(hx + 12.5, hy + 2.5, hx + 5.5, hy + 5.5);
    ctx.closePath();
    ctx.fill();
    // mustache
    ctx.fillStyle = '#1a1210';
    ctx.beginPath();
    ctx.ellipse(hx - 1.5, hy + 6.2, 4.6, 2.2, -0.35, 0, Math.PI * 2);
    ctx.ellipse(hx + 6.2, hy + 6.8, 5.5, 2.5, 0.32, 0, Math.PI * 2);
    ctx.fill();
    goAviator(ctx, hx, hy - 0.8);

    // flat / scally cap — brim forward (+x)
    const capY = hy - 8.2;
    const capG = ctx.createLinearGradient(hx - 10, capY - 6, hx + 14, capY + 4);
    capG.addColorStop(0, '#3a2a1c');
    capG.addColorStop(0.4, '#7a6a54');
    capG.addColorStop(1, '#4a3a2a');
    ctx.fillStyle = capG;
    ctx.beginPath();
    ctx.ellipse(hx + 1.2, capY, 11.2, 5.8, 0.06, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hx + 1.2, capY + 1.5, 11, 3.2, 0.06, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#5a4a38';
    ctx.beginPath();
    ctx.ellipse(hx + 10, capY + 2.6, 9.5, 3.1, 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1a10';
    ctx.beginPath();
    ctx.arc(hx + 1.2, capY - 5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,200,100,0.18)';
    ctx.beginPath();
    ctx.ellipse(hx + 1.2, capY - 3.5, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (opts.smoking) {
      const jointLit = !!opts.jointLit;
      const puffing = !!opts.puffing && jointLit;
      const puffProg = opts.puffProg != null ? opts.puffProg : (puffing ? 1 : 0);
      // Pin to real hand tip (GO palm) — no floating offset / no thick finger stroke
      let jx = smokeHand ? (x + f * scale * smokeHand.lx) : (x + f * 18 * scale);
      let jy = smokeHand ? (y + scale * smokeHand.ly) : (y - (seated ? 28 : 34) * scale);
      let jang = f > 0 ? -0.85 : Math.PI + 0.85;
      if (puffing) {
        const rise = 0.55 + puffProg * 0.45;
        const hx0 = smokeHand ? (x + f * scale * smokeHand.lx) : (x + f * 18 * scale);
        const hy0 = smokeHand ? (y + scale * smokeHand.ly) : (y - 34 * scale);
        const mx = x + f * 10 * scale;
        const my = y - 58 * scale;
        jx = hx0 + (mx - hx0) * rise;
        jy = hy0 + (my - hy0) * rise;
        jang = f > 0 ? (-0.85 + 0.35 * rise) : (Math.PI + 0.85 - 0.35 * rise);
      }
      drawJoint(ctx, jx, jy, jang, { lit: jointLit, len: 11, lineW: 2 });
      if (puffing) {
        const mouthX = x + f * 10 * scale;
        const mouthY = y - 58 * scale;
        const mul = 1.6 + puffProg * 1.0;
        drawSmokePuffs(ctx, mouthX + f * 10, mouthY, t, mul);
        drawSmokePuffs(ctx, mouthX + f * 4, mouthY - 12, t + 280, 1.2 + puffProg * 0.6);
      }
    }

    if (!opts.noLabel) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 10px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Zakk', x, y + 14);
      ctx.textAlign = 'left';
    }

    function zakkAlienPatch(ctx, px, py, s) {
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(s, s);
      ctx.fillStyle = '#1a3a28';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(0, 0, 7, 7, 1.5);
      else ctx.rect(0, 0, 7, 7);
      ctx.fill();
      ctx.strokeStyle = '#c4a35a';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = '#4dff6a';
      ctx.beginPath();
      ctx.arc(3.5, 3.5, 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0a2010';
      ctx.beginPath();
      ctx.ellipse(2.6, 3.2, 0.7, 1.1, 0, 0, Math.PI * 2);
      ctx.ellipse(4.4, 3.2, 0.7, 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Tayler — GO soft avatar: backwards maroon/purple cap, aviators,
   * yellow/teal/white plaid, jeans, brown boots.
   */
  function drawTayler(ctx, x, y, facing, moving, t, opts) {
    opts = opts || {};
    const scale = opts.scale != null ? opts.scale : CHAR_SCALE;
    const seated = !!opts.seated;
    const f = facing >= 0 ? 1 : -1;
    const pose = goWalkPose(moving, seated, t);
    const skinHi = '#ecc8ac', skin = '#d8b090', skinLo = '#b88868';
    const denHi = '#4a6288', den = '#2a3a5a', denLo = '#1a2838';
    const plaidBase = '#3a5a78';

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(f * scale, scale);

    if (!opts.noShadow) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(2 + pose.sway * 0.15, 0, seated ? 13 : 14.5, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const bob = pose.bob;
    const lean = pose.lean;
    const sway = pose.sway;
    const hipY = -26 - bob;
    const hipX = lean * 0.35 + sway * 0.15;
    const bodyCy = -40 - bob;
    const bodyCx = lean * 0.55 + sway * 0.08;
    const ground = 0;

    // FAR LEG
    {
      const hx = hipX - 3.5;
      const hy = hipY;
      let ang1 = pose.fThigh, ang2 = pose.fThigh - pose.fKnee;
      if (seated) { ang1 = 1.05; ang2 = 1.55; }
      const end = goJointLimb(ctx, hx, hy, ang1, ang2, 13, 12, 4.2, 3.6,
        [den, denLo, '#121c28'], [den, denLo, '#0e1620']);
      goBoot(ctx, end.ex, Math.min(end.ey, ground), end.ex + 6,
        ['#6a3a20', '#5a2e18', '#3a1a10'], '#2a1808');
    }

    // FAR ARM
    if (!seated) {
      const sx = bodyCx - 9;
      const sy = bodyCy - 10;
      const a1 = 0.15 + pose.fArm;
      const a2 = a1 + pose.fElbow;
      // plaid sleeve covers upper arm; shorter skin forearm + hand
      goArmLimb(ctx, sx, sy, a1, a2, 11, 8.0, 2.85, 2.35,
        ['#4a6a88', plaidBase, '#2a4058'], [skinHi, skin, skinLo]);
    }

    // TORSO plaid soft body
    {
      const tw = 20, th = 24, rad = 9;
      const tx = bodyCx - tw / 2, ty = bodyCy - th / 2;
      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(tx, ty, tw, th, rad);
      else {
        ctx.moveTo(tx + rad, ty);
        ctx.arcTo(tx + tw, ty, tx + tw, ty + th, rad);
        ctx.arcTo(tx + tw, ty + th, tx, ty + th, rad);
        ctx.arcTo(tx, ty + th, tx, ty, rad);
        ctx.arcTo(tx, ty, tx + tw, ty, rad);
        ctx.closePath();
      }
      ctx.clip();
      ctx.fillStyle = plaidBase;
      ctx.fillRect(tx, ty, tw, th);
      ctx.strokeStyle = 'rgba(230,200,60,0.78)';
      ctx.lineWidth = 1.15;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(tx, ty + 3 + i * 5);
        ctx.lineTo(tx + tw, ty + 3 + i * 5);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(230,240,255,0.55)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(tx + 2 + i * 5, ty);
        ctx.lineTo(tx + 2 + i * 5, ty + th);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(40,180,160,0.35)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(tx + 4 + i * 10, ty);
        ctx.lineTo(tx + 4 + i * 10, ty + th);
        ctx.stroke();
      }
      const shade = ctx.createLinearGradient(tx, ty, tx + tw, ty + th);
      shade.addColorStop(0, 'rgba(0,0,0,0.28)');
      shade.addColorStop(0.4, 'rgba(0,0,0,0)');
      shade.addColorStop(1, 'rgba(255,255,255,0.1)');
      ctx.fillStyle = shade;
      ctx.fillRect(tx, ty, tw, th);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.beginPath();
      ctx.ellipse(bodyCx - 3, bodyCy - 6, 5, 3, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // open collar skin V
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.moveTo(bodyCx - 2.5, bodyCy - 12);
      ctx.lineTo(bodyCx + 0.5, bodyCy - 5);
      ctx.lineTo(bodyCx + 3.5, bodyCy - 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,40,180,0.28)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(bodyCx + 9, bodyCy - 8);
      ctx.quadraticCurveTo(bodyCx + 10.5, bodyCy, bodyCx + 9, bodyCy + 9);
      ctx.stroke();
    }

    goTorso(ctx, hipX, hipY - 2, 16, 10, 5, denHi, den, denLo);

    // NEAR LEG
    {
      const hx = hipX + 3.2;
      const hy = hipY;
      let ang1 = pose.nThigh, ang2 = pose.nThigh - pose.nKnee;
      if (seated) { ang1 = 1.2; ang2 = 1.65; }
      const end = goJointLimb(ctx, hx, hy, ang1, ang2, 13.5, 12.5, 4.5, 3.8,
        [denHi, den, denLo], [den, denLo, '#121c28']);
      goBoot(ctx, end.ex, Math.min(end.ey, ground), end.ex + 6,
        ['#9a6040', '#6a3a20', '#3a1a10'], '#2a1808');
    }

    // NEAR ARM
    let smokeHand = null;
    {
      const sx = bodyCx + 9;
      const sy = bodyCy - 10;
      let a1 = 0.1 + pose.nArm;
      let a2 = a1 + pose.nElbow;
      if (seated) { a1 = 0.4; a2 = 0.95; }
      if (opts.smoking) { a1 = 0.55; a2 = 1.15; }
      const end = goArmLimb(ctx, sx, sy, a1, a2, 10.5, 8.0, 2.95, 2.4,
        ['#4a6a88', plaidBase, '#2a4058'], [skinHi, skin, skinLo]);
      if (opts.smoking) smokeHand = smokeHandTip(end, a2);
    }

    // neck + head
    const nx = bodyCx + 1.5;
    const ny = bodyCy - 14;
    goCapsule(ctx, nx, ny + 4, nx, ny - 2, 3.4, skinHi, skin, skinLo);

    const hx = bodyCx + 2.2 + lean * 0.12;
    const hy = -62 - bob;
    ctx.fillStyle = skinLo;
    ctx.beginPath();
    ctx.ellipse(hx - 9.5, hy + 1, 2.5, 3.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    goHead(ctx, hx, hy, 9.6, 11.0, skinHi, skin, skinLo);
    ctx.fillStyle = skinLo;
    ctx.beginPath();
    ctx.moveTo(hx + 5, hy);
    ctx.quadraticCurveTo(hx + 12.2, hy + 2.4, hx + 5.5, hy + 5.2);
    ctx.closePath();
    ctx.fill();
    // light stubble
    ctx.fillStyle = 'rgba(60,40,30,0.38)';
    ctx.beginPath();
    ctx.ellipse(hx + 1.2, hy + 6.8, 7.2, 4.5, 0.08, 0, Math.PI);
    ctx.fill();
    goAviator(ctx, hx, hy - 0.8);

    // BACKWARDS maroon/purple cap — brim to −x
    const capY = hy - 8.2;
    const capG = ctx.createLinearGradient(hx - 14, capY - 5, hx + 10, capY + 4);
    capG.addColorStop(0, '#4a1028');
    capG.addColorStop(0.45, '#7a2848');
    capG.addColorStop(1, '#3a0c1c');
    ctx.fillStyle = capG;
    ctx.beginPath();
    ctx.ellipse(hx, capY, 11.5, 5.6, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#5a1830';
    ctx.beginPath();
    ctx.ellipse(hx, capY + 1.8, 11.5, 3.5, 0, 0, Math.PI);
    ctx.fill();
    const brimG = ctx.createLinearGradient(hx - 20, capY, hx - 4, capY + 6);
    brimG.addColorStop(0, '#8a3050');
    brimG.addColorStop(1, '#4a1028');
    ctx.fillStyle = brimG;
    ctx.beginPath();
    ctx.ellipse(hx - 11.5, capY + 2.6, 10.5, 3.4, -0.22, 0, Math.PI * 2);
    ctx.fill();
    // forehead strap + buckle
    ctx.strokeStyle = '#9a4860';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx + 3, capY + 2);
    ctx.lineTo(hx + 10.5, capY + 2.2);
    ctx.stroke();
    ctx.fillStyle = '#c4a35a';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(hx + 8.5, capY + 0.9, 3.4, 2.6, 0.6);
    else ctx.fillRect(hx + 8.5, capY + 0.9, 3.4, 2.6);
    ctx.fill();
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(hx + 5, capY + 1.6, 3.6, 2.2, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,180,90,0.16)';
    ctx.beginPath();
    ctx.ellipse(hx, capY - 3, 5.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (opts.smoking) {
      const jointLit = !!opts.jointLit;
      const puffing = !!opts.puffing && jointLit;
      // Pin to real hand tip — no giant finger stroke
      const jx = smokeHand ? (x + f * scale * smokeHand.lx) : (x + f * 18 * scale);
      const jy = smokeHand ? (y + scale * smokeHand.ly) : (y - (seated ? 28 : 34) * scale);
      drawJoint(ctx, jx, jy, f > 0 ? -0.85 : Math.PI + 0.85, { lit: jointLit, len: 11, lineW: 2 });
      if (puffing) {
        drawSmokePuffs(ctx, jx + f * 6, jy - 8, t, 1.2);
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
    drawTayler(ctx, sx, sy, 1, false, t, { smoking: true, jointLit: true });
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


  /** Boombox / stereo deck — chrome/plastic materials, neon rim, contact shadow */
  function drawStereo(ctx, x, y, opts) {
    opts = opts || {};
    const playing = !!opts.playing;
    const glow = !!opts.glow;
    // contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(x + 30, y + 2, 34, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // wood crate stand
    const crate = ctx.createLinearGradient(x - 6, y - 18, x + 66, y);
    crate.addColorStop(0, '#3a2818');
    crate.addColorStop(0.35, '#7a5a38');
    crate.addColorStop(0.7, '#5a4030');
    crate.addColorStop(1, '#2a1a10');
    ctx.fillStyle = crate;
    ctx.fillRect(x - 6, y - 18, 72, 18);
    ctx.strokeStyle = 'rgba(40,24,10,0.45)';
    ctx.lineWidth = 0.8;
    for (let gy = y - 16; gy < y; gy += 4) {
      ctx.beginPath();
      ctx.moveTo(x - 4, gy);
      ctx.lineTo(x + 64, gy + Math.sin(gy) * 0.6);
      ctx.stroke();
    }
    // main boombox body — gunmetal plastic
    const body = ctx.createLinearGradient(x, y - 58, x + 60, y - 16);
    body.addColorStop(0, '#3a3a48');
    body.addColorStop(0.25, '#1a1a24');
    body.addColorStop(0.6, '#0e0e16');
    body.addColorStop(1, '#2a2a36');
    ctx.fillStyle = body;
    ctx.fillRect(x, y - 58, 60, 42);
    // neon rim
    ctx.strokeStyle = 'rgba(60,220,255,0.45)';
    ctx.lineWidth = 1.3;
    ctx.strokeRect(x + 0.5, y - 57.5, 59, 41);
    ctx.strokeStyle = 'rgba(255,40,180,0.28)';
    ctx.strokeRect(x + 2, y - 56, 56, 38);
    // specular edge
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + 2, y - 56, 2.5, 38);
    // speakers with chrome rings
    function speaker(sx, sy) {
      const sg = ctx.createRadialGradient(sx - 2, sy - 2, 1, sx, sy, 11);
      sg.addColorStop(0, '#3a3a44');
      sg.addColorStop(0.5, '#121218');
      sg.addColorStop(1, '#050508');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(sx, sy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8a8a98';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(sx, sy, 7.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(60,220,255,0.35)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    speaker(x + 14, y - 36);
    speaker(x + 46, y - 36);
    // cassette slot
    ctx.fillStyle = '#050508';
    ctx.fillRect(x + 22, y - 48, 16, 10);
    ctx.strokeStyle = playing ? '#7dff3a' : '#666';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 22, y - 48, 16, 10);
    if (playing) {
      drawCassetteProp(ctx, x + 30, y - 43, { scale: 0.35 });
    }
    // metal knobs
    for (let i = 0; i < 3; i++) {
      const kx = x + 26 + i * 8;
      const ky = y - 28;
      const kg = ctx.createRadialGradient(kx - 1, ky - 1, 0.4, kx, ky, 3);
      kg.addColorStop(0, '#ddd');
      kg.addColorStop(0.5, '#888');
      kg.addColorStop(1, '#333');
      ctx.fillStyle = kg;
      ctx.beginPath();
      ctx.arc(kx, ky, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = playing ? '#7dff3a' : '#334433';
    ctx.beginPath();
    ctx.arc(x + 52, y - 52, 3, 0, Math.PI * 2);
    ctx.fill();
    if (playing) {
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
    // Beer fridge — chrome body, specular edge, neon stickers
    const body = ctx.createLinearGradient(x, y, x + 44, y);
    body.addColorStop(0, '#3a3a48');
    body.addColorStop(0.18, '#c8c8d8');
    body.addColorStop(0.45, '#9a9aac');
    body.addColorStop(0.72, '#6a6a7a');
    body.addColorStop(1, '#2a2a38');
    ctx.fillStyle = body;
    ctx.fillRect(x, y, 44, 95);
    // magenta/cyan rim
    ctx.strokeStyle = 'rgba(255,40,180,0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.5, y + 0.5, 43, 94);
    ctx.strokeStyle = 'rgba(60,220,255,0.35)';
    ctx.strokeRect(x + 2, y + 2, 40, 91);
    // doors with inset depth
    const doorG = ctx.createLinearGradient(x + 3, y, x + 41, y);
    doorG.addColorStop(0, '#5a5a6a');
    doorG.addColorStop(0.4, '#8a8a9a');
    doorG.addColorStop(1, '#4a4a58');
    ctx.fillStyle = doorG;
    ctx.fillRect(x + 3, y + 6, 38, 38);
    ctx.fillRect(x + 3, y + 50, 38, 38);
    // door seam shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x + 3, y + 44, 38, 6);
    // specular stripe
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(x + 6, y + 8, 3, 82);
    // handles
    const hg = ctx.createLinearGradient(x + 35, y, x + 40, y);
    hg.addColorStop(0, '#eee');
    hg.addColorStop(1, '#888');
    ctx.fillStyle = hg;
    ctx.fillRect(x + 36, y + 20, 4, 16);
    ctx.fillRect(x + 36, y + 64, 4, 16);
    // neon stickers
    ctx.fillStyle = 'rgba(125,255,58,0.9)';
    ctx.font = 'bold 8px Segoe UI, sans-serif';
    ctx.fillText('BEER', x + 8, y + 28);
    ctx.fillStyle = 'rgba(255,60,160,0.95)';
    ctx.fillText('MOON', x + 8, y + 68);
    // floor contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 95, 20, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawAmp(ctx, x, y) {
    // combo amp — depth, grill specular, neon edge, cables
    const cab = ctx.createLinearGradient(x, y - 50, x + 56, y);
    cab.addColorStop(0, '#2a2a32');
    cab.addColorStop(0.35, '#141418');
    cab.addColorStop(0.7, '#0a0a0e');
    cab.addColorStop(1, '#1a1a22');
    ctx.fillStyle = cab;
    ctx.fillRect(x, y - 50, 56, 50);
    // cyan/magenta rim
    ctx.strokeStyle = 'rgba(60,220,255,0.5)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(x + 0.5, y - 49.5, 55, 49);
    ctx.strokeStyle = 'rgba(255,40,180,0.28)';
    ctx.strokeRect(x + 2, y - 48, 52, 46);
    // speaker grill recess
    const grill = ctx.createLinearGradient(x + 4, y - 46, x + 52, y - 18);
    grill.addColorStop(0, '#3a3a44');
    grill.addColorStop(0.5, '#1a1a22');
    grill.addColorStop(1, '#0e0e14');
    ctx.fillStyle = grill;
    ctx.fillRect(x + 4, y - 46, 48, 28);
    // grill cloth weave
    ctx.strokeStyle = 'rgba(80,80,90,0.55)';
    ctx.lineWidth = 0.7;
    for (let gy = y - 44; gy < y - 20; gy += 3) {
      ctx.beginPath();
      ctx.moveTo(x + 6, gy);
      ctx.lineTo(x + 50, gy);
      ctx.stroke();
    }
    for (let gx = x + 6; gx < x + 50; gx += 4) {
      ctx.beginPath();
      ctx.moveTo(gx, y - 44);
      ctx.lineTo(gx, y - 20);
      ctx.stroke();
    }
    // warm pilot glow bar
    const bar = ctx.createLinearGradient(x + 8, y - 40, x + 48, y - 32);
    bar.addColorStop(0, 'rgba(255,80,40,0.15)');
    bar.addColorStop(0.5, 'rgba(255,160,60,0.85)');
    bar.addColorStop(1, 'rgba(255,60,180,0.35)');
    ctx.fillStyle = bar;
    ctx.fillRect(x + 8, y - 40, 40, 8);
    ctx.fillStyle = 'rgba(255,200,120,0.45)';
    ctx.fillRect(x + 10, y - 39, 8, 2);
    // knobs with specular
    for (let i = 0; i < 4; i++) {
      const kx = x + 12 + i * 10;
      const ky = y - 22;
      const kg = ctx.createRadialGradient(kx - 1, ky - 1, 0.5, kx, ky, 4);
      kg.addColorStop(0, '#aaa');
      kg.addColorStop(0.5, '#555');
      kg.addColorStop(1, '#222');
      ctx.fillStyle = kg;
      ctx.beginPath();
      ctx.arc(kx, ky, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,220,255,0.4)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    // corner feet
    ctx.fillStyle = '#333';
    ctx.fillRect(x + 2, y - 4, 6, 4);
    ctx.fillRect(x + 48, y - 4, 6, 4);
    // cables
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x + 56, y - 10);
    ctx.quadraticCurveTo(x + 80, y - 30, x + 70, y);
    ctx.stroke();
    ctx.strokeStyle = '#2a2a30';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x + 50, y);
    ctx.quadraticCurveTo(x + 90, y + 10, x + 100, y - 5);
    ctx.stroke();
    // floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(x + 28, y + 2, 26, 5, 0, 0, Math.PI * 2);
    ctx.fill();
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

  /** Loaded neon trading-card band posters (refs/band → assets/posters). */
  const BAND_POSTER_IMGS = [1, 2, 3, 4].map(function (n) {
    const img = new Image();
    img._ready = false;
    img._failed = false;
    img.onload = function () { img._ready = !!(img.naturalWidth && img.naturalHeight); };
    img.onerror = function () { img._failed = true; img._ready = false; };
    img.src = 'assets/posters/band-' + n + '.jpeg?v=18';
    return img;
  });

  /**
   * Shed-wall band card / gig flyer — draws photo trading-card refs when ready.
   * opts: { w, h, poster (0..3), label } — procedural neon fallback if images fail.
   */
  function drawBandFlyer(ctx, x, y, opts) {
    opts = opts || {};
    const w = opts.w || 78;
    const h = opts.h || 104;
    const idx = ((opts.poster != null ? opts.poster : 0) % BAND_POSTER_IMGS.length + BAND_POSTER_IMGS.length) % BAND_POSTER_IMGS.length;
    const img = BAND_POSTER_IMGS[idx];
    if (img && img._ready && !img._failed) {
      ctx.save();
      // Soft neon glow + chrome card frame (trading-card aesthetic)
      const accent = opts.accent || '#ff60c0';
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.22;
      ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
      ctx.globalAlpha = 1;
      // Chrome outer bevel
      const frameG = ctx.createLinearGradient(x - 3, y - 3, x + w + 3, y + h + 3);
      frameG.addColorStop(0, '#e8e8f0');
      frameG.addColorStop(0.35, '#888898');
      frameG.addColorStop(0.65, '#f0f0f8');
      frameG.addColorStop(1, '#505060');
      ctx.fillStyle = frameG;
      ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
      ctx.fillStyle = '#0a0812';
      ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
      ctx.drawImage(img, x, y, w, h);
      // Neon inner edge
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = '#40e0ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
      ctx.globalAlpha = 1;
      if (opts.label) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(x + 4, y + h - 14, w - 8, 10);
        ctx.fillStyle = '#ffe8ff';
        ctx.font = 'bold 7px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(opts.label, x + w * 0.5, y + h - 6);
        ctx.textAlign = 'left';
      }
      ctx.restore();
      return;
    }
    // Procedural fallback (cartoon) while images load / if missing
    const skin = opts.skin || '#c89070';
    const hair = opts.hair || '#2a1a10';
    const jacket = opts.jacket || '#2a4060';
    const accent = opts.accent || '#ff40c0';
    const shade = opts.shade || '#1a1030';
    ctx.save();
    const bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, shade);
    bg.addColorStop(0.45, '#2a1848');
    bg.addColorStop(1, '#0a1828');
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(x + w * 0.78, y + h * 0.22, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = jacket;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + h - 6);
    ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.52, x + w - 8, y + h - 6);
    ctx.lineTo(x + w - 4, y + h);
    ctx.lineTo(x + 4, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.38, 11, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.3, 12, 9, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.restore();
  }

  /** Primary Retrofit wall art — real gig / postcard / tracks photos. */
  const RETROFIT_POSTER_SRCS = [
    'assets/posters/retrofit-live.png?v=18',
    'assets/posters/retrofit-greetings.jpg?v=18',
    'assets/posters/retrofit-tracks.jpg?v=18',
  ];
  const RETROFIT_POSTER_IMGS = RETROFIT_POSTER_SRCS.map(function (src) {
    const img = new Image();
    img._ready = false;
    img._failed = false;
    img.onload = function () { img._ready = !!(img.naturalWidth && img.naturalHeight); };
    img.onerror = function () { img._failed = true; img._ready = false; };
    img.src = src;
    return img;
  });

  /**
   * Photoreal shed poster — wood + neon frame around a Retrofit photo.
   * opts: { w, h, which (0..2), accent, wood, label }
   */
  function drawPhotoPoster(ctx, x, y, opts) {
    opts = opts || {};
    const w = opts.w || 110;
    const h = opts.h || 148;
    const which = ((opts.which != null ? opts.which : 0) % RETROFIT_POSTER_IMGS.length + RETROFIT_POSTER_IMGS.length) % RETROFIT_POSTER_IMGS.length;
    const img = RETROFIT_POSTER_IMGS[which];
    const accent = opts.accent || '#ff60c0';
    const wood = !!opts.wood;
    ctx.save();
    // Soft contact shadow on wall
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x + 3, y + 4, w + 4, h + 4);
    // Outer neon halo
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.18;
    ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
    ctx.globalAlpha = 1;
    if (wood) {
      const frameG = ctx.createLinearGradient(x - 5, y - 5, x + w + 5, y + h + 5);
      frameG.addColorStop(0, '#8a6840');
      frameG.addColorStop(0.3, '#c4a060');
      frameG.addColorStop(0.55, '#6a4a28');
      frameG.addColorStop(0.8, '#a08050');
      frameG.addColorStop(1, '#4a3020');
      ctx.fillStyle = frameG;
      ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
      // wood grain ticks
      ctx.strokeStyle = 'rgba(40,24,10,0.35)';
      ctx.lineWidth = 0.8;
      for (let gy = y - 3; gy < y + h + 5; gy += 7) {
        ctx.beginPath();
        ctx.moveTo(x - 4, gy);
        ctx.lineTo(x + w + 4, gy + Math.sin(gy * 0.2) * 1.2);
        ctx.stroke();
      }
    } else {
      const chrome = ctx.createLinearGradient(x - 4, y - 4, x + w + 4, y + h + 4);
      chrome.addColorStop(0, '#f0f0f8');
      chrome.addColorStop(0.35, '#888898');
      chrome.addColorStop(0.65, '#e8e8f0');
      chrome.addColorStop(1, '#404050');
      ctx.fillStyle = chrome;
      ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
    }
    ctx.fillStyle = '#0a0810';
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    if (img && img._ready && !img._failed) {
      // cover-fit
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const sx = (dw - w) * 0.5;
      const sy = (dh - h) * 0.35;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.drawImage(img, x - sx, y - sy, dw, dh);
      // subtle vignette
      const vig = ctx.createRadialGradient(x + w * 0.5, y + h * 0.45, w * 0.2, x + w * 0.5, y + h * 0.5, w * 0.75);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(10,4,20,0.35)');
      ctx.fillStyle = vig;
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    } else {
      // fallback neon card while loading
      const bg = ctx.createLinearGradient(x, y, x + w, y + h);
      bg.addColorStop(0, '#2a1040');
      bg.addColorStop(1, '#0a1828');
      ctx.fillStyle = bg;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = accent;
      ctx.font = 'bold 10px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RETROFIT', x + w * 0.5, y + h * 0.5);
      ctx.textAlign = 'left';
    }
    // Neon inner rim
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#40e0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
    ctx.globalAlpha = 1;
    if (opts.label) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(x + 4, y + h - 16, w - 8, 12);
      ctx.fillStyle = '#ffe8ff';
      ctx.font = 'bold 8px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.label, x + w * 0.5, y + h - 7);
      ctx.textAlign = 'left';
    }
    ctx.restore();
  }

  function drawTools(ctx, x, y) {
    // metal tool shafts with wood handles (less flat)
    const shaft = ctx.createLinearGradient(x, y - 70, x + 6, y);
    shaft.addColorStop(0, '#c8c8d0');
    shaft.addColorStop(0.4, '#888898');
    shaft.addColorStop(1, '#404048');
    ctx.strokeStyle = shaft;
    ctx.lineWidth = 3.2;
    // rake
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 4, y - 70);
    ctx.stroke();
    ctx.strokeStyle = '#6a5030';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 2, y - 28);
    ctx.lineTo(x + 3, y - 8);
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

  function drawChillTable(ctx, x, y, t, opts) {
    opts = opts || {};
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
    drawJoint(ctx, x + 10, y - 40, -0.2, { lit: false });
    // Mute ashtray plumes during unlit roll/sesh so they don't read as joint smoke
    if (opts.ambientSmoke !== false) {
      drawSmokePuffs(ctx, x + 42, y - 44, t, 2.1);
    }
  }

  /** Photo cutout of a real ’67 El Camino (assets/elcamino-side.png). */
  const ELCAMINO_IMG = (function () {
    const img = new Image();
    img._ready = false;
    img._failed = false;
    img.onload = function () { img._ready = !!(img.naturalWidth && img.naturalHeight); };
    img.onerror = function () { img._failed = true; img._ready = false; };
    img.src = 'assets/elcamino-side.png?v=18';
    return img;
  })();

  /**
   * 1967 Chevy El Camino — side view (ute: long hood ≈ open bed, short cab,
   * C-pillar flowing into bed rails). Prefers photo cutout; procedural fallback.
   * Local space is nose-left; facingRight flips. Ground at y≈0, car center x=0.
   * opts: dusty, scale, facingRight, wheelRot, drawDriver(ctx), noLabel
   */
  function drawElCamino(ctx, x, y, t, opts) {
    opts = opts || {};
    const dusty = !!opts.dusty;
    const facingRight = !!opts.facingRight;
    const wheelRot = opts.wheelRot != null ? opts.wheelRot : 0;
    ctx.save();
    ctx.translate(x, y);
    const s = opts.scale != null ? opts.scale : 1;
    ctx.scale(s, s);
    if (facingRight) ctx.scale(-1, 1);

    const img = ELCAMINO_IMG;
    if (img && img._ready && !img._failed) {
            // Life-sized vs STANDING_HEIGHT: roof ~82% of person (window/door height).
      // Width stays locked to CAMINO_HALF_W so collision matches the sprite.
      const drawW = CAMINO_HALF_W * 2;
      const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
      const lifeH = Math.round(STANDING_HEIGHT * 0.82);
      // Prefer height-based life size; if aspect would disagree with HALF_W, keep HALF_W width
      // (collision truth) and accept slight height variance from photo aspect.
      const drawH = drawW / aspect;
      // Soft assert life-size: drawH should land near lifeH for our BRIA cutout aspect~3.2
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.beginPath();
      ctx.ellipse(0, 5, drawW * 0.46, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // Image bottom ≈ tire contact; nudge so rocker sits above ground
      const yOff = 6;
      ctx.drawImage(img, -drawW / 2, -drawH + yOff, drawW, drawH);

      // Driver head-in-window (clip to cabin glass region matching CAMINO_WIN)
      const w = CAMINO_WIN;
      if (typeof opts.drawDriver === 'function') {
        ctx.save();
        ctx.beginPath();
        ctx.rect(w.x, w.y, w.w, w.h);
        ctx.clip();
        opts.drawDriver(ctx);
        ctx.restore();
        // Light glass wash so photo still reads as glass over driver
        ctx.fillStyle = dusty ? 'rgba(140,170,190,0.18)' : 'rgba(170,205,230,0.16)';
        ctx.fillRect(w.x, w.y, w.w, w.h);
      }

      // Soft rotating spoke hint over photo wheels (keeps motion readable)
      if (wheelRot) {
        const wfX = -drawW * 0.26;
        const wrX = drawW * 0.27;
        const cy = -drawH * 0.18 + yOff;
        const r = drawH * 0.22;
        function spokeHint(wx) {
          ctx.save();
          ctx.translate(wx, cy);
          ctx.rotate(wheelRot);
          ctx.strokeStyle = dusty ? 'rgba(220,220,230,0.35)' : 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 1.2;
          for (let a = 0; a < 6; a++) {
            const ang = a * (Math.PI / 3);
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * 3, Math.sin(ang) * 3);
            ctx.lineTo(Math.cos(ang) * r * 0.55, Math.sin(ang) * r * 0.55);
            ctx.stroke();
          }
          ctx.restore();
        }
        spokeHint(wfX);
        spokeHint(wrX);
      }

      if (dusty) {
        ctx.fillStyle = 'rgba(160,140,100,0.1)';
        ctx.fillRect(-drawW / 2, -drawH + yOff, drawW, drawH * 0.7);
      }

      if (!opts.noLabel) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = 'bold 11px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("'67 EL CAMINO", 0, 28);
        ctx.textAlign = 'left';
      }
      ctx.restore();
      return;
    }

    // —— Procedural fallback: long hood ≈ bed, short cab, flying-buttress C-pillar ——
    const goldHi = dusty ? '#d8b86e' : '#f4d894';
    const goldMid = dusty ? '#c49a4a' : '#dcb050';
    const goldLo = dusty ? '#8e6c32' : '#b07e28';
    const goldDeep = dusty ? '#5c4622' : '#704e1a';
    const vinyl = dusty ? '#1a1a1c' : '#0e0e10';

    function paint(x0, y0, x1, y1) {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, goldDeep);
      g.addColorStop(0.28, goldLo);
      g.addColorStop(0.5, goldHi);
      g.addColorStop(0.72, goldMid);
      g.addColorStop(1, goldDeep);
      return g;
    }
    function chrome(x0, y0, x1, y1) {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, dusty ? '#5a5a62' : '#6e6e78');
      g.addColorStop(0.28, dusty ? '#c8c8d0' : '#ececf4');
      g.addColorStop(0.5, '#ffffff');
      g.addColorStop(0.72, dusty ? '#a8a8b0' : '#d0d0d8');
      g.addColorStop(1, dusty ? '#404048' : '#505058');
      return g;
    }

    // Proportions: hood ≈ bed (~38% each), short cab (~24%)
    const wfX = -118;
    const wrX = 122;
    const wR = 26;
    const archR = 32;
    const wheelCy = -24;

    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 210, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    function bodyOutline() {
      ctx.beginPath();
      // Tail / bed rear
      ctx.moveTo(222, -14);
      ctx.lineTo(222, -32);
      ctx.lineTo(214, -36);
      ctx.lineTo(208, -56);
      ctx.lineTo(42, -58);                       // long bed rail
      ctx.quadraticCurveTo(22, -58, -2, -100);   // C-pillar → roof (flying buttress)
      ctx.lineTo(-52, -100);                     // short roof
      ctx.lineTo(-78, -58);                      // raked windshield
      ctx.lineTo(-200, -56);                     // long hood ≈ bed
      ctx.lineTo(-214, -44);
      ctx.lineTo(-222, -28);
      ctx.lineTo(-216, -14);
      ctx.lineTo(wfX - archR - 4, wheelCy);
      ctx.lineTo(wfX - archR, wheelCy);
      ctx.arc(wfX, wheelCy, archR, Math.PI, 0, true);
      ctx.lineTo(wrX - archR, wheelCy);
      ctx.arc(wrX, wheelCy, archR, Math.PI, 0, true);
      ctx.lineTo(222, wheelCy);
      ctx.closePath();
    }

    ctx.fillStyle = paint(-224, -100, 224, -10);
    bodyOutline();
    ctx.fill();

    // Open bed look-down
    ctx.fillStyle = dusty ? '#24180c' : '#120c08';
    ctx.beginPath();
    ctx.moveTo(40, -54);
    ctx.lineTo(200, -52);
    ctx.lineTo(194, -40);
    ctx.lineTo(46, -44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = goldMid;
    ctx.fillRect(40, -58, 162, 6);
    ctx.fillStyle = chrome(40, -62, 210, -54);
    ctx.fillRect(40, -60, 164, 3.5);

    // Cab glass + driver
    const w = CAMINO_WIN;
    if (typeof opts.drawDriver === 'function') {
      ctx.save();
      ctx.beginPath();
      ctx.rect(w.x, w.y, w.w, w.h);
      ctx.clip();
      opts.drawDriver(ctx);
      ctx.restore();
    }
    ctx.fillStyle = dusty ? 'rgba(140,170,190,0.38)' : 'rgba(170,205,230,0.36)';
    ctx.beginPath();
    ctx.moveTo(-74, -58);
    ctx.lineTo(-56, -98);
    ctx.lineTo(-6, -98);
    ctx.lineTo(8, -58);
    ctx.closePath();
    ctx.fill();

    // Vinyl roof (cab only)
    ctx.fillStyle = vinyl;
    ctx.beginPath();
    ctx.moveTo(-52, -100);
    ctx.lineTo(-2, -100);
    ctx.lineTo(-6, -92);
    ctx.lineTo(-48, -92);
    ctx.closePath();
    ctx.fill();

    // Chrome bumper + stacked lamps
    ctx.fillStyle = chrome(-224, -34, -190, -12);
    ctx.fillRect(-222, -32, 30, 18);
    ctx.fillStyle = dusty ? '#d8d8e0' : '#f0f0f6';
    ctx.beginPath();
    ctx.arc(-210, -52, 7, 0, Math.PI * 2);
    ctx.arc(-210, -34, 7, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    function wheel(wx) {
      const cy = wheelCy;
      ctx.fillStyle = '#0a0a0c';
      ctx.beginPath();
      ctx.arc(wx, cy, wR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = dusty ? '#8a2020' : '#d02828';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(wx, cy, wR - 3.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.save();
      ctx.translate(wx, cy);
      ctx.rotate(wheelRot);
      ctx.strokeStyle = dusty ? '#c8c8d0' : '#f2f2f8';
      ctx.lineWidth = 1.4;
      for (let a = 0; a < 12; a++) {
        const ang = a * (Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 3, Math.sin(ang) * 3);
        ctx.lineTo(Math.cos(ang) * 13, Math.sin(ang) * 13);
        ctx.stroke();
      }
      ctx.fillStyle = '#d8d8e0';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    wheel(wfX);
    wheel(wrX);

    if (!opts.noLabel) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("'67 EL CAMINO", 0, 28);
      ctx.textAlign = 'left';
    }
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

  // ——— Band gear (shed props) ———
  /** Cherry SG with painted blue eye, yellow crescent, psychedelic swirls (ref exact). */
  function drawElectricGuitar(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // stand
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 0); ctx.lineTo(0, -18); ctx.lineTo(10, 0);
    ctx.moveTo(0, -18); ctx.lineTo(0, -36);
    ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(0, -38, 4, 0, Math.PI * 2);
    ctx.fill();

    // Cherry SG body — double cutaway
    const bodyG = ctx.createLinearGradient(-16, -78, 16, -36);
    bodyG.addColorStop(0, '#4a0808');
    bodyG.addColorStop(0.35, '#b01820');
    bodyG.addColorStop(0.65, '#e03028');
    bodyG.addColorStop(1, '#6a1010');
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    // lower bout
    ctx.ellipse(0, -48, 15, 18, 0.08, 0, Math.PI * 2);
    ctx.fill();
    // upper bout / horns
    ctx.beginPath();
    ctx.ellipse(-8, -66, 8, 10, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(9, -64, 7, 9, 0.4, 0, Math.PI * 2);
    ctx.fill();
    // waist cutaway notches
    ctx.fillStyle = '#1a0808';
    ctx.beginPath();
    ctx.ellipse(-14, -58, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(14, -56, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Yellow crescent moon on upper horn
    ctx.fillStyle = '#ffe040';
    ctx.beginPath();
    ctx.arc(-9, -68, 4.5, 0.2, Math.PI * 1.6);
    ctx.arc(-7.5, -68, 3.2, Math.PI * 1.55, 0.35, true);
    ctx.fill();

    // Psychedelic swirls around lower bout
    ctx.strokeStyle = '#2060ff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(6, -42, 7, 0.4, 2.6);
    ctx.stroke();
    ctx.strokeStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(-5, -38, 6, -0.5, 2.2);
    ctx.stroke();
    ctx.strokeStyle = '#ff4060';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(2, -52, 5, 1, 3.5);
    ctx.stroke();

    // Painted blue eye below bridge area
    ctx.fillStyle = '#f4f4f8';
    ctx.beginPath();
    ctx.ellipse(1, -40, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#2060e0';
    ctx.beginPath();
    ctx.arc(1, -40, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(1, -40, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(2.2, -41, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Black multi-ply pickguard
    ctx.fillStyle = '#121214';
    ctx.beginPath();
    ctx.moveTo(-4, -72);
    ctx.lineTo(6, -70);
    ctx.lineTo(8, -48);
    ctx.lineTo(2, -36);
    ctx.lineTo(-8, -42);
    ctx.lineTo(-6, -68);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3a3a40';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Dual chrome humbuckers
    ctx.fillStyle = '#c8c8d0';
    ctx.fillRect(-5, -62, 12, 5);
    ctx.fillRect(-5, -54, 12, 5);
    ctx.fillStyle = '#2a2a30';
    ctx.fillRect(-4, -61, 10, 3);
    ctx.fillRect(-4, -53, 10, 3);

    // Bridge + stopbar
    ctx.fillStyle = '#d0d0d8';
    ctx.fillRect(-4, -46, 10, 2.5);
    ctx.fillRect(-3, -43, 8, 2);

    // Control knobs (top hat)
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 4; i++) {
      const kx = 8 + (i % 2) * 5;
      const ky = -50 + Math.floor(i / 2) * 6;
      ctx.beginPath();
      ctx.arc(kx, ky, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Neck
    ctx.fillStyle = '#c4a060';
    ctx.fillRect(-3, -118, 6, 48);
    // Fret markers
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 5; i++) ctx.fillRect(-1, -112 + i * 8, 2, 1.5);

    // Open-book headstock
    ctx.fillStyle = '#1a1008';
    ctx.beginPath();
    ctx.moveTo(-6, -118);
    ctx.lineTo(6, -118);
    ctx.lineTo(5, -130);
    ctx.lineTo(0, -134);
    ctx.lineTo(-4, -130);
    ctx.closePath();
    ctx.fill();
    // Tuners
    ctx.fillStyle = '#ccc';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(5, -128 + i * 3.5, 3.5, 1.8);
      ctx.fillRect(-8.5, -128 + i * 3.5, 3.5, 1.8);
    }
    // Strings
    ctx.strokeStyle = 'rgba(220,220,230,0.5)';
    ctx.lineWidth = 0.55;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(-2 + i * 0.8, -116);
      ctx.lineTo(-2 + i * 0.7, -44);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Cream Eko teardrop — white guard, 3 slanted singles, Bigsby, Eko script headstock. */
  function drawEkoTeardropGuitar(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // lean against amp / wall
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, -6); ctx.lineTo(8, -40);
    ctx.stroke();

    // Cream teardrop body
    const g = ctx.createLinearGradient(-14, -70, 16, -28);
    g.addColorStop(0, '#f0e8d0');
    g.addColorStop(0.45, '#e8dcc0');
    g.addColorStop(1, '#c8b890');
    ctx.fillStyle = g;
    ctx.beginPath();
    // rounded bottom, tapering toward neck
    ctx.moveTo(0, -28);
    ctx.bezierCurveTo(16, -30, 18, -50, 10, -68);
    ctx.bezierCurveTo(6, -78, -2, -80, -8, -72);
    ctx.bezierCurveTo(-16, -58, -14, -36, 0, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,60,40,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // White pickguard following teardrop
    ctx.fillStyle = '#f8f4e8';
    ctx.beginPath();
    ctx.moveTo(2, -34);
    ctx.bezierCurveTo(12, -36, 13, -52, 8, -64);
    ctx.lineTo(-2, -62);
    ctx.bezierCurveTo(-6, -50, -4, -38, 2, -34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(160,150,130,0.5)';
    ctx.stroke();

    // Three slanted black single-coils
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(1 + i * 0.5, -58 + i * 7);
      ctx.rotate(-0.35);
      ctx.fillRect(-6, -2, 13, 4);
      ctx.restore();
    }

    // Chrome Bigsby vibrato
    ctx.fillStyle = '#d0d0d8';
    ctx.fillRect(-2, -36, 10, 4);
    ctx.beginPath();
    ctx.ellipse(3, -30, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bigsby arm
    ctx.strokeStyle = '#b8b8c0';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(8, -30);
    ctx.quadraticCurveTo(16, -28, 14, -18);
    ctx.stroke();
    ctx.fillStyle = '#c8c8d0';
    ctx.beginPath();
    ctx.arc(14, -17, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Four chrome knobs on guard
    ctx.fillStyle = '#c8c8d0';
    const knobs = [[6, -44], [9, -40], [10, -35], [8, -31]];
    for (let i = 0; i < knobs.length; i++) {
      ctx.beginPath();
      ctx.arc(knobs[i][0], knobs[i][1], 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Toggle
    ctx.fillStyle = '#aaa';
    ctx.fillRect(4, -48, 2, 5);

    // Neck
    ctx.fillStyle = '#5a3a22';
    ctx.fillRect(-2, -124, 5, 52);
    ctx.fillStyle = 'rgba(220,200,160,0.4)';
    for (let i = 0; i < 6; i++) ctx.fillRect(-0.5, -118 + i * 7, 2, 1.2);

    // Pointed black Eko headstock (shark-fin)
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath();
    ctx.moveTo(-4, -124);
    ctx.lineTo(5, -124);
    ctx.lineTo(4, -138);
    ctx.lineTo(-1, -148);
    ctx.lineTo(-5, -136);
    ctx.closePath();
    ctx.fill();
    // Eko script
    ctx.fillStyle = '#e8e8f0';
    ctx.font = 'italic bold 7px Georgia, serif';
    ctx.save();
    ctx.translate(-2, -132);
    ctx.rotate(-1.15);
    ctx.fillText('Eko', 0, 0);
    ctx.restore();
    // Tuners along top edge
    ctx.fillStyle = '#ccc';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(3, -146 + i * 3.2, 3.5, 1.6);
    }
    // Strings
    ctx.strokeStyle = 'rgba(200,200,210,0.45)';
    ctx.lineWidth = 0.55;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(-1 + i * 0.7, -122);
      ctx.lineTo(0 + i * 0.6, -38);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Glossy cherry-red mannequin floor lamp — black shade head, hand on hip,
   other hand raised, red plinth, soft red glow (ref exact).
   */
  function drawMannequinLamp(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Soft red glow pool
    const glow = ctx.createRadialGradient(0, -40, 4, 0, -50, 70);
    glow.addColorStop(0, 'rgba(255, 40, 40, 0.28)');
    glow.addColorStop(0.5, 'rgba(200, 20, 40, 0.1)');
    glow.addColorStop(1, 'rgba(180, 0, 20, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(0, -55, 48, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red plinth
    const plinth = ctx.createLinearGradient(-18, 0, 18, 0);
    plinth.addColorStop(0, '#6a1018');
    plinth.addColorStop(0.4, '#d02830');
    plinth.addColorStop(0.7, '#ff4050');
    plinth.addColorStop(1, '#8a1820');
    ctx.fillStyle = plinth;
    ctx.fillRect(-16, -6, 32, 6);
    ctx.fillStyle = '#4a0c10';
    ctx.fillRect(-18, -2, 36, 3);

    // Glossy cherry body — S-curve silhouette
    const bodyG = ctx.createLinearGradient(-14, -110, 14, -10);
    bodyG.addColorStop(0, '#ff6068');
    bodyG.addColorStop(0.3, '#e02030');
    bodyG.addColorStop(0.55, '#ff3848');
    bodyG.addColorStop(0.8, '#a01020');
    bodyG.addColorStop(1, '#6a0810');
    ctx.fillStyle = bodyG;

    // Torso + hip cock (hand-on-hip side pushes out)
    ctx.beginPath();
    ctx.moveTo(-4, -108); // neck
    ctx.bezierCurveTo(-12, -100, -14, -88, -10, -78); // left shoulder/waist
    ctx.bezierCurveTo(-16, -70, -18, -58, -8, -50); // hip out (right hand on hip → left hip)
    ctx.bezierCurveTo(-6, -30, -4, -14, -2, -6); // single leg taper
    ctx.lineTo(4, -6);
    ctx.bezierCurveTo(6, -18, 8, -36, 10, -50);
    ctx.bezierCurveTo(18, -58, 14, -70, 8, -78);
    ctx.bezierCurveTo(12, -90, 10, -100, 4, -108);
    ctx.closePath();
    ctx.fill();

    // Dress fold highlight
    ctx.strokeStyle = 'rgba(255,180,180,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-2, -100);
    ctx.quadraticCurveTo(-8, -80, -4, -55);
    ctx.stroke();

    // Right arm — hand on hip
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.moveTo(6, -96);
    ctx.quadraticCurveTo(20, -90, 18, -72);
    ctx.quadraticCurveTo(16, -62, 10, -58);
    ctx.quadraticCurveTo(14, -68, 12, -82);
    ctx.quadraticCurveTo(10, -92, 6, -96);
    ctx.fill();
    // Hand on hip
    ctx.beginPath();
    ctx.ellipse(10, -56, 4, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Left arm — raised, palm up
    ctx.beginPath();
    ctx.moveTo(-8, -96);
    ctx.quadraticCurveTo(-20, -100, -18, -118);
    ctx.quadraticCurveTo(-16, -128, -10, -130);
    ctx.quadraticCurveTo(-14, -120, -12, -108);
    ctx.quadraticCurveTo(-10, -98, -8, -96);
    ctx.fill();
    // Raised hand / palm
    ctx.beginPath();
    ctx.ellipse(-10, -132, 5, 3.5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Collar
    ctx.fillStyle = '#c01828';
    ctx.beginPath();
    ctx.ellipse(0, -108, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black conical lampshade as head
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-16, -118);
    ctx.lineTo(16, -118);
    ctx.lineTo(8, -148);
    ctx.lineTo(-8, -148);
    ctx.closePath();
    ctx.fill();
    // Shade grain
    ctx.strokeStyle = 'rgba(60,60,60,0.6)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 4; i++) {
      const ty = -122 - i * 6;
      ctx.beginPath();
      ctx.moveTo(-14 + i, ty);
      ctx.lineTo(14 - i, ty);
      ctx.stroke();
    }
    // Shade inner glow
    const shadeGlow = ctx.createRadialGradient(0, -130, 2, 0, -128, 18);
    shadeGlow.addColorStop(0, 'rgba(255, 80, 60, 0.55)');
    shadeGlow.addColorStop(1, 'rgba(255, 40, 20, 0)');
    ctx.fillStyle = shadeGlow;
    ctx.beginPath();
    ctx.ellipse(0, -118, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Power cord hint
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(14, -1);
    ctx.quadraticCurveTo(28, 2, 36, -4);
    ctx.stroke();

    ctx.restore();
  }

  function drawBassGuitar(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // wall hook / lean
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, -8); ctx.lineTo(6, -90);
    ctx.stroke();
    // longer bass body
    const g = ctx.createLinearGradient(-10, -70, 12, -30);
    g.addColorStop(0, '#0a1a28');
    g.addColorStop(0.5, '#1a4060');
    g.addColorStop(1, '#0a1520');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(2, -48, 11, 18, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c4a060';
    ctx.fillRect(-1, -118, 5, 55);
    ctx.fillStyle = '#2a2010';
    ctx.fillRect(-4, -128, 10, 12);
    ctx.fillStyle = '#888';
    ctx.fillRect(6, -126, 3, 8);
    // 4 strings
    ctx.strokeStyle = 'rgba(200,200,210,0.45)';
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 1.1, -116);
      ctx.lineTo(1 + i * 0.9, -42);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,40,180,0.12)';
    ctx.beginPath();
    ctx.arc(2, -48, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawKeyboardStand(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // X-stand
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-22, 0); ctx.lineTo(18, -36);
    ctx.moveTo(22, 0); ctx.lineTo(-18, -36);
    ctx.stroke();
    // keys body
    const kg = ctx.createLinearGradient(-36, -48, 36, -36);
    kg.addColorStop(0, '#1a1a1e');
    kg.addColorStop(0.5, '#2a2a30');
    kg.addColorStop(1, '#121214');
    ctx.fillStyle = kg;
    ctx.fillRect(-38, -50, 76, 16);
    // white keys
    ctx.fillStyle = '#e8e8f0';
    for (let i = 0; i < 14; i++) {
      ctx.fillRect(-36 + i * 5.2, -48, 4.6, 12);
    }
    // black keys
    ctx.fillStyle = '#111';
    for (let i = 0; i < 10; i++) {
      if (i % 7 === 2 || i % 7 === 6) continue;
      ctx.fillRect(-34 + i * 5.2, -48, 3, 7);
    }
    // soft cyan panel glow
    ctx.fillStyle = 'rgba(0,200,255,0.2)';
    ctx.fillRect(-20, -54, 40, 3);
    ctx.restore();
  }

  function drawDrumKit(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // kick drum
    const kickG = ctx.createLinearGradient(-28, -40, 20, -10);
    kickG.addColorStop(0, '#1a1a20');
    kickG.addColorStop(0.4, '#3a3a48');
    kickG.addColorStop(1, '#121218');
    ctx.fillStyle = kickG;
    ctx.beginPath();
    ctx.ellipse(0, -22, 28, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -22, 28, 22, 0, 0, Math.PI * 2);
    ctx.stroke();
    // front resonant head
    ctx.fillStyle = '#d8d8e0';
    ctx.beginPath();
    ctx.ellipse(0, -22, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#666';
    ctx.font = 'bold 7px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MS', 0, -20);
    // snare
    ctx.fillStyle = '#2a2a32';
    ctx.fillRect(18, -48, 22, 12);
    ctx.fillStyle = '#c8c8d0';
    ctx.fillRect(18, -50, 22, 3);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(22, -36); ctx.lineTo(20, 0);
    ctx.moveTo(36, -36); ctx.lineTo(38, 0);
    ctx.stroke();
    // hi-hat
    ctx.fillStyle = '#c4a050';
    ctx.beginPath();
    ctx.ellipse(-22, -52, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a08040';
    ctx.beginPath();
    ctx.ellipse(-22, -50, 12, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-22, -50); ctx.lineTo(-22, 0);
    ctx.stroke();
    // soft magenta glow under kick
    ctx.fillStyle = 'rgba(255,40,180,0.1)';
    ctx.beginPath();
    ctx.ellipse(0, -4, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCableSpaghetti(ctx, x, y, t) {
    const cols = ['#222', '#333', '#1a1a1a', '#ff6644', '#2a6aaa'];
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = cols[i];
      ctx.lineWidth = 1.6 + (i % 2);
      ctx.beginPath();
      const ox = x + i * 6;
      ctx.moveTo(ox, y);
      ctx.bezierCurveTo(
        ox + 20 + Math.sin((t || 0) * 0.001 + i) * 3, y - 12 - i * 3,
        ox + 40, y + 6 + i * 2,
        ox + 55 + i * 8, y - 4 - i
      );
      ctx.stroke();
    }
    // jack ends
    ctx.fillStyle = '#888';
    ctx.fillRect(x + 58, y - 8, 6, 4);
    ctx.fillRect(x + 72, y - 6, 6, 4);
  }

  function drawShedRug(ctx, x, y, ww, hh) {
    ctx.fillStyle = '#5a3038';
    ctx.beginPath();
    ctx.ellipse(x + ww / 2, y + hh / 2, ww / 2, hh / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a1a22';
    ctx.beginPath();
    ctx.ellipse(x + ww / 2, y + hh / 2, ww / 2 - 6, hh / 2 - 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // fringe
    ctx.strokeStyle = '#7a4850';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const fx = x + 8 + i * ((ww - 16) / 11);
      ctx.beginPath();
      ctx.moveTo(fx, y + hh - 2);
      ctx.lineTo(fx + 1, y + hh + 5);
      ctx.stroke();
    }
  }

  function drawShed(ctx, w, h, camX, t, opts) {
    opts = opts || {};
    const floorY = h * 0.72;
    const cassetteTaken = !!opts.cassetteTaken;
    const tapeInStereo = !!opts.tapeInStereo;
    const doorLocked = !!opts.doorLocked;
    const ufoProg = opts.windowUfo != null ? opts.windowUfo : 0;

    // plywood back wall — rich grain + magenta/cyan rim light (neon card aesthetic)
    const wallG = ctx.createLinearGradient(0, 0, 0, floorY);
    wallG.addColorStop(0, '#4a3420');
    wallG.addColorStop(0.25, '#6e5234');
    wallG.addColorStop(0.55, '#7a5a38');
    wallG.addColorStop(0.85, '#5a4028');
    wallG.addColorStop(1, '#3a2818');
    ctx.fillStyle = wallG;
    ctx.fillRect(0, 0, w, floorY);
    // Magenta wash from left, cyan from right (rim light)
    const rimL = ctx.createLinearGradient(0, 0, w * 0.45, 0);
    rimL.addColorStop(0, 'rgba(255,40,180,0.14)');
    rimL.addColorStop(1, 'rgba(255,40,180,0)');
    ctx.fillStyle = rimL;
    ctx.fillRect(0, 0, w * 0.45, floorY);
    const rimR = ctx.createLinearGradient(w * 0.55, 0, w, 0);
    rimR.addColorStop(0, 'rgba(40,200,255,0)');
    rimR.addColorStop(1, 'rgba(40,200,255,0.14)');
    ctx.fillStyle = rimR;
    ctx.fillRect(w * 0.55, 0, w * 0.45, floorY);
    // Panel seams + rich grain
    for (let x = -((camX | 0) % 90); x < w + 40; x += 90) {
      ctx.strokeStyle = 'rgba(30,20,12,0.55)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, floorY);
      ctx.stroke();
      // warm highlight on panel edge
      ctx.strokeStyle = 'rgba(200,160,100,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 1.5, 0);
      ctx.lineTo(x + 1.5, floorY);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(90,60,30,0.35)';
      ctx.lineWidth = 1;
      for (let gy = 18; gy < floorY; gy += 22) {
        const wobble = Math.sin(gy * 0.08 + x * 0.02) * 3;
        ctx.beginPath();
        ctx.moveTo(x + 6, gy);
        ctx.bezierCurveTo(x + 30 + wobble, gy + 2, x + 55 - wobble, gy - 1, x + 84, gy + (gy % 17) * 0.08);
        ctx.stroke();
      }
    }
    // exposed studs with neon kiss
    for (let x = -((camX | 0) % 72) + 18; x < w + 40; x += 72) {
      const studG = ctx.createLinearGradient(x, 0, x + 8, 0);
      studG.addColorStop(0, '#2a1a10');
      studG.addColorStop(0.35, '#6a4a2e');
      studG.addColorStop(0.7, '#4a3420');
      studG.addColorStop(1, '#2a1a10');
      ctx.fillStyle = studG;
      ctx.fillRect(x, 0, 8, floorY);
      ctx.fillStyle = 'rgba(255,80,180,0.12)';
      ctx.fillRect(x, 0, 1.5, floorY);
      ctx.fillStyle = 'rgba(60,220,255,0.1)';
      ctx.fillRect(x + 6.5, 0, 1.5, floorY);
    }
    // plywood knots / darker grain blotches
    ctx.fillStyle = 'rgba(50,32,16,0.32)';
    for (let i = 0; i < 22; i++) {
      const kx = ((i * 167 - (camX | 0)) % (w + 60)) - 20;
      const ky = 40 + (i * 37) % Math.max(40, (floorY - 80));
      ctx.beginPath();
      ctx.ellipse(kx, ky, 5 + (i % 4), 3 + (i % 3), (i % 5) * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(90,60,30,0.4)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(kx, ky, 3 + (i % 3), 2, (i % 5) * 0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
    // rafter header
    const raftG = ctx.createLinearGradient(0, 0, 0, 22);
    raftG.addColorStop(0, '#2a1a10');
    raftG.addColorStop(1, '#4a3424');
    ctx.fillStyle = raftG;
    ctx.fillRect(0, 0, w, 22);
    for (let x = -((camX | 0) % 55); x < w + 40; x += 55) {
      ctx.fillStyle = '#5a4030';
      ctx.fillRect(x, 14, 10, 16);
      ctx.fillStyle = 'rgba(255,40,180,0.15)';
      ctx.fillRect(x, 14, 2, 16);
    }
    // silver insulation peek between rafters
    ctx.fillStyle = 'rgba(180,190,210,0.42)';
    for (let x = -((camX | 0) % 55) + 12; x < w; x += 55) {
      ctx.fillRect(x, 4, 40, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(x + 2, 5, 8, 8);
      ctx.fillStyle = 'rgba(180,190,210,0.42)';
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

    // glass + neon dusk landscape + UFO — clipped cleanly inside glass rect
    ctx.save();
    ctx.beginPath();
    ctx.rect(glassX, glassY, glassW, glassH);
    ctx.clip();

    // Neon dusk sky (illustrated, not flat cartoon mountain)
    const dusk = ctx.createLinearGradient(glassX, glassY, glassX, glassY + glassH);
    dusk.addColorStop(0, '#0a0620');
    dusk.addColorStop(0.2, '#1a0a48');
    dusk.addColorStop(0.42, '#6a1868');
    dusk.addColorStop(0.58, '#c02858');
    dusk.addColorStop(0.72, '#e85828');
    dusk.addColorStop(0.88, '#f0a040');
    dusk.addColorStop(1, '#ffe8a0');
    ctx.fillStyle = dusk;
    ctx.fillRect(glassX, glassY, glassW, glassH);
    // Cyan night rim upper-right
    const cyanWin = ctx.createRadialGradient(glassX + glassW * 0.82, glassY + 10, 2, glassX + glassW * 0.75, glassY + 24, glassW * 0.55);
    cyanWin.addColorStop(0, 'rgba(60,220,255,0.35)');
    cyanWin.addColorStop(1, 'rgba(60,220,255,0)');
    ctx.fillStyle = cyanWin;
    ctx.fillRect(glassX, glassY, glassW, glassH * 0.55);
    // Magenta bloom left
    const magWin = ctx.createRadialGradient(glassX + 20, glassY + glassH * 0.35, 4, glassX + 40, glassY + glassH * 0.4, glassW * 0.4);
    magWin.addColorStop(0, 'rgba(255,40,180,0.28)');
    magWin.addColorStop(1, 'rgba(255,40,180,0)');
    ctx.fillStyle = magWin;
    ctx.fillRect(glassX, glassY, glassW, glassH);
    // Streaked dusk clouds
    for (let i = 0; i < 5; i++) {
      const cy = glassY + glassH * (0.12 + i * 0.1);
      const band = ctx.createLinearGradient(glassX, cy - 6, glassX, cy + 10);
      const a = 0.12 + (i % 3) * 0.05;
      band.addColorStop(0, 'rgba(255,80,160,0)');
      band.addColorStop(0.4, 'rgba(255,60,120,' + a + ')');
      band.addColorStop(0.7, 'rgba(255,160,80,' + (a * 0.8) + ')');
      band.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = band;
      ctx.fillRect(glassX, cy - 6, glassW, 16);
    }
    // Layered mountain silhouettes with neon ridgelines
    const groundLine = glassY + glassH - 8;
    function duskRidge(pts, fill, rimCol, ox) {
      ctx.beginPath();
      ctx.moveTo(glassX - 4, groundLine + 4);
      for (let i = 0; i < pts.length; i++) {
        ctx.lineTo(glassX + ox + pts[i][0] * glassW, groundLine - pts[i][1] * (glassH * 0.55));
      }
      ctx.lineTo(glassX + glassW + 4, groundLine + 4);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = rimCol;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const px = glassX + ox + pts[i][0] * glassW;
        const py = groundLine - pts[i][1] * (glassH * 0.55);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    duskRidge([[0,0.15],[0.18,0.42],[0.32,0.28],[0.48,0.72],[0.62,0.38],[0.78,0.55],[1.0,0.2]], 'rgba(12,8,28,0.85)', 'rgba(255,40,180,0.35)', 0);
    duskRidge([[0,0.08],[0.22,0.28],[0.4,0.18],[0.55,0.48],[0.7,0.22],[0.88,0.35],[1.05,0.1]], 'rgba(8,10,24,0.92)', 'rgba(60,220,255,0.4)', -glassW * 0.04);
    // Valley city neon dots
    for (let i = 0; i < 18; i++) {
      const lx = glassX + 12 + ((i * 47 + (camX | 0) * 0.05) % (glassW - 24));
      const ly = groundLine - 6 - (i % 5) * 3;
      ctx.fillStyle = i % 2 ? 'rgba(255,60,180,0.75)' : 'rgba(60,220,255,0.7)';
      ctx.fillRect(lx, ly, 2 + (i % 2), 2 + (i % 3));
    }
    // Horizon sun glow
    const sunG = ctx.createRadialGradient(glassX + glassW * 0.4, groundLine - 20, 2, glassX + glassW * 0.4, groundLine - 10, glassW * 0.35);
    sunG.addColorStop(0, 'rgba(255,230,160,0.55)');
    sunG.addColorStop(0.5, 'rgba(255,120,60,0.18)');
    sunG.addColorStop(1, 'rgba(255,80,40,0)');
    ctx.fillStyle = sunG;
    ctx.fillRect(glassX, glassY, glassW, glassH);

    // Keep Cheam silhouette soft under neon layers (parallax continuity with fly)
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.translate(glassX, glassY);
    drawFlySkylineBackdrop(ctx, glassW, glassH, glassH - 8, camX);
    ctx.restore();

    // UFO landing (clipped inside glass, drawn on top of skyline)
    if (ufoProg > 0.01) {
      const ufoX = glassX + 55 + ufoProg * (glassW * 0.38);
      const ufoY = glassY + 14 + Math.min(1, ufoProg) * (glassH - 62);
      const ufoS = 0.48 + ufoProg * 0.32;
      const winLegs = Math.max(0, Math.min(1, (ufoProg - 0.5) / 0.45));
      drawClayUFO(ctx, ufoX, ufoY, ufoS, t, ufoProg > 0.18, { legExtend: winLegs });
      if (ufoProg > 0.45) {
        ctx.fillStyle = 'rgba(200,220,255,' + (0.14 + ufoProg * 0.3) + ')';
        ctx.beginPath();
        ctx.ellipse(ufoX, groundLine + 2, 28 + ufoProg * 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // glass reflection sheen + neon bounce
    const sheen = ctx.createLinearGradient(glassX, glassY, glassX + glassW * 0.45, glassY + glassH);
    sheen.addColorStop(0, 'rgba(255,255,255,0.22)');
    sheen.addColorStop(0.3, 'rgba(60,220,255,0.06)');
    sheen.addColorStop(0.65, 'rgba(255,40,180,0.04)');
    sheen.addColorStop(1, 'rgba(20,10,40,0.12)');
    ctx.fillStyle = sheen;
    ctx.fillRect(glassX, glassY, glassW, glassH);
    ctx.restore();

    // mullions ON TOP of glass (2×2 panes) — solid wood, not broken
    ctx.fillStyle = '#6a4e34';
    // vertical center mullion
    ctx.fillRect(wx + ww / 2 - mullion / 2, glassY - 1, mullion, glassH + 2);
    // horizontal center mullion
    ctx.fillRect(glassX - 1, wy + wh / 2 - mullion / 2, glassW + 2, mullion);
    // outer frame highlight + neon dusk rim
    ctx.strokeStyle = 'rgba(200,170,120,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(wx + 2, wy + 2, ww - 4, wh - 4);
    ctx.strokeStyle = 'rgba(255,40,180,0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(wx - 1, wy - 1, ww + 2, wh + 2);
    ctx.strokeStyle = 'rgba(60,220,255,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(wx + 4, wy + 4, ww - 8, wh - 8);
    // shadow under sill
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(wx - 8, wy + wh + 10, ww + 16, 4);
    // neon bounce on sill
    const sillGlow = ctx.createLinearGradient(wx, wy + wh, wx + ww, wy + wh + 12);
    sillGlow.addColorStop(0, 'rgba(255,40,180,0.12)');
    sillGlow.addColorStop(0.5, 'rgba(255,180,80,0.18)');
    sillGlow.addColorStop(1, 'rgba(60,220,255,0.12)');
    ctx.fillStyle = sillGlow;
    ctx.fillRect(wx - 10, wy + wh + 2, ww + 20, 10);

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

    // ——— RETROFIT primary wall art (photoreal posters dominate) ———
    // Left of window: live gig poster (Handsome Daughter / Winnipeg)
    // Eye-height (~mid-torso/head) — not high on the wall
    drawPhotoPoster(ctx, 480 - camX, 108, { which: 0, w: 118, h: 158, accent: '#ff60c0', wood: true, label: 'LIVE' });
    // Right of window / stereo wall: Greetings postcard + tracks photo
    drawPhotoPoster(ctx, 1115 - camX, 118, { which: 1, w: 130, h: 100, accent: '#40e0ff', wood: true, label: 'GREETINGS' });
    drawPhotoPoster(ctx, 1255 - camX, 98, { which: 2, w: 108, h: 142, accent: '#ffe040', wood: false, label: 'TRACKS' });
    // One small trading-card scrap kept tucked (not competing with Retrofit)
    drawBandFlyer(ctx, 560 - camX, 178, { poster: 2, w: 42, h: 56, accent: '#c040ff' });
    drawPoster(ctx, 620 - camX, 188, 'BEER', '#4a2a1a');
    // tiny polaroids / sticky notes
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(700 - camX, 210, 22, 18);
    ctx.fillRect(728 - camX, 214, 18, 16);
    ctx.fillStyle = '#1a3a2a';
    ctx.font = '6px Segoe UI, sans-serif';
    ctx.fillText('sesh', 704 - camX, 222);
    // soft neon accent strip on a stud near stereo wall
    const neonX = 1100 - camX;
    const neonG = ctx.createLinearGradient(neonX, 30, neonX, 160);
    neonG.addColorStop(0, 'rgba(0,220,255,0)');
    neonG.addColorStop(0.4, 'rgba(0,220,255,0.35)');
    neonG.addColorStop(0.7, 'rgba(255,40,180,0.3)');
    neonG.addColorStop(1, 'rgba(255,40,180,0)');
    ctx.fillStyle = neonG;
    ctx.fillRect(neonX, 30, 3, 140);

    function propAt(ax, drawFn) {
      ctx.save();
      ctx.translate(ax, floorY);
      ctx.scale(PROP_SCALE, PROP_SCALE);
      ctx.translate(-ax, -floorY);
      drawFn();
      ctx.restore();
    }

    // Life-sized El Camino — NOT furniture-scaled; path walks in FRONT.
    // Header promises El Camino: if driven to yard, still park a dusty stand-in.
    {
      const cx = (opts.hideCamino
        ? SHED_CAMINO_X
        : (opts.caminoX != null ? opts.caminoX : SHED_CAMINO_X)) - camX;
      drawElCamino(ctx, cx, floorY, t, {
        dusty: !!opts.caminoDusty || !!opts.hideCamino,
        facingRight: opts.hideCamino ? false : !!opts.caminoFacingRight,
        wheelRot: opts.hideCamino ? 0 : opts.caminoWheelRot,
        drawDriver: opts.hideCamino ? null : opts.caminoDrawDriver,
        noLabel: !!opts.caminoNoLabel || !!opts.hideCamino,
      });
    }

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
    propAt(950 - camX, function () {
      // ashSmoke false during unlit roll/sesh; true (or omitted default) otherwise
      const ashOn = opts.ashSmoke != null ? !!opts.ashSmoke : true;
      drawChillTable(ctx, 950 - camX, floorY - 4, t, { ambientSmoke: ashOn });
    });
    propAt(1020 - camX, function () { drawLawnChair(ctx, 1020 - camX, floorY); });
    propAt(1080 - camX, function () { drawAmp(ctx, 1080 - camX, floorY); });

    // ——— Band corner (clear of joint sesh ~900–1020, Camino ~360, door ~1420) ———
    // Drum kit in gap aft of Camino / before cassette clutter (walk path stays forward)
    propAt(520 - camX, function () { drawDrumKit(ctx, 520 - camX, floorY); });
    // Bass leaning on wall between Camino tail and mid-shed open walk
    propAt(760 - camX, function () { drawBassGuitar(ctx, 760 - camX, floorY); });
    // Keys on X-stand behind lawnmower / couch approach (compact footprint)
    propAt(860 - camX, function () { drawKeyboardStand(ctx, 860 - camX, floorY); });
    // Cream Eko teardrop at distinct X (USE-able)
    propAt(990 - camX, function () { drawEkoTeardropGuitar(ctx, 990 - camX, floorY); });
    // Cherry SG eye guitar on stand beside amp
    propAt(1045 - camX, function () { drawElectricGuitar(ctx, 1045 - camX, floorY); });
    // Cable spaghetti near amps / stereo
    drawCableSpaghetti(ctx, 1088 - camX, floorY - 2, t);
    drawCableSpaghetti(ctx, 1145 - camX, floorY - 1, t + 400);

    // Instrument USE prompts + brief play pulse (game: instrumentPromptId / instrumentPulse)
    (function drawInstrumentHotspots() {
      const pulse = opts.instrumentPulse || null;
      const promptId = opts.instrumentPromptId || null;
      for (let i = 0; i < SHED_INSTRUMENTS.length; i++) {
        const inst = SHED_INSTRUMENTS[i];
        const sx = inst.x - camX;
        if (pulse && pulse.id === inst.id && (pulse.frames == null || pulse.frames > 0)) {
          const p = 0.55 + 0.45 * Math.sin((t || 0) * 0.04);
          ctx.fillStyle = 'rgba(0,220,255,' + (0.12 + 0.14 * p) + ')';
          ctx.beginPath();
          ctx.ellipse(sx, floorY - 28, 36, 18, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,40,180,' + (0.08 + 0.1 * p) + ')';
          ctx.beginPath();
          ctx.ellipse(sx, floorY - 50, 22, 40, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        if (promptId === inst.id) {
          const bob = Math.sin((t || 0) * 0.01) * 3;
          ctx.fillStyle = '#1a5a1a';
          ctx.font = 'bold 12px Segoe UI, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('▲ USE', sx, floorY - 98 + bob);
          ctx.font = 'bold 9px Segoe UI, sans-serif';
          ctx.fillStyle = 'rgba(20,80,40,0.85)';
          ctx.fillText(inst.label, sx, floorY - 84 + bob);
          ctx.textAlign = 'left';
        }
      }
    })();

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
    // Cherry mannequin lamp — readable, clear of Camino / joint / door
    propAt(1288 - camX, function () { drawMannequinLamp(ctx, 1288 - camX, floorY); });
    propAt(1335 - camX, function () { drawBikeParts(ctx, 1335 - camX, floorY); });
    propAt(1375 - camX, function () { drawJunkPile(ctx, 1375 - camX, floorY); });
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

    // Wet reflective floor — dark plywood/concrete with neon streaks (card aesthetic)
    const floorG = ctx.createLinearGradient(0, floorY, 0, h);
    floorG.addColorStop(0, '#2a221c');
    floorG.addColorStop(0.35, '#3a3228');
    floorG.addColorStop(1, '#1a1410');
    ctx.fillStyle = floorG;
    ctx.fillRect(0, floorY, w, h - floorY);
    // board seams
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    for (let x = -((camX | 0) % 48); x < w; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    // oil / spill stains
    ctx.fillStyle = 'rgba(20,14,10,0.35)';
    for (let i = 0; i < 8; i++) {
      const sx = ((i * 191 - (camX | 0) * 0.5) % (w + 100)) - 30;
      ctx.beginPath();
      ctx.ellipse(sx, floorY + 18 + (i % 5) * 10, 18 + (i % 4) * 6, 5 + (i % 3), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Soft warm wet-floor pools only (no pink/teal vertical streaks)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const pool1 = ctx.createRadialGradient(w * 0.55, floorY + 28, 4, w * 0.55, floorY + 36, 90);
    pool1.addColorStop(0, 'rgba(255,180,70,0.14)');
    pool1.addColorStop(1, 'rgba(255,180,70,0)');
    ctx.fillStyle = pool1;
    ctx.fillRect(0, floorY, w, h - floorY);
    const pool2 = ctx.createRadialGradient(w * 0.72, floorY + 22, 3, w * 0.72, floorY + 30, 70);
    pool2.addColorStop(0, 'rgba(255,200,120,0.08)');
    pool2.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = pool2;
    ctx.fillRect(0, floorY, w, h - floorY);
    ctx.restore();
    // Floating dust motes in lamp shafts (photoreal garage air)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 28; i++) {
      const dx = ((i * 97 + (t || 0) * 0.012) % (w + 40)) - 20;
      const dy = floorY - 40 - ((i * 53 + (t || 0) * 0.008) % 120);
      const a = 0.08 + (i % 5) * 0.03;
      ctx.fillStyle = 'rgba(255,230,180,' + a + ')';
      ctx.beginPath();
      ctx.arc(dx, dy, 1 + (i % 3) * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Extra contact shadow pools under gear (visual only)
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    for (const sx of [520, 760, 860, 990, 1045, 1080, 1180, 1240]) {
      const px = sx - camX;
      if (px < -40 || px > w + 40) continue;
      ctx.beginPath();
      ctx.ellipse(px, floorY + 3, 22, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // worn rug under chill / joint sesh (couch~900 table~950) — visual only, doesn't block
    drawShedRug(ctx, 880 - camX, floorY + 2, 130, 28);

    // exit door — plywood depth + neon edge fidelity
    const doorX = SHED_DOOR_X - camX;
    const doorH = 155;
    ctx.fillStyle = '#1a1008';
    ctx.fillRect(doorX - 32, floorY - doorH - 2, 64, doorH + 4);
    const doorBody = ctx.createLinearGradient(doorX - 26, 0, doorX + 26, 0);
    if (doorLocked) {
      doorBody.addColorStop(0, '#3a2a20');
      doorBody.addColorStop(0.35, '#6a5040');
      doorBody.addColorStop(0.7, '#5a4030');
      doorBody.addColorStop(1, '#2a1a10');
    } else {
      doorBody.addColorStop(0, '#4a3020');
      doorBody.addColorStop(0.35, '#9a6840');
      doorBody.addColorStop(0.7, '#7a5030');
      doorBody.addColorStop(1, '#3a2010');
    }
    ctx.fillStyle = doorBody;
    ctx.fillRect(doorX - 26, floorY - doorH + 4, 52, doorH - 4);
    // neon rim
    ctx.strokeStyle = doorLocked ? 'rgba(255,80,60,0.45)' : 'rgba(60,255,140,0.5)';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(doorX - 26.5, floorY - doorH + 3.5, 53, doorH - 3);
    ctx.strokeStyle = 'rgba(60,220,255,0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(doorX - 24, floorY - doorH + 6, 48, doorH - 8);
    // plywood door grain
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    for (let gy = floorY - doorH + 10; gy < floorY - 8; gy += 11) {
      ctx.beginPath();
      ctx.moveTo(doorX - 24, gy);
      ctx.lineTo(doorX + 24, gy + Math.sin(gy * 0.1) * 1.5);
      ctx.stroke();
    }
    // specular edge
    ctx.fillStyle = 'rgba(255,220,160,0.18)';
    ctx.fillRect(doorX - 24, floorY - doorH + 6, 3, doorH - 12);
    if (doorLocked) {
      ctx.fillStyle = '#222';
      ctx.fillRect(doorX + 8, floorY - 78, 12, 16);
      ctx.fillStyle = '#c4a35a';
      ctx.beginPath();
      ctx.arc(doorX + 14, floorY - 72, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const knob = ctx.createRadialGradient(doorX + 15, floorY - 71, 0.5, doorX + 16, floorY - 70, 5);
      knob.addColorStop(0, '#ffe8a0');
      knob.addColorStop(1, '#8a6830');
      ctx.fillStyle = knob;
      ctx.beginPath();
      ctx.arc(doorX + 16, floorY - 70, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = doorLocked ? '#ff6644' : '#7dff3a';
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(doorLocked ? 'LOCKED' : 'EXIT →', doorX, floorY - doorH - 10);
    ctx.textAlign = 'left';

    // hanging bulbs — warm key + cool fill (neon-noir lean without breaking shed story)
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
    // warm pool
    const warm = ctx.createRadialGradient(lx, 62, 4, lx, 70, 90);
    warm.addColorStop(0, 'rgba(255,210,90,0.16)');
    warm.addColorStop(0.55, 'rgba(255,180,60,0.05)');
    warm.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.fillStyle = warm;
    ctx.beginPath();
    ctx.arc(lx, 62, 90, 0, Math.PI * 2);
    ctx.fill();
    // second cooler bulb toward stereo / band wall
    const lx2 = w * 0.72;
    ctx.strokeStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(lx2, 22);
    ctx.lineTo(lx2, 40);
    ctx.stroke();
    ctx.fillStyle = '#a8d8e8';
    ctx.beginPath();
    ctx.arc(lx2, 48, 6, 0, Math.PI * 2);
    ctx.fill();
    const cool = ctx.createRadialGradient(lx2, 58, 3, lx2, 70, 70);
    cool.addColorStop(0, 'rgba(120,220,255,0.12)');
    cool.addColorStop(0.5, 'rgba(255,60,180,0.04)');
    cool.addColorStop(1, 'rgba(80,180,255,0)');
    ctx.fillStyle = cool;
    ctx.beginPath();
    ctx.arc(lx2, 60, 70, 0, Math.PI * 2);
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

    ctx.fillStyle = 'rgba(12,6,20,0.72)';
    ctx.fillRect(w / 2 - 148, 3, 296, 20);
    ctx.strokeStyle = 'rgba(255,40,180,0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(w / 2 - 148, 3, 296, 20);
    ctx.strokeStyle = 'rgba(60,220,255,0.35)';
    ctx.strokeRect(w / 2 - 146, 5, 292, 16);
    ctx.fillStyle = '#f0e8ff';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    // Header promises El Camino — always draw (dusty stand-in if driven to yard)
    ctx.fillText("Mom's Shed — plywood · band gear · El Camino", w / 2, 17);
    ctx.textAlign = 'left';
  }

  // ——— Sci-fi clay/chrome mothership (side-readable) ———
  function drawClayUFO(ctx, x, y, scale, t, lightsOn, opts) {
    opts = opts || {};
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const pulse = 0.7 + Math.sin(t * 0.008) * 0.15;
    const spin = t * 0.0025;

    if (lightsOn) {
      const halo = ctx.createRadialGradient(0, 6, 20, 0, 10, 130);
      halo.addColorStop(0, 'rgba(160,220,255,' + (0.14 * pulse) + ')');
      halo.addColorStop(0.55, 'rgba(100,180,220,0.05)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 8, 130, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground contact shadow only — never paint a blob on the sky while airborne
    const legExtEarly = opts.legExtend != null ? Math.max(0, Math.min(1, opts.legExtend)) : 1;
    const showGroundShadow = opts.groundShadow === true || (opts.groundShadow !== false && legExtEarly > 0.35);
    if (showGroundShadow) {
      const sa = 0.12 + legExtEarly * 0.22;
      ctx.fillStyle = 'rgba(0,0,0,' + sa + ')';
      ctx.beginPath();
      ctx.ellipse(2, 38, 70 + legExtEarly * 10, 6 + legExtEarly * 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ——— Classic smooth flying saucer ———
    // Underside dish (gentle bowl)
    const under = ctx.createLinearGradient(0, 8, 0, 28);
    under.addColorStop(0, '#6a7884');
    under.addColorStop(0.5, '#3a4854');
    under.addColorStop(1, '#1a2228');
    ctx.fillStyle = under;
    ctx.beginPath();
    ctx.ellipse(0, 14, 88, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main disc — wide, thin, chrome-smooth rim
    const disc = ctx.createLinearGradient(-100, -8, 100, 18);
    disc.addColorStop(0, '#2a323a');
    disc.addColorStop(0.15, '#8a969e');
    disc.addColorStop(0.35, '#e8eef2');
    disc.addColorStop(0.5, '#ffffff');
    disc.addColorStop(0.65, '#c8d2da');
    disc.addColorStop(0.85, '#5a646c');
    disc.addColorStop(1, '#1c242c');
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.ellipse(0, 2, 98, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smooth rim highlight (no hard panels)
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, -1, 92, 12, 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(20,28,36,0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 4, 86, 12, 0, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Slim equatorial light ring
    ctx.strokeStyle = lightsOn ? 'rgba(140,230,255,0.55)' : 'rgba(80,120,140,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 5, 90, 6.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Upper deck — soft step into dome (smooth, not boxy)
    const deck = ctx.createLinearGradient(-48, -14, 48, 4);
    deck.addColorStop(0, '#4a545c');
    deck.addColorStop(0.5, '#d0d8e0');
    deck.addColorStop(1, '#3a444c');
    ctx.fillStyle = deck;
    ctx.beginPath();
    ctx.ellipse(0, -2, 48, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Classic bubble dome — smooth glass hemisphere
    const dome = ctx.createRadialGradient(-10, -26, 2, 0, -8, 34);
    dome.addColorStop(0, 'rgba(245,252,255,0.92)');
    dome.addColorStop(0.35, 'rgba(150,210,235,0.55)');
    dome.addColorStop(0.75, 'rgba(40,80,120,0.55)');
    dome.addColorStop(1, 'rgba(15,35,55,0.85)');
    ctx.fillStyle = dome;
    ctx.beginPath();
    ctx.ellipse(0, -6, 28, 26, 0, Math.PI, 0);
    ctx.fill();
    // dome specular
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-8, -22, 7, 5, -0.5, 0, Math.PI * 1.15);
    ctx.stroke();
    // dome rim seal
    ctx.strokeStyle = 'rgba(180,190,200,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, -6, 28, 4, 0, 0, Math.PI);
    ctx.stroke();

    // Rim porthole lights — evenly spaced on disc edge
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + spin;
      const on = lightsOn && ((Math.floor(t / 140 + i) % 3) !== 2);
      const lx = Math.cos(a) * 86;
      const ly = Math.sin(a) * 13 + 3;
      ctx.fillStyle = on ? '#e8ffff' : '#3a5060';
      ctx.shadowColor = '#88e8ff';
      ctx.shadowBlur = on ? 8 : 0;
      ctx.beginPath();
      ctx.arc(lx, ly, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Underside bay / beam port
    ctx.fillStyle = '#0c1014';
    ctx.beginPath();
    ctx.ellipse(0, 18, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = lightsOn ? 'rgba(80,255,180,' + (0.35 + pulse * 0.35) + ')' : '#1a3a2a';
    ctx.shadowColor = '#66ffaa';
    ctx.shadowBlur = lightsOn ? 8 : 0;
    ctx.beginPath();
    ctx.ellipse(0, 18, 7, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Landing legs: legExtend 0 = tucked, 1 = down
    const legExt = opts.legExtend != null ? Math.max(0, Math.min(1, opts.legExtend)) : 1;
    if (legExt > 0.02) {
      const strut = 4 + legExt * 12;
      const footY = 18 + strut;
      const bayOpen = 0.35 + legExt * 0.65;
      ctx.fillStyle = '#1a2024';
      for (const px of [-42, 0, 42]) {
        ctx.fillRect(px - 3.5 * bayOpen, 16, 7 * bayOpen, 4);
      }
      ctx.fillStyle = '#2a3238';
      for (const px of [-42, 0, 42]) {
        const tuck = (1 - legExt) * 10;
        const lean = px === 0 ? 0 : (px < 0 ? tuck : -tuck);
        ctx.beginPath();
        ctx.moveTo(px - 2.5, 18);
        ctx.lineTo(px + 2.5, 18);
        ctx.lineTo(px + 2.2 + lean * 0.3, footY);
        ctx.lineTo(px - 2.2 + lean * 0.3, footY);
        ctx.closePath();
        ctx.fill();
        const footW = 3 + legExt * 5;
        ctx.beginPath();
        ctx.ellipse(px + lean * 0.35, footY + 1, footW, 1.5 + legExt * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        if (lightsOn && legExt > 0.45) {
          ctx.fillStyle = 'rgba(180,230,255,' + (0.15 + legExt * 0.2) + ')';
          ctx.beginPath();
          ctx.ellipse(px + lean * 0.35, footY + 2, footW * 0.9, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#2a3238';
        }
      }
    } else {
      ctx.fillStyle = '#3a444c';
      for (const px of [-42, 0, 42]) {
        ctx.beginPath();
        ctx.ellipse(px, 17.5, 5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (opts.showPilots) {
      for (const px of [-8, 8]) {
        ctx.fillStyle = '#2a6a32';
        ctx.beginPath();
        ctx.ellipse(px, -14, 5.5, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0a0c10';
        ctx.beginPath();
        ctx.ellipse(px - 1.8, -15, 2.0, 3.0, -0.3, 0, Math.PI * 2);
        ctx.ellipse(px + 1.8, -15, 2.0, 3.0, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff2244';
        ctx.beginPath();
        ctx.arc(px - 1.3, -15.4, 0.55, 0, Math.PI * 2);
        ctx.arc(px + 2.2, -15.4, 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }


  function drawClayAlien(ctx, x, y, facing, t, opts) {
    opts = opts || {};
    const scale = opts.scale != null ? opts.scale : 1.15;
    const seated = !!opts.seated;
    const yieldAmt = opts.yield != null ? opts.yield : 0;
    const bob = Math.sin((t || 0) * 0.004 + (opts.seed || 0)) * (seated ? 0.6 : 1.4);
    ctx.save();
    ctx.translate(x + yieldAmt * facing * 28, y);
    ctx.scale(facing * scale, scale);

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    const skin = '#3d7a42';
    const skinLo = '#1e4424';
    const skinHi = '#4a8f50';
    const bodyTop = seated ? -36 : -42;

    // skinny legs / boots
    ctx.fillStyle = '#121018';
    if (seated) {
      ctx.fillRect(-10, -6, 7, 7);
      ctx.fillRect(3, -6, 7, 7);
    } else {
      ctx.fillRect(-8, -8, 6, 9);
      ctx.fillRect(2, -8, 6, 9);
    }
    // dark jumpsuit pants
    ctx.fillStyle = '#1a1524';
    if (seated) {
      ctx.fillRect(-11, -20, 22, 16);
    } else {
      ctx.fillRect(-8, -28, 6, 22);
      ctx.fillRect(2, -28, 6, 22);
    }
    // torso — charcoal flight suit
    ctx.fillStyle = '#221a30';
    ctx.fillRect(-11, bodyTop, 22, seated ? 20 : 22);
    // dull metal belt
    ctx.fillStyle = '#5a6068';
    ctx.fillRect(-11, bodyTop + (seated ? 14 : 16), 22, 3);
    // cold insignia
    ctx.fillStyle = '#a01028';
    ctx.beginPath();
    ctx.moveTo(5, bodyTop + 5);
    ctx.lineTo(9, bodyTop + 8);
    ctx.lineTo(5, bodyTop + 11);
    ctx.lineTo(1, bodyTop + 8);
    ctx.closePath();
    ctx.fill();

    // long thin arms
    ctx.fillStyle = skin;
    ctx.fillRect(-15, bodyTop + 2, 4, 16);
    ctx.fillRect(11, bodyTop + 2, 4, 16);
    ctx.fillStyle = skinLo;
    ctx.fillRect(-15, bodyTop + 14, 4, 4);
    ctx.fillRect(11, bodyTop + 14, 4, 4);
    // claw fingertips
    ctx.fillStyle = '#0e1a10';
    ctx.fillRect(-16, bodyTop + 17, 2, 4);
    ctx.fillRect(-13, bodyTop + 17, 2, 4);
    ctx.fillRect(11, bodyTop + 17, 2, 4);
    ctx.fillRect(14, bodyTop + 17, 2, 4);

    // long neck
    ctx.fillStyle = skin;
    ctx.fillRect(-2.5, bodyTop - 8, 5, 10);

    // gaunt oversized head (narrower chin)
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(0, bodyTop - 20 + bob * 0.12, 13, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    // hollow cheek shade
    ctx.fillStyle = 'rgba(10,30,14,0.35)';
    ctx.beginPath();
    ctx.ellipse(-7, bodyTop - 14, 3.5, 5, 0.2, 0, Math.PI * 2);
    ctx.ellipse(7, bodyTop - 14, 3.5, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // cold highlight
    ctx.fillStyle = 'rgba(120,180,100,0.15)';
    ctx.beginPath();
    ctx.ellipse(-3, bodyTop - 26 + bob * 0.1, 4, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // large slanted black eyes (angry / predatory)
    const ey = bodyTop - 19 + bob * 0.08;
    ctx.fillStyle = '#050608';
    ctx.beginPath();
    ctx.ellipse(-5.5, ey, 5.2, 6.8, -0.4, 0, Math.PI * 2);
    ctx.ellipse(5.5, ey, 5.2, 6.8, 0.4, 0, Math.PI * 2);
    ctx.fill();
    // red pupils
    ctx.fillStyle = '#ff1a2e';
    ctx.beginPath();
    ctx.arc(-4.2, ey - 0.5, 1.1, 0, Math.PI * 2);
    ctx.arc(6.6, ey - 0.5, 1.1, 0, Math.PI * 2);
    ctx.fill();
    // brow ridge
    ctx.strokeStyle = skinLo;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, ey - 7);
    ctx.lineTo(-2, ey - 5);
    ctx.moveTo(2, ey - 5);
    ctx.lineTo(10, ey - 7);
    ctx.stroke();

    // thin frown / slit mouth (not a smile)
    ctx.strokeStyle = '#0e2012';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-4, bodyTop - 8);
    ctx.quadraticCurveTo(0, bodyTop - 6, 4, bodyTop - 8);
    ctx.stroke();

    // spiky dark antennae (not cute pink tips)
    if (!opts.noAntenna) {
      ctx.strokeStyle = skinLo;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-5, bodyTop - 35);
      ctx.lineTo(-11, bodyTop - 46);
      ctx.moveTo(5, bodyTop - 35);
      ctx.lineTo(11, bodyTop - 46);
      ctx.stroke();
      ctx.fillStyle = '#8a1020';
      ctx.beginPath();
      ctx.moveTo(-11, bodyTop - 46);
      ctx.lineTo(-13, bodyTop - 50);
      ctx.lineTo(-9, bodyTop - 48);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(11, bodyTop - 46);
      ctx.lineTo(13, bodyTop - 50);
      ctx.lineTo(9, bodyTop - 48);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Walkable mothership bridge / alien control deck.
   * opts: seatTaken, alienYield (0..1), showPlayerSeat
   */
  function drawShipInterior(ctx, w, h, camX, t, opts) {
    opts = opts || {};
    const groundY = h * 0.72;
    const drift = Math.sin(t * 0.00035) * 18; // sky "we're flying" parallax
    const driftY = Math.cos(t * 0.00028) * 6;

    // Deep hull backdrop
    const hull = ctx.createLinearGradient(0, 0, 0, h);
    hull.addColorStop(0, '#0c141c');
    hull.addColorStop(0.35, '#1a2834');
    hull.addColorStop(0.7, '#243040');
    hull.addColorStop(1, '#121820');
    ctx.fillStyle = hull;
    ctx.fillRect(0, 0, w, h);

    // Curved upper hull ribs
    ctx.strokeStyle = 'rgba(120,150,170,0.22)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const rx = i * 140 - (camX * 0.25) % 140 - 40;
      ctx.beginPath();
      ctx.moveTo(rx, 10);
      ctx.quadraticCurveTo(rx + 40, groundY * 0.35, rx + 20, groundY - 8);
      ctx.stroke();
    }
    // ceiling curve band
    ctx.fillStyle = '#2a3848';
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.quadraticCurveTo(w / 2, 70, w + 20, 0);
    ctx.lineTo(w + 20, 0);
    ctx.lineTo(-20, 0);
    ctx.fill();
    ctx.fillStyle = '#3a4a5a';
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.quadraticCurveTo(w / 2, 42, w + 20, 0);
    ctx.fill();

    // ——— Observation windows (Chilliwack sky drifting) ———
    const winYs = [78, 78, 78];
    const winXs = [80, 320, 560];
    for (let wi = 0; wi < 3; wi++) {
      const wx = winXs[wi] - camX * 0.15;
      const wy = winYs[wi];
      const ww = 200;
      const wh = 110;
      // frame
      ctx.fillStyle = '#4a5a68';
      ctx.beginPath();
      ctx.moveTo(wx - 6, wy + wh);
      ctx.quadraticCurveTo(wx + ww / 2, wy - 18, wx + ww + 6, wy + wh);
      ctx.lineTo(wx + ww + 6, wy + wh + 10);
      ctx.lineTo(wx - 6, wy + wh + 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1a242c';
      ctx.fillRect(wx, wy, ww, wh);

      ctx.save();
      ctx.beginPath();
      ctx.rect(wx, wy, ww, wh);
      ctx.clip();
      // dusk neon sky matching drawSky
      const skyG = ctx.createLinearGradient(0, wy, 0, wy + wh);
      skyG.addColorStop(0, '#1a0a38');
      skyG.addColorStop(0.45, '#6a2868');
      skyG.addColorStop(1, '#e8a060');
      ctx.fillStyle = skyG;
      ctx.fillRect(wx, wy, ww, wh);
      // drifting mountains (aliens flying)
      const scroll = camX * 0.08 + drift + wi * 40;
      const base = wy + wh - 8 + driftY * 0.3;
      ctx.fillStyle = '#cfd6dd';
      ctx.beginPath();
      ctx.moveTo(wx - 10, base);
      ctx.lineTo(wx + 40 - scroll * 0.2, base - 28);
      ctx.lineTo(wx + 90 - scroll * 0.2, base - 18);
      ctx.lineTo(wx + 140 - scroll * 0.2, base - 42);
      ctx.lineTo(wx + ww + 10, base - 14);
      ctx.lineTo(wx + ww + 10, base + 20);
      ctx.lineTo(wx - 10, base + 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#7a8896';
      ctx.beginPath();
      ctx.moveTo(wx - 10, base);
      // Cheam-ish left peak, unlabeled
      ctx.lineTo(wx + 30 - scroll * 0.15, base - 22);
      ctx.lineTo(wx + 55 - scroll * 0.15, base - 55);
      ctx.lineTo(wx + 85 - scroll * 0.15, base - 20);
      ctx.lineTo(wx + 150 - scroll * 0.15, base - 12);
      ctx.lineTo(wx + ww + 10, base - 8);
      ctx.lineTo(wx + ww + 10, base + 20);
      ctx.lineTo(wx - 10, base + 20);
      ctx.closePath();
      ctx.fill();
      const mist = ctx.createLinearGradient(0, wy, 0, base);
      mist.addColorStop(0, 'rgba(243,244,246,0.15)');
      mist.addColorStop(1, 'rgba(209,213,219,0.5)');
      ctx.fillStyle = mist;
      ctx.fillRect(wx, wy, ww, wh);
      // glass sheen
      ctx.fillStyle = 'rgba(180,220,255,0.08)';
      ctx.fillRect(wx, wy, ww * 0.35, wh);
      ctx.restore();

      // mullion
      ctx.strokeStyle = 'rgba(160,180,200,0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx + 2, wy + 2, ww - 4, wh - 4);
    }

    // Side curved walls
    ctx.fillStyle = '#1e2a34';
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.quadraticCurveTo(30 - camX * 0.05, groundY * 0.5, 0, groundY);
    ctx.lineTo(0, h);
    ctx.lineTo(0, 40);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w, 40);
    ctx.quadraticCurveTo(w - 30 + camX * 0.05, groundY * 0.5, w, groundY);
    ctx.lineTo(w, h);
    ctx.lineTo(w, 40);
    ctx.fill();

    // Deck floor
    const floorG = ctx.createLinearGradient(0, groundY - 4, 0, h);
    floorG.addColorStop(0, '#3a4854');
    floorG.addColorStop(0.15, '#2a343c');
    floorG.addColorStop(1, '#141a20');
    ctx.fillStyle = floorG;
    ctx.fillRect(0, groundY, w, h - groundY);
    // deck plating lines
    ctx.strokeStyle = 'rgba(100,120,140,0.25)';
    ctx.lineWidth = 1;
    for (let x = -((camX | 0) % 48); x < w; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 2);
      ctx.lineTo(x + 20, h);
      ctx.stroke();
    }
    // walk stripe
    ctx.fillStyle = 'rgba(125,255,58,0.12)';
    ctx.fillRect(0, groundY + 18, w, 6);
    ctx.fillStyle = 'rgba(200,220,240,0.08)';
    ctx.fillRect(0, groundY, w, 3);

    // Console banks (left mid deck)
    function drawConsole(cx, cy, wide) {
      const sx = cx - camX;
      ctx.fillStyle = '#1a2228';
      ctx.fillRect(sx, cy - 38, wide, 38);
      ctx.fillStyle = '#2a3844';
      ctx.fillRect(sx + 4, cy - 52, wide - 8, 16);
      // screens
      for (let i = 0; i < Math.floor(wide / 36); i++) {
        const on = ((Math.floor(t / 180) + i) % 3) !== 2;
        ctx.fillStyle = on ? '#44ffaa' : '#1a4030';
        ctx.shadowColor = '#44ffaa';
        ctx.shadowBlur = on ? 6 : 0;
        ctx.fillRect(sx + 10 + i * 34, cy - 48, 22, 10);
      }
      ctx.shadowBlur = 0;
      // knobs
      for (let i = 0; i < Math.floor(wide / 28); i++) {
        ctx.fillStyle = '#8898a8';
        ctx.beginPath();
        ctx.arc(sx + 16 + i * 28, cy - 18, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = ((Math.floor(t / 90) + i) % 2) ? '#ff4466' : '#66aaff';
        ctx.beginPath();
        ctx.arc(sx + 16 + i * 28, cy - 18, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    drawConsole(200, groundY, 160);
    drawConsole(420, groundY, 140);

    // Helm / driver's seat pedestal (front-right)
    const helmX = SHIP_HELM_X - camX;
    const helmY = groundY;
    // raised dais
    ctx.fillStyle = '#2a3540';
    ctx.beginPath();
    ctx.ellipse(helmX, helmY - 2, 70, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a4854';
    ctx.beginPath();
    ctx.ellipse(helmX, helmY - 8, 58, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // control yoke console
    ctx.fillStyle = '#1a2830';
    ctx.fillRect(helmX - 50, helmY - 55, 100, 28);
    ctx.fillStyle = '#88ffcc';
    ctx.shadowColor = '#66ffaa';
    ctx.shadowBlur = 8;
    ctx.fillRect(helmX - 36, helmY - 48, 72, 8);
    ctx.shadowBlur = 0;
    // blinkenlights
    for (let i = 0; i < 6; i++) {
      const on = ((Math.floor(t / 120) + i) % 4) !== 3;
      ctx.fillStyle = on ? '#ffe088' : '#4a4030';
      ctx.beginPath();
      ctx.arc(helmX - 40 + i * 16, helmY - 58, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // driver's seat chair
    ctx.fillStyle = '#4a3040';
    ctx.fillRect(helmX - 16, helmY - 70, 32, 22);
    ctx.fillStyle = '#5a3850';
    ctx.fillRect(helmX - 18, helmY - 88, 36, 20);
    ctx.fillStyle = '#3a2030';
    ctx.fillRect(helmX - 22, helmY - 90, 8, 42);
    ctx.fillRect(helmX + 14, helmY - 90, 8, 42);
    // seat empty label when not taken
    if (!opts.seatTaken) {
      ctx.fillStyle = 'rgba(125,255,58,0.55)';
      ctx.font = 'bold 10px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("DRIVER'S SEAT", helmX, helmY - 98);
      ctx.textAlign = 'left';
    }

    // Aliens at the helm (still "flying")
    const yieldAmt = opts.alienYield != null ? opts.alienYield : 0;
    const seatTaken = !!opts.seatTaken;
    // left alien at side console
    drawClayAlien(ctx, 280 - camX, groundY, 1, t, { seed: 1, yield: 0 });
    // helm aliens — step aside when yielding / seat taken
    drawClayAlien(ctx, SHIP_HELM_X - 55 - camX, groundY, 1, t, {
      seed: 2,
      seated: !seatTaken && yieldAmt < 0.4,
      yield: -yieldAmt,
    });
    drawClayAlien(ctx, SHIP_HELM_X + 48 - camX, groundY, -1, t, {
      seed: 3,
      seated: false,
      yield: yieldAmt,
    });

    // Ambient green glow
    const glow = ctx.createRadialGradient(helmX, groundY - 40, 10, helmX, groundY - 40, 160);
    glow.addColorStop(0, 'rgba(80,255,160,' + (0.06 + Math.sin(t * 0.004) * 0.03) + ')');
    glow.addColorStop(1, 'rgba(80,255,160,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(helmX - 160, groundY - 160, 320, 200);

    // Operating / exam table (surgery Easter egg)
    if (opts.operate) {
      const tx = SHIP_TABLE_X - camX;
      const ty = groundY;
      // table base
      ctx.fillStyle = '#2a3844';
      ctx.fillRect(tx - 55, ty - 28, 110, 12);
      ctx.fillStyle = '#1a242c';
      ctx.fillRect(tx - 50, ty - 16, 8, 16);
      ctx.fillRect(tx + 42, ty - 16, 8, 16);
      // glowing slab
      const slabGlow = 0.35 + 0.15 * Math.sin(t * 0.006);
      ctx.fillStyle = 'rgba(100,255,180,' + slabGlow + ')';
      ctx.shadowColor = '#66ffaa';
      ctx.shadowBlur = 12;
      ctx.fillRect(tx - 52, ty - 36, 104, 10);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#3a4a58';
      ctx.fillRect(tx - 50, ty - 34, 100, 6);
      // beamed subject on table (simple citizen silhouette)
      if (!opts.surgeryDone) {
        ctx.fillStyle = '#ffcc88';
        ctx.beginPath();
        ctx.ellipse(tx - 10, ty - 48, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4a6a88';
        ctx.fillRect(tx - 28, ty - 42, 50, 10);
        // weird alien scanner arm
        ctx.strokeStyle = '#88ffcc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx + 40, ty - 70);
        ctx.quadraticCurveTo(tx + 10, ty - 90, tx - 10, ty - 55);
        ctx.stroke();
        ctx.fillStyle = 'rgba(100,255,200,0.5)';
        ctx.beginPath();
        ctx.arc(tx - 10, ty - 52, 6 + Math.sin(t * 0.01) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      // KFC / plastics props near table (gag foreshadow)
      ctx.fillStyle = '#c43a2a';
      ctx.fillRect(tx + 58, ty - 22, 14, 12);
      ctx.fillStyle = '#fff8e8';
      ctx.font = 'bold 6px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KFC', tx + 65, ty - 13);
      ctx.fillStyle = '#9ef0ff';
      ctx.fillRect(tx - 72, ty - 18, 8, 8);
      ctx.fillStyle = 'rgba(255,220,100,0.7)';
      ctx.font = 'bold 10px Segoe UI, sans-serif';
      ctx.fillText(opts.surgeryDone ? 'SUBJECT: PROCESSED' : 'OPERATING TABLE', tx, ty - 78);
      ctx.textAlign = 'left';
    }


    // Retrofit band tour — members hanging on the bridge after abduction bit
    if (opts.bandTour && typeof BAND_ROSTER !== 'undefined') {
      const talked = opts.bandTalked || {};
      for (let bi = 0; bi < BAND_ROSTER.length; bi++) {
        const bm = BAND_ROSTER[bi];
        const bx = bm.x - camX;
        // Same GO soft pipeline as Zakk/Tayler — costumed from band-grid refs
        drawBandMate(ctx, bx, groundY, bm.look, t, {
          seed: bi * 37,
          label: bm.id,
          noLabel: false,
        });
        ctx.fillStyle = talked[bm.id] ? 'rgba(125,255,58,0.45)' : 'rgba(255,220,100,0.7)';
        ctx.font = 'bold 8px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(talked[bm.id] ? '✓' : '▲', bx, groundY - 100);
        ctx.textAlign = 'left';
      }
    }

    // Caption
    ctx.fillStyle = 'rgba(200,230,210,0.55)';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      opts.bandTour
        ? 'Mothership lounge — Retrofit aboard · USE near bandmates'
        : opts.operate
        ? 'Mothership sickbay — "son of a bitch you recognize" protocol'
        : 'Mothership bridge — Chilliwack below · crew watching',
      w / 2,
      22
    );
    ctx.textAlign = 'left';
  }

  function drawYard(ctx, w, h, camX, t, landing, opts) {
    opts = opts || {};
    const groundY = h * 0.72;
    // Same Cheam sunset skyline as fly mode
    drawFlySkylineBackdrop(ctx, w, h, groundY, camX);

    // Yard grass — dusk-lit with wet specular sheen
    const grass = ctx.createLinearGradient(0, groundY, 0, h);
    grass.addColorStop(0, '#2a5a38');
    grass.addColorStop(0.45, '#1e4830');
    grass.addColorStop(1, '#142820');
    ctx.fillStyle = grass;
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = '#1a3a28';
    for (let x = -((camX | 0) % 16); x < w; x += 16) {
      ctx.fillRect(x, groundY, 3, 8);
    }
    // Magenta/cyan wet streaks
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 10; i++) {
      const sx = ((i * 97 + ((camX | 0) * 0.3)) % (w + 30)) - 15;
      const col = i % 2 ? 'rgba(255,60,200,0.12)' : 'rgba(60,200,255,0.1)';
      const g = ctx.createLinearGradient(sx, groundY, sx, h);
      g.addColorStop(0, col);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(sx, groundY, 2 + (i % 3), h - groundY);
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(255,100,60,0.1)';
    ctx.fillRect(0, groundY, w, h - groundY);

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
    // back-into-shed prompt marker
    ctx.fillStyle = '#7dff3a';
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('← SHED', sx + 34, groundY - 48);
    ctx.textAlign = 'left';

    // Driven-out El Camino Easter egg
    if (opts.showCamino) {
      drawElCamino(ctx, (opts.caminoX != null ? opts.caminoX : 420) - camX, groundY, t, {
        dusty: false,
        facingRight: !!opts.caminoFacingRight,
        wheelRot: opts.caminoWheelRot,
        drawDriver: opts.caminoDrawDriver,
        noLabel: !!opts.caminoNoLabel,
        scale: opts.caminoScale != null ? opts.caminoScale : 0.92,
      });
    }

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
      const yardLegs = landing.legExtend != null ? landing.legExtend : 1;
      drawClayUFO(ctx, landing.x - camX, landing.y, landing.scale || 2.28, t, landing.lights, {
        legExtend: yardLegs,
        showPilots: !!landing.showPilots,
      });
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
  /**
   * Retrofit bandmate — same soft GO pipeline as Zakk/Tayler (goHead / goArmLimb / goBoot),
   * costumed from band-grid refs. Distinct looks, shared art language (not citizen sticks).
   */
  function drawBandMate(ctx, x, y, look, t, opts) {
    opts = opts || {};
    // Same standing height as Zakk/Tayler (STANDING_HEIGHT via CHAR_SCALE)
    const scale = opts.scale != null ? opts.scale : CHAR_SCALE;
    const f = 1;
    const pose = goWalkPose(!!opts.moving, !!opts.seated, t + (opts.seed || 0));
    const skinHi = '#e8c4a4', skin = '#d4a882', skinLo = '#b07a58';
    const pantHi = '#2e2e36', pant = '#16161c', pantLo = '#08080c';

    // Costume kits from refs/band-grid-neon.jpeg
    const kits = {
      blazer: {
        sleeve: ['#9a7048', '#6a4a2a', '#3a2818'],
        torso: ['#8a5a32', '#6a4224', '#3a2814'],
        pant: ['#2a2a32', '#16161c', '#08080c'],
        boot: ['#3a2a20', '#1a1210', '#080606'],
        hair: 'sandy', face: 'mustache', hat: 'none', glasses: 'goldAvi',
        shirt: 'cream',
      },
      graphic: {
        sleeve: ['#2a2a30', '#141418', '#060608'],
        torso: ['#1a1a1e', '#101014', '#050508'],
        pant: ['#222228', '#141418', '#08080c'],
        boot: ['#2a2a30', '#141418', '#050506'],
        hair: 'beard', face: 'beard', hat: 'blackCap', glasses: 'rect',
        shirt: 'hk',
      },
      denim: {
        sleeve: ['#4a6a8a', '#2a4a6a', '#1a3048'],
        torso: ['#3a5a7a', '#2a4a6a', '#1a3048'],
        pant: ['#2a3a4a', '#1a2838', '#0e1620'],
        boot: ['#2a2a30', '#141418', '#050506'],
        hair: 'shortDark', face: 'clean', hat: 'none', glasses: 'darkAvi',
        shirt: 'whiteTee',
      },
      raglan: {
        sleeve: ['#2a8a3a', '#1a6a28', '#0e4018'],
        torso: ['#f0f0ec', '#d8d8d0', '#b0b0a8'],
        pant: ['#2a2a32', '#16161c', '#08080c'],
        boot: ['#3a2a20', '#1a1210', '#080606'],
        hair: 'curly', face: 'stubble', hat: 'none', glasses: 'darkAvi',
        shirt: 'raglan',
      },
      western: {
        sleeve: ['#2a2a32', '#141418', '#060608'],
        torso: ['#1a1a22', '#101014', '#050508'],
        pant: ['#2e2e36', '#16161c', '#08080c'],
        boot: ['#2a2a30', '#141418', '#050506'],
        hair: 'mustache', face: 'mustache', hat: 'flatCap', glasses: 'darkAvi',
        shirt: 'western',
      },
      plaid: {
        sleeve: ['#4a6a88', '#3a5a78', '#2a4058'],
        torso: ['#3a5a78', '#2a4a68', '#1a3048'],
        pant: ['#4a6288', '#2a3a5a', '#1a2838'],
        boot: ['#6a3a20', '#5a2e18', '#3a1a10'],
        hair: 'stubble', face: 'stubble', hat: 'backCap', glasses: 'darkAvi',
        shirt: 'plaid',
      },
    };
    const kit = kits[look] || kits.denim;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(f * scale, scale);

    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(2, 0, 14, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = pose.bob;
    const lean = pose.lean * 0.5;
    const sway = pose.sway * 0.5;
    const hipY = -27 - bob;
    const hipX = lean * 0.3;
    const bodyCy = -41 - bob;
    const bodyCx = lean * 0.4;

    // FAR LEG
    {
      const end = goJointLimb(ctx, hipX - 3.2, hipY, pose.fThigh, pose.fThigh - pose.fKnee, 13.5, 12.5, 3.4, 2.9,
        kit.pant, [kit.pant[1], kit.pant[2], '#040406']);
      goBoot(ctx, end.ex, Math.min(end.ey, 0), end.ex + 6, kit.boot, '#555');
    }
    // FAR ARM
    {
      goArmLimb(ctx, bodyCx - 9, bodyCy - 10, 0.15 + pose.fArm, 0.15 + pose.fArm + pose.fElbow,
        11, 8.0, 2.8, 2.3, kit.sleeve, [skinHi, skin, skinLo]);
    }

    // TORSO
    if (kit.shirt === 'plaid') {
      const tw = 18, th = 22, rad = 7;
      const tx = bodyCx - tw / 2, ty = bodyCy - th / 2;
      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(tx, ty, tw, th, rad);
      else ctx.rect(tx, ty, tw, th);
      ctx.clip();
      ctx.fillStyle = '#3a5a78';
      ctx.fillRect(tx, ty, tw, th);
      ctx.strokeStyle = 'rgba(230,200,60,0.75)';
      ctx.lineWidth = 1.1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(tx, ty + 3 + i * 5); ctx.lineTo(tx + tw, ty + 3 + i * 5); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(230,240,255,0.5)';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(tx + 2 + i * 5, ty); ctx.lineTo(tx + 2 + i * 5, ty + th); ctx.stroke();
      }
      ctx.restore();
    } else if (kit.shirt === 'raglan') {
      goTorso(ctx, bodyCx, bodyCy, 18, 22, 7, '#f4f4f0', '#e0e0d8', '#c0c0b8');
      // green sleeves already on arms; chest graphic hint
      ctx.fillStyle = 'rgba(200,80,80,0.45)';
      ctx.beginPath();
      ctx.ellipse(bodyCx, bodyCy - 2, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // necklace
      ctx.strokeStyle = 'rgba(200,180,100,0.7)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(bodyCx, bodyCy - 6, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.fillStyle = '#c4a35a';
      ctx.beginPath();
      ctx.arc(bodyCx, bodyCy + 1, 1.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (kit.shirt === 'hk') {
      goTorso(ctx, bodyCx, bodyCy, 18, 22, 7, '#2a2a30', '#141418', '#060608');
      ctx.fillStyle = '#ff8ab8';
      ctx.beginPath();
      ctx.arc(bodyCx, bodyCy - 4, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff9944';
      ctx.beginPath();
      ctx.moveTo(bodyCx - 5, bodyCy - 2); ctx.lineTo(bodyCx - 3, bodyCy + 4); ctx.lineTo(bodyCx - 1, bodyCy - 1);
      ctx.moveTo(bodyCx + 5, bodyCy - 2); ctx.lineTo(bodyCx + 3, bodyCy + 4); ctx.lineTo(bodyCx + 1, bodyCy - 1);
      ctx.fill();
      ctx.fillStyle = '#eee';
      ctx.font = 'bold 4px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HK', bodyCx, bodyCy + 6);
      ctx.textAlign = 'left';
    } else if (kit.shirt === 'western') {
      goTorso(ctx, bodyCx, bodyCy, 18, 22, 7, '#2a2a32', '#141418', '#050508');
      const tg = ctx.createLinearGradient(bodyCx, bodyCy - 10, bodyCx, bodyCy + 10);
      tg.addColorStop(0, '#2ec4a0');
      tg.addColorStop(0.5, '#1a8a7a');
      tg.addColorStop(1, '#c4a35a');
      ctx.fillStyle = tg;
      ctx.fillRect(bodyCx - 1.2, bodyCy - 8, 2.4, 16);
      // pocket embroidery hints
      ctx.strokeStyle = 'rgba(200,180,100,0.45)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(bodyCx - 7, bodyCy - 2, 4, 3.5);
      ctx.strokeRect(bodyCx + 3, bodyCy - 2, 4, 3.5);
    } else if (kit.shirt === 'cream') {
      goTorso(ctx, bodyCx, bodyCy, 18, 22, 7, kit.torso[0], kit.torso[1], kit.torso[2]);
      ctx.fillStyle = '#e8d8b8';
      ctx.beginPath();
      ctx.moveTo(bodyCx - 3, bodyCy - 11);
      ctx.lineTo(bodyCx, bodyCy + 6);
      ctx.lineTo(bodyCx + 3, bodyCy - 11);
      ctx.closePath();
      ctx.fill();
    } else if (kit.shirt === 'whiteTee') {
      goTorso(ctx, bodyCx, bodyCy, 18, 22, 7, kit.torso[0], kit.torso[1], kit.torso[2]);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(bodyCx - 4, bodyCy - 6, 8, 12);
    } else {
      goTorso(ctx, bodyCx, bodyCy, 18, 22, 7, kit.torso[0], kit.torso[1], kit.torso[2]);
    }

    goTorso(ctx, hipX, hipY - 2, 15, 9, 4.5, kit.pant[0], kit.pant[1], kit.pant[2]);

    // NEAR LEG
    {
      const end = goJointLimb(ctx, hipX + 3.2, hipY, pose.nThigh, pose.nThigh - pose.nKnee, 13.5, 12.5, 3.5, 3.0,
        kit.pant, kit.pant);
      goBoot(ctx, end.ex, Math.min(end.ey, 0), end.ex + 6, kit.boot, '#666');
    }
    // NEAR ARM
    {
      goArmLimb(ctx, bodyCx + 9, bodyCy - 10, 0.1 + pose.nArm, 0.1 + pose.nArm + pose.nElbow,
        10.5, 8.0, 2.9, 2.35, kit.sleeve, [skinHi, skin, skinLo]);
    }

    // neck + head
    goCapsule(ctx, bodyCx + 1.5, bodyCy - 10, bodyCx + 1.5, bodyCy - 16, 3.2, skinHi, skin, skinLo);
    const hx = bodyCx + 2.2;
    const hy = -60 - bob;
    ctx.fillStyle = skinLo;
    ctx.beginPath();
    ctx.ellipse(hx - 9.2, hy + 1, 2.4, 3.0, -0.2, 0, Math.PI * 2);
    ctx.fill();
    goHead(ctx, hx, hy, 9.4, 10.8, skinHi, skin, skinLo);

    // nose
    ctx.fillStyle = skinLo;
    ctx.beginPath();
    ctx.moveTo(hx + 5, hy);
    ctx.quadraticCurveTo(hx + 11.5, hy + 2.2, hx + 5.2, hy + 5);
    ctx.closePath();
    ctx.fill();

    if (kit.face === 'mustache') {
      ctx.fillStyle = '#1a1210';
      ctx.beginPath();
      ctx.ellipse(hx - 1.2, hy + 6.0, 4.4, 2.0, -0.35, 0, Math.PI * 2);
      ctx.ellipse(hx + 5.8, hy + 6.5, 5.2, 2.3, 0.32, 0, Math.PI * 2);
      ctx.fill();
    } else if (kit.face === 'beard') {
      ctx.fillStyle = '#2a1a16';
      ctx.beginPath();
      ctx.ellipse(hx + 1, hy + 8.5, 7.5, 5.5, 0.05, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#1a1210';
      ctx.beginPath();
      ctx.ellipse(hx + 1, hy + 5.8, 5.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (kit.face === 'stubble') {
      ctx.fillStyle = 'rgba(60,40,30,0.4)';
      ctx.beginPath();
      ctx.ellipse(hx + 1.2, hy + 6.8, 7.0, 4.2, 0.08, 0, Math.PI);
      ctx.fill();
    }

    if (kit.glasses === 'goldAvi') {
      goAviator(ctx, hx, hy - 0.6);
      // gold tint hint
      ctx.strokeStyle = 'rgba(220,180,60,0.55)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.ellipse(hx - 3.0, hy - 0.6, 3.2, 2.6, -0.22, 0, Math.PI * 2);
      ctx.ellipse(hx + 5.4, hy - 0.6, 4.6, 3.0, 0.1, 0, Math.PI * 2);
      ctx.stroke();
    } else if (kit.glasses === 'rect') {
      ctx.fillStyle = 'rgba(30,40,55,0.35)';
      ctx.fillRect(hx - 6.2, hy - 2.2, 5.2, 3.8);
      ctx.fillRect(hx + 1.5, hy - 2.2, 5.6, 3.8);
      ctx.strokeStyle = '#1a1a1e';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(hx - 6.2, hy - 2.2, 5.2, 3.8);
      ctx.strokeRect(hx + 1.5, hy - 2.2, 5.6, 3.8);
      ctx.beginPath();
      ctx.moveTo(hx - 1.0, hy - 0.2);
      ctx.lineTo(hx + 1.5, hy - 0.2);
      ctx.stroke();
    } else {
      goAviator(ctx, hx, hy - 0.6);
    }

    // hair / hats
    if (kit.hat === 'flatCap') {
      const capY = hy - 8.0;
      const capG = ctx.createLinearGradient(hx - 10, capY - 6, hx + 14, capY + 4);
      capG.addColorStop(0, '#3a2a1c');
      capG.addColorStop(0.4, '#7a6a54');
      capG.addColorStop(1, '#4a3a2a');
      ctx.fillStyle = capG;
      ctx.beginPath();
      ctx.ellipse(hx + 1.2, capY, 11.0, 5.6, 0.06, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#5a4a38';
      ctx.beginPath();
      ctx.ellipse(hx + 10, capY + 2.4, 9.2, 3.0, 0.14, 0, Math.PI * 2);
      ctx.fill();
    } else if (kit.hat === 'backCap') {
      const capY = hy - 8.0;
      const capG = ctx.createLinearGradient(hx - 14, capY - 5, hx + 10, capY + 4);
      capG.addColorStop(0, '#4a1028');
      capG.addColorStop(0.45, '#7a2848');
      capG.addColorStop(1, '#3a0c1c');
      ctx.fillStyle = capG;
      ctx.beginPath();
      ctx.ellipse(hx, capY, 11.2, 5.4, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#5a1830';
      ctx.beginPath();
      ctx.ellipse(hx - 11.2, capY + 2.4, 10.0, 3.2, -0.22, 0, Math.PI * 2);
      ctx.fill();
    } else if (kit.hat === 'blackCap') {
      const capY = hy - 8.2;
      ctx.fillStyle = '#1a1a1e';
      ctx.beginPath();
      ctx.ellipse(hx, capY, 10.5, 5.2, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#2a2a30';
      ctx.beginPath();
      ctx.ellipse(hx + 9, capY + 2.2, 8.5, 2.8, 0.12, 0, Math.PI * 2);
      ctx.fill();
    } else if (kit.hair === 'sandy') {
      ctx.fillStyle = '#c4a070';
      ctx.beginPath();
      ctx.ellipse(hx - 1, hy - 7, 9.5, 5.5, 0, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(hx - 8, hy - 2, 3.5, 6, -0.3, 0, Math.PI * 2);
      ctx.ellipse(hx + 8, hy - 1, 3.8, 7, 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else if (kit.hair === 'curly') {
      ctx.fillStyle = '#2a1a14';
      for (let i = 0; i < 7; i++) {
        const a = -0.2 + i * 0.35;
        ctx.beginPath();
        ctx.arc(hx + Math.sin(a) * 8, hy - 6 + Math.cos(a) * 2, 3.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.ellipse(hx - 9, hy + 2, 3.5, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(hx + 9, hy + 3, 3.8, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (kit.hair === 'shortDark') {
      ctx.fillStyle = '#1a1210';
      ctx.beginPath();
      ctx.ellipse(hx, hy - 7.5, 9.2, 4.5, 0, Math.PI, 0);
      ctx.fill();
    }

    ctx.restore();

    if (!opts.noLabel && opts.label) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.font = 'bold 9px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.label, x, y + 12);
      ctx.textAlign = 'left';
    }
  }

  function drawCitizen(ctx, x, y, look, t, opts) {
    opts = opts || {};
    const localH = 62; // feet→crown in citizen local units
    const s = opts.scale != null ? opts.scale : (STANDING_HEIGHT / localH);
    const moving = !!opts.moving;
    const pose = goWalkPose(moving, false, t || 0);
    const bob = pose.bob;
    const sway = pose.sway;
    const lean = pose.lean;
    const skinHi = '#e8c4a4', skin = '#d4a882', skinLo = '#a07858';

    // Look kits — richer cel-shade palettes (neon trading-card language)
    const kits = {
      blazer: {
        torso: ['#a07048', '#6a4a2a', '#3a2818'],
        pant: ['#2a2a36', '#16161e', '#0a0a10'],
        sleeve: ['#9a7048', '#6a4a2a', '#3a2818'],
        hair: '#6a4a2a', shirt: 'cream', hat: 'fedora', glasses: 'gold',
      },
      graphic: {
        torso: ['#2a2a32', '#141418', '#060608'],
        pant: ['#222228', '#141418', '#08080c'],
        sleeve: ['#2a2a30', '#141418', '#060608'],
        hair: '#1a1210', shirt: 'hk', hat: 'cap', glasses: 'rect',
      },
      denim: {
        torso: ['#4a7aaa', '#2a4a6a', '#1a3048'],
        pant: ['#2a3a4a', '#1a2838', '#0e1620'],
        sleeve: ['#4a6a8a', '#2a4a6a', '#1a3048'],
        hair: '#2a1a14', shirt: 'tee', hat: 'none', glasses: 'avi',
      },
      raglan: {
        torso: ['#f4f4f0', '#d8d8d0', '#b0b0a8'],
        pant: ['#2a2a32', '#16161c', '#08080c'],
        sleeve: ['#2a8a3a', '#1a6a28', '#0e4018'],
        hair: '#1a1210', shirt: 'raglan', hat: 'none', glasses: 'avi',
      },
      western: {
        torso: ['#1a1a22', '#101014', '#050508'],
        pant: ['#2e2e36', '#16161c', '#08080c'],
        sleeve: ['#2a2a32', '#141418', '#060608'],
        hair: '#1a1210', shirt: 'western', hat: 'flat', glasses: 'avi',
      },
      plaid: {
        torso: ['#6a3a2a', '#4a2818', '#2a1810'],
        pant: ['#2a2a36', '#16161e', '#0a0a10'],
        sleeve: ['#6a3a2a', '#4a2818', '#2a1810'],
        hair: '#8a2040', shirt: 'plaid', hat: 'beanie', glasses: 'avi',
      },
    };
    const kit = kits[look] || kits.denim;

    ctx.save();
    ctx.translate(x + sway * 0.15 + lean * 0.08, y);
    ctx.scale(s, s);

    // Soft contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.34)';
    ctx.beginPath();
    ctx.ellipse(1, 1, 12, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Magenta / cyan rim light (trading-card)
    ctx.strokeStyle = 'rgba(255,60,200,0.32)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-12, -48 - bob);
    ctx.quadraticCurveTo(-14.5, -30 - bob, -11, -6);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(60,210,255,0.26)';
    ctx.beginPath();
    ctx.moveTo(12, -48 - bob);
    ctx.quadraticCurveTo(14.5, -30 - bob, 11, -6);
    ctx.stroke();

    // Legs — cel-shade pants + walk stride
    function pantGrad() {
      const g = ctx.createLinearGradient(-8, -24, 8, -2);
      g.addColorStop(0, kit.pant[0]);
      g.addColorStop(0.45, kit.pant[1]);
      g.addColorStop(1, kit.pant[2]);
      return g;
    }
    ctx.fillStyle = pantGrad();
    ctx.save();
    ctx.translate(-4.8, -22 - bob * 0.35);
    ctx.rotate(pose.fThigh * 0.55);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-3.8, 0, 7.6, 19, 2);
    else ctx.rect(-3.8, 0, 7.6, 19);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(4.8, -22 - bob * 0.35);
    ctx.rotate(pose.nThigh * 0.55);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-3.8, 0, 7.6, 19, 2);
    else ctx.rect(-3.8, 0, 7.6, 19);
    ctx.fill();
    ctx.restore();
    // Boots
    ctx.fillStyle = '#0e0e14';
    ctx.beginPath();
    ctx.ellipse(-5 + pose.nThigh * 2, -2.5, 5.2, 2.6, 0, 0, Math.PI * 2);
    ctx.ellipse(5 - pose.nThigh * 2, -2.5, 5.2, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, -bob);

    // Arms (opposite swing when walking)
    function arm(side, ang) {
      ctx.save();
      ctx.translate(side * 12, -38);
      ctx.rotate(ang);
      const ag = ctx.createLinearGradient(0, 0, 0, 16);
      ag.addColorStop(0, kit.sleeve[0]);
      ag.addColorStop(0.55, kit.sleeve[1]);
      ag.addColorStop(1, kit.sleeve[2]);
      ctx.fillStyle = ag;
      ctx.fillRect(-2.6, 0, 5.2, 12);
      // hand
      const hg = ctx.createRadialGradient(0, 13, 0.5, 0, 14, 3);
      hg.addColorStop(0, skinHi);
      hg.addColorStop(1, skinLo);
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(0, 14, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    arm(-1, pose.fArm * 0.6);
    arm(1, pose.nArm * 0.6);

    // Torso — rounded cel body
    const tw = 20, th = 24;
    const tg = ctx.createLinearGradient(-tw / 2, -46, tw / 2, -20);
    tg.addColorStop(0, kit.torso[0]);
    tg.addColorStop(0.5, kit.torso[1]);
    tg.addColorStop(1, kit.torso[2]);
    ctx.fillStyle = tg;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-tw / 2, -46, tw, th, 6);
    else ctx.rect(-tw / 2, -46, tw, th);
    ctx.fill();
    // Specular stripe
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(-tw / 2 + 2, -44, 3, th - 4);

    if (kit.shirt === 'cream') {
      ctx.fillStyle = '#e8d8b8';
      ctx.beginPath();
      ctx.moveTo(-3.5, -44);
      ctx.lineTo(0, -24);
      ctx.lineTo(3.5, -44);
      ctx.closePath();
      ctx.fill();
    } else if (kit.shirt === 'hk') {
      ctx.fillStyle = '#ff8ab8';
      ctx.beginPath();
      ctx.arc(0, -36, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#eee';
      ctx.font = 'bold 5px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HK', 0, -28);
      ctx.textAlign = 'left';
    } else if (kit.shirt === 'tee') {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(-4, -40, 8, 12);
    } else if (kit.shirt === 'raglan') {
      ctx.strokeStyle = '#c4a35a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.lineTo(0, -30);
      ctx.stroke();
    } else if (kit.shirt === 'western') {
      const stripe = ctx.createLinearGradient(0, -44, 0, -24);
      stripe.addColorStop(0, '#2ec4a0');
      stripe.addColorStop(1, '#c4a35a');
      ctx.fillStyle = stripe;
      ctx.fillRect(-1.4, -42, 2.8, 16);
    } else if (kit.shirt === 'plaid') {
      ctx.fillStyle = '#c45a4a';
      ctx.fillRect(-7, -40, 5, 7);
      ctx.fillRect(2, -40, 5, 7);
      ctx.fillStyle = '#2a4a6a';
      ctx.fillRect(-7, -32, 14, 7);
    }

    // Head — soft cel sphere
    const hg = ctx.createRadialGradient(-2.5, -56, 1, 0, -54, 10);
    hg.addColorStop(0, skinHi);
    hg.addColorStop(0.55, skin);
    hg.addColorStop(1, skinLo);
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(0, -54, 8.4, 0, Math.PI * 2);
    ctx.fill();
    // Magenta cheek rim
    ctx.strokeStyle = 'rgba(255,60,180,0.25)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(-3, -52, 7, 0.6, 2.2);
    ctx.stroke();

    // Hair / hat
    ctx.fillStyle = kit.hair;
    if (kit.hat === 'fedora') {
      ctx.beginPath();
      ctx.ellipse(0, -58, 9.5, 7, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-9.5, -58, 3, 12);
      ctx.fillRect(6.5, -58, 3, 12);
      ctx.fillStyle = '#4a3020';
      ctx.fillRect(-4.5, -50.5, 9, 2);
    } else if (kit.hat === 'cap') {
      ctx.beginPath();
      ctx.ellipse(0, -62, 8.5, 4.2, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-8.5, -62, 17, 4);
      ctx.fillStyle = '#2a1a16';
      ctx.fillRect(-5, -51, 10, 2.5);
    } else if (kit.hat === 'flat') {
      ctx.beginPath();
      ctx.ellipse(0, -62, 9.5, 5, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-9.5, -62, 19, 3);
    } else if (kit.hat === 'beanie') {
      ctx.beginPath();
      ctx.ellipse(0, -61, 8.5, 5.5, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(4, -60, 8, 3);
    } else {
      ctx.beginPath();
      ctx.ellipse(0, -60, 8.5, 5.2, 0, Math.PI, 0);
      ctx.fill();
    }

    // Glasses
    if (kit.glasses === 'avi' || kit.glasses === 'gold') {
      ctx.fillStyle = 'rgba(20,30,50,0.55)';
      ctx.beginPath();
      ctx.ellipse(-3.6, -55, 3.5, 2.7, -0.12, 0, Math.PI * 2);
      ctx.ellipse(3.6, -55, 3.5, 2.7, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = kit.glasses === 'gold' ? '#c9a227' : 'rgba(210,215,225,0.9)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(-3.6, -55, 3.5, 2.7, -0.12, 0, Math.PI * 2);
      ctx.ellipse(3.6, -55, 3.5, 2.7, 0.12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-0.5, -55);
      ctx.lineTo(0.5, -55);
      ctx.stroke();
    } else if (kit.glasses === 'rect') {
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-6.2, -57, 5, 3.4);
      ctx.strokeRect(1.2, -57, 5, 3.4);
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


  function drawLandmarkLabel(ctx, x, y, text) {
    if (!text) return;
    ctx.save();
    ctx.font = 'bold 8px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    const tw = Math.max(52, ctx.measureText(text).width + 10);
    ctx.fillRect(x - tw / 2, y - 9, tw, 12);
    ctx.fillStyle = '#ffe8a0';
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
    ctx.restore();
  }

  /** Millennium Clock Tower — tall slender downtown tower with clock faces */
  function drawClockTower(ctx, x, groundY, label) {
    const baseW = 28;
    const cx = x + baseW / 2;
    // aged limestone shaft
    ctx.fillStyle = '#b8a888';
    ctx.fillRect(x + 6, groundY - 118, 16, 118);
    // slightly wider mid section
    ctx.fillStyle = '#a89878';
    ctx.fillRect(x + 3, groundY - 78, 22, 28);
    // clock face block
    ctx.fillStyle = '#c8b898';
    ctx.fillRect(x, groundY - 108, 28, 26);
    // clock faces (N/S readable)
    ctx.fillStyle = '#fff8e8';
    ctx.beginPath();
    ctx.arc(cx, groundY - 95, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a4030';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = '#2a2010';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, groundY - 95);
    ctx.lineTo(cx + 5, groundY - 98);
    ctx.moveTo(cx, groundY - 95);
    ctx.lineTo(cx - 1, groundY - 88);
    ctx.stroke();
    // peaked roof / cupola
    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.moveTo(x - 2, groundY - 118);
    ctx.lineTo(cx, groundY - 138);
    ctx.lineTo(x + baseW + 2, groundY - 118);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6a4830';
    ctx.fillRect(cx - 2, groundY - 142, 4, 8);
    // door
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(cx - 5, groundY - 18, 10, 18);
    // coloured pigeon flock (public art) on ledge
    const pcols = ['#c04050', '#3a88c0', '#d4a020'];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = pcols[i];
      ctx.beginPath();
      ctx.ellipse(cx - 8 + i * 7, groundY - 110, 3.2, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    drawLandmarkLabel(ctx, cx, groundY + 14, label || 'CLOCK TOWER');
  }

  /** Chilliwack Museum — former City Hall Beaux-Arts: white, pediment, columns, twin stairs */
  function drawMuseum(ctx, x, groundY, label) {
    const w = 92;
    const cx = x + w / 2;
    // twin stairs
    ctx.fillStyle = '#d0d0d0';
    ctx.fillRect(x + 8, groundY - 14, 28, 14);
    ctx.fillRect(x + 56, groundY - 14, 28, 14);
    ctx.fillStyle = '#b8b8b8';
    ctx.fillRect(x + 14, groundY - 20, 22, 6);
    ctx.fillRect(x + 56, groundY - 20, 22, 6);
    // Beaux-Arts cream body
    ctx.fillStyle = '#ebe6d8';
    ctx.fillRect(x, groundY - 72, w, 52);
    // columns
    ctx.fillStyle = '#e8e4d8';
    for (let i = 0; i < 4; i++) {
      const cxCol = x + 14 + i * 20;
      ctx.fillRect(cxCol, groundY - 68, 6, 36);
      ctx.fillStyle = '#f8f6f0';
      ctx.beginPath();
      ctx.arc(cxCol + 3, groundY - 70, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8e4d8';
    }
    // pediment
    ctx.fillStyle = '#ebe6da';
    ctx.beginPath();
    ctx.moveTo(x - 4, groundY - 72);
    ctx.lineTo(cx, groundY - 96);
    ctx.lineTo(x + w + 4, groundY - 72);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c8c0b0';
    ctx.lineWidth = 1;
    ctx.stroke();
    // center door + windows
    ctx.fillStyle = '#3a4a5a';
    ctx.fillRect(cx - 7, groundY - 36, 14, 16);
    ctx.fillStyle = '#7ec8ff';
    ctx.fillRect(x + 10, groundY - 56, 12, 10);
    ctx.fillRect(x + w - 22, groundY - 56, 12, 10);
    drawLandmarkLabel(ctx, cx, groundY + 14, label || 'MUSEUM');
  }

  /** Vedder Bridge — span over water */
  function drawVedderBridge(ctx, x, groundY, label) {
    const w = 140;
    const cx = x + w / 2;
    // dusk water under span
    ctx.fillStyle = '#2a6a98';
    ctx.fillRect(x + 10, groundY - 6, w - 20, 14);
    ctx.fillStyle = 'rgba(200,160,100,0.25)';
    ctx.fillRect(x + 18, groundY - 2, 20, 3);
    ctx.fillRect(x + 70, groundY + 2, 28, 3);
    // deck
    ctx.fillStyle = '#6a6a70';
    ctx.fillRect(x, groundY - 22, w, 10);
    ctx.fillStyle = '#8a8a90';
    ctx.fillRect(x, groundY - 24, w, 3);
    // rail
    ctx.strokeStyle = '#444850';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, groundY - 30);
    ctx.lineTo(x + w, groundY - 30);
    ctx.stroke();
    for (let i = 0; i <= 10; i++) {
      ctx.fillStyle = '#505058';
      ctx.fillRect(x + i * 14, groundY - 30, 2, 8);
    }
    // piers
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(x + 18, groundY - 14, 10, 18);
    ctx.fillRect(x + w - 28, groundY - 14, 10, 18);
    // simple arch suggestion
    ctx.strokeStyle = '#707078';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 28, groundY - 14);
    ctx.quadraticCurveTo(cx, groundY - 42, x + w - 28, groundY - 14);
    ctx.stroke();
    drawLandmarkLabel(ctx, cx, groundY + 18, label || 'VEDDER BRIDGE');
  }

  /** Royal Hotel — brick downtown hotel block with sign */
  function drawRoyalHotel(ctx, x, groundY, label) {
    const w = 78;
    const cx = x + w / 2;
    ctx.fillStyle = '#7a3a38';
    ctx.fillRect(x, groundY - 88, w, 88);
    ctx.fillStyle = '#5a2828';
    ctx.fillRect(x - 2, groundY - 96, w + 4, 10);
    // windows grid
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = r % 2 === 0 ? '#ffe88a' : '#7ec8ff';
        ctx.fillRect(x + 8 + c * 17, groundY - 82 + r * 16, 10, 10);
      }
    }
    // canopy / entrance
    ctx.fillStyle = '#2a2010';
    ctx.fillRect(cx - 10, groundY - 28, 20, 28);
    ctx.fillStyle = '#c03030';
    ctx.fillRect(x + 6, groundY - 34, w - 12, 8);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ROYAL', cx, groundY - 27);
    ctx.textAlign = 'left';
    drawLandmarkLabel(ctx, cx, groundY + 14, label || 'ROYAL HOTEL');
  }

  /** Historic Fire Hall — red brick with hose tower */
  function drawFireHall(ctx, x, groundY, label) {
    const w = 70;
    const cx = x + w / 2;
    ctx.fillStyle = '#8a3830';
    ctx.fillRect(x, groundY - 58, w, 58);
    // hose / bell tower
    ctx.fillStyle = '#6a2824';
    ctx.fillRect(x + w - 22, groundY - 96, 18, 96);
    ctx.fillStyle = '#4a2020';
    ctx.beginPath();
    ctx.moveTo(x + w - 24, groundY - 96);
    ctx.lineTo(x + w - 13, groundY - 112);
    ctx.lineTo(x + w - 2, groundY - 96);
    ctx.closePath();
    ctx.fill();
    // bay doors
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(x + 6, groundY - 32, 22, 32);
    ctx.fillRect(x + 32, groundY - 32, 22, 32);
    ctx.strokeStyle = '#c4a35a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 6, groundY - 32, 22, 32);
    ctx.strokeRect(x + 32, groundY - 32, 22, 32);
    // windows
    ctx.fillStyle = '#ffe88a';
    ctx.fillRect(x + 10, groundY - 50, 12, 10);
    ctx.fillRect(x + 36, groundY - 50, 12, 10);
    drawLandmarkLabel(ctx, cx, groundY + 14, label || 'FIRE HALL');
  }

  /** Paramount / Imperial theatre silhouette — marquee + tall facade */
  function drawTheatre(ctx, x, groundY, label) {
    const w = 84;
    const cx = x + w / 2;
    // Streamline Moderne facade
    ctx.fillStyle = '#3a3048';
    ctx.fillRect(x, groundY - 100, w, 100);
    // stepped top
    ctx.fillStyle = '#2a2038';
    ctx.fillRect(x + 12, groundY - 112, w - 24, 12);
    ctx.fillRect(x + 24, groundY - 122, w - 48, 10);
    // marquee
    ctx.fillStyle = '#c4a030';
    ctx.fillRect(x - 6, groundY - 58, w + 12, 16);
    ctx.fillStyle = '#1a1828';
    ctx.fillRect(x - 2, groundY - 54, w + 4, 10);
    ctx.fillStyle = '#ffe8a0';
    ctx.font = 'bold 8px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PARAMOUNT', cx, groundY - 46);
    // ticket doors
    ctx.fillStyle = '#5a4060';
    ctx.fillRect(cx - 14, groundY - 28, 28, 28);
    ctx.fillStyle = '#7ec8ff';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x + 10 + i * 24, groundY - 88, 14, 18);
    }
    // marquee bulbs
    ctx.fillStyle = '#fff6c0';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc(x - 2 + i * 8, groundY - 58, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textAlign = 'left';
    drawLandmarkLabel(ctx, cx, groundY + 14, label || 'PARAMOUNT');
  }

  /** Sassy Saloon — neon dusk facade, warm windows, porch */
  function drawSassySaloon(ctx, x, groundY, label) {
    const w = 96;
    const cx = x + w / 2;
    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(cx, groundY + 2, 48, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Porch platform
    const porchG = ctx.createLinearGradient(x - 8, groundY - 14, x + w + 8, groundY);
    porchG.addColorStop(0, '#3a2818');
    porchG.addColorStop(0.5, '#5a4030');
    porchG.addColorStop(1, '#2a1a10');
    ctx.fillStyle = porchG;
    ctx.fillRect(x - 8, groundY - 14, w + 16, 14);
    // Porch posts
    for (const px of [x - 2, x + w - 4]) {
      const pg = ctx.createLinearGradient(px, 0, px + 6, 0);
      pg.addColorStop(0, '#2a1a10');
      pg.addColorStop(0.4, '#8a6840');
      pg.addColorStop(1, '#3a2818');
      ctx.fillStyle = pg;
      ctx.fillRect(px, groundY - 78, 6, 64);
    }
    // Facade body — dusty wood with neon rim
    const body = ctx.createLinearGradient(x, groundY - 88, x + w, groundY);
    body.addColorStop(0, '#4a3028');
    body.addColorStop(0.35, '#6a4838');
    body.addColorStop(0.7, '#3a241c');
    body.addColorStop(1, '#2a1814');
    ctx.fillStyle = body;
    ctx.fillRect(x, groundY - 88, w, 74);
    // Magenta left / cyan right rim
    ctx.strokeStyle = 'rgba(255,40,180,0.45)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x + 1, groundY - 86);
    ctx.lineTo(x + 1, groundY - 16);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(60,220,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(x + w - 1, groundY - 86);
    ctx.lineTo(x + w - 1, groundY - 16);
    ctx.stroke();
    // False-front top board
    ctx.fillStyle = '#2a1a14';
    ctx.fillRect(x - 4, groundY - 108, w + 8, 22);
    // Neon SASSY SALOON sign
    const signG = ctx.createLinearGradient(x + 6, groundY - 106, x + w - 6, groundY - 88);
    signG.addColorStop(0, '#1a0820');
    signG.addColorStop(0.5, '#2a1030');
    signG.addColorStop(1, '#0a1828');
    ctx.fillStyle = signG;
    ctx.fillRect(x + 6, groundY - 104, w - 12, 16);
    ctx.strokeStyle = 'rgba(255,60,180,0.85)';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(x + 6.5, groundY - 103.5, w - 13, 15);
    ctx.fillStyle = '#ff6ec8';
    ctx.font = 'bold 9px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255,40,180,0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText('SASSY SALOON', cx, groundY - 93);
    ctx.shadowBlur = 0;
    // Warm glowing windows
    for (let i = 0; i < 3; i++) {
      const wx = x + 10 + i * 28;
      const wg = ctx.createRadialGradient(wx + 10, groundY - 55, 2, wx + 10, groundY - 52, 16);
      wg.addColorStop(0, '#ffe8a0');
      wg.addColorStop(0.5, '#e8a040');
      wg.addColorStop(1, '#6a4020');
      ctx.fillStyle = wg;
      ctx.fillRect(wx, groundY - 68, 20, 22);
      ctx.strokeStyle = 'rgba(255,200,120,0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(wx, groundY - 68, 20, 22);
      // mullion
      ctx.beginPath();
      ctx.moveTo(wx + 10, groundY - 68);
      ctx.lineTo(wx + 10, groundY - 46);
      ctx.stroke();
    }
    // Batwing doors
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(cx - 14, groundY - 42, 12, 28);
    ctx.fillRect(cx + 2, groundY - 42, 12, 28);
    ctx.strokeStyle = '#c4a060';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(cx - 14, groundY - 42, 12, 28);
    ctx.strokeRect(cx + 2, groundY - 42, 12, 28);
    // Porch roof / awning
    ctx.fillStyle = '#5a2030';
    ctx.beginPath();
    ctx.moveTo(x - 10, groundY - 78);
    ctx.lineTo(cx, groundY - 92);
    ctx.lineTo(x + w + 10, groundY - 78);
    ctx.lineTo(x + w + 6, groundY - 74);
    ctx.lineTo(x - 6, groundY - 74);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,80,160,0.2)';
    ctx.fillRect(x - 8, groundY - 76, w + 16, 3);
    ctx.textAlign = 'left';
    drawLandmarkLabel(ctx, cx, groundY + 14, label || 'SASSY SALOON');
  }

  /** Mom's house + backyard shed — home land cue at start of fly map */
  function drawHomeShed(ctx, x, groundY, label) {
    // house
    ctx.fillStyle = '#8a6050';
    ctx.fillRect(x - 8, groundY - 72, 58, 72);
    ctx.fillStyle = '#5a3030';
    ctx.beginPath();
    ctx.moveTo(x - 12, groundY - 72);
    ctx.lineTo(x + 21, groundY - 98);
    ctx.lineTo(x + 54, groundY - 72);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffe88a';
    ctx.fillRect(x + 4, groundY - 48, 14, 14);
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(x + 28, groundY - 32, 14, 32);
    // shed behind / beside
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(x + 52, groundY - 42, 36, 42);
    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.moveTo(x + 50, groundY - 42);
    ctx.lineTo(x + 70, groundY - 58);
    ctx.lineTo(x + 90, groundY - 42);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(x + 62, groundY - 24, 14, 24);
    // neon home cue
    ctx.fillStyle = 'rgba(125,255,58,0.18)';
    ctx.fillRect(x - 14, groundY - 108, 108, 14);
    drawLandmarkLabel(ctx, x + 40, groundY + 14, label || "MOM'S / SHED");
  }


  /** Canary-yellow 70s high-top conversion van — Retrofit tour rig */
  function drawRetrofitVan(ctx, x, groundY, label) {
    const cx = x + 48;
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, groundY - 2, 52, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = '#f5d420';
    ctx.fillRect(x + 4, groundY - 42, 88, 36);
    // nose
    ctx.fillStyle = '#e8c818';
    ctx.fillRect(x + 84, groundY - 36, 18, 30);
    // high-top white roof
    ctx.fillStyle = '#f4f4f0';
    ctx.beginPath();
    ctx.moveTo(x + 10, groundY - 42);
    ctx.lineTo(x + 14, groundY - 62);
    ctx.lineTo(x + 72, groundY - 62);
    ctx.lineTo(x + 78, groundY - 42);
    ctx.closePath();
    ctx.fill();
    // roof side window
    ctx.fillStyle = '#6a98b8';
    ctx.fillRect(x + 28, groundY - 58, 22, 8);
    ctx.strokeStyle = '#c8c8c0';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 28, groundY - 58, 22, 8);
    // teal stripe
    ctx.fillStyle = '#2a9aaa';
    ctx.fillRect(x + 4, groundY - 28, 98, 8);
    ctx.fillStyle = '#1a7a88';
    ctx.fillRect(x + 4, groundY - 21, 98, 2);
    // windows
    ctx.fillStyle = 'rgba(120,180,210,0.55)';
    ctx.fillRect(x + 12, groundY - 40, 18, 12);
    ctx.fillRect(x + 34, groundY - 40, 22, 12);
    ctx.fillRect(x + 60, groundY - 40, 16, 12);
    ctx.fillRect(x + 88, groundY - 34, 10, 10);
    // door seam
    ctx.strokeStyle = 'rgba(80,60,10,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 48, groundY - 42);
    ctx.lineTo(x + 48, groundY - 6);
    ctx.stroke();
    // wheels
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x + 22, groundY - 4, 8, 0, Math.PI * 2);
    ctx.arc(x + 82, groundY - 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(x + 22, groundY - 4, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 82, groundY - 4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // bumper
    ctx.fillStyle = '#c8c8c0';
    ctx.fillRect(x + 88, groundY - 10, 16, 5);
    drawLandmarkLabel(ctx, cx, groundY + 14, label || 'RETROFIT VAN');
  }

  /** Cream Winnebago-style Class A — BRAVE tour bus */
  function drawBraveTourBus(ctx, x, groundY, label) {
    const cx = x + 62;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, groundY - 2, 68, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // body cream
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(x + 2, groundY - 58, 120, 52);
    // cab front
    ctx.fillStyle = '#ddd5c4';
    ctx.fillRect(x + 110, groundY - 52, 22, 46);
    // white roof + A/C
    ctx.fillStyle = '#f8f8f4';
    ctx.fillRect(x + 6, groundY - 66, 112, 10);
    ctx.fillStyle = '#c8c8c8';
    ctx.fillRect(x + 48, groundY - 72, 28, 8);
    // awning roll
    ctx.fillStyle = '#f0f0ec';
    ctx.fillRect(x + 8, groundY - 60, 100, 4);
    // maroon twin stripes
    ctx.fillStyle = '#7a2038';
    ctx.fillRect(x + 2, groundY - 32, 130, 5);
    ctx.fillRect(x + 2, groundY - 24, 130, 5);
    // stripe kick near front
    ctx.beginPath();
    ctx.moveTo(x + 100, groundY - 32);
    ctx.lineTo(x + 118, groundY - 40);
    ctx.lineTo(x + 124, groundY - 40);
    ctx.lineTo(x + 108, groundY - 32);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 100, groundY - 24);
    ctx.lineTo(x + 116, groundY - 30);
    ctx.lineTo(x + 122, groundY - 30);
    ctx.lineTo(x + 108, groundY - 24);
    ctx.closePath();
    ctx.fill();
    // W logo
    ctx.fillStyle = '#7a2038';
    ctx.font = 'bold 16px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('W', x + 55, groundY - 40);
    // BRAVE lettering
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.fillText('BRAVE', x + 28, groundY - 10);
    ctx.textAlign = 'left';
    // windows
    ctx.fillStyle = 'rgba(100,150,190,0.5)';
    ctx.fillRect(x + 14, groundY - 54, 36, 18);
    ctx.fillRect(x + 56, groundY - 54, 22, 18);
    ctx.fillRect(x + 84, groundY - 54, 18, 16);
    ctx.fillRect(x + 114, groundY - 48, 14, 14);
    // door
    ctx.strokeStyle = 'rgba(60,40,30,0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 84, groundY - 54, 18, 40);
    // wheels + hubcaps
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x + 28, groundY - 4, 9, 0, Math.PI * 2);
    ctx.arc(x + 108, groundY - 4, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c8c8d0';
    ctx.beginPath();
    ctx.arc(x + 28, groundY - 4, 4, 0, Math.PI * 2);
    ctx.arc(x + 108, groundY - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    drawLandmarkLabel(ctx, cx, groundY + 14, label || 'BRAVE TOUR BUS');
  }

  function drawBuilding(ctx, x, groundY, kind, label, worldX, bakedCol) {
    if (kind === 'streetlight') { drawStreetlight(ctx, x, groundY); return; }
    if (kind === 'homeShed') { drawHomeShed(ctx, x, groundY, label); return; }
    if (kind === 'clockTower') { drawClockTower(ctx, x, groundY, label); return; }
    if (kind === 'museum') { drawMuseum(ctx, x, groundY, label); return; }
    if (kind === 'vedderBridge') { drawVedderBridge(ctx, x, groundY, label); return; }
    if (kind === 'royalHotel') { drawRoyalHotel(ctx, x, groundY, label); return; }
    if (kind === 'fireHall') { drawFireHall(ctx, x, groundY, label); return; }
    if (kind === 'theatre') { drawTheatre(ctx, x, groundY, label); return; }
    if (kind === 'sassySaloon') { drawSassySaloon(ctx, x, groundY, label); return; }
    if (kind === 'retrofitVan') { drawRetrofitVan(ctx, x, groundY, label); return; }
    if (kind === 'braveBus') { drawBraveTourBus(ctx, x, groundY, label); return; }
    if (kind === 'car') {
      // Color must be stable vs scroll — never hash screen x (that flashes while flying)
      const cols = ['#446688', '#884444', '#555', '#c4a35a', '#2a5a3a'];
      const seed = worldX != null ? worldX : x;
      const col = bakedCol || cols[(Math.abs(seed | 0) % cols.length)];
      drawParkedCar(ctx, x, groundY, col);
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

    if (tg.kind.loot) {
      // cyan/gold ring = good loot
      const lootColor = tg.kind.loot === 'chicken' ? 'rgba(255,180,60,0.85)' : 'rgba(120,240,255,0.85)';
      ctx.strokeStyle = lootColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y - 2, 15, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      const shape = tg.kind.shape;
      if (shape === 'plastics') {
        // sparkly bottle flakes / plastic bits
        const spark = 0.55 + 0.45 * Math.sin(t * 0.02 + tg.wobble);
        ctx.save();
        ctx.globalAlpha = 0.55 + spark * 0.35;
        ctx.fillStyle = '#b8f8ff';
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 8);
        ctx.lineTo(x - 2, y - 22);
        ctx.lineTo(x + 4, y - 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#7ad8f0';
        ctx.fillRect(x + 2, y - 18, 7, 10);
        ctx.fillStyle = '#e8ffff';
        ctx.fillRect(x - 10, y - 14, 5, 5);
        ctx.fillRect(x + 6, y - 8, 4, 4);
        ctx.fillRect(x - 1, y - 26, 3, 3);
        ctx.restore();
        // sparkles
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = spark;
        ctx.fillRect(x - 12, y - 20, 2, 2);
        ctx.fillRect(x + 10, y - 24, 2, 2);
        ctx.fillRect(x + 1, y - 30, 2, 2);
        ctx.globalAlpha = 1;
      } else {
        // KFC bucket + drumstick vibe
        ctx.fillStyle = '#c43a2a';
        ctx.beginPath();
        ctx.moveTo(x - 12, y - 8);
        ctx.lineTo(x - 10, y - 26);
        ctx.lineTo(x + 10, y - 26);
        ctx.lineTo(x + 12, y - 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fff8e8';
        ctx.fillRect(x - 9, y - 22, 18, 8);
        ctx.fillStyle = '#c43a2a';
        ctx.font = 'bold 7px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('KFC', x, y - 15);
        // drumstick peeking out
        ctx.strokeStyle = '#e8c090';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 4, y - 26);
        ctx.lineTo(x + 10, y - 36);
        ctx.stroke();
        ctx.fillStyle = '#d4a060';
        ctx.beginPath();
        ctx.arc(x + 11, y - 38, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = tg.kind.loot === 'chicken' ? '#ffcc66' : '#9ef0ff';
      ctx.font = 'bold 8px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((tg.kind.loot === 'chicken' ? '🍗 ' : '🧪 ') + tg.kind.label, x, y - 44);
      ctx.textAlign = 'left';
      return;
    }

    if (tg.kind.cow) {
      // Holy Cow — good target (green ring, not hazard red)
      ctx.strokeStyle = 'rgba(255,220,100,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y - 2, 22, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      // body
      ctx.fillStyle = '#f5f0e6';
      ctx.beginPath();
      ctx.ellipse(x, y - 18, 20, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // black spots
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.ellipse(x - 8, y - 20, 5, 4, -0.3, 0, Math.PI * 2);
      ctx.ellipse(x + 6, y - 14, 6, 4, 0.2, 0, Math.PI * 2);
      ctx.ellipse(x + 2, y - 24, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // head
      ctx.fillStyle = '#f5f0e6';
      ctx.beginPath();
      ctx.ellipse(x + 18, y - 26, 9, 8, 0.15, 0, Math.PI * 2);
      ctx.fill();
      // snout
      ctx.fillStyle = '#e8a0b0';
      ctx.beginPath();
      ctx.ellipse(x + 26, y - 22, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // ears
      ctx.fillStyle = '#f0e0d0';
      ctx.beginPath();
      ctx.ellipse(x + 14, y - 34, 4, 3, -0.6, 0, Math.PI * 2);
      ctx.ellipse(x + 22, y - 34, 4, 3, 0.6, 0, Math.PI * 2);
      ctx.fill();
      // eye
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(x + 20, y - 28, 1.6, 0, Math.PI * 2);
      ctx.fill();
      // legs
      ctx.fillStyle = '#e8e0d4';
      ctx.fillRect(x - 14, y - 8, 4, 10);
      ctx.fillRect(x - 4, y - 8, 4, 10);
      ctx.fillRect(x + 4, y - 8, 4, 10);
      ctx.fillRect(x + 12, y - 8, 4, 10);
      // udder hint
      ctx.fillStyle = '#e8a0b0';
      ctx.beginPath();
      ctx.ellipse(x - 2, y - 6, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // tail
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 20, y - 18);
      ctx.quadraticCurveTo(x - 28, y - 28, x - 24, y - 8);
      ctx.stroke();
      ctx.fillStyle = '#ffd76a';
      ctx.font = 'bold 9px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🐄 ' + tg.kind.label, x, y - 44);
      ctx.textAlign = 'left';
      return;
    }

    if (tg.kind.human) {
      ctx.strokeStyle = 'rgba(125,255,58,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y - 2, 16, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      drawCitizen(ctx, x, y, tg.kind.look || 'denim', t + (tg.wobble || 0) * 50, { moving: true });
      ctx.fillStyle = '#7dff3a';
      ctx.font = 'bold 8px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tg.kind.label, x, y - STANDING_HEIGHT - 8);
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


  /**
   * Drawn sunset + Cheam ridgeline (traced from user photo shape — no image load).
   * nx = 0..1 across span; peak = height above ground as fraction of groundY (higher = taller).
   * Left sharp pyramid = Cheam; saddle; broader companion right; treeline base.
   */
  const CHEAM_RIDGE = [
    [0.00, 0.08], [0.06, 0.12], [0.12, 0.18], [0.18, 0.28], [0.24, 0.40],
    [0.30, 0.52], [0.34, 0.62], [0.37, 0.72], [0.395, 0.82], // approach Cheam
    [0.42, 0.90], // Cheam summit (sharp)
    [0.445, 0.70], [0.47, 0.52], [0.50, 0.40], // east face drop into saddle
    [0.54, 0.36], // saddle
    [0.58, 0.48], [0.62, 0.58], [0.66, 0.64], [0.70, 0.66], // broad companion
    [0.74, 0.60], [0.78, 0.48], [0.84, 0.34], [0.90, 0.22], [0.96, 0.14], [1.00, 0.10],
  ];

  function drawFlySkylineBackdrop(ctx, w, h, groundY, scrollX) {
    // —— Fiery sunset sky (match photo palette) ——
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#140828');
    sky.addColorStop(0.18, '#3a1858');
    sky.addColorStop(0.38, '#a02858');
    sky.addColorStop(0.55, '#d94a28');
    sky.addColorStop(0.72, '#f07828');
    sky.addColorStop(0.88, '#f8b050');
    sky.addColorStop(1, '#ffe0a0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, groundY);
    // Soft cyan rim in upper sky (vaporwave night)
    const cyanSky = ctx.createRadialGradient(w * 0.78, groundY * 0.12, 4, w * 0.78, groundY * 0.18, w * 0.4);
    cyanSky.addColorStop(0, 'rgba(60,200,255,0.18)');
    cyanSky.addColorStop(1, 'rgba(60,200,255,0)');
    ctx.fillStyle = cyanSky;
    ctx.fillRect(0, 0, w, groundY * 0.5);

    // Horizontal streaked clouds
    for (let i = 0; i < 7; i++) {
      const cy = groundY * (0.08 + i * 0.09);
      const band = ctx.createLinearGradient(0, cy - 10, 0, cy + 14);
      const a = 0.18 + (i % 3) * 0.06;
      band.addColorStop(0, 'rgba(255,120,80,0)');
      band.addColorStop(0.45, 'rgba(220,60,40,' + a + ')');
      band.addColorStop(0.7, 'rgba(255,160,60,' + (a * 0.85) + ')');
      band.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = band;
      ctx.fillRect(0, cy - 8, w, 22);
    }
    // Bright horizon glow behind peaks
    const glow = ctx.createRadialGradient(w * 0.42, groundY * 0.72, 4, w * 0.42, groundY * 0.78, w * 0.55);
    glow.addColorStop(0, 'rgba(255,245,200,0.55)');
    glow.addColorStop(0.45, 'rgba(255,180,80,0.2)');
    glow.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, groundY * 0.45, w, groundY * 0.55);

    // —— Mountain silhouette (exact Cheam shape) with gentle parallax ——
    const span = w * 1.35;
    const shift = -((scrollX * 0.08) % span);
    function drawRidge(ox, baseAlpha) {
      const maxPeak = groundY * 0.58;
      ctx.beginPath();
      ctx.moveTo(ox - 20, groundY + 4);
      for (let i = 0; i < CHEAM_RIDGE.length; i++) {
        const nx = CHEAM_RIDGE[i][0];
        const peak = CHEAM_RIDGE[i][1];
        const x = ox + nx * span;
        const y = groundY - peak * maxPeak;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(ox + span + 20, groundY + 4);
      ctx.closePath();
      ctx.fillStyle = 'rgba(12,14,22,' + baseAlpha + ')';
      ctx.fill();

      // Snow on upper Cheam + companion (only near summits)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ox - 20, groundY + 4);
      for (let i = 0; i < CHEAM_RIDGE.length; i++) {
        const nx = CHEAM_RIDGE[i][0];
        const peak = CHEAM_RIDGE[i][1];
        ctx.lineTo(ox + nx * span, groundY - peak * maxPeak);
      }
      ctx.lineTo(ox + span + 20, groundY + 4);
      ctx.closePath();
      ctx.clip();
      // Cheam snow cap
      const cheamX = ox + 0.42 * span;
      const cheamY = groundY - 0.90 * maxPeak;
      ctx.fillStyle = 'rgba(236,244,255,0.88)';
      ctx.beginPath();
      ctx.moveTo(cheamX - 28, cheamY + 48);
      ctx.lineTo(cheamX, cheamY + 2);
      ctx.lineTo(cheamX + 22, cheamY + 42);
      ctx.closePath();
      ctx.fill();
      // east face shade
      ctx.fillStyle = 'rgba(8,10,18,0.35)';
      ctx.beginPath();
      ctx.moveTo(cheamX, cheamY + 2);
      ctx.lineTo(cheamX + 22, cheamY + 42);
      ctx.lineTo(cheamX + 8, cheamY + 55);
      ctx.closePath();
      ctx.fill();
      // companion snow
      const compX = ox + 0.68 * span;
      const compY = groundY - 0.66 * maxPeak;
      ctx.fillStyle = 'rgba(230,238,248,0.75)';
      ctx.beginPath();
      ctx.moveTo(compX - 36, compY + 28);
      ctx.lineTo(compX - 8, compY + 4);
      ctx.lineTo(compX + 40, compY + 22);
      ctx.lineTo(compX + 20, compY + 36);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    drawRidge(shift - span * 0.15, 0.92);
    // second tile for seamless parallax
    drawRidge(shift - span * 0.15 + span, 0.92);

    // Foreground evergreen treeline (dark silhouette under peaks)
    ctx.fillStyle = '#0a0c10';
    ctx.beginPath();
    ctx.moveTo(-10, groundY + 2);
    const treeBase = groundY - 18;
    for (let x = -10; x <= w + 20; x += 14) {
      const th = 22 + ((x * 3 + scrollX * 0.2) % 17);
      const tip = treeBase - th;
      ctx.lineTo(x, treeBase);
      ctx.lineTo(x + 7, tip);
      ctx.lineTo(x + 14, treeBase);
    }
    ctx.lineTo(w + 20, groundY + 2);
    ctx.closePath();
    ctx.fill();

    // Soft blend into ground
    const fade = ctx.createLinearGradient(0, groundY - 20, 0, groundY);
    fade.addColorStop(0, 'rgba(20,24,30,0)');
    fade.addColorStop(1, 'rgba(20,24,30,0.4)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, groundY - 20, w, 20);
  }

  function drawFlyScene(ctx, w, h, fly, t) {
    const scrollX = fly.scrollX || 0;
    const shakeX = fly.shakeX || 0;
    const shakeY = fly.shakeY || 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    const groundY = h * 0.78;
    // Drawn sunset + Cheam silhouette (from user photo shape)
    drawFlySkylineBackdrop(ctx, w, h, groundY, scrollX);

    // ground bands — dusk grass + wet Yale Rd specular
    const gBand = ctx.createLinearGradient(0, groundY, 0, h);
    gBand.addColorStop(0, '#2a5a3a');
    gBand.addColorStop(1, '#142418');
    ctx.fillStyle = gBand;
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = '#5a5860';
    ctx.fillRect(0, groundY - 7, w, 7);
    ctx.fillStyle = '#3a3a42';
    ctx.fillRect(0, groundY - 1, w, 1);
    // Yale Rd — wet asphalt
    const road = ctx.createLinearGradient(0, groundY + 8, 0, groundY + 34);
    road.addColorStop(0, '#2a2a34');
    road.addColorStop(0.5, '#1a1a24');
    road.addColorStop(1, '#12121a');
    ctx.fillStyle = road;
    ctx.fillRect(0, groundY + 8, w, 26);
    // Neon wet streaks on road
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 8; i++) {
      const rx = ((i * 119 - scrollX * 0.4) % (w + 40)) - 20;
      ctx.fillStyle = i % 2 ? 'rgba(255,50,200,0.14)' : 'rgba(50,200,255,0.12)';
      ctx.fillRect(rx, groundY + 10, 2 + (i % 3), 20);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,220,120,0.75)';
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
      drawBuilding(ctx, px, groundY, p.kind, p.label, p.x, p.col);
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
    const flyLegs = fly.legExtend != null ? fly.legExtend : 0;
    const ufoScale = fly.ufoScale != null ? fly.ufoScale : 0.92;
    drawClayUFO(ctx, ufoScreenX, ufoScreenY, ufoScale, t, true, {
      showPilots: true,
      legExtend: flyLegs,
    });

    // beam reticle under ship
    ctx.strokeStyle = 'rgba(125,255,58,0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(ufoScreenX, groundY, fly.beamWide ? 48 : 32, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(ufoScreenX, ufoScreenY + 18 * ufoScale);
    ctx.lineTo(ufoScreenX, groundY - 8);
    ctx.strokeStyle = 'rgba(125,255,58,0.2)';
    ctx.stroke();

    // active beam — pulsing cone, soft glow, rising energy, scan ripples
    if (fly.beaming) {
      const bw = fly.beamWide ? 96 : 64;
      const beamTop = ufoScreenY + 16 * ufoScale;
      const pulse = 0.85 + 0.15 * Math.sin(t * 0.028);
      const bwPulse = bw * pulse;
      // Soft ground glow
      const gGlow = ctx.createRadialGradient(ufoScreenX, groundY, 4, ufoScreenX, groundY, bwPulse * 0.7);
      gGlow.addColorStop(0, 'rgba(160,255,120,0.35)');
      gGlow.addColorStop(0.5, 'rgba(80,220,140,0.12)');
      gGlow.addColorStop(1, 'rgba(80,220,140,0)');
      ctx.fillStyle = gGlow;
      ctx.beginPath();
      ctx.ellipse(ufoScreenX, groundY, bwPulse * 0.65, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Outer soft cone
      const outer = ctx.createLinearGradient(ufoScreenX, beamTop, ufoScreenX, groundY);
      outer.addColorStop(0, 'rgba(180,255,160,' + (0.35 * pulse) + ')');
      outer.addColorStop(0.45, 'rgba(100,255,140,0.18)');
      outer.addColorStop(1, 'rgba(80,255,120,0.04)');
      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.moveTo(ufoScreenX - 14 * ufoScale, beamTop);
      ctx.lineTo(ufoScreenX + 14 * ufoScale, beamTop);
      ctx.lineTo(ufoScreenX + bwPulse / 2 + 8, groundY);
      ctx.lineTo(ufoScreenX - bwPulse / 2 - 8, groundY);
      ctx.closePath();
      ctx.fill();
      // Core cone
      const grad = ctx.createLinearGradient(ufoScreenX, beamTop, ufoScreenX, groundY);
      grad.addColorStop(0, 'rgba(200,255,180,' + (0.75 * pulse) + ')');
      grad.addColorStop(0.35, 'rgba(125,255,58,0.45)');
      grad.addColorStop(1, 'rgba(125,255,58,0.1)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ufoScreenX - 8 * ufoScale, beamTop);
      ctx.lineTo(ufoScreenX + 8 * ufoScale, beamTop);
      ctx.lineTo(ufoScreenX + bwPulse / 2, groundY);
      ctx.lineTo(ufoScreenX - bwPulse / 2, groundY);
      ctx.closePath();
      ctx.fill();
      // Bright center shaft
      ctx.fillStyle = 'rgba(230,255,220,' + (0.22 + 0.1 * pulse) + ')';
      ctx.beginPath();
      ctx.moveTo(ufoScreenX - 3 * ufoScale, beamTop);
      ctx.lineTo(ufoScreenX + 3 * ufoScale, beamTop);
      ctx.lineTo(ufoScreenX + 6, groundY);
      ctx.lineTo(ufoScreenX - 6, groundY);
      ctx.closePath();
      ctx.fill();
      // Scan ripples rising along the cone
      for (let ri = 0; ri < 4; ri++) {
        const rp = ((t * 0.004 + ri * 0.25) % 1);
        const ry = beamTop + (groundY - beamTop) * rp;
        const halfAtY = (8 * ufoScale) + (bwPulse / 2 - 8 * ufoScale) * rp;
        ctx.strokeStyle = 'rgba(180,255,160,' + (0.35 * (1 - rp)) + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(ufoScreenX, ry, halfAtY * 0.9, 3 + rp * 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Rising energy particles
      for (let pi = 0; pi < 10; pi++) {
        const seed = pi * 17.13 + Math.floor(t / 40);
        const px = ufoScreenX + Math.sin(seed + t * 0.01 + pi) * (bwPulse * 0.28);
        const py = groundY - ((t * 0.12 + pi * 37) % (groundY - beamTop));
        const pa = 0.3 + 0.5 * Math.sin(t * 0.02 + pi);
        ctx.fillStyle = 'rgba(200,255,160,' + pa + ')';
        ctx.beginPath();
        ctx.arc(px, py, 1.5 + (pi % 3) * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // HUD strip: hull + loot progress
    ctx.fillStyle = 'rgba(10,30,16,0.75)';
    ctx.fillRect(12, h - 36, 280, 24);
    ctx.fillStyle = '#9bc87a';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.fillText('HULL', 18, h - 20);
    const lives = fly.lives | 0;
    ctx.fillStyle = lives <= 1 ? '#ff6644' : '#7dff3a';
    ctx.fillText('♥'.repeat(Math.max(0, lives)) + (lives <= 0 ? ' TOAST' : ''), 55, h - 20);
    const thresh = MICROPLASTIC_THRESHOLD;
    const plasticsProg = (fly.microplastics | 0) % thresh;
    ctx.fillStyle = '#9ef0ff';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.fillText('🧪 ' + plasticsProg + '/' + thresh, 118, h - 20);
    ctx.fillStyle = '#ffcc66';
    ctx.fillText('🍗 ' + (fly.chicken | 0), 178, h - 20);
    if (fly.scoreMultTimer > 0) {
      const secs = Math.ceil(fly.scoreMultTimer / 60);
      const blink = (Math.floor(t / 200) % 2) === 0;
      ctx.fillStyle = blink ? '#ffe066' : '#ffaa33';
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.fillText('2× ' + secs + 's', 230, h - 20);
    }

    ctx.fillStyle = 'rgba(10,30,16,0.75)';
    ctx.fillRect(w - 220, h - 36, 208, 24);
    ctx.fillStyle = '#c8e0b8';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('beam people/loot · red=DON\'T · Enter end', w - 18, h - 20);
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

  /**
   * Easter egg: El Camino cruise on Yale Rd — same Chilliwack fly ground layer,
   * no UFO. street: { scrollX, caminoX, facingRight, wheelRot, lane, props,
   *   districtIndex, drawDriver, scale, hasPassenger }
   */
  function drawStreetDriveScene(ctx, w, h, street, t) {
    street = street || {};
    const scrollX = street.scrollX || 0;
    const groundY = h * 0.78;

    drawFlySkylineBackdrop(ctx, w, h, groundY, scrollX);

    // ground bands (match drawFlyScene) — wet Yale Rd
    const gBand = ctx.createLinearGradient(0, groundY, 0, h);
    gBand.addColorStop(0, '#2a5a3a');
    gBand.addColorStop(1, '#142418');
    ctx.fillStyle = gBand;
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = '#5a5860';
    ctx.fillRect(0, groundY - 7, w, 7);
    ctx.fillStyle = '#3a3a42';
    ctx.fillRect(0, groundY - 1, w, 1);
    // Yale Rd — wet asphalt
    const road = ctx.createLinearGradient(0, groundY + 8, 0, groundY + 34);
    road.addColorStop(0, '#2a2a34');
    road.addColorStop(0.5, '#1a1a24');
    road.addColorStop(1, '#12121a');
    ctx.fillStyle = road;
    ctx.fillRect(0, groundY + 8, w, 26);
    // Neon wet streaks on road
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 8; i++) {
      const rx = ((i * 119 - scrollX * 0.4) % (w + 40)) - 20;
      ctx.fillStyle = i % 2 ? 'rgba(255,50,200,0.14)' : 'rgba(50,200,255,0.12)';
      ctx.fillRect(rx, groundY + 10, 2 + (i % 3), 20);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,220,120,0.75)';
    ctx.lineWidth = 2;
    ctx.setLineDash([18, 14]);
    ctx.beginPath();
    const dashOff = -((scrollX * 1.1) % 32);
    ctx.moveTo(dashOff, groundY + 21);
    ctx.lineTo(w + 20, groundY + 21);
    ctx.stroke();
    ctx.setLineDash([]);

    const props = street.props || [];
    for (const p of props) {
      const px = p.x - scrollX;
      if (px < -80 || px > w + 80) continue;
      drawBuilding(ctx, px, groundY, p.kind, p.label, p.x, p.col);
    }

    const d = DISTRICTS[(street.districtIndex | 0) % DISTRICTS.length];
    if (d.id === 'vedder' || d.id === 'cultus') {
      ctx.fillStyle = d.accent;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(0, groundY - 8, w, 10);
      ctx.globalAlpha = 1;
    }

    // Camino on the road (slight lane offset)
    const lane = Math.max(-1, Math.min(1, street.lane || 0));
    const roadY = groundY + 20 + lane * 7;
    const caminoScreenX = (street.caminoX != null ? street.caminoX : scrollX + w * 0.38) - scrollX;
    const driverFn = street.drawDriver;
    drawElCamino(ctx, caminoScreenX, roadY, t, {
      dusty: false,
      facingRight: !!street.facingRight,
      wheelRot: street.wheelRot || 0,
      drawDriver: typeof driverFn === 'function' ? driverFn : null,
      noLabel: true,
      scale: street.scale != null ? street.scale : 0.78,
    });

    // Soft HUD
    ctx.fillStyle = 'rgba(10,30,16,0.72)';
    ctx.fillRect(12, h - 36, 300, 24);
    ctx.fillStyle = '#ffd76a';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.fillText('YALE RD · El Camino cruise', 18, h - 20);

    ctx.fillStyle = 'rgba(10,30,16,0.72)';
    ctx.fillRect(w - 230, h - 36, 218, 24);
    ctx.fillStyle = '#c8e0b8';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('←→ drive · ↑↓ lane · E home', w - 18, h - 20);
    ctx.textAlign = 'left';

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.name, w / 2, 48);
    ctx.textAlign = 'left';
  }

  /** Lazy-load dash photo for canvas title backdrop (HTML overlay sits on top). */
  let _titleDashImg = null;
  function titleDashImage() {
    if (_titleDashImg) return _titleDashImg;
    _titleDashImg = new Image();
    _titleDashImg.src = 'assets/title-dash-bg.jpg?v=18';
    return _titleDashImg;
  }

  function drawTitleBackdrop(ctx, w, h, t) {
    const img = titleDashImage();
    if (img.complete && img.naturalWidth) {
      // cover
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      // Warm dark wood-dash fallback while image loads
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1a120c');
      g.addColorStop(0.45, '#2a1a10');
      g.addColorStop(1, '#0a0604');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // soft amber gauge glow hint
      const glow = ctx.createRadialGradient(w * 0.28, h * 0.38, 8, w * 0.28, h * 0.4, w * 0.28);
      glow.addColorStop(0, 'rgba(255, 140, 40, 0.22)');
      glow.addColorStop(1, 'rgba(255, 140, 40, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }
    // Cinematic vignette
    const vig = ctx.createRadialGradient(w * 0.45, h * 0.4, h * 0.12, w * 0.5, h * 0.5, h * 0.78);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }


  /** Side-view cinematic landmark interiors — mature Chilliwack chambers */
  function lmDustMotes(ctx, w, groundY, t, camX, density) {
    density = density || 18;
    ctx.save();
    for (let i = 0; i < density; i++) {
      const seed = i * 97.13;
      const x = ((seed * 37 + t * (0.012 + (i % 5) * 0.003) - camX * 0.15) % (w + 40) + w + 40) % (w + 40) - 20;
      const y = 56 + ((seed * 13) % (groundY - 80));
      const a = 0.08 + ((i * 17) % 10) * 0.012;
      const r = 0.6 + (i % 3) * 0.35;
      ctx.fillStyle = 'rgba(255,236,200,' + a + ')';
      ctx.beginPath();
      ctx.arc(x, y + Math.sin(t * 0.0015 + i) * 3, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function lmSoftGrain(ctx, w, h, t) {
    ctx.save();
    ctx.globalAlpha = 0.035;
    for (let i = 0; i < 40; i++) {
      const x = ((i * 73 + (t * 0.02) | 0) % w);
      const y = ((i * 91 + 17) % h);
      ctx.fillStyle = (i % 2) ? '#fff8e8' : '#1a1410';
      ctx.fillRect(x, y, 1.2, 1.2);
    }
    ctx.restore();
  }

  function lmLightShaft(ctx, x, y0, y1, width, alpha) {
    ctx.save();
    const g = ctx.createLinearGradient(x, y0, x, y1);
    g.addColorStop(0, 'rgba(255,220,160,' + (alpha * 0.55) + ')');
    g.addColorStop(0.55, 'rgba(255,200,130,' + (alpha * 0.18) + ')');
    g.addColorStop(1, 'rgba(255,180,100,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.35, y0);
    ctx.lineTo(x + width * 0.35, y0);
    ctx.lineTo(x + width, y1);
    ctx.lineTo(x - width, y1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function lmDrawHatch(ctx, ex, groundY, t) {
    // Mature takeoff hatch — brass frame, soft cyan glow (not arcade neon)
    const pulse = 0.28 + Math.sin(t * 0.008) * 0.08;
    ctx.fillStyle = '#1c2228';
    ctx.fillRect(ex - 30, groundY - 100, 60, 100);
    // inner portal
    const portal = ctx.createLinearGradient(ex, groundY - 96, ex, groundY - 20);
    portal.addColorStop(0, '#6aa8c8');
    portal.addColorStop(0.5, '#3a7088');
    portal.addColorStop(1, '#1a3040');
    ctx.fillStyle = portal;
    ctx.globalAlpha = 0.55 + pulse * 0.35;
    ctx.fillRect(ex - 22, groundY - 90, 44, 74);
    ctx.globalAlpha = 1;
    // soft cyan rim
    ctx.strokeStyle = 'rgba(140,200,220,' + (0.45 + pulse) + ')';
    ctx.lineWidth = 2;
    ctx.strokeRect(ex - 30, groundY - 100, 60, 100);
    // brass corner plates
    ctx.fillStyle = '#8a7040';
    ctx.fillRect(ex - 32, groundY - 102, 10, 6);
    ctx.fillRect(ex + 22, groundY - 102, 10, 6);
    ctx.fillRect(ex - 32, groundY - 8, 10, 6);
    ctx.fillRect(ex + 22, groundY - 8, 10, 6);
    ctx.fillStyle = 'rgba(220,200,150,0.75)';
    ctx.font = 'bold 8px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TAKEOFF', ex, groundY - 104);
    ctx.fillText('HATCH', ex, groundY - 94);
    // threshold plate
    ctx.fillStyle = '#3a4248';
    ctx.beginPath();
    ctx.moveTo(ex - 36, groundY);
    ctx.lineTo(ex + 36, groundY);
    ctx.lineTo(ex + 22, groundY + 10);
    ctx.lineTo(ex - 22, groundY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,160,100,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function lmHotGlow(ctx, x, y, t, interacted, col) {
    ctx.save();
    const base = interacted ? 0.18 : (0.38 + Math.sin(t * 0.01) * 0.12);
    ctx.globalAlpha = base;
    ctx.fillStyle = col || 'rgba(220,170,80,0.9)';
    ctx.beginPath();
    ctx.ellipse(x, y, 40, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function lmTitleBanner(ctx, w, title) {
    ctx.fillStyle = 'rgba(12,14,16,0.72)';
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    const tw = ctx.measureText(title).width;
    const bx = w / 2 - tw / 2 - 16;
    ctx.fillRect(bx, 12, tw + 32, 26);
    ctx.strokeStyle = 'rgba(180,150,90,0.55)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, 12, tw + 32, 26);
    ctx.fillStyle = '#e8dcc0';
    ctx.fillText(title, w / 2, 30);
    ctx.textAlign = 'left';
  }

  function drawClockTowerInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted) {
    // Tall stone/metal shaft — dusty limestone + aged steel ribs
    const wall = ctx.createLinearGradient(0, 40, 0, groundY);
    wall.addColorStop(0, '#6a6258');
    wall.addColorStop(0.35, '#8a7e6e');
    wall.addColorStop(0.7, '#7a6e5e');
    wall.addColorStop(1, '#5a5044');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 48, w, groundY - 48);

    // Vertical steel ribs / cable conduit
    for (let i = 0; i < 8; i++) {
      const rx = 80 + i * 120 - (camX * 0.08) % 120;
      ctx.fillStyle = 'rgba(40,36,30,0.35)';
      ctx.fillRect(rx, 52, 4, groundY - 56);
      ctx.fillStyle = 'rgba(160,150,130,0.12)';
      ctx.fillRect(rx + 1, 52, 1, groundY - 56);
    }
    // Horizontal catwalk ledges
    ctx.fillStyle = '#4a453c';
    ctx.fillRect(0, groundY - 168, w, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, groundY - 162, w, 3);
    // rivets on ledge
    ctx.fillStyle = '#8a7a58';
    for (let x = 40; x < w; x += 48) {
      ctx.beginPath();
      ctx.arc(x - (camX * 0.05) % 48, groundY - 165, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Arched windows — dusk Five Corners street outside
    const winYs = [groundY - 250, groundY - 250];
    const winXs = [hx - 220, hx + 160];
    for (let wi = 0; wi < 2; wi++) {
      const wx = winXs[wi] - camX * 0.02;
      const wy = winYs[wi];
      const ww = 70;
      const wh = 95;
      // arch frame
      ctx.fillStyle = '#3a342c';
      ctx.beginPath();
      ctx.moveTo(wx, wy + wh);
      ctx.lineTo(wx, wy + 28);
      ctx.quadraticCurveTo(wx + ww / 2, wy - 8, wx + ww, wy + 28);
      ctx.lineTo(wx + ww, wy + wh);
      ctx.closePath();
      ctx.fill();
      // glass / dusk sky
      const dusk = ctx.createLinearGradient(wx, wy, wx, wy + wh);
      dusk.addColorStop(0, '#4a2a48');
      dusk.addColorStop(0.4, '#c85838');
      dusk.addColorStop(0.75, '#e88848');
      dusk.addColorStop(1, '#3a4858');
      ctx.fillStyle = dusk;
      ctx.beginPath();
      ctx.moveTo(wx + 5, wy + wh - 2);
      ctx.lineTo(wx + 5, wy + 30);
      ctx.quadraticCurveTo(wx + ww / 2, wy + 2, wx + ww - 5, wy + 30);
      ctx.lineTo(wx + ww - 5, wy + wh - 2);
      ctx.closePath();
      ctx.fill();
      // Cheam hint far left of left window
      if (wi === 0) {
        ctx.fillStyle = 'rgba(18,16,28,0.75)';
        ctx.beginPath();
        ctx.moveTo(wx + 6, wy + wh - 4);
        ctx.lineTo(wx + 10, wy + 55);
        ctx.lineTo(wx + 22, wy + 42);
        ctx.lineTo(wx + 34, wy + 58);
        ctx.lineTo(wx + 40, wy + wh - 4);
        ctx.fill();
      }
      // Yale Rd street suggestion + warm windows
      ctx.fillStyle = 'rgba(30,34,42,0.85)';
      ctx.fillRect(wx + 8, wy + wh - 28, ww - 16, 24);
      ctx.fillStyle = 'rgba(255,180,80,0.55)';
      for (let b = 0; b < 4; b++) {
        ctx.fillRect(wx + 12 + b * 12, wy + wh - 22, 5, 6);
      }
      // street lamp glow
      ctx.fillStyle = 'rgba(255,200,100,0.25)';
      ctx.beginPath();
      ctx.arc(wx + ww / 2, wy + wh - 30, 14, 0, Math.PI * 2);
      ctx.fill();
      // mullion
      ctx.strokeStyle = 'rgba(60,50,40,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wx + ww / 2, wy + 18);
      ctx.lineTo(wx + ww / 2, wy + wh - 2);
      ctx.moveTo(wx + 5, wy + 55);
      ctx.lineTo(wx + ww - 5, wy + 55);
      ctx.stroke();
      lmLightShaft(ctx, wx + ww / 2, wy + 20, groundY, 55, 0.22);
    }

    // Worn concrete floor
    const floorG = ctx.createLinearGradient(0, groundY, 0, h);
    floorG.addColorStop(0, '#5a5448');
    floorG.addColorStop(0.15, '#3e3830');
    floorG.addColorStop(1, '#1a1814');
    ctx.fillStyle = floorG;
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    for (let x = -((camX | 0) % 56); x < w; x += 56) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 1);
      ctx.lineTo(x + 18, h);
      ctx.stroke();
    }
    // oil stains
    ctx.fillStyle = 'rgba(20,18,14,0.35)';
    ctx.beginPath();
    ctx.ellipse(hx - 40, groundY + 18, 50, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Large brass gear assembly (left of hotspot)
    const gx = hx - 90;
    const gy = groundY - 95;
    function gear(cx, cy, r, teeth, rot, col) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = col;
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a0 = (i / teeth) * Math.PI * 2;
        const a1 = a0 + Math.PI / teeth;
        ctx.lineTo(Math.cos(a0) * r, Math.sin(a0) * r);
        ctx.lineTo(Math.cos(a0 + 0.08) * (r + 7), Math.sin(a0 + 0.08) * (r + 7));
        ctx.lineTo(Math.cos(a1 - 0.08) * (r + 7), Math.sin(a1 - 0.08) * (r + 7));
        ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2a2418';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c4a060';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    gear(gx, gy, 42, 12, t * 0.0004, '#8a6a38');
    gear(gx + 58, gy + 28, 28, 10, -t * 0.0006, '#a08048');
    gear(gx + 30, gy - 38, 18, 8, t * 0.0009, '#6a5030');
    // gear shadow / depth ring
    ctx.strokeStyle = 'rgba(40,30,18,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(gx, gy, 44, 0, Math.PI * 2);
    ctx.stroke();

    // Pendulum
    const pendX = hx - 20;
    const swing = Math.sin(t * 0.0022) * 18;
    ctx.strokeStyle = '#5a4a30';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pendX, groundY - 200);
    ctx.lineTo(pendX + swing, groundY - 55);
    ctx.stroke();
    const bobG = ctx.createRadialGradient(pendX + swing, groundY - 48, 2, pendX + swing, groundY - 48, 16);
    bobG.addColorStop(0, '#d4b070');
    bobG.addColorStop(0.6, '#8a6838');
    bobG.addColorStop(1, '#3a2810');
    ctx.fillStyle = bobG;
    ctx.beginPath();
    ctx.ellipse(pendX + swing, groundY - 48, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clock face from inside (hands WRONG — local gag)
    const faceX = hx + 70;
    const faceY = groundY - 130;
    ctx.fillStyle = '#2a241c';
    ctx.fillRect(faceX - 48, faceY - 48, 96, 96);
    ctx.fillStyle = '#f0e8d0';
    ctx.beginPath();
    ctx.arc(faceX, faceY, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6a5030';
    ctx.lineWidth = 4;
    ctx.stroke();
    // hour marks
    ctx.strokeStyle = '#3a3020';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(faceX + Math.cos(a) * 32, faceY + Math.sin(a) * 32);
      ctx.lineTo(faceX + Math.cos(a) * 38, faceY + Math.sin(a) * 38);
      ctx.stroke();
    }
    // WRONG hands: hour ~2:40, minute pointing nearly up-left — famously incorrect
    ctx.strokeStyle = '#1a1410';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(faceX, faceY);
    ctx.lineTo(faceX + 22, faceY - 6); // hour askew
    ctx.moveTo(faceX, faceY);
    ctx.lineTo(faceX - 8, faceY - 28); // minute wrong
    ctx.stroke();
    ctx.fillStyle = '#8a3030';
    ctx.beginPath();
    ctx.arc(faceX, faceY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // small plaque under face
    ctx.fillStyle = 'rgba(30,24,18,0.7)';
    ctx.font = 'bold 7px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HANDS: DEBATABLE', faceX, faceY + 56);

    // Bronze dedication plaque
    const px = hx - 200;
    const py = groundY - 70;
    ctx.fillStyle = '#6a4a28';
    ctx.fillRect(px, py, 110, 42);
    ctx.strokeStyle = '#c4a060';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, 110, 42);
    ctx.fillStyle = '#e8d4a0';
    ctx.font = 'bold 8px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MILLENNIUM', px + 55, py + 14);
    ctx.fillText('CLOCK TOWER · 2002', px + 55, py + 26);
    ctx.font = '7px Segoe UI, sans-serif';
    ctx.fillStyle = '#c8b080';
    ctx.fillText('FIVE CORNERS', px + 55, py + 37);

    // Coloured pigeons on ledge / sill (public art flock)
    const pigeonColors = ['#c04050', '#3a88c0', '#d4a020', '#5a9860', '#8a50a0'];
    for (let i = 0; i < 5; i++) {
      const pxi = hx - 160 + i * 28 + Math.sin(t * 0.001 + i) * 2;
      const pyi = groundY - 178 + (i % 2) * 3;
      ctx.fillStyle = pigeonColors[i];
      ctx.beginPath();
      ctx.ellipse(pxi, pyi, 7, 4.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pxi + 6, pyi - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(pxi + 8, pyi - 3, 3, 1);
      // tiny feet
      ctx.strokeStyle = '#3a3020';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pxi - 2, pyi + 4);
      ctx.lineTo(pxi - 2, pyi + 7);
      ctx.moveTo(pxi + 2, pyi + 4);
      ctx.lineTo(pxi + 2, pyi + 7);
      ctx.stroke();
    }

    // Bell rope / chime hammer USE hotspot — mature brass, not cartoon bell
    const bx = hx + 10;
    const by = groundY - 8;
    // hammer arm
    ctx.fillStyle = '#5a4a32';
    ctx.fillRect(bx - 4, groundY - 120, 8, 70);
    // brass hammer head
    const hamm = ctx.createLinearGradient(bx - 18, groundY - 55, bx + 18, groundY - 35);
    hamm.addColorStop(0, '#c4a060');
    hamm.addColorStop(0.5, '#8a6838');
    hamm.addColorStop(1, '#4a3820');
    ctx.fillStyle = hamm;
    ctx.beginPath();
    ctx.ellipse(bx, groundY - 48, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,160,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // rope
    ctx.strokeStyle = interacted ? '#6a5840' : '#a88858';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx + 18, groundY - 48);
    ctx.quadraticCurveTo(bx + 36, groundY - 24, bx + 28, groundY - 2);
    ctx.stroke();
    // rope knot / pull handle
    ctx.fillStyle = interacted ? '#5a4030' : '#8a6040';
    ctx.beginPath();
    ctx.arc(bx + 28, groundY - 4, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c4a070';
    ctx.beginPath();
    ctx.arc(bx + 28, groundY - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    // small chime plate above
    ctx.fillStyle = '#9a7a48';
    ctx.fillRect(bx - 28, groundY - 128, 56, 10);
    ctx.fillStyle = 'rgba(255,230,180,0.2)';
    ctx.fillRect(bx - 26, groundY - 126, 52, 3);
    if (!interacted) {
      ctx.fillStyle = 'rgba(220,180,100,0.7)';
      ctx.font = 'bold 8px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CHIME', bx + 28, groundY - 18);
    }
    lmHotGlow(ctx, bx + 28, groundY, t, interacted, 'rgba(220,170,80,0.95)');

    lmDustMotes(ctx, w, groundY, t, camX, 22);
    lmSoftGrain(ctx, w, h, t);
  }

  function drawMuseumInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted) {
    const wall = ctx.createLinearGradient(0, 40, 0, groundY);
    wall.addColorStop(0, '#e8e2d4');
    wall.addColorStop(0.5, '#d8d0c0');
    wall.addColorStop(1, '#c8bfae');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 48, w, groundY - 48);

    // Cornice
    ctx.fillStyle = '#f4f0e6';
    ctx.fillRect(0, 48, w, 14);
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, 60, w, 4);

    // Pilasters / columns
    for (let i = 0; i < 5; i++) {
      const cx = 100 + i * 200 - (camX * 0.05) % 40;
      ctx.fillStyle = '#f0ebe0';
      ctx.fillRect(cx, 68, 18, groundY - 72);
      ctx.fillStyle = '#fffaf2';
      ctx.fillRect(cx + 3, 68, 5, groundY - 72);
      // capital
      ctx.fillStyle = '#e8e0d0';
      ctx.fillRect(cx - 4, 64, 26, 10);
      ctx.fillStyle = '#d0c8b8';
      ctx.fillRect(cx - 2, groundY - 8, 22, 8);
    }

    // Wood floor
    const floorG = ctx.createLinearGradient(0, groundY, 0, h);
    floorG.addColorStop(0, '#8a6a40');
    floorG.addColorStop(0.2, '#6a5030');
    floorG.addColorStop(1, '#2a2010');
    ctx.fillStyle = floorG;
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.strokeStyle = 'rgba(40,28,12,0.25)';
    for (let x = -((camX | 0) % 36); x < w; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x + 10, h);
      ctx.stroke();
    }

    // Soft museum spotlights
    for (let i = 0; i < 4; i++) {
      const sx = 180 + i * 220;
      lmLightShaft(ctx, sx - camX * 0.03, 70, groundY, 70, 0.14);
    }

    // Wall text: Former City Hall
    ctx.fillStyle = 'rgba(40,36,30,0.75)';
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('FORMER CITY HALL  ·  SPADINA AVE', 160, 100);
    ctx.font = '9px Segoe UI, sans-serif';
    ctx.fillStyle = 'rgba(60,50,40,0.55)';
    ctx.fillText('Fraser Valley heritage gallery', 160, 114);

    // Photo of Cheam on wall
    const phx = hx - 210;
    ctx.fillStyle = '#3a342c';
    ctx.fillRect(phx, groundY - 140, 72, 58);
    ctx.fillStyle = '#8aa0b8';
    ctx.fillRect(phx + 4, groundY - 136, 64, 50);
    ctx.fillStyle = '#2a3040';
    ctx.beginPath();
    ctx.moveTo(phx + 8, groundY - 90);
    ctx.lineTo(phx + 20, groundY - 118);
    ctx.lineTo(phx + 36, groundY - 108);
    ctx.lineTo(phx + 50, groundY - 124);
    ctx.lineTo(phx + 66, groundY - 90);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '6px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MT. CHEAM', phx + 36, groundY - 78);

    // Glass cases
    function glassCase(cx, label1, label2, artifactDraw) {
      ctx.fillStyle = '#2a3038';
      ctx.fillRect(cx - 42, groundY - 6, 84, 6);
      ctx.fillStyle = '#4a4030';
      ctx.fillRect(cx - 40, groundY - 12, 80, 8);
      // glass
      const glass = ctx.createLinearGradient(cx - 38, groundY - 100, cx + 38, groundY - 20);
      glass.addColorStop(0, 'rgba(180,210,230,0.18)');
      glass.addColorStop(0.5, 'rgba(200,220,240,0.28)');
      glass.addColorStop(1, 'rgba(160,190,210,0.15)');
      ctx.fillStyle = glass;
      ctx.fillRect(cx - 38, groundY - 100, 76, 88);
      ctx.strokeStyle = 'rgba(120,140,160,0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 38, groundY - 100, 76, 88);
      // highlight
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(cx - 34, groundY - 96, 8, 78);
      if (artifactDraw) artifactDraw();
      ctx.fillStyle = '#d8d0c0';
      ctx.font = 'bold 7px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label1, cx, groundY - 108);
      ctx.font = '6px Segoe UI, sans-serif';
      ctx.fillStyle = 'rgba(200,190,170,0.7)';
      ctx.fillText(label2, cx, groundY - 98);
    }

    glassCase(hx - 100, 'SETTLER PLOUGH', 'c. 1890', function () {
      ctx.strokeStyle = '#6a5030';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(hx - 120, groundY - 45);
      ctx.lineTo(hx - 80, groundY - 55);
      ctx.lineTo(hx - 75, groundY - 40);
      ctx.stroke();
    });

    // Hotspot case — microplastic of Chilliwack (museum label comedy)
    glassCase(hx, 'CASE 14', 'Valley residue', function () {
      ctx.fillStyle = interacted ? '#5a7078' : '#7ec8d8';
      ctx.beginPath();
      ctx.arc(hx, groundY - 55, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.arc(hx - 3, groundY - 58, 3, 0, Math.PI * 2);
      ctx.fill();
      // museum label card
      ctx.fillStyle = '#f4f0e4';
      ctx.fillRect(hx - 34, groundY - 36, 68, 22);
      ctx.fillStyle = '#3a3428';
      ctx.font = 'bold 6px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Microplastic of', hx, groundY - 26);
      ctx.fillText('Chilliwack', hx, groundY - 18);
    });

    glassCase(hx + 110, 'SALMON WEIR', 'Stó:lō', function () {
      ctx.strokeStyle = '#8a7050';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(hx + 90 + i * 8, groundY - 70);
        ctx.lineTo(hx + 95 + i * 8, groundY - 40);
        ctx.stroke();
      }
    });

    lmHotGlow(ctx, hx, groundY, t, interacted, 'rgba(150,200,220,0.85)');
    lmDustMotes(ctx, w, groundY, t, camX, 12);
    lmSoftGrain(ctx, w, h, t);
  }

  function drawRoyalHotelInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted) {
    // Dim lobby — dark wood, velvet shadows
    const wall = ctx.createLinearGradient(0, 40, 0, groundY);
    wall.addColorStop(0, '#3a2428');
    wall.addColorStop(0.4, '#4a2c30');
    wall.addColorStop(1, '#2a181c');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 48, w, groundY - 48);

    // Wainscot
    ctx.fillStyle = '#2a1c18';
    ctx.fillRect(0, groundY - 90, w, 90);
    ctx.fillStyle = '#3a2820';
    ctx.fillRect(0, groundY - 90, w, 6);
    ctx.strokeStyle = 'rgba(180,140,80,0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, groundY - 84);
      ctx.lineTo(x, groundY);
      ctx.stroke();
    }

    // Wallpaper stripe above
    ctx.strokeStyle = 'rgba(120,60,70,0.25)';
    for (let x = 0; x < w; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 52);
      ctx.lineTo(x, groundY - 90);
      ctx.stroke();
    }

    // Floor — worn carpet
    const floorG = ctx.createLinearGradient(0, groundY, 0, h);
    floorG.addColorStop(0, '#4a2830');
    floorG.addColorStop(0.3, '#2a181e');
    floorG.addColorStop(1, '#120c10');
    ctx.fillStyle = floorG;
    ctx.fillRect(0, groundY, w, h - groundY);
    // runner
    ctx.fillStyle = 'rgba(100,40,50,0.45)';
    ctx.fillRect(w * 0.2, groundY, w * 0.45, h - groundY);
    ctx.fillStyle = 'rgba(180,140,60,0.15)';
    ctx.fillRect(w * 0.2, groundY, 4, h - groundY);
    ctx.fillRect(w * 0.65, groundY, 4, h - groundY);

    // Brass wall sconce lamps
    for (let i = 0; i < 3; i++) {
      const lx = 200 + i * 280;
      ctx.fillStyle = '#8a7040';
      ctx.fillRect(lx - 3, groundY - 150, 6, 20);
      ctx.beginPath();
      ctx.arc(lx, groundY - 155, 8, 0, Math.PI * 2);
      ctx.fill();
      const glow = ctx.createRadialGradient(lx, groundY - 140, 2, lx, groundY - 140, 50);
      glow.addColorStop(0, 'rgba(255,200,120,0.35)');
      glow.addColorStop(1, 'rgba(255,160,80,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lx, groundY - 140, 50, 0, Math.PI * 2);
      ctx.fill();
    }

    // Check-in desk
    const dx = hx - 40;
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(dx - 70, groundY - 58, 160, 58);
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(dx - 74, groundY - 64, 168, 10);
    ctx.fillStyle = '#8a6a40';
    ctx.fillRect(dx - 70, groundY - 64, 160, 3);
    // desk lamp
    ctx.fillStyle = '#c4a060';
    ctx.fillRect(dx - 50, groundY - 88, 4, 24);
    ctx.beginPath();
    ctx.moveTo(dx - 58, groundY - 88);
    ctx.lineTo(dx - 42, groundY - 88);
    ctx.lineTo(dx - 48, groundY - 78);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,200,120,0.4)';
    ctx.beginPath();
    ctx.arc(dx - 48, groundY - 70, 20, 0, Math.PI * 2);
    ctx.fill();
    // room keys on board
    ctx.fillStyle = '#2a2018';
    ctx.fillRect(dx + 40, groundY - 120, 50, 50);
    ctx.fillStyle = '#c4a060';
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.fillRect(dx + 46 + c * 14, groundY - 112 + r * 14, 8, 3);
        ctx.beginPath();
        ctx.arc(dx + 50 + c * 14, groundY - 106 + r * 14, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#d8c090';
    ctx.font = 'bold 8px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ROYAL · 1909', dx + 10, groundY - 42);
    ctx.font = '7px Segoe UI, sans-serif';
    ctx.fillStyle = 'rgba(200,180,140,0.6)';
    ctx.fillText('WELLINGTON AVE', dx + 10, groundY - 30);

    // Beer-parlour doorway
    ctx.fillStyle = '#1a1010';
    ctx.fillRect(hx + 160, groundY - 110, 50, 110);
    ctx.fillStyle = 'rgba(180,100,40,0.25)';
    ctx.fillRect(hx + 166, groundY - 100, 38, 90);
    ctx.fillStyle = '#8a7040';
    ctx.font = 'bold 7px Segoe UI, sans-serif';
    ctx.fillText('PARLOUR', hx + 185, groundY - 114);

    // Framed B&W lobby photo
    ctx.fillStyle = '#2a2018';
    ctx.fillRect(hx - 220, groundY - 150, 64, 50);
    ctx.fillStyle = '#8a8880';
    ctx.fillRect(hx - 216, groundY - 146, 56, 42);
    ctx.fillStyle = '#4a4840';
    ctx.fillRect(hx - 210, groundY - 130, 44, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '5px Segoe UI, sans-serif';
    ctx.fillText('LOBBY · BERRY ERA', hx - 188, groundY - 96);

    // Room-service cart USE — KFC gag, hotel realism
    const cx = hx + 70;
    ctx.fillStyle = interacted ? '#4a4030' : '#5a5040';
    ctx.fillRect(cx - 28, groundY - 42, 56, 28);
    ctx.fillStyle = '#3a3428';
    ctx.fillRect(cx - 30, groundY - 46, 60, 6);
    // cloche / bucket suggestion
    ctx.fillStyle = interacted ? '#6a5840' : '#c49040';
    ctx.beginPath();
    ctx.ellipse(cx, groundY - 52, 14, 10, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = interacted ? '#5a4830' : '#a07030';
    ctx.fillRect(cx - 12, groundY - 52, 24, 8);
    // wheels
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx - 18, groundY - 2, 5, 0, Math.PI * 2);
    ctx.arc(cx + 18, groundY - 2, 5, 0, Math.PI * 2);
    ctx.fill();
    // napkin / lid sheen
    ctx.fillStyle = 'rgba(255,240,200,0.2)';
    ctx.fillRect(cx - 8, groundY - 58, 6, 4);
    if (!interacted) {
      ctx.fillStyle = 'rgba(220,180,100,0.65)';
      ctx.font = 'bold 7px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SERVICE', cx, groundY - 66);
    }
    lmHotGlow(ctx, cx, groundY, t, interacted, 'rgba(220,160,80,0.9)');
    lmSoftGrain(ctx, w, h, t);
  }

  function drawTheatreInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted) {
    // Art-deco auditorium — burgundy / gold
    const wall = ctx.createLinearGradient(0, 40, 0, groundY);
    wall.addColorStop(0, '#2a1828');
    wall.addColorStop(0.5, '#3a2030');
    wall.addColorStop(1, '#1a1018');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 48, w, groundY - 48);

    // Curved wall suggestion (arches)
    ctx.strokeStyle = 'rgba(180,140,60,0.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const ax = 60 + i * 160;
      ctx.beginPath();
      ctx.moveTo(ax, groundY);
      ctx.quadraticCurveTo(ax + 50, groundY - 180, ax + 100, groundY);
      ctx.stroke();
    }

    // Proscenium
    ctx.fillStyle = '#1a0c14';
    ctx.fillRect(hx - 160, groundY - 200, 320, 200);
    // gold frame
    ctx.strokeStyle = '#a88840';
    ctx.lineWidth = 6;
    ctx.strokeRect(hx - 150, groundY - 190, 300, 180);
    ctx.strokeStyle = 'rgba(220,180,100,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(hx - 144, groundY - 184, 288, 168);
    // curtain
    const curt = ctx.createLinearGradient(hx - 140, 0, hx + 140, 0);
    curt.addColorStop(0, '#6a1830');
    curt.addColorStop(0.5, '#881828');
    curt.addColorStop(1, '#5a1428');
    ctx.fillStyle = curt;
    ctx.fillRect(hx - 140, groundY - 180, 280, 120);
    // curtain folds
    ctx.strokeStyle = 'rgba(40,8,16,0.35)';
    for (let i = 0; i < 14; i++) {
      const fx = hx - 130 + i * 20;
      ctx.beginPath();
      ctx.moveTo(fx, groundY - 180);
      ctx.quadraticCurveTo(fx + 8, groundY - 120, fx, groundY - 60);
      ctx.stroke();
    }
    // soft marquee glow above proscenium
    const mg = ctx.createRadialGradient(hx, groundY - 200, 4, hx, groundY - 190, 120);
    mg.addColorStop(0, 'rgba(255,200,100,0.35)');
    mg.addColorStop(1, 'rgba(255,160,60,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(hx - 160, groundY - 230, 320, 50);
    ctx.fillStyle = '#c4a050';
    ctx.font = 'bold 10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PARAMOUNT  ·  1949', hx, groundY - 198);

    // Velvet seats (rows)
    for (let row = 0; row < 3; row++) {
      const ry = groundY - 8 - row * 14;
      for (let s = 0; s < 10; s++) {
        const sx = hx - 200 + s * 42 + row * 6;
        ctx.fillStyle = row === 1 ? '#6a2038' : '#4a1828';
        ctx.fillRect(sx, ry - 18, 28, 18);
        ctx.fillStyle = '#3a1020';
        ctx.fillRect(sx + 2, ry - 22, 24, 6);
      }
    }

    // Floor
    ctx.fillStyle = '#1a1018';
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = 'rgba(180,140,60,0.08)';
    ctx.fillRect(hx - 80, groundY, 160, h - groundY);

    // Stage floor lip
    ctx.fillStyle = '#3a2a18';
    ctx.fillRect(hx - 140, groundY - 22, 280, 14);
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(hx - 140, groundY - 24, 280, 4);

    // ——— Concession: popcorn machine + tubs (lobby vibe near interact) ———
    const px = hx - 118;
    // Machine body
    const popG = ctx.createLinearGradient(px - 22, groundY - 90, px + 22, groundY);
    popG.addColorStop(0, '#e8e0d0');
    popG.addColorStop(0.4, '#c8b090');
    popG.addColorStop(1, '#8a7050');
    ctx.fillStyle = popG;
    ctx.fillRect(px - 24, groundY - 88, 48, 70);
    // Chrome corners
    ctx.strokeStyle = '#d0d0d8';
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 24, groundY - 88, 48, 70);
    // Glass kettle window
    ctx.fillStyle = 'rgba(40, 30, 20, 0.55)';
    ctx.fillRect(px - 16, groundY - 78, 32, 36);
    // Warm butter glow inside
    const butter = ctx.createRadialGradient(px, groundY - 60, 2, px, groundY - 58, 22);
    butter.addColorStop(0, 'rgba(255, 200, 80, 0.55)');
    butter.addColorStop(1, 'rgba(255, 160, 40, 0)');
    ctx.fillStyle = butter;
    ctx.fillRect(px - 16, groundY - 78, 32, 36);
    // Popcorn kernels tumbling
    ctx.fillStyle = '#ffe8a0';
    for (let i = 0; i < 9; i++) {
      const kx = px - 10 + (i % 3) * 9 + Math.sin((t || 0) * 0.01 + i) * 2;
      const ky = groundY - 72 + Math.floor(i / 3) * 10 + Math.cos((t || 0) * 0.012 + i) * 2;
      ctx.beginPath();
      ctx.ellipse(kx, ky, 3.2, 2.4, i * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Red top marquee stripe
    ctx.fillStyle = '#a01828';
    ctx.fillRect(px - 26, groundY - 96, 52, 10);
    ctx.fillStyle = '#ffe8a0';
    ctx.font = 'bold 7px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('POPCORN', px, groundY - 88);
    // Warm lamp on top
    ctx.fillStyle = '#ffcc66';
    ctx.beginPath();
    ctx.arc(px, groundY - 100, 5, 0, Math.PI * 2);
    ctx.fill();
    const lamp = ctx.createRadialGradient(px, groundY - 100, 1, px, groundY - 100, 28);
    lamp.addColorStop(0, 'rgba(255,200,100,0.4)');
    lamp.addColorStop(1, 'rgba(255,160,60,0)');
    ctx.fillStyle = lamp;
    ctx.beginPath();
    ctx.arc(px, groundY - 100, 28, 0, Math.PI * 2);
    ctx.fill();

    // Striped tubs on counter ledge
    const tubs = [px + 38, px + 58, px + 78];
    for (let i = 0; i < tubs.length; i++) {
      const tx = tubs[i];
      ctx.fillStyle = '#f4f0e8';
      ctx.beginPath();
      ctx.moveTo(tx - 8, groundY - 28);
      ctx.lineTo(tx + 8, groundY - 28);
      ctx.lineTo(tx + 6, groundY - 8);
      ctx.lineTo(tx - 6, groundY - 8);
      ctx.closePath();
      ctx.fill();
      // red stripes
      ctx.fillStyle = '#c01828';
      for (let s = 0; s < 3; s++) {
        ctx.fillRect(tx - 7 + s * 5, groundY - 26, 2.5, 16);
      }
      // popcorn heap
      ctx.fillStyle = '#ffe8a0';
      ctx.beginPath();
      ctx.ellipse(tx, groundY - 30, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Concession smell / lobby cue
    ctx.fillStyle = 'rgba(255, 200, 120, 0.22)';
    ctx.font = 'italic 8px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    const bob = Math.sin((t || 0) * 0.008) * 2;
    ctx.fillText('butter in the air…', px + 30, groundY - 108 + bob);

    // Mic on stand (still USE hotspot center)
    ctx.fillStyle = '#4a4a50';
    ctx.fillRect(hx - 2, groundY - 70, 4, 50);
    ctx.fillStyle = interacted ? '#5a5a60' : '#c8c8d0';
    ctx.beginPath();
    ctx.ellipse(hx, groundY - 78, 9, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a2a2e';
    ctx.fillRect(hx - 3, groundY - 72, 6, 4);
    // base
    ctx.fillStyle = '#3a3a40';
    ctx.beginPath();
    ctx.ellipse(hx, groundY - 18, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!interacted) {
      ctx.fillStyle = 'rgba(200,180,120,0.6)';
      ctx.font = 'bold 7px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🍿 USE', hx, groundY - 92);
    }
    lmHotGlow(ctx, hx, groundY, t, interacted, 'rgba(180,220,200,0.75)');
    lmSoftGrain(ctx, w, h, t);
  }

  function drawFireHallInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted) {
    // Apparatus bay
    const wall = ctx.createLinearGradient(0, 40, 0, groundY);
    wall.addColorStop(0, '#6a5048');
    wall.addColorStop(0.5, '#5a4038');
    wall.addColorStop(1, '#4a3028');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 48, w, groundY - 48);

    // Brick pattern
    ctx.strokeStyle = 'rgba(40,24,20,0.25)';
    ctx.lineWidth = 1;
    for (let row = 0; row < 14; row++) {
      const oy = 56 + row * 14;
      const off = (row % 2) * 18;
      for (let x = -20 + off; x < w; x += 36) {
        ctx.strokeRect(x, oy, 34, 12);
      }
    }

    // Polished concrete floor
    const floorG = ctx.createLinearGradient(0, groundY, 0, h);
    floorG.addColorStop(0, '#7a7870');
    floorG.addColorStop(0.2, '#5a5850');
    floorG.addColorStop(1, '#2a2824');
    ctx.fillStyle = floorG;
    ctx.fillRect(0, groundY, w, h - groundY);
    // floor shine
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, groundY + 4, w, 8);
    ctx.strokeStyle = 'rgba(255,200,80,0.2)';
    ctx.setLineDash([20, 16]);
    ctx.beginPath();
    ctx.moveTo(40, groundY + 20);
    ctx.lineTo(w - 40, groundY + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Red bay doors (background)
    for (let i = 0; i < 3; i++) {
      const bx = 140 + i * 200;
      ctx.fillStyle = '#8a2820';
      ctx.fillRect(bx, groundY - 160, 110, 160);
      ctx.fillStyle = '#6a2018';
      for (let p = 0; p < 5; p++) {
        ctx.fillRect(bx + 8 + p * 20, groundY - 152, 14, 144);
      }
      ctx.strokeStyle = '#c4a050';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, groundY - 160, 110, 160);
      // window lights in doors
      ctx.fillStyle = 'rgba(255,220,120,0.35)';
      ctx.fillRect(bx + 20, groundY - 140, 70, 18);
    }

    // Truck silhouette
    ctx.fillStyle = 'rgba(20,16,14,0.55)';
    ctx.fillRect(hx - 200, groundY - 55, 130, 55);
    ctx.fillRect(hx - 180, groundY - 85, 70, 30);
    ctx.fillStyle = 'rgba(180,40,30,0.5)';
    ctx.fillRect(hx - 195, groundY - 50, 120, 20);
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(hx - 175, groundY - 2, 12, 0, Math.PI * 2);
    ctx.arc(hx - 95, groundY - 2, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hose racks
    ctx.fillStyle = '#3a3428';
    ctx.fillRect(hx + 120, groundY - 100, 8, 100);
    ctx.strokeStyle = '#8a3030';
    ctx.lineWidth = 5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(hx + 140, groundY - 80 + i * 22, 16, -0.2, Math.PI * 1.1);
      ctx.stroke();
    }

    // Turnout gear
    ctx.fillStyle = '#c45020';
    ctx.fillRect(hx + 180, groundY - 70, 22, 70);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(hx + 182, groundY - 78, 18, 12);
    ctx.fillStyle = '#c49020';
    ctx.fillRect(hx + 184, groundY - 40, 14, 6);

    // Brass fire pole USE
    const poleX = hx;
    const poleG = ctx.createLinearGradient(poleX - 4, 0, poleX + 4, 0);
    poleG.addColorStop(0, '#6a5030');
    poleG.addColorStop(0.4, '#e0c080');
    poleG.addColorStop(0.7, '#a88848');
    poleG.addColorStop(1, '#4a3820');
    ctx.fillStyle = poleG;
    ctx.fillRect(poleX - 4, 52, 8, groundY - 52);
    // ceiling mount
    ctx.fillStyle = '#5a4a30';
    ctx.fillRect(poleX - 14, 48, 28, 10);
    // floor plate
    ctx.fillStyle = '#4a4030';
    ctx.beginPath();
    ctx.ellipse(poleX, groundY - 2, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Station bell (secondary, near pole)
    ctx.fillStyle = interacted ? '#6a5830' : '#c4a040';
    ctx.beginPath();
    ctx.arc(hx + 45, groundY - 75, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a3020';
    ctx.fillRect(hx + 42, groundY - 95, 6, 12);
    ctx.strokeStyle = 'rgba(255,230,160,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hx + 45, groundY - 75, 16, 0, Math.PI * 2);
    ctx.stroke();

    if (!interacted) {
      ctx.fillStyle = 'rgba(220,180,100,0.65)';
      ctx.font = 'bold 8px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('POLE', poleX, groundY - 110);
    }
    lmHotGlow(ctx, poleX + 20, groundY, t, interacted, 'rgba(220,170,70,0.9)');
    lmDustMotes(ctx, w, groundY, t, camX, 10);
    lmSoftGrain(ctx, w, h, t);
  }

  function drawVedderBridgeInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted) {
    // Standing on bridge walkway — outdoor dusk
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, groundY);
    ctx.clip();
    drawFlySkylineBackdrop(ctx, w, groundY + 20, groundY, camX * 0.35 + t * 0.02);
    ctx.restore();

    // Water below deck
    const waterTop = groundY + 18;
    const wg = ctx.createLinearGradient(0, waterTop, 0, h);
    wg.addColorStop(0, '#2a4860');
    wg.addColorStop(0.4, '#1a3048');
    wg.addColorStop(1, '#0c1828');
    ctx.fillStyle = wg;
    ctx.fillRect(0, waterTop, w, h - waterTop);
    // reflections
    ctx.fillStyle = 'rgba(255,160,80,0.12)';
    for (let i = 0; i < 8; i++) {
      const wx = ((t * 0.03 + i * 110) % (w + 60)) - 30;
      ctx.fillRect(wx, waterTop + 10 + (i % 4) * 12, 50 + (i % 3) * 10, 3);
    }
    ctx.fillStyle = 'rgba(180,220,255,0.1)';
    for (let i = 0; i < 5; i++) {
      const wx = ((t * 0.05 + i * 140) % (w + 40)) - 20;
      ctx.fillRect(wx, waterTop + 28 + (i % 3) * 10, 36, 2);
    }
    // gravel bar hint
    ctx.fillStyle = 'rgba(120,110,90,0.35)';
    ctx.beginPath();
    ctx.ellipse(w * 0.7, h - 10, 90, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bridge deck (wood/steel)
    const deckG = ctx.createLinearGradient(0, groundY - 8, 0, waterTop);
    deckG.addColorStop(0, '#6a5a48');
    deckG.addColorStop(0.5, '#4a4034');
    deckG.addColorStop(1, '#3a342c');
    ctx.fillStyle = deckG;
    ctx.fillRect(0, groundY - 8, w, 28);
    // planks
    ctx.strokeStyle = 'rgba(30,24,18,0.35)';
    for (let x = -((camX | 0) % 28); x < w; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, groundY - 8);
      ctx.lineTo(x, groundY + 18);
      ctx.stroke();
    }
    // steel edge
    ctx.fillStyle = '#3a4048';
    ctx.fillRect(0, groundY - 12, w, 5);
    ctx.fillStyle = '#5a6870';
    ctx.fillRect(0, groundY - 12, w, 2);

    // Rails
    ctx.strokeStyle = '#4a5058';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY - 48);
    ctx.lineTo(w, groundY - 48);
    ctx.moveTo(0, groundY - 28);
    ctx.lineTo(w, groundY - 28);
    ctx.stroke();
    for (let i = 0; i < 20; i++) {
      const rx = i * 55 - (camX * 0.2) % 55;
      ctx.fillStyle = '#505860';
      ctx.fillRect(rx, groundY - 48, 4, 40);
      // bolt
      ctx.fillStyle = '#8a9098';
      ctx.fillRect(rx, groundY - 48, 4, 2);
    }

    // Life ring
    ctx.strokeStyle = '#c44030';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(hx - 80, groundY - 55, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#e8e0d0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hx - 80, groundY - 55, 14, -0.4, 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx - 80, groundY - 55, 14, Math.PI - 0.4, Math.PI + 0.4);
    ctx.stroke();

    // Crumbs USE hotspot on rail
    ctx.fillStyle = interacted ? '#5a4a38' : '#c8b090';
    ctx.beginPath();
    ctx.ellipse(hx, groundY - 50, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = interacted ? '#6a5840' : '#e8d8b0';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(hx - 10 + i * 5, groundY - 52 + (i % 2), 2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!interacted) {
      ctx.fillStyle = 'rgba(200,210,220,0.65)';
      ctx.font = 'bold 7px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CRUMBS', hx, groundY - 62);
    }
    // floaters in water
    ctx.fillStyle = 'rgba(200,220,240,0.45)';
    ctx.beginPath();
    ctx.arc(hx + 40 + Math.sin(t * 0.003) * 12, waterTop + 30, 4, 0, Math.PI * 2);
    ctx.arc(hx - 30 + Math.cos(t * 0.004) * 10, waterTop + 42, 3, 0, Math.PI * 2);
    ctx.fill();

    lmHotGlow(ctx, hx, groundY, t, interacted, 'rgba(160,200,220,0.8)');
    lmSoftGrain(ctx, w, h, t);
  }

  /** Kurtis Not Hall — neon-card pianist (seated at keys) */
  function drawKurtisNotHall(ctx, x, y, t, opts) {
    opts = opts || {};
    const scale = opts.scale != null ? opts.scale : (STANDING_HEIGHT / 62) * 0.92;
    const handPhase = Math.sin((t || 0) * 0.018) * 2.2;
    const handPhase2 = Math.sin((t || 0) * 0.022 + 1.2) * 1.8;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    // soft shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // magenta/cyan rim
    ctx.strokeStyle = 'rgba(255,60,200,0.35)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-14, -42);
    ctx.quadraticCurveTo(-16, -28, -12, -8);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(60,210,255,0.28)';
    ctx.beginPath();
    ctx.moveTo(14, -42);
    ctx.quadraticCurveTo(16, -28, 12, -8);
    ctx.stroke();
    // seated legs
    const pant = ctx.createLinearGradient(-10, -20, 10, 0);
    pant.addColorStop(0, '#2a2a36');
    pant.addColorStop(1, '#0a0a10');
    ctx.fillStyle = pant;
    ctx.fillRect(-12, -18, 10, 16);
    ctx.fillRect(2, -18, 10, 16);
    ctx.fillStyle = '#0e0e14';
    ctx.fillRect(-13, -4, 11, 5);
    ctx.fillRect(2, -4, 11, 5);
    // tuxedo torso
    const torso = ctx.createLinearGradient(-12, -48, 12, -18);
    torso.addColorStop(0, '#2a2a34');
    torso.addColorStop(0.45, '#121218');
    torso.addColorStop(1, '#060608');
    ctx.fillStyle = torso;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-12, -48, 24, 30, 5);
    else ctx.rect(-12, -48, 24, 30);
    ctx.fill();
    // white shirt + bowtie
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(-4, -46, 8, 16);
    ctx.fillStyle = '#c03050';
    ctx.fillRect(-5, -44, 10, 3);
    ctx.beginPath();
    ctx.moveTo(-6, -42); ctx.lineTo(0, -38); ctx.lineTo(6, -42);
    ctx.closePath();
    ctx.fill();
    // arms to keys
    ctx.fillStyle = '#121218';
    ctx.save();
    ctx.translate(-10, -34);
    ctx.rotate(0.55 + handPhase * 0.02);
    ctx.fillRect(-2, 0, 5, 16);
    ctx.fillStyle = '#d4a882';
    ctx.fillRect(-2, 14 + handPhase * 0.15, 5, 4);
    ctx.restore();
    ctx.save();
    ctx.translate(10, -34);
    ctx.rotate(-0.55 + handPhase2 * 0.02);
    ctx.fillStyle = '#121218';
    ctx.fillRect(-3, 0, 5, 16);
    ctx.fillStyle = '#d4a882';
    ctx.fillRect(-3, 14 + handPhase2 * 0.15, 5, 4);
    ctx.restore();
    // head
    const hg = ctx.createRadialGradient(-2, -58, 1, 0, -56, 10);
    hg.addColorStop(0, '#e8c4a4');
    hg.addColorStop(0.55, '#d4a882');
    hg.addColorStop(1, '#a07858');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(0, -56, 8.5, 0, Math.PI * 2);
    ctx.fill();
    // dark hair slick
    ctx.fillStyle = '#1a1210';
    ctx.beginPath();
    ctx.ellipse(0, -62, 9, 6, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-9, -62, 18, 4);
    // shades
    ctx.fillStyle = 'rgba(20,20,30,0.7)';
    ctx.beginPath();
    ctx.ellipse(-3.5, -56, 3.4, 2.5, -0.1, 0, Math.PI * 2);
    ctx.ellipse(3.5, -56, 3.4, 2.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(-3.5, -56, 3.4, 2.5, -0.1, 0, Math.PI * 2);
    ctx.ellipse(3.5, -56, 3.4, 2.5, 0.1, 0, Math.PI * 2);
    ctx.stroke();
    // music note particles
    if (!opts.noNotes) {
      ctx.font = 'bold 10px Segoe UI, sans-serif';
      ctx.fillStyle = 'rgba(255,100,200,0.75)';
      const n1 = Math.sin((t || 0) * 0.01) * 6;
      const n2 = Math.cos((t || 0) * 0.012) * 5;
      ctx.globalAlpha = 0.55 + Math.sin((t || 0) * 0.015) * 0.25;
      ctx.fillText('♪', 14 + n1, -70 - Math.abs(n1));
      ctx.fillStyle = 'rgba(80,220,255,0.7)';
      ctx.fillText('♫', -18 + n2, -78 - Math.abs(n2));
      ctx.globalAlpha = 1;
    }
    // name label
    if (!opts.noLabel) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.font = 'bold 8px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      // unscale for readable label roughly
      ctx.fillText('Kurtis Not Hall', 0, 16);
      ctx.textAlign = 'left';
    }
    ctx.restore();
  }

  function drawSassySaloonInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted) {
    // Dusty gold / magenta bar room
    const wall = ctx.createLinearGradient(0, 40, 0, groundY);
    wall.addColorStop(0, '#2a1418');
    wall.addColorStop(0.35, '#4a2820');
    wall.addColorStop(0.7, '#3a2018');
    wall.addColorStop(1, '#1a100c');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 48, w, groundY - 48);

    // Warm stage / lamp blooms
    const bloom = ctx.createRadialGradient(w * 0.55, 90, 10, w * 0.5, 120, 280);
    bloom.addColorStop(0, 'rgba(255,160,60,0.28)');
    bloom.addColorStop(0.5, 'rgba(255,40,140,0.1)');
    bloom.addColorStop(1, 'rgba(255,160,60,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 48, w, groundY - 48);

    // Wood wainscot
    ctx.fillStyle = '#2a1c14';
    ctx.fillRect(0, groundY - 100, w, 100);
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(0, groundY - 100, w, 6);
    ctx.strokeStyle = 'rgba(180,140,80,0.22)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, groundY - 94);
      ctx.lineTo(x, groundY);
      ctx.stroke();
    }

    // Checkered / worn floor
    const tile = 28;
    for (let ty = 0; ty < h - groundY + 4; ty += tile) {
      for (let tx = -((camX | 0) % (tile * 2)); tx < w + tile; tx += tile) {
        const dark = (((tx / tile) | 0) + ((ty / tile) | 0)) % 2 === 0;
        ctx.fillStyle = dark ? '#2a1c14' : '#3a2a1c';
        ctx.fillRect(tx, groundY + ty, tile, tile);
      }
    }
    // Dust / wear wash
    const floorWash = ctx.createLinearGradient(0, groundY, 0, h);
    floorWash.addColorStop(0, 'rgba(180,140,80,0.08)');
    floorWash.addColorStop(0.4, 'rgba(0,0,0,0.15)');
    floorWash.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = floorWash;
    ctx.fillRect(0, groundY, w, h - groundY);

    // Neon beer signs on back wall
    function neonSign(sx, sy, text, col) {
      ctx.fillStyle = '#0a0810';
      ctx.fillRect(sx - 4, sy - 14, 72, 22);
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(sx - 4, sy - 14, 72, 22);
      ctx.fillStyle = col;
      ctx.font = 'bold 10px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = col;
      ctx.shadowBlur = 10;
      ctx.fillText(text, sx + 32, sy);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }
    neonSign(180 - camX * 0.15, groundY - 160, 'MOON BEER', '#ff60c0');
    neonSign(420 - camX * 0.1, groundY - 170, 'YALE LAGER', '#40e0ff');
    neonSign(700 - camX * 0.12, groundY - 155, 'SASSY IPA', '#ffe040');

    // Stage lights
    for (let i = 0; i < 4; i++) {
      const lx = 240 + i * 160;
      ctx.fillStyle = '#2a2a30';
      ctx.fillRect(lx - 6, 52, 12, 10);
      const spot = ctx.createRadialGradient(lx, 70, 2, lx, 120, 70);
      spot.addColorStop(0, i % 2 ? 'rgba(255,80,180,0.35)' : 'rgba(255,200,80,0.3)');
      spot.addColorStop(1, 'rgba(255,160,80,0)');
      ctx.fillStyle = spot;
      ctx.beginPath();
      ctx.moveTo(lx - 8, 62);
      ctx.lineTo(lx + 8, 62);
      ctx.lineTo(lx + 50, groundY - 20);
      ctx.lineTo(lx - 50, groundY - 20);
      ctx.closePath();
      ctx.fill();
    }

    // Long wood bar (right side)
    const barX = hx + 80;
    const barG = ctx.createLinearGradient(barX, groundY - 70, barX + 200, groundY);
    barG.addColorStop(0, '#3a2418');
    barG.addColorStop(0.4, '#6a4830');
    barG.addColorStop(0.7, '#4a3020');
    barG.addColorStop(1, '#2a1810');
    ctx.fillStyle = barG;
    ctx.fillRect(barX, groundY - 62, 210, 62);
    ctx.fillStyle = '#8a6840';
    ctx.fillRect(barX - 4, groundY - 68, 218, 10);
    ctx.fillStyle = 'rgba(255,220,160,0.25)';
    ctx.fillRect(barX, groundY - 66, 210, 3);
    // Bottles
    for (let i = 0; i < 9; i++) {
      const bx = barX + 12 + i * 22;
      ctx.fillStyle = i % 3 === 0 ? '#6a1020' : (i % 3 === 1 ? '#1a4a3a' : '#2a3a6a');
      ctx.fillRect(bx, groundY - 100, 7, 28);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(bx + 1, groundY - 98, 2, 10);
    }
    // Bar stools
    for (let i = 0; i < 4; i++) {
      const sx = barX + 24 + i * 48;
      ctx.fillStyle = '#1a1210';
      ctx.fillRect(sx - 2, groundY - 28, 4, 28);
      ctx.fillRect(sx + 10, groundY - 28, 4, 28);
      ctx.fillStyle = '#4a3020';
      ctx.beginPath();
      ctx.ellipse(sx + 6, groundY - 30, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Piano in the corner (hotspot)
    const px = hx;
    const py = groundY;
    // Piano body
    ctx.fillStyle = '#0e0e12';
    ctx.fillRect(px - 50, py - 36, 100, 22);
    ctx.fillRect(px - 46, py - 22, 10, 22);
    ctx.fillRect(px + 36, py - 22, 10, 22);
    // Keys
    ctx.fillStyle = '#f4efe6';
    ctx.fillRect(px - 42, py - 32, 84, 10);
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 10; i++) {
      if (i % 7 === 2 || i % 7 === 5) continue;
      ctx.fillRect(px - 38 + i * 8, py - 32, 4, 6);
    }
    // Piano rim neon
    ctx.strokeStyle = interacted ? 'rgba(160,140,100,0.4)' : 'rgba(255,100,200,0.7)';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(px - 50, py - 36, 100, 22);
    // Bench
    ctx.fillStyle = '#2a1a14';
    ctx.fillRect(px - 18, py - 14, 36, 8);

    // Kurtis at piano
    drawKurtisNotHall(ctx, px, py - 8, t, { noLabel: false });

    if (!interacted) {
      ctx.fillStyle = 'rgba(255,180,100,0.7)';
      ctx.font = 'bold 8px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HEAR HIM PLAY', px, py - 88);
      ctx.textAlign = 'left';
    }

    lmHotGlow(ctx, px, groundY, t, interacted, 'rgba(255,120,200,0.9)');
    lmSoftGrain(ctx, w, h, t);
  }

  function drawLandmarkInterior(ctx, w, h, camX, t, opts) {
    opts = opts || {};
    const kind = opts.kind || 'clockTower';
    const label = opts.label || '';
    const interacted = !!opts.interacted;
    const groundY = h * 0.72;
    const hx = LANDMARK_HOTSPOT_X - camX;
    const ex = LANDMARK_EXIT_X - camX;

    // Per-kind rooms own their walls/floors; hatch + title overlaid after
    if (kind === 'clockTower') {
      drawClockTowerInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted);
    } else if (kind === 'museum') {
      drawMuseumInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted);
    } else if (kind === 'royalHotel') {
      drawRoyalHotelInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted);
    } else if (kind === 'theatre') {
      drawTheatreInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted);
    } else if (kind === 'fireHall') {
      drawFireHallInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted);
    } else if (kind === 'vedderBridge') {
      drawVedderBridgeInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted);
    } else if (kind === 'sassySaloon') {
      drawSassySaloonInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted);
    } else {
      drawClockTowerInteriorRoom(ctx, w, h, camX, t, groundY, hx, interacted);
    }

    lmDrawHatch(ctx, ex, groundY, t);
    lmTitleBanner(ctx, w, label || kind);
  }



  global.MothershipWorld = {
    DISTRICTS,
    TARGET_KINDS,
    PEOPLE_KINDS,
    HAZARD_KINDS,
    LOOT_KINDS,
    COW_KIND,
    SHIP_TABLE_X,
    MICROPLASTIC_THRESHOLD,
    MAX_LIVES_BASE,
    MAX_LIVES_UPGRADED,
    ONE_LINERS,
    BAD_BEAM_LINERS,
    PLASTICS_LINERS,
    CHICKEN_LINERS,
    RESULTS_LINERS,
    SHED_GAGS,
    SHED_WORLD_W,
    SHED_DOOR_X,
    YARD_SHED_DOOR_X,
    SHIP_WORLD_W,
    SHIP_HELM_X,
    BAND_SIZE,
    BAND_ROSTER,
    LANDMARK_WORLD_W,
    LANDMARK_HOTSPOT_X,
    LANDMARK_EXIT_X,
    SHED_CASSETTE_X,
    SHED_STEREO_X,
    SHED_CAMINO_X,
    SHED_INSTRUMENTS,
    CAMINO_DOOR_DX,
    CAMINO_HALF_W,
    SHED_WINDOW_X,
    CHAR_SCALE,
    STANDING_HEIGHT,
    SEATED_HEIGHT,
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
    drawShipInterior,
    drawLandmarkInterior,
    drawClayAlien,
    drawBoardCutscene,
    drawCassetteScene,
    drawFlyScene,
    drawStreetDriveScene,
    drawHuman,
    drawZakk,
    drawTayler,
    drawBandMate,
    drawTaylor,
    drawClayUFO,
    drawCitizen,
    drawTitleBackdrop,
    drawJointSesh,
    drawRollingPaper,
    drawWeedPinch,
    drawLighterFlame,
    drawJoint,
    drawSmokePuffs,
  };
})(window);
