/**
 * Mothership — Chilliwack skies
 * Flow: title (insert cassette → playTheme) → shed (Tayler press steps → UFO land) → yard (board ship) → ship (walk to helm / take seat) → fly → results
 * Pilots: Zakk & Tayler. Theme starts on menu cassette insert (iOS-safe gesture).
 * Fly scroll is player-driven (no auto-scroll). Landing legs extend on ground, tuck on takeoff.
 */
(function () {
  const W = MothershipWorld;
  const Audio = window.MothershipAudio;
  const HS_KEY = 'mothership_highscore';
  const LB_KEY = 'mothership_leaderboard_v1';
  const NAME_KEY = 'mothership_last_name';
  const LB_MAX = 10;

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const CW = canvas.width;
  const CH = canvas.height;
  const GROUND = CH * 0.72;

  const el = {
    hud: document.getElementById('hud'),
    score: document.getElementById('score'),
    beamed: document.getElementById('beamed'),
    plastics: document.getElementById('plastics'),
    plasticsLabel: document.getElementById('plastics-label'),
    chicken: document.getElementById('chicken'),
    chickenLabel: document.getElementById('chicken-label'),
    multLabel: document.getElementById('mult-label'),
    multValue: document.getElementById('mult'),
    operateChoice: document.getElementById('screen-operate-choice'),
    btnLandShed: document.getElementById('btn-land-shed'),
    btnFlyAgainOp: document.getElementById('btn-fly-again-op'),
    modeLabel: document.getElementById('mode-label'),
    district: document.getElementById('district'),
    prompt: document.getElementById('prompt-label'),
    title: document.getElementById('screen-title'),
    results: document.getElementById('screen-results'),
    titleHigh: document.getElementById('title-high'),
    playCount: document.getElementById('play-count'),
    resBeamed: document.getElementById('res-beamed'),
    resScore: document.getElementById('res-score'),
    resHigh: document.getElementById('res-high'),
    resLiner: document.getElementById('res-liner'),
    muteBtn: document.getElementById('mute-btn'),
    touch: document.getElementById('touch'),
    btnAgain: document.getElementById('btn-again'),
    btnTitle: document.getElementById('btn-title'),
    btnBeam: document.getElementById('btn-beam'),
    btnDestruct: document.getElementById('btn-destruct'),
    hudDestruct: document.getElementById('hud-destruct'),
    btnInteract: document.getElementById('btn-interact'),
    carStereo: document.getElementById('car-stereo'),
    menuCassette: document.getElementById('menu-cassette'),
    cassetteSlot: document.getElementById('cassette-slot'),
    stereoDisplay: document.getElementById('stereo-display'),
    slotHint: document.getElementById('slot-hint'),
    titleLbList: document.getElementById('title-lb-list'),
    titleLbEmpty: document.getElementById('title-lb-empty'),
    resultsLbList: document.getElementById('results-lb-list'),
    resultsLbEmpty: document.getElementById('results-lb-empty'),
    saveScoreWrap: document.getElementById('save-score-wrap'),
    saveScoreLabel: document.getElementById('save-score-label'),
    scoreName: document.getElementById('score-name'),
    btnSaveScore: document.getElementById('btn-save-score'),
    saveScoreMsg: document.getElementById('save-score-msg'),
  };

  const keys = Object.create(null);
  const touchDirs = Object.create(null);
  let interactQueued = false;
  let beamQueued = false;
  let jumpQueued = false;
  let prevInteractHeld = false;
  let prevBeamHeld = false;

  // title | shed | yard | ship | fly | operate | landmark | bandTour | results
  let mode = 'title';
  let t = 0;
  let lastTs = 0;
  let flashMsg = null;
  let flashTimer = 0;
  let particles = [];
  let floaters = [];

  let score = 0;
  let beamed = 0;
  /** 15th-person surgery Easter egg — once per run */
  let recognizedDone = false;
  /** Operate-mode state: walk → surgery stages → choice */
  let operate = null;
  /** Snapshot of fly run to resume after surgery / landmark visit */
  let flyResume = null;
  /** Landmark landing visit: settle → walk → liftoff */
  let landmarkVisit = null;
  /** Band abduction tour after van/bus beam */
  let bandTour = null;
  /** Edge-detect ↓ for land confirm while hovering a landmark */
  let prevLandDownHeld = false;

  let avatar = null;
  let camX = 0;
  let tayler = null;
  let landing = null;
  let fly = null;
  /** Theme already started from menu cassette insert */
  let tapeInStereo = true;
  /** Shared sesh with Tayler (press-to-advance steps) */
  let smoking = false;
  /** Overall 0..1 progress across joint stages (HUD bar) */
  let smokeProgress = 0;
  /** Finished joint + UFO land gate complete */
  let smokeDone = false;
  /** 0..1 UFO fly-in in shed window; advances after Smoke step */
  let windowUfo = 0;
  /**
   * Joint step id while animating / awaiting next press:
   * 'gethigh' | 'roll' | 'light' | 'smoke' | null
   */
  let jointStage = null;
  /** 'await' = show next button · 'anim' = playing stage · null = not started */
  let jointPhase = null;
  /** Index of next / current JOINT_STEPS entry */
  let jointStepIndex = 0;
  /** Frames elapsed in current joint stage animation */
  let jointTimer = 0;
  /** UFO landing auto-anim after smoke (separate from press steps) */
  let ufoLanding = false;
  /** Mouth-puff frames remaining (Up while holding lit joint) */
  let puffTimer = 0;
  /** Previous frame Up-held for puff edge detect */
  let prevUpHeld = false;
  /** Brief sit + takeoff after taking driver's seat (ship mode) */
  let boardSit = null;
  /** Guard double-insert on title stereo */
  let titleInserting = false;
  /**
   * Gold '67 El Camino Easter egg (optional — does not gate story).
   * inYard: car parked/driven in backyard; driving: Zakk is behind the wheel.
   */
  let camino = null;
  let drivingCamino = false;

  function resetCamino() {
    camino = {
      x: W.SHED_CAMINO_X,
      facingRight: false,
      wheelRot: 0,
      inYard: false,
      vx: 0,
    };
    drivingCamino = false;
  }

  function caminoDoorX() {
    if (!camino) return W.SHED_CAMINO_X + W.CAMINO_DOOR_DX;
    // Door sits toward the nose; nose is left when !facingRight
    return camino.x + (camino.facingRight ? -W.CAMINO_DOOR_DX : W.CAMINO_DOOR_DX);
  }

  function nearCaminoDoor() {
    if (!avatar || !camino || drivingCamino) return false;
    if (mode === 'shed' && camino.inYard) return false;
    if (mode === 'yard' && !camino.inYard) return false;
    // Prefer cabin / door over whole car so walking past bed doesn't prompt
    const doorX = caminoDoorX();
    return Math.abs(avatar.x - doorX) < 52 && Math.abs(avatar.x - camino.x) < 140;
  }

  function makeCaminoDriverDraw() {
    return function (ctx) {
      // Head-in-window: drawElCamino clips to CAMINO_WIN so only cabin glass shows Zakk.
      // Feet/body stay below the clip; scale keeps the head readable at game size.
      W.drawZakk(ctx, W.CAMINO_DOOR_DX + 4, -70, -1, false, t, {
        seated: true,
        scale: 0.46,
        noLabel: true,
        noShadow: true,
        smoking: false,
      });
    };
  }

  function enterCamino() {
    if (!camino || drivingCamino) return;
    drivingCamino = true;
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    avatar.vx = 0;
    avatar.vy = 0;
    avatar.onGround = true;
    avatar.x = caminoDoorX();
    avatar.y = GROUND;
    Audio.play('ui');
    showFlash("Fired up the '67 — ←→ drive · E exit", 110);
    setPrompt('← → drive · E / USE exit');
    syncInteractBtn();
  }

  function exitCamino() {
    if (!drivingCamino || !camino) return;
    drivingCamino = false;
    camino.vx = 0;
    interactQueued = false;
    prevInteractHeld = true;
    avatar.x = caminoDoorX();
    avatar.y = GROUND;
    avatar.vx = 0;
    Audio.play('ui');
    showFlash('Parked the Camino.', 70);
    syncInteractBtn();
  }

  /** Drive through shed exit → yard with car */
  function driveCaminoToYard() {
    mode = 'yard';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    boardSit = null;
    Audio.play('ui');
    Audio.play('power');
    if (!landing) {
      const targetY = GROUND - 86;
      landing = {
        phase: 'landed',
        x: 720,
        y: targetY,
        targetY: targetY,
        scale: 2.28,
        lights: true,
        timer: 0,
        legExtend: 1,
        showPilots: false,
      };
    }
    // Keep Tayler in yard for boarding flow if sesh done; otherwise still spawn
    if (!tayler) tayler = { x: 240, y: GROUND };
    else tayler.x = 240;
    camino.inYard = true;
    camino.x = W.YARD_SHED_DOOR_X + 120;
    camino.facingRight = true;
    camino.vx = 2.5;
    drivingCamino = true;
    avatar.x = caminoDoorX();
    avatar.y = GROUND;
    camX = Math.max(0, Math.min(Math.max(0, 1200 - CW), avatar.x - CW * 0.4));
    showFlash('Drove the gold Camino into the yard!', 130);
    setPrompt('← → drive · E exit · board mothership when ready');
    showScreen('play');
    syncHud();
    syncInteractBtn();
  }

  /** Drive back into shed from yard */
  function driveCaminoToShed() {
    mode = 'shed';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    boardSit = null;
    Audio.play('ui');
    if (!tayler) tayler = { x: 940, y: GROUND };
    camino.inYard = false;
    camino.x = Math.min(W.SHED_DOOR_X - 160, W.SHED_WORLD_W - 200);
    camino.facingRight = false;
    camino.vx = -2;
    drivingCamino = true;
    avatar.x = caminoDoorX();
    avatar.y = GROUND;
    camX = Math.max(0, Math.min(Math.max(0, W.SHED_WORLD_W - CW), avatar.x - CW * 0.4));
    showFlash('Back in the shed — Camino style.', 90);
    showScreen('play');
    syncHud();
    syncInteractBtn();
  }

  function updateCaminoDrive(worldW) {
    const accel = 0.55;
    const maxSpd = 9.2;
    const friction = 0.88;
    const ix = inputX();
    camino.vx += ix * accel;
    camino.vx *= friction;
    if (Math.abs(camino.vx) > maxSpd) camino.vx = Math.sign(camino.vx) * maxSpd;
    if (Math.abs(ix) > 0.1) camino.facingRight = ix > 0;
    camino.x += camino.vx;
    camino.wheelRot += camino.vx * 0.045;
    const pad = W.CAMINO_HALF_W * 0.55;
    camino.x = Math.max(pad, Math.min(worldW - pad, camino.x));
    // Keep avatar hitbox glued to door for camera / proximity
    avatar.x = caminoDoorX();
    avatar.y = GROUND;
    avatar.vx = camino.vx;
    avatar.vy = 0;
    avatar.onGround = true;
    avatar.facing = camino.facingRight ? 1 : -1;
    camX = Math.max(0, Math.min(Math.max(0, worldW - CW), avatar.x - CW * 0.4));
  }

  /**
   * Press-required Tayler sesh (not one long auto-cutscene).
   * Labels match UX copy casually.
   */
  const JOINT_STEPS = [
    { id: 'gethigh', dur: 34, prompt: 'get high with T', label: 'Start the sesh…', btn: 'get high with T' },
    { id: 'roll', dur: 55, prompt: 'roll joint', label: 'Tayler rolls — paper + weed…', btn: 'roll joint' },
    { id: 'light', dur: 42, prompt: 'light the joint', label: 'Zakk lights it…', btn: 'light the joint' },
    { id: 'smoke', dur: 64, prompt: 'Smoke the joint', label: 'Puff puff…', btn: 'Smoke the joint' },
  ];

  function jointStageIndex(id) {
    for (let i = 0; i < JOINT_STEPS.length; i++) {
      if (JOINT_STEPS[i].id === id) return i;
    }
    return -1;
  }

  function jointOverallProgress() {
    if (smokeDone) return 1;
    if (!jointStage && jointPhase == null) return 0;
    const idx = jointStepIndex;
    let done = 0;
    let total = 0;
    for (let i = 0; i < JOINT_STEPS.length; i++) {
      total += JOINT_STEPS[i].dur;
      if (i < idx) done += JOINT_STEPS[i].dur;
    }
    if (jointPhase === 'anim' && jointStage) {
      const cur = JOINT_STEPS[jointStageIndex(jointStage)];
      if (cur) done += Math.min(cur.dur, jointTimer);
    }
    // UFO landing adds a little tail progress
    total += 90;
    if (ufoLanding || smokeDone) done += Math.min(90, windowUfo * 90);
    return Math.max(0, Math.min(1, done / total));
  }

  function currentJointPrompt() {
    if (smokeDone || ufoLanding) return null;
    const step = JOINT_STEPS[jointStepIndex];
    return step || null;
  }

  function syncInteractBtn() {
    if (!el.btnInteract) return;
    if (mode === 'fly') {
      const nv = nearBandVehicle();
      if (nv && nv.lowEnough && !nv.already) el.btnInteract.textContent = 'LAND';
      else if (nearLandableLandmark()) el.btnInteract.textContent = 'LAND';
      else el.btnInteract.textContent = 'USE';
      return;
    }
    if (mode === 'bandTour' && bandTour && bandTour.phase === 'walk' && avatar) {
      const mate = nearBandMate();
      if (mate) el.btnInteract.textContent = bandTour.talked[mate.id] ? 'DONE' : 'USE';
      else if (avatar.x < 120) el.btnInteract.textContent = 'WRAP';
      else el.btnInteract.textContent = 'USE';
      return;
    }
    if (mode === 'landmark' && landmarkVisit && landmarkVisit.phase === 'walk' && avatar) {
      if (Math.abs(avatar.x - W.LANDMARK_EXIT_X) < 55) {
        el.btnInteract.textContent = 'TAKEOFF';
        return;
      }
      if (Math.abs(avatar.x - W.LANDMARK_HOTSPOT_X) < 60) {
        el.btnInteract.textContent = landmarkVisit.interacted ? 'DONE' : 'USE';
        return;
      }
      el.btnInteract.textContent = 'USE';
      return;
    }
    if (drivingCamino) {
      el.btnInteract.textContent = 'EXIT';
      return;
    }
    const step = (mode === 'shed' && nearTaylerForPrompt()) ? currentJointPrompt() : null;
    if (step && jointPhase !== 'anim') {
      el.btnInteract.textContent = step.btn;
    } else if (nearCaminoDoor()) {
      el.btnInteract.textContent = 'DRIVE';
    } else if (mode === 'shed' && nearDoor() && ufoLanded()) {
      el.btnInteract.textContent = 'EXIT';
    } else if (mode === 'yard' && nearYardShedDoor()) {
      el.btnInteract.textContent = 'ENTER';
    } else if (mode === 'yard' && nearInteract()) {
      el.btnInteract.textContent = 'BOARD';
    } else if (mode === 'ship' && nearInteract() && !boardSit) {
      el.btnInteract.textContent = 'SIT';
    } else if (mode === 'operate' && operate && operate.phase === 'walk' && nearOperateTable()) {
      el.btnInteract.textContent = 'OPERATE';
    } else {
      el.btnInteract.textContent = 'USE';
    }
  }

  function nearTaylerForPrompt() {
    if (mode !== 'shed' || !avatar || !tayler) return false;
    if (smokeDone || ufoLanding) return false;
    if (jointPhase === 'anim') return false;
    return Math.abs(avatar.x - tayler.x) < 72;
  }

  function getHigh() {
    try {
      return parseInt(localStorage.getItem(HS_KEY) || '0', 10) || 0;
    } catch (_) {
      return 0;
    }
  }
  function setHigh(n) {
    try {
      localStorage.setItem(HS_KEY, String(Math.max(0, Math.floor(Number(n) || 0))));
    } catch (_) { /* private mode / quota */ }
  }

  function safeGetItem(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function safeSetItem(key, val) {
    try { localStorage.setItem(key, val); return true; } catch (_) { return false; }
  }

  /** Strip tags / junk; keep letters, numbers, spaces; trim; cap length. */
  function sanitizeName(raw) {
    return String(raw == null ? '' : raw)
      .replace(/<[^>]*>/g, '')
      .replace(/[^A-Za-z0-9 ]+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12);
  }

  function isValidName(name) {
    return typeof name === 'string' && name.length >= 1 && name.length <= 12 && /^[A-Za-z0-9 ]+$/.test(name);
  }

  function loadBoard() {
    try {
      const raw = safeGetItem(LB_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      return arr
        .map((e) => ({
          name: sanitizeName(e && e.name) || '???',
          score: Math.max(0, Math.floor(Number(e && e.score) || 0)),
          ts: Number(e && e.ts) || 0,
        }))
        .filter((e) => e.score > 0 && e.name.length >= 1)
        .sort((a, b) => b.score - a.score || a.ts - b.ts)
        .slice(0, LB_MAX);
    } catch (_) {
      return [];
    }
  }

  function persistBoard(entries) {
    const trimmed = (entries || []).slice(0, LB_MAX);
    if (!safeSetItem(LB_KEY, JSON.stringify(trimmed))) {
      return false;
    }
    // Keep personal-best key in sync with board top (never invent remote scores).
    const top = trimmed.length ? trimmed[0].score : 0;
    if (top > getHigh()) setHigh(top);
    return true;
  }

  function syncHighFromBoard() {
    const board = loadBoard();
    if (board.length && board[0].score > getHigh()) setHigh(board[0].score);
  }

  function renderOneBoard(listEl, emptyEl, highlightTs) {
    if (!listEl) return;
    const entries = loadBoard();
    listEl.textContent = '';
    if (!entries.length) {
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }
    if (emptyEl) emptyEl.classList.add('hidden');
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const li = document.createElement('li');
      li.className = 'lb-row' + (highlightTs != null && e.ts === highlightTs ? ' lb-row--new' : '');
      const rank = document.createElement('span');
      rank.className = 'lb-rank';
      rank.textContent = String(i + 1);
      const name = document.createElement('span');
      name.className = 'lb-name';
      name.textContent = e.name;
      const sc = document.createElement('span');
      sc.className = 'lb-score';
      sc.textContent = String(e.score);
      li.appendChild(rank);
      li.appendChild(name);
      li.appendChild(sc);
      listEl.appendChild(li);
    }
  }

  function renderLeaderboards(highlightTs) {
    syncHighFromBoard();
    renderOneBoard(el.titleLbList, el.titleLbEmpty, highlightTs);
    renderOneBoard(el.resultsLbList, el.resultsLbEmpty, highlightTs);
    if (el.titleHigh) el.titleHigh.textContent = 'High Score: ' + getHigh();
  }

  function setupResultsSaveUI() {
    if (!el.saveScoreWrap) return;
    if (el.saveScoreMsg) {
      el.saveScoreMsg.textContent = '';
      el.saveScoreMsg.classList.add('hidden');
      el.saveScoreMsg.classList.remove('err');
    }
    if (score > 0) {
      el.saveScoreWrap.classList.remove('hidden');
      const board = loadBoard();
      const personalHigh = getHigh();
      const isPersonalBest = score >= personalHigh && score > 0;
      const wouldBeFirst = !board.length || score > board[0].score;
      const worst = board.length ? board[board.length - 1].score : 0;
      const qualifies = board.length < LB_MAX || score > worst;
      if (el.saveScoreLabel) {
        let label = 'SAVE SCORE';
        if (wouldBeFirst) label = '★ NEW #1 — SAVE SCORE';
        else if (isPersonalBest) label = '★ NEW HIGH — SAVE SCORE';
        else if (qualifies) label = 'SAVE TO LEADERBOARD';
        el.saveScoreLabel.textContent = label;
        el.saveScoreLabel.classList.toggle('new-high', wouldBeFirst || isPersonalBest);
      }
      const last = safeGetItem(NAME_KEY) || '';
      if (el.scoreName) {
        el.scoreName.value = last;
        el.scoreName.disabled = false;
        setTimeout(function () {
          if (mode === 'results' && el.scoreName && !el.scoreName.disabled) {
            try { el.scoreName.focus(); el.scoreName.select(); } catch (_) {}
          }
        }, 80);
      }
      if (el.btnSaveScore) {
        el.btnSaveScore.disabled = false;
        el.btnSaveScore.textContent = 'SUBMIT';
      }
      // If we already know their name, auto-submit qualifying scores so highs don't get lost
      const lastClean = sanitizeName(last);
      if (lastClean && isValidName(lastClean) && (isPersonalBest || qualifies || wouldBeFirst)) {
        setTimeout(function () {
          if (mode !== 'results' || !el.btnSaveScore || el.btnSaveScore.disabled) return;
          if (sanitizeName(el.scoreName && el.scoreName.value) !== lastClean) return;
          onSaveScoreClick();
        }, 220);
      }
    } else {
      el.saveScoreWrap.classList.add('hidden');
    }
  }

  /** Returns { ok, isNewHigh, entry } or { ok:false, reason } */
  function submitScoreToBoard() {
    if (score <= 0) return { ok: false, reason: 'Score must be > 0' };
    let clean = sanitizeName(el.scoreName ? el.scoreName.value : '');
    if (!clean) clean = 'PILOT';
    if (!isValidName(clean)) {
      return { ok: false, reason: 'Name: 1–12 letters, numbers, spaces' };
    }
    const entry = { name: clean, score: Math.floor(score), ts: Date.now() };
    // Always lock personal best even if board is full of higher scores
    if (entry.score > getHigh()) setHigh(entry.score);

    let board = loadBoard();
    // Upsert: keep best score per name (case-insensitive)
    const nameKey = clean.toLowerCase();
    const prevIdx = board.findIndex((e) => (e.name || '').toLowerCase() === nameKey);
    if (prevIdx >= 0) {
      if (entry.score < board[prevIdx].score) {
        // Don't demote an existing better score for this name
        safeSetItem(NAME_KEY, clean);
        return {
          ok: true,
          isNewHigh: false,
          entry: board[prevIdx],
          keptBest: true,
          reason: 'Kept your best (' + board[prevIdx].score + ')',
        };
      }
      board.splice(prevIdx, 1);
    }
    board.push(entry);
    board.sort((a, b) => b.score - a.score || b.ts - a.ts);
    const trimmed = board.slice(0, LB_MAX);
    const madeIt = trimmed.some((e) => e.ts === entry.ts && e.score === entry.score && e.name === entry.name);
    if (!madeIt) {
      safeSetItem(NAME_KEY, clean);
      return { ok: false, reason: 'Not quite top 10 — personal best still saved' };
    }
    if (!persistBoard(trimmed)) {
      return { ok: false, reason: 'Could not write leaderboard (storage blocked)' };
    }
    safeSetItem(NAME_KEY, clean);
    const isNewHigh = !!(trimmed[0] && trimmed[0].ts === entry.ts);
    return { ok: true, isNewHigh: isNewHigh, entry: entry };
  }

  function onSaveScoreClick() {
    if (!el.btnSaveScore || el.btnSaveScore.disabled) return;
    const result = submitScoreToBoard();
    if (!result.ok) {
      if (el.saveScoreMsg) {
        el.saveScoreMsg.textContent = result.reason || 'Could not save';
        el.saveScoreMsg.classList.remove('hidden');
        el.saveScoreMsg.classList.add('err');
      }
      return;
    }
    if (el.saveScoreMsg) {
      let msg = 'SCORE SAVED';
      if (result.isNewHigh) msg = '★ NEW HIGH SAVED!';
      else if (result.keptBest) msg = result.reason || 'KEPT YOUR BEST';
      el.saveScoreMsg.textContent = msg;
      el.saveScoreMsg.classList.remove('hidden', 'err');
    }
    if (el.btnSaveScore) {
      el.btnSaveScore.disabled = true;
      el.btnSaveScore.textContent = 'SAVED';
    }
    if (el.scoreName) el.scoreName.disabled = true;
    if (el.resHigh) el.resHigh.textContent = String(getHigh());
    if (el.titleHigh) el.titleHigh.textContent = 'High Score: ' + getHigh();
    renderLeaderboards(result.entry.ts);
    if (Audio && Audio.play) Audio.play('ui');
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
      ship: 'SHIP',
      fly: 'FLY',
      operate: 'OPERATE',
      landmark: 'VISIT',
      bandTour: 'BAND',
    };
    el.modeLabel.textContent = labels[mode] || '';
    const flyHud = (mode === 'fly' && fly) ? fly
      : (mode === 'landmark' && flyResume) ? flyResume
      : (mode === 'bandTour' && flyResume) ? flyResume
      : null;
    if (flyHud) {
      el.district.classList.remove('hidden');
      const distName = mode === 'landmark' && landmarkVisit
        ? (landmarkVisit.label || 'LANDMARK')
        : W.DISTRICTS[flyHud.districtIndex % W.DISTRICTS.length].name;
      el.district.textContent =
        distName + ' · HULL ' + flyHud.lives + '/' + flyHud.maxLives;
      const thresh = W.MICROPLASTIC_THRESHOLD;
      const prog = (flyHud.microplastics | 0) % thresh;
      if (el.plastics) el.plastics.textContent = prog + '/' + thresh;
      if (el.chicken) el.chicken.textContent = String(flyHud.chicken | 0);
      if (el.multLabel && el.multValue) {
        if (flyHud.scoreMultTimer > 0) {
          el.multLabel.classList.remove('hidden');
          el.multValue.textContent = '2× ' + Math.ceil(flyHud.scoreMultTimer / 60) + 's';
        } else {
          el.multLabel.classList.add('hidden');
        }
      }
    } else if (mode === 'operate') {
      el.district.classList.remove('hidden');
      el.district.textContent = 'Sickbay · Subject #' + beamed;
      if (el.multLabel) el.multLabel.classList.add('hidden');
    } else if (mode === 'bandTour') {
      el.district.classList.remove('hidden');
      el.district.textContent = 'Mothership · Retrofit aboard';
      if (el.multLabel) el.multLabel.classList.add('hidden');
    } else {
      el.district.classList.add('hidden');
      if (el.multLabel) el.multLabel.classList.add('hidden');
    }
    syncInvHud();
    syncBeamUi();
  }

  function syncInvHud() {
    // Cassette hunt removed — theme starts from title stereo insert.
  }

  /** Beam touch control + fly-only HUD bits — hidden until fly. */
  function syncBeamUi() {
    const flying = mode === 'fly';
    const visiting = mode === 'landmark' || mode === 'bandTour';
    const inRunHud = flying || mode === 'operate' || visiting;
    if (el.btnBeam) el.btnBeam.classList.toggle('hidden', !flying);
    // Keep #btn-destruct / #hud-destruct — visibility only; placement owned elsewhere
    if (el.btnDestruct) el.btnDestruct.classList.toggle('hidden', !flying);
    if (el.hudDestruct) el.hudDestruct.classList.toggle('hidden', !flying);
    if (el.beamed) {
      const wrap = document.getElementById('beamed-label');
      if (wrap) wrap.classList.toggle('hidden', !inRunHud);
    }
    if (el.plasticsLabel) el.plasticsLabel.classList.toggle('hidden', !(flying || visiting));
    if (el.chickenLabel) el.chickenLabel.classList.toggle('hidden', !(flying || visiting));
  }

  function hideOperateChoice() {
    if (el.operateChoice) el.operateChoice.classList.add('hidden');
  }

  function showOperateChoice() {
    if (el.operateChoice) el.operateChoice.classList.remove('hidden');
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
    if (name !== 'play') hideOperateChoice();
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

  // ——— Global play count (increments every START) ———
  const PLAY_COUNT_TALLY = 'https://tally.yuki.sh/hits/retrofit/mothership-plays.json';
  const PLAY_COUNT_KEY = 'retrofit_mothership_plays_v1';
  const PLAY_COUNT_API = 'https://countapi.mileshilliard.com/api/v1';
  let lastPlayCount = null;

  function formatPlays(n) {
    const num = Number(n);
    if (!Number.isFinite(num) || num < 0) return 'Plays: …';
    if (num === 1) return '1 play';
    return num.toLocaleString('en-CA') + ' plays';
  }

  function setPlayCountLabel(n) {
    if (!el.playCount) return;
    if (Number.isFinite(Number(n))) lastPlayCount = Number(n);
    el.playCount.textContent = formatPlays(n);
  }

  async function fetchPlayCount() {
    // Prefer Tally read (no increment)
    try {
      const res = await fetch(PLAY_COUNT_TALLY + '?mode=read', { cache: 'no-store', mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        const v = Number(data.visit);
        if (Number.isFinite(v)) {
          setPlayCountLabel(v);
          return v;
        }
      }
    } catch (_) { /* try fallback */ }

    try {
      const res = await fetch(PLAY_COUNT_API + '/get/' + PLAY_COUNT_KEY, { cache: 'no-store', mode: 'cors' });
      if (!res.ok) throw new Error('get failed');
      const data = await res.json();
      const v = Number(data.value);
      if (Number.isFinite(v)) {
        setPlayCountLabel(v);
        return v;
      }
    } catch (_) { /* ignore */ }

    if (el.playCount && (el.playCount.textContent.includes('…') || el.playCount.textContent.includes('—'))) {
      el.playCount.textContent = lastPlayCount != null ? formatPlays(lastPlayCount) : 'Plays: —';
    }
    return lastPlayCount;
  }

  async function recordPlay() {
    // Optimistic bump so the UI moves even if the network is slow
    if (lastPlayCount != null) setPlayCountLabel(lastPlayCount + 1);
    else if (el.playCount) el.playCount.textContent = 'Plays: …';

    // Primary: Tally hit (GET without mode=read increments)
    try {
      const res = await fetch(PLAY_COUNT_TALLY, { cache: 'no-store', mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        const v = Number(data.visit);
        if (Number.isFinite(v)) {
          setPlayCountLabel(v);
          return v;
        }
      }
    } catch (_) { /* fallback */ }

    // Fallback: Miles CountAPI hit
    try {
      const res = await fetch(PLAY_COUNT_API + '/hit/' + PLAY_COUNT_KEY, { cache: 'no-store', mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        const v = Number(data.value);
        if (Number.isFinite(v)) {
          setPlayCountLabel(v);
          return v;
        }
      }
    } catch (_) { /* ignore */ }

    await fetchPlayCount();
    return lastPlayCount;
  }

  function resetStereoTitleUI() {
    titleInserting = false;
    if (el.carStereo) {
      el.carStereo.classList.remove('inserting', 'inserted', 'playing');
    }
    if (el.stereoDisplay) {
      el.stereoDisplay.innerHTML =
        '<span class="stereo-eq" aria-hidden="true"></span><span class="stereo-lcd">INSERT TAPE</span>';
    }
    if (el.slotHint) el.slotHint.classList.remove('hidden');
  }

  function setStereoPlayingUI() {
    if (el.carStereo) {
      el.carStereo.classList.add('inserted', 'playing');
      el.carStereo.classList.remove('inserting');
    }
    if (el.stereoDisplay) {
      el.stereoDisplay.innerHTML =
        '<span class="stereo-eq" aria-hidden="true"></span><span class="stereo-lcd">▶ MOTHERSHIP</span>';
    }
  }

  /**
   * Title cassette insert — same user gesture starts theme (iOS-safe) + begins the run.
   * recordPlay fires on insert/start.
   */
  function insertCassetteAndStart() {
    if (mode !== 'title' || titleInserting) return;
    titleInserting = true;
    gestureUnlock();
    Audio.warm();
    // Must stay in this gesture stack:
    Audio.playTheme();
    Audio.play('cassette');
    Audio.play('ui');
    recordPlay();
    if (el.carStereo) {
      el.carStereo.classList.add('inserting');
      el.carStereo.classList.remove('inserted', 'playing');
    }
    if (el.stereoDisplay) {
      el.stereoDisplay.innerHTML =
        '<span class="stereo-eq" aria-hidden="true"></span><span class="stereo-lcd">LOADING…</span>';
    }
    setTimeout(function () {
      setStereoPlayingUI();
      beginRun(true);
    }, 520);
  }

  /** Start / restart a run. Theme already playing when fromTitleInsert. */
  function beginRun(fromTitleInsert) {
    if (!fromTitleInsert) {
      gestureUnlock();
      Audio.warm();
      Audio.playTheme();
      Audio.play('ui');
      recordPlay();
    }
    score = 0;
    beamed = 0;
    recognizedDone = false;
    operate = null;
    flyResume = null;
    landmarkVisit = null;
    bandTour = null;
    prevLandDownHeld = false;
    hideOperateChoice();
    particles = [];
    floaters = [];
    flashMsg = null;
    fly = null;
    landing = null;
    boardSit = null;
    tapeInStereo = true;
    smoking = false;
    smokeProgress = 0;
    smokeDone = false;
    windowUfo = 0;
    jointStage = null;
    jointPhase = null;
    jointStepIndex = 0;
    jointTimer = 0;
    ufoLanding = false;
    puffTimer = 0;
    prevUpHeld = false;
    titleInserting = false;
    resetCamino();
    syncInvHud();
    enterShed();
  }

  /** Results "FLY AGAIN" — gesture-safe theme restart */
  function startGame() {
    beginRun(false);
  }

  function enterShed() {
    mode = 'shed';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    camX = 0;
    if (!camino) resetCamino();
    drivingCamino = false;
    // Spawn in the shed by the El Camino
    avatar = makeAvatar(220, GROUND);
    tayler = { x: 940, y: GROUND };
    showScreen('play');
    syncHud();
    syncInteractBtn();
    setPrompt('Walk up to Tayler — get high with T');
    showFlash('Theme on. Hang with Tayler by the Camino.', 130);
  }

  /** From backyard — re-enter shed without resetting sesh / landing progress */
  function returnToShed() {
    mode = 'shed';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    boardSit = null;
    drivingCamino = false;
    Audio.play('ui');
    if (!tayler) tayler = { x: 940, y: GROUND };
    avatar = makeAvatar(Math.max(80, W.SHED_DOOR_X - 55), GROUND);
    camX = Math.max(0, Math.min(Math.max(0, W.SHED_WORLD_W - CW), avatar.x - CW * 0.4));
    showScreen('play');
    syncHud();
    syncInteractBtn();
    showFlash('Back in the shed.', 80);
    if (ufoLanded()) setPrompt('← → walk · EXIT → out back');
    else if (ufoLanding) setPrompt('Watch the window — wait for it to land…');
    else setPrompt('Hang in the shed · EXIT → when ready');
  }

  function enterYard(opts) {
    opts = opts || {};
    mode = 'yard';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    boardSit = null;
    // Walking out the door — leave Camino where it is (usually still in shed)
    drivingCamino = false;
    tayler = { x: 240, y: GROUND };
    Audio.play('ui');
    camX = 0;
    avatar = makeAvatar(opts.fromFlyHome ? 520 : 280, GROUND);

    // Door only opens after land — mothership already waiting in backyard
    const targetY = GROUND - 86;
    landing = {
      phase: 'landed',
      x: 720,
      y: targetY,
      targetY: targetY,
      scale: 2.28,
      lights: true,
      timer: 0,
      legExtend: 1,
      showPilots: false,
    };
    Audio.play('landing');
    if (opts.fromFlyHome) {
      showFlash("Home — landed behind mom's house. Score banked: " + score, 150);
      setPrompt('← SHED · board UFO · score kept — fly again anytime');
    } else {
      showFlash('Mothership waiting. Walk up and board the mothership.', 130);
      setPrompt('Walk to the UFO — board the mothership');
    }
    showScreen('play');
    syncHud();
  }


  function enterShip() {
    mode = 'ship';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    boardSit = null;
    landing = null;
    drivingCamino = false;
    Audio.play('ui');
    Audio.play('power');
    camX = 0;
    avatar = makeAvatar(140, GROUND);
    // Tayler boards with Zakk — companion on the mothership
    tayler = { x: 95, y: GROUND, facing: 1, moving: false };
    showFlash('Welcome aboard — Zakk & Tayler on the mothership. Walk to the helm.', 130);
    setPrompt("Walk to the aliens — take the driver's seat");
    showScreen('play');
    syncHud();
    syncInteractBtn();
  }

  function enterFly(opts) {
    opts = opts || {};
    const resume = opts.resume && flyResume ? flyResume : null;
    selfDestructing = false;
    destructTimer = 0;
    mode = 'fly';
    interactQueued = false;
    beamQueued = false;
    prevBeamHeld = false;
    boardSit = null;
    landing = null;
    operate = null;
    hideOperateChoice();

    if (resume) {
      fly = resume;
      fly.beaming = false;
      fly.beamTimer = 0;
      fly.vx = 0;
      fly.vy = 0;
      fly.invuln = Math.max(fly.invuln | 0, 40);
      if (!fly.visitedLandmarks) fly.visitedLandmarks = {};
      if (fly.beamedVan == null) fly.beamedVan = false;
      if (fly.beamedBus == null) fly.beamedBus = false;
      flyResume = null;
      bandTour = null;
      landmarkVisit = null;
      ensureLandmarks();
      ensureStreetlights();
      showScreen('play');
      syncHud();
      setPrompt("←→↑↓ fly · Space/USE beam · dive near landmark / MOM'S SHED to LAND · Enter end");
      if (opts.fromLandmark) {
        fly.ufoY = Math.min(fly.ufoY != null ? fly.ufoY : CH * 0.45, CH * 0.48);
        fly.legExtend = 0.4;
        showFlash('Back in the air — Chilliwack awaits', 140);
      } else {
        showFlash('Back in the cooler — surgery complete. Fly on!', 140);
      }
      return;
    }

    fly = {
      scrollX: 0,
      ufoX: CW * 0.52,
      ufoY: CH * 0.32,
      vx: 0,
      vy: 0,
      districtIndex: 0,
      districtTimer: 0,
      lives: W.MAX_LIVES_BASE,
      maxLives: W.MAX_LIVES_BASE,
      microplastics: 0,
      chicken: 0,
      scoreMultTimer: 0,
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
      /** Landing legs tucked for flight */
      legExtend: 0,
      /** Fly craft draw scale — smaller + snappier feel */
      ufoScale: 0.92,
      cowSpawned: 0,
      visitedLandmarks: {},
      forceCowSoon: false,
      beamedVan: false,
      beamedBus: false,
    };
    ensureLandmarks();
    ensureStreetlights();
    for (let i = 0; i < 30; i++) spawnProp(60 + i * 68);
    for (let i = 0; i < 5; i++) spawnFlyTarget(300 + i * 200);
    showScreen('play');
    syncHud();
    setPrompt('←→↑↓ fly · Space/USE beam · people+loot good · red=DON\'T · Enter end');
    showFlash('Beam people, microplastics & KFC — not pets!', 140);
  }

  function endMission() {
    Audio.play('gameOver');
    bandTour = null;
    mode = 'results';
    const high = getHigh();
    const isNew = score > high;
    // Always persist if this run matches/beats stored high (covers storage race / missed writes)
    if (score >= high && score > 0) setHigh(score);
    el.resBeamed.textContent = String(beamed);
    el.resScore.textContent = String(score);
    el.resHigh.textContent = String(Math.max(high, score));
    el.resLiner.textContent = isNew
      ? 'NEW HIGH SCORE! The band is proud (and still green).'
      : W.pick(W.RESULTS_LINERS);
    showScreen('results');
    el.titleHigh.textContent = 'High Score: ' + getHigh();
    setupResultsSaveUI();
    renderLeaderboards(null);
    setPrompt('');
  }

  let selfDestructing = false;
  let destructTimer = 0;

  function goToTitleMenu() {
    Audio.stopTheme();
    selfDestructing = false;
    destructTimer = 0;
    mode = 'title';
    fly = null;
    landing = null;
    boardSit = null;
    operate = null;
    flyResume = null;
    landmarkVisit = null;
    hideOperateChoice();
    resetCamino();
    avatar = null;
    tayler = null;
    smoking = false;
    smokeProgress = 0;
    smokeDone = false;
    windowUfo = 0;
    jointStage = null;
    jointPhase = null;
    jointStepIndex = 0;
    jointTimer = 0;
    ufoLanding = false;
    puffTimer = 0;
    prevUpHeld = false;
    tapeInStereo = true;
    particles = [];
    floaters = [];
    flashMsg = null;
    syncInvHud();
    resetStereoTitleUI();
    showScreen('title');
    el.titleHigh.textContent = 'High Score: ' + getHigh();
    renderLeaderboards(null);
    fetchPlayCount();
    setPrompt('');
  }

  function triggerSelfDestruct() {
    if (mode !== 'fly' || !fly || selfDestructing) return;
    selfDestructing = true;
    destructTimer = 0;
    Audio.play('explode');
    showFlash('SELF DESTRUCT — see you in the tape deck', 90);
    setPrompt('💥 BOOM');
    // big explosion FX
    for (let i = 0; i < 5; i++) {
      W.burst(particles, fly.ufoX + (Math.random() - 0.5) * 40, fly.ufoY + (Math.random() - 0.5) * 30, '#ff6622', 18);
      W.burst(particles, fly.ufoX, fly.ufoY, '#ffe088', 12);
    }
    fly.shake = 40;
    fly.hitFlash = 50;
  }


  /** Fixed Chilliwack landmarks — world X along N→S flight (districts ~900 wide). */
  /** Spread ~700–800 apart across N→S Chilliwack so each reads as its own beat. */
  const FLY_LANDMARKS = [
    { x: 320, kind: 'homeShed', label: "MOM'S / SHED", home: true },
    { x: 1100, kind: 'clockTower', label: 'CLOCK TOWER' },
    { x: 1900, kind: 'museum', label: 'MUSEUM' },
    { x: 2700, kind: 'royalHotel', label: 'ROYAL HOTEL' },
    { x: 3500, kind: 'theatre', label: 'PARAMOUNT' },
    { x: 4200, kind: 'fireHall', label: 'FIRE HALL' },
    { x: 5000, kind: 'vedderBridge', label: 'VEDDER BRIDGE' },
  ];

  /** Band vehicles — special fly props (not landmark interiors). Spread in gaps. */
  const FLY_VEHICLES = [
    { x: 1500, kind: 'retrofitVan', label: 'RETROFIT VAN', flag: 'beamedVan', promptName: 'RETROFIT VAN' },
    { x: 4600, kind: 'braveBus', label: 'BRAVE TOUR BUS', flag: 'beamedBus', promptName: 'BRAVE TOUR BUS' },
  ];
  const BAND_BEAM_POINTS = 520;

  const STREETLIGHT_SPACING = 130;

  function districtPropKinds() {
    const id = W.DISTRICTS[fly.districtIndex % W.DISTRICTS.length].id;
    // streetlights spawn on a fixed interval — never mixed into random building picks
    if (id === 'downtown') return ['shop', 'plaza', 'apt', 'car', 'shop', 'tree', 'apt', 'car'];
    if (id === 'farm') return ['barn', 'corn', 'tree', 'house', 'corn', 'tree', 'car'];
    if (id === 'cultus') return ['tree', 'house', 'tree', 'car', 'tree', 'house'];
    if (id === 'south') return ['house', 'apt', 'tree', 'car', 'house', 'shop'];
    return ['house', 'tree', 'car', 'house', 'tree', 'car'];
  }

  function ensureLandmarks() {
    if (!fly) return;
    for (const lm of FLY_LANDMARKS) {
      const has = fly.props.some((p) => p.landmark && p.kind === lm.kind);
      if (!has) {
        fly.props.push({
          x: lm.x,
          kind: lm.kind,
          label: lm.label,
          landmark: true,
        });
      }
    }
    for (const v of FLY_VEHICLES) {
      const has = fly.props.some((p) => p.vehicle && p.kind === v.kind);
      if (!has) {
        fly.props.push({
          x: v.x,
          kind: v.kind,
          label: v.label,
          vehicle: true,
          flag: v.flag,
          promptName: v.promptName,
        });
      }
    }
  }

  /** Keep streetlights on a regular grid along the road (readable via drawStreetlight). */
  function ensureStreetlights() {
    if (!fly) return;
    const spacing = STREETLIGHT_SPACING;
    const minX = Math.max(0, fly.scrollX - 120);
    const maxX = fly.scrollX + CW + 280;
    const start = Math.floor(minX / spacing) * spacing;
    const have = new Set();
    for (const p of fly.props) {
      if (p.kind === 'streetlight') have.add(p.x | 0);
    }
    for (let x = start; x <= maxX; x += spacing) {
      if (x < 20) continue;
      const xi = x | 0;
      // keep lamps off landmark footprints
      if (FLY_LANDMARKS.some((lm) => Math.abs(xi - lm.x) < 45)) continue;
      if (FLY_VEHICLES.some((v) => Math.abs(xi - v.x) < 55)) continue;
      if (!have.has(xi)) {
        fly.props.push({ x: xi, kind: 'streetlight', streetlight: true });
        have.add(xi);
      }
    }
  }


  const PARKED_CAR_COLS = ['#446688', '#884444', '#555', '#c4a35a', '#2a5a3a'];
  function makeProp(x, kind) {
    const prop = { x: x, kind: kind };
    if (kind === 'car') {
      prop.col = PARKED_CAR_COLS[Math.abs(x | 0) % PARKED_CAR_COLS.length];
    }
    return prop;
  }

  function spawnProp(atX) {
    if (!fly) return;
    const kinds = districtPropKinds();
    let x0 = atX != null ? atX : fly.scrollX + CW + W.rand(16, 90);
    // nudge off landmark footprints so icons stay readable
    for (const lm of FLY_LANDMARKS) {
      if (Math.abs(x0 - lm.x) < 55) x0 = lm.x + (x0 < lm.x ? -70 : 70);
    }
    for (const v of FLY_VEHICLES) {
      if (Math.abs(x0 - v.x) < 70) x0 = v.x + (x0 < v.x ? -85 : 85);
    }
    fly.props.push(makeProp(x0, W.pick(kinds)));
    if (Math.random() < 0.62) {
      let x1 = x0 + W.rand(28, 64);
      for (const lm of FLY_LANDMARKS) {
        if (Math.abs(x1 - lm.x) < 55) x1 = lm.x + 75;
      }
      for (const v of FLY_VEHICLES) {
        if (Math.abs(x1 - v.x) < 70) x1 = v.x + 90;
      }
      fly.props.push(makeProp(x1, W.pick(kinds)));
    }
  }

  function spawnFlyTarget(atX) {
    if (!fly) return;
    // Mix: ~50% people, ~22% loot, ~28% hazards; ~4% Holy Cow Easter egg
    const roll = Math.random();
    let kind;
    const forceCow = !!fly.forceCowSoon
      || ((fly.cowSpawned | 0) === 0 && (fly.scrollX | 0) > 1400 && Math.random() < 0.12);
    if (forceCow || Math.random() < 0.04) {
      kind = W.COW_KIND;
      fly.cowSpawned = (fly.cowSpawned | 0) + 1;
      fly.forceCowSoon = false;
    } else if (roll < 0.5) {
      kind = W.pick(W.PEOPLE_KINDS);
    } else if (roll < 0.72) {
      // plastics a bit more common than KFC (threshold repairs)
      kind = Math.random() < 0.6 ? W.LOOT_KINDS[0] : W.LOOT_KINDS[1];
    } else {
      kind = W.pick(W.HAZARD_KINDS);
    }
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

  function upHeld() {
    return !!(keys['arrowup'] || keys['w'] || touchDirs.up);
  }

  /** Zakk holds a lit joint — Up drives mouth-puff instead of generic interact */
  function canPuffJoint() {
    if (mode !== 'shed') return false;
    if (smokeDone || ufoLanding) return true;
    // After light complete: awaiting / in smoke step
    if (jointStage === 'smoke') {
      if (jointPhase === 'anim') {
        const idx = jointStageIndex('smoke');
        const dur = idx >= 0 ? JOINT_STEPS[idx].dur : 64;
        // After handoff (~70% of smoke anim)
        return jointTimer / Math.max(1, dur) >= 0.7;
      }
      return true;
    }
    if (jointPhase === 'await' && jointStepIndex >= 3) return true;
    return false;
  }

  function zakkPuffing() {
    return puffTimer > 0 && canPuffJoint();
  }

  function puffProg() {
    if (puffTimer <= 0) return 0;
    // Count-down timer: strong at start, soft fade at end
    return Math.max(0, Math.min(1, puffTimer / 22));
  }

  function interactHeld() {
    const useKeys = !!(keys['e'] || keys['enter']);
    const upKeys = upHeld();
    // While holding lit joint (and not at open exit door), Up is for puffing
    if (canPuffJoint() && !(nearDoor() && ufoLanded())) {
      return useKeys;
    }
    return !!(useKeys || upKeys);
  }

  function wantsInteract() {
    if (interactQueued) { interactQueued = false; return true; }
    const held = interactHeld();
    const edge = held && !prevInteractHeld;
    prevInteractHeld = held;
    return edge;
  }

  /** Tick / edge-start mouth puff from Up while Zakk has lit joint */
  function updatePuffInput() {
    if (puffTimer > 0) puffTimer--;
    if (!canPuffJoint()) {
      prevUpHeld = upHeld();
      return;
    }
    // At open exit door, Up stays interact — skip puff steal
    if (nearDoor() && ufoLanded()) {
      prevUpHeld = upHeld();
      return;
    }
    const up = upHeld();
    if (up) {
      if (!prevUpHeld) {
        puffTimer = 32;
        Audio.play('smoke');
      } else if (puffTimer < 6) {
        // sustain while held
        puffTimer = 28;
        if (Math.random() < 0.35) Audio.play('smoke');
      }
    }
    prevUpHeld = up;
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

  function isTypingScoreName() {
    const ae = document.activeElement;
    return !!(el.scoreName && (ae === el.scoreName || (ae && ae.id === 'score-name')));
  }

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    const typingName = isTypingScoreName();
    keys[k] = true;
    // Never steal Space/arrows while the name field is focused
    if (!typingName && (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) || e.code === 'Space')) {
      e.preventDefault();
    }
    if (k === 'm' && !typingName) {
      gestureUnlock();
      Audio.toggle();
      updateMuteUI();
    }
    if ((k === 'enter' || k === ' ') && mode === 'title' && !typingName) insertCassetteAndStart();
    if (mode === 'results') {
      if (typingName) {
        if (k === 'enter') onSaveScoreClick();
        return; // let Space type a space in the name
      }
      // Only Enter restarts — Space used to skip save by accident
      if (k === 'enter') startGame();
      return;
    }

    if (k === 'e' || k === 'enter') {
      if (mode === 'fly') {
        if (k === 'e') interactQueued = true; // land if near landmark, else beam (updateFly)
      } else if (mode === 'shed' || mode === 'yard' || mode === 'ship' || mode === 'operate' || mode === 'landmark' || mode === 'bandTour') {
        interactQueued = true;
      }
    }
    if ((k === 'arrowup' || k === 'w') && (mode === 'shed' || mode === 'yard' || mode === 'ship' || mode === 'operate' || mode === 'landmark' || mode === 'bandTour')) {
      // Lit-joint Up → mouth puff (handled in updatePuffInput); keep Up-as-interact otherwise
      if (!(mode === 'shed' && canPuffJoint() && !(nearDoor() && ufoLanded()))) {
        interactQueued = true;
      }
    }

    if ((e.code === 'Space' || k === ' ')) {
      if (mode === 'fly') beamQueued = true;
      else if (mode === 'shed' || mode === 'yard' || mode === 'ship' || mode === 'operate' || mode === 'landmark' || mode === 'bandTour') jumpQueued = true;
    }

    if (k === 'b' && mode === 'fly') beamQueued = true;

    // Post-surgery / band-tour choice keys
    if (mode === 'operate' && operate && operate.phase === 'choice') {
      if (k === 'l') chooseLandShed();
      if (k === 'f') chooseFlyAgainFromOperate();
    }
    if (mode === 'bandTour') {
      if (k === 'l') chooseLandShedFromBandTour();
      if (k === 'f') chooseFlyAgainFromBandTour();
      if (bandTour && bandTour.phase === 'walk' && (k === 'l' || k === 'f')) {
        // keys handled above
      }
    }

    if (k === 'enter' && mode === 'fly') {
      // Prefer landing when hovering a landmark / band vehicle — don't end the run by accident
      const nv = nearBandVehicle();
      if ((nv && nv.lowEnough) || nearLandableLandmark()) interactQueued = true;
      else endMission();
    }
    if ((k === 'x' || k === 'delete' || k === 'backspace') && mode === 'fly') {
      triggerSelfDestruct();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  canvas.addEventListener('click', () => {
    if (mode === 'title') insertCassetteAndStart();
    else if (mode === 'shed' || mode === 'yard' || mode === 'ship' || mode === 'operate' || mode === 'landmark' || mode === 'bandTour') interactQueued = true;
  });

  function bindTitleInsert(node) {
    if (!node) return;
    const go = (e) => {
      e.preventDefault();
      insertCassetteAndStart();
    };
    node.addEventListener('click', go);
    node.addEventListener('touchstart', go, { passive: false });
  }
  bindTitleInsert(el.menuCassette);
  bindTitleInsert(el.cassetteSlot);

  el.btnAgain.addEventListener('click', startGame);
  if (el.btnLandShed) {
    el.btnLandShed.addEventListener('click', function () {
      Audio.play('ui');
      chooseLandShed();
    });
  }
  if (el.btnFlyAgainOp) {
    el.btnFlyAgainOp.addEventListener('click', function () {
      Audio.play('ui');
      chooseFlyAgainFromOperate();
    });
  }
  if (el.btnSaveScore) el.btnSaveScore.addEventListener('click', onSaveScoreClick);
  if (el.scoreName) {
    el.scoreName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSaveScoreClick();
      }
    });
  }
  el.btnTitle.addEventListener('click', () => {
    Audio.play('ui');
    Audio.stopTheme();
    mode = 'title';
    tapeInStereo = true;
    smoking = false;
    smokeProgress = 0;
    smokeDone = false;
    windowUfo = 0;
    jointStage = null;
    jointPhase = null;
    jointStepIndex = 0;
    jointTimer = 0;
    ufoLanding = false;
    puffTimer = 0;
    prevUpHeld = false;
    boardSit = null;
    operate = null;
    flyResume = null;
    hideOperateChoice();
    syncInvHud();
    resetStereoTitleUI();
    showScreen('title');
    el.titleHigh.textContent = 'High Score: ' + getHigh();
    renderLeaderboards(null);
    fetchPlayCount();
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
    else if (mode === 'shed' || mode === 'yard' || mode === 'ship' || mode === 'operate' || mode === 'landmark' || mode === 'bandTour') interactQueued = true;
  }, { passive: false });
  el.btnBeam.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (mode === 'fly') beamQueued = true;
    else if (mode === 'shed' || mode === 'yard' || mode === 'ship' || mode === 'operate' || mode === 'landmark' || mode === 'bandTour') interactQueued = true;
  });

  function onInteractPointer(e) {
    e.preventDefault();
    if (mode === 'fly') {
      // LAND when near landmark; otherwise beam
      interactQueued = true;
      return;
    }
    interactQueued = true;
  }
  el.btnInteract.addEventListener('touchstart', onInteractPointer, { passive: false });
  el.btnInteract.addEventListener('mousedown', onInteractPointer);

  function onDestructPointer(e) {
    e.preventDefault();
    triggerSelfDestruct();
  }
  if (el.btnDestruct) {
    el.btnDestruct.addEventListener('touchstart', onDestructPointer, { passive: false });
    el.btnDestruct.addEventListener('mousedown', onDestructPointer);
  }
  if (el.hudDestruct) {
    el.hudDestruct.addEventListener('click', () => triggerSelfDestruct());
  }

  // ——— Physics ———
  function updateSideScroller(worldW) {
    // ~1.8× prior walk feel — still controllable in shed/yard
    const accel = 0.95;
    const maxSpd = 7.6;
    const friction = 0.80;
    const grav = 0.62;
    const jumpV = -11.4;

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

  function nearDoor() {
    if (mode !== 'shed' || !avatar) return false;
    return Math.abs(avatar.x - W.SHED_DOOR_X) < 50;
  }

  function nearYardShedDoor() {
    if (mode !== 'yard' || !avatar) return false;
    return Math.abs(avatar.x - W.YARD_SHED_DOOR_X) < 55;
  }

  function nearTaylerSesh() {
    if (mode !== 'shed' || !avatar || !tayler) return false;
    if (smokeDone || ufoLanding) return false;
    if (jointPhase === 'anim') return false;
    // Allow starting / advancing steps while near Tayler
    return Math.abs(avatar.x - tayler.x) < 72;
  }

  function ufoLanded() {
    return windowUfo >= 0.98;
  }

  function nearInteract() {
    if (drivingCamino) return true;
    if (nearCaminoDoor()) return true;
    if (mode === 'shed') {
      return nearTaylerSesh() || nearDoor();
    }
    if (mode === 'yard' && landing && landing.phase === 'landed') {
      return Math.abs(avatar.x - landing.x) < 110;
    }
    if (mode === 'ship' && !boardSit && avatar) {
      return Math.abs(avatar.x - W.SHIP_HELM_X) < 90;
    }
    if (mode === 'operate' && operate && operate.phase === 'walk' && avatar) {
      return nearOperateTable();
    }
    if (mode === 'landmark' && landmarkVisit && landmarkVisit.phase === 'walk' && avatar) {
      return Math.abs(avatar.x - W.LANDMARK_HOTSPOT_X) < 60
        || Math.abs(avatar.x - W.LANDMARK_EXIT_X) < 55;
    }
    if (mode === 'bandTour' && bandTour && bandTour.phase === 'walk' && avatar) {
      return !!nearBandMate() || avatar.x < 120;
    }
    return false;
  }

  function beginJointStep(step) {
    smoking = true;
    jointPhase = 'anim';
    jointStage = step.id;
    jointTimer = 0;
    Audio.play('ui');
    showFlash(step.prompt, 90);
    W.burst(particles, tayler.x - camX, GROUND - 50, '#c8e8a0', 10);
    W.addFloater(floaters, tayler.x - camX, GROUND - 80, step.prompt, '#c8e8a0');
    if (step.id === 'light') {
      // sfx during anim
    }
    if (step.id === 'smoke') {
      Audio.play('smoke');
    }
    syncInteractBtn();
  }

  // ——— Updates ———
  function updateShed() {
    updatePuffInput();

    // Easter egg: drive the gold El Camino (optional — never required)
    if (drivingCamino && camino && !camino.inYard) {
      updateCaminoDrive(W.SHED_WORLD_W);
      setPrompt(ufoLanded()
        ? '← → drive · E exit · peel out EXIT → yard'
        : '← → drive · E exit · (EXIT unlocks after landing)');
      if (wantsInteract()) {
        exitCamino();
        syncInteractBtn();
        return;
      }
      // Drive out through garage / exit door (same story gate as walking EXIT)
      if (camino.x + W.CAMINO_HALF_W * 0.35 > W.SHED_DOOR_X - 20) {
        if (ufoLanded()) {
          driveCaminoToYard();
          return;
        }
        // Soft stop — keep Easter egg from skipping the sesh / landing
        camino.x = W.SHED_DOOR_X - 20 - W.CAMINO_HALF_W * 0.35;
        camino.vx = Math.min(0, camino.vx);
        if (Math.random() < 0.08) {
          showFlash(!smokeDone ? 'Sesh first — then peel out!' : 'Wait for the mothership to land…', 80);
        }
      }
      syncInteractBtn();
      return;
    }

    // Press-to-advance joint: get high → roll → light → smoke → UFO lands
    if (jointPhase === 'anim' && jointStage && !smokeDone) {
      jointTimer++;
      const idx = jointStageIndex(jointStage);
      const stage = JOINT_STEPS[idx];
      const stageProg = Math.min(1, jointTimer / Math.max(1, stage.dur));
      smokeProgress = jointOverallProgress();
      setPrompt(stage.prompt + ' — ' + stage.label);

      if (jointStage === 'light' && jointTimer === 8) Audio.play('smoke');
      if (jointStage === 'roll' && jointTimer === 4) Audio.play('ui');
      if (jointStage === 'smoke' && jointTimer === 10) Audio.play('smoke');
      if (jointStage === 'smoke' && Math.random() < 0.03) Audio.play('smoke');

      if (jointTimer >= stage.dur) {
        if (idx >= JOINT_STEPS.length - 1) {
          // After Smoke — UFO appears / lands in the shed window
          jointPhase = null;
          jointStage = 'smoke';
          smoking = true;
          ufoLanding = true;
          windowUfo = 0.02;
          Audio.play('landing');
          showFlash('Dude… the window! Mothership inbound!', 120);
          W.addFloater(floaters, tayler.x - camX, GROUND - 90, 'UFO!', '#7dff3a');
        } else {
          jointStepIndex = idx + 1;
          jointPhase = 'await';
          jointStage = JOINT_STEPS[jointStepIndex].id;
          jointTimer = 0;
          const next = JOINT_STEPS[jointStepIndex];
          showFlash('▲ ' + next.prompt, 80);
          syncInteractBtn();
        }
      }

      avatar.vx *= 0.45;
      updateSideScroller(W.SHED_WORLD_W);
      syncInteractBtn();
      return;
    }

    // Auto UFO land after smoke step (door unlocks when landed)
    if (ufoLanding && !smokeDone) {
      windowUfo = Math.min(1, windowUfo + 0.012);
      smokeProgress = jointOverallProgress();
      if (Math.random() < 0.03) Audio.play('smoke');
      setPrompt('Watch the window — mothership landing…');
      if (windowUfo >= 0.98) {
        windowUfo = 1;
        ufoLanding = false;
        smokeDone = true;
        smoking = false;
        smokeProgress = 1;
        jointStage = null;
        jointPhase = null;
        Audio.play('landing');
        Audio.play('power');
        showFlash('Mothership landed! Head for EXIT →', 130);
        W.addFloater(floaters, tayler.x - camX, GROUND - 90, 'LANDED', '#7dff3a');
      }
      avatar.vx *= 0.55;
      updateSideScroller(W.SHED_WORLD_W);
      syncInteractBtn();
      return;
    }

    updateSideScroller(W.SHED_WORLD_W);

    if (tayler && Math.abs(avatar.x - tayler.x) < 60 && Math.random() < 0.01 && jointPhase == null && !smokeDone) {
      showFlash(W.pick(W.SHED_GAGS), 100);
    }

    if (nearTaylerSesh()) {
      const step = currentJointPrompt();
      if (step) {
        if (canPuffJoint() && step.id === 'smoke') {
          setPrompt('↑ puff · E / USE — ' + step.prompt);
        } else {
          setPrompt('↑ / E / USE — ' + step.prompt);
        }
        if (wantsInteract()) {
          beginJointStep(step);
        }
      }
    } else if (nearCaminoDoor()) {
      setPrompt('↑ / E / USE — DRIVE EL CAMINO');
      if (wantsInteract()) {
        enterCamino();
        return;
      }
    } else if (nearDoor()) {
      if (!ufoLanded()) {
        let msg;
        if (!smokeDone && !ufoLanding) {
          msg = 'Hang with Tayler first — then the mothership lands';
        } else {
          msg = 'Wait for it to land…';
        }
        setPrompt(msg);
        prevInteractHeld = interactHeld();
        if (wantsInteract()) {
          showFlash(!smokeDone ? 'get high with T first!' : 'Wait for it to land…', 100);
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
      if (canPuffJoint() && !smokeDone && !ufoLanding) {
        const step = currentJointPrompt();
        setPrompt(step ? '↑ puff · walk to Tayler — ' + step.prompt : '↑ puff');
      } else if (!smokeDone && !ufoLanding) {
        const step = currentJointPrompt();
        setPrompt(step ? 'Walk to Tayler — ' + step.prompt : 'Walk up to Tayler');
      } else if (!ufoLanded()) {
        setPrompt(canPuffJoint() ? '↑ puff · watch the window — landing…' : 'Watch the window — wait for it to land…');
      } else {
        setPrompt(canPuffJoint()
          ? '↑ puff · ← → walk · Camino / EXIT →'
          : '← → walk · Camino · EXIT →');
      }
    }
    syncInteractBtn();
  }

  function updateYard() {
    if (landing) landing.timer++;

    // Driving Camino in the yard
    if (drivingCamino && camino && camino.inYard) {
      updateCaminoDrive(1200);
      setPrompt('← → drive · E exit · ← shed door · mothership →');
      if (wantsInteract()) {
        exitCamino();
        syncInteractBtn();
        return;
      }
      // Drive back into shed
      if (camino.x - W.CAMINO_HALF_W * 0.25 < W.YARD_SHED_DOOR_X + 10 && camino.vx < -0.4) {
        driveCaminoToShed();
        return;
      }
      syncInteractBtn();
      return;
    }

    updateSideScroller(1200);

    if (tayler && landing && landing.phase === 'landed') {
      const tx = landing.x - 50;
      if (tayler.x < tx - 4) tayler.x += 1.2;
      else if (tayler.x > tx + 4) tayler.x -= 1.2;
    }

    // Prefer shed door when near it (left side) over boarding
    if (nearYardShedDoor() && !(camino && camino.inYard && nearCaminoDoor())) {
      setPrompt('↑ / E / USE — enter the shed');
      if (wantsInteract()) {
        returnToShed();
        return;
      }
      syncInteractBtn();
      return;
    }

    if (nearCaminoDoor()) {
      setPrompt('↑ / E / USE — DRIVE EL CAMINO');
      if (wantsInteract()) {
        enterCamino();
        return;
      }
      syncInteractBtn();
      return;
    }

    if (landing && landing.phase === 'landed') {
      if (nearInteract()) {
        setPrompt('↑ / E / USE — board the mothership');
        if (wantsInteract()) {
          Audio.play('power');
          Audio.play('ui');
          showFlash('Boarding the mothership…', 80);
          enterShip();
          return;
        }
      } else {
        prevInteractHeld = interactHeld();
        setPrompt(camino && camino.inYard
          ? '← shed · Camino · mothership →'
          : '← shed · mothership →  Walk to board');
      }
    } else {
      prevInteractHeld = interactHeld();
      setPrompt('← → walk · enter shed on the left');
    }
    syncInteractBtn();
  }


  /** Soft-follow companion so Tayler stays aboard with Zakk (ship / bandTour). */
  function updateTaylerCompanion(worldW) {
    if (!tayler || !avatar) return;
    const behind = 44;
    const target = avatar.x - behind * (avatar.facing >= 0 ? 1 : -1);
    const dx = target - tayler.x;
    if (Math.abs(dx) > 10) {
      const step = Math.min(2.0, Math.max(0.7, Math.abs(dx) * 0.09));
      tayler.x += Math.sign(dx) * step;
      tayler.facing = dx > 0 ? 1 : -1;
      tayler.moving = true;
    } else {
      tayler.moving = false;
      tayler.facing = avatar.facing;
    }
    tayler.x = Math.max(40, Math.min((worldW || 900) - 40, tayler.x));
    tayler.y = GROUND;
  }

  function updateShip() {
    if (boardSit) {
      boardSit.timer++;
      if (!boardSit.phase || boardSit.phase === 'yield') {
        setPrompt('Aliens yield the controls…');
        boardSit.alienYield = Math.min(1, boardSit.timer / 24);
        if (boardSit.timer > 26) {
          boardSit.phase = 'sit';
          boardSit.timer = 0;
          boardSit.seatTaken = true;
          boardSit.alienYield = 1;
          Audio.play('ui');
          showFlash("Taking the driver's seat…", 80);
        }
        return;
      }
      if (boardSit.phase === 'sit') {
        setPrompt("Sitting in the driver's seat…");
        boardSit.seatTaken = true;
        boardSit.alienYield = 1;
        if (boardSit.timer > 22) {
          boardSit.phase = 'takeoff';
          boardSit.timer = 0;
          Audio.play('power');
          showFlash('Legs tucking — liftoff!', 90);
        }
        return;
      }
      // Brief takeoff beat then free flight
      setPrompt('Landing legs tucking in — liftoff…');
      boardSit.seatTaken = true;
      boardSit.alienYield = 1;
      boardSit.tuck = Math.min(1, boardSit.timer / 36);
      if (boardSit.timer > 40) {
        enterFly();
        return;
      }
      return;
    }

    updateSideScroller(W.SHIP_WORLD_W);
    updateTaylerCompanion(W.SHIP_WORLD_W);

    if (nearInteract()) {
      setPrompt("↑ / E / USE — take the driver's seat");
      if (wantsInteract()) {
        Audio.play('power');
        Audio.play('ui');
        boardSit = { timer: 0, phase: 'yield', alienYield: 0, seatTaken: false };
        showFlash('Excuse me, green dudes — mind if I drive?', 100);
        return;
      }
    } else {
      prevInteractHeld = interactHeld();
      setPrompt("Walk to the aliens / take the driver's seat");
    }
    syncInteractBtn();
  }

  function updateFly() {
    const ix = inputX();
    const iy = inputY();

    // Independent axes so left/right works while holding up/down (diagonals free)
    const accel = 0.95;
    const friction = 0.88;
    const maxSpd = 11;
    fly.vx += ix * accel;
    fly.vy += iy * accel;
    fly.vx *= friction;
    fly.vy *= friction;
    fly.vx = Math.max(-maxSpd, Math.min(maxSpd, fly.vx));
    fly.vy = Math.max(-maxSpd, Math.min(maxSpd, fly.vy));

    fly.ufoY += fly.vy;
    // Tight camera band near mid-left: world scrolls almost as soon as you strafe
    // (old edgeL=70 / edgeR=CW-70 forced a long cross-screen crawl first).
    const preferX = CW * 0.52;
    const deadHalf = 28; // small deadzone — leave it and the map moves
    const bandL = preferX - deadHalf;
    const bandR = preferX + deadHalf;
    fly.ufoX += fly.vx;
    let scrollDelta = 0;
    if (fly.ufoX < bandL) {
      scrollDelta = fly.ufoX - bandL; // negative → scroll west
      fly.ufoX = bandL;
    } else if (fly.ufoX > bandR) {
      scrollDelta = fly.ufoX - bandR; // positive → scroll east/south
      fly.ufoX = bandR;
    } else if (Math.abs(fly.vx) > 0.15) {
      // Still inside band: bleed most motion into scroll so it never feels stuck
      scrollDelta = fly.vx * 0.85;
      fly.ufoX -= fly.vx * 0.55; // cancel most on-screen drift
    }
    // Soft spring toward preferX so the ship settles mid-frame
    fly.ufoX += (preferX - fly.ufoX) * 0.06;
    fly.ufoX = Math.max(36, Math.min(CW - 36, fly.ufoX));
    // Wider vertical band — free climb/dive while strafing
    fly.ufoY = Math.max(40, Math.min(CH * 0.72, fly.ufoY));

    fly.scrollX = Math.max(0, fly.scrollX + scrollDelta);

    // District from how far south you've flown (scrollX), not a free timer
    const newDistrict = Math.min(
      W.DISTRICTS.length - 1,
      Math.floor(fly.scrollX / 900)
    );
    if (newDistrict !== fly.districtIndex) {
      fly.districtIndex = newDistrict;
      syncHud();
      showFlash(W.DISTRICTS[fly.districtIndex].name, 90);
    }

    if (fly.moonJuice > 0) {
      fly.moonJuice--;
      fly.beamWide = true;
    } else {
      fly.beamWide = false;
    }

    if (fly.scoreMultTimer > 0) {
      fly.scoreMultTimer--;
      // Periodic reminder while Holy Cow 2× is active
      if (fly.scoreMultTimer > 0 && fly.scoreMultTimer % 360 === 0) {
        showFlash('2× ACTIVE — ' + Math.ceil(fly.scoreMultTimer / 60) + 's', 70);
      }
    }

    if (Math.random() < 0.0015 && fly.moonJuice <= 0) {
      fly.moonJuice = 280;
      Audio.play('power');
      showFlash('MOON JUICE! Wider beam!', 100);
    }

    fly.propTimer--;
    if (fly.propTimer <= 0) {
      // Spawn ahead of travel direction (player-driven reveal)
      if (scrollDelta >= 0) spawnProp(fly.scrollX + CW + W.rand(20, 100));
      else spawnProp(fly.scrollX - W.rand(40, 120));
      fly.propTimer = W.rand(16, 36);
    }
    fly.props = fly.props.filter((p) => {
      if (p.landmark || p.vehicle) return true; // fixed landmarks + band vehicles stay
      return p.x > fly.scrollX - 220 && p.x < fly.scrollX + CW + 320;
    });
    ensureLandmarks();
    ensureStreetlights();

    fly.spawnTimer--;
    if (fly.spawnTimer <= 0) {
      if (scrollDelta >= 0) spawnFlyTarget(fly.scrollX + CW + W.rand(80, 280));
      else spawnFlyTarget(fly.scrollX - W.rand(60, 200));
      fly.spawnTimer = W.rand(45, 95);
    }
    fly.targets = fly.targets.filter((tg) => tg.x > fly.scrollX - 160 && tg.x < fly.scrollX + CW + 280 && !tg.beamed);

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

    // Landing gear: extend when diving near the ground
    const groundBand = CH * 0.72;
    const targetLegs = Math.max(0, Math.min(1, (fly.ufoY - CH * 0.42) / (groundBand - CH * 0.42)));
    fly.legExtend += (targetLegs - (fly.legExtend || 0)) * 0.14;

    const landLm = nearLandableLandmark();
    const nearVeh = nearBandVehicle();
    const downHeld = !!(keys['arrowdown'] || keys['s'] || touchDirs.down);
    const downEdge = downHeld && !prevLandDownHeld;
    prevLandDownHeld = downHeld;

    // Prefer band vehicle when overlapping (they sit in landmark gaps)
    if (nearVeh && nearVeh.lowEnough) {
      const v = nearVeh.vehicle;
      if (nearVeh.already) {
        setPrompt('Already beamed — ' + v.promptName);
        if (interactQueued) interactQueued = false;
      } else {
        setPrompt('↓/E LAND — ' + v.promptName + ' · Space/beam also works');
        const wantLand = wantsInteract() || downEdge;
        if (wantLand) {
          triggerBandBeam(v, true);
          syncHud();
          return;
        }
      }
    } else if (landLm) {
      setPrompt('↓/E LAND — ' + landLm.label);
      const wantLand = wantsInteract() || downEdge;
      if (wantLand) {
        if (landLm.home || landLm.kind === 'homeShed') {
          landHomeFromFly();
        } else {
          startLandmarkVisit(landLm);
        }
        syncHud();
        return;
      }
    } else {
      // E / USE while flying beams (interactQueued from E/USE button)
      if (interactQueued) {
        interactQueued = false;
        beamQueued = true;
      }
      setPrompt("←→↑↓ fly · Space/USE beam · dive near landmark / van / bus / MOM'S SHED to LAND · Enter end");
      prevInteractHeld = interactHeld();
    }
    syncInteractBtn();
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
        if (tg.kind.loot === 'plastics') {
          fly.microplastics = (fly.microplastics | 0) + 1;
          let pts = tg.kind.points + (fly.beamWide ? 20 : 0);
          if (fly.scoreMultTimer > 0) pts = (pts * 2) | 0;
          score += pts;
          W.burst(particles, fly.ufoX, CH * 0.7, '#9ef0ff', 12);
          W.addFloater(floaters, fly.ufoX, CH * 0.55, '+' + pts + ' 🧪', '#9ef0ff');
          Audio.play('score');
          const thresh = W.MICROPLASTIC_THRESHOLD;
          if (fly.microplastics > 0 && fly.microplastics % thresh === 0) {
            // First upgrade raises max hull; always restore +1 life (capped)
            if (fly.maxLives < W.MAX_LIVES_UPGRADED) {
              fly.maxLives = W.MAX_LIVES_UPGRADED;
              showFlash('MICROPLASTIC UPGRADE — max hull ' + fly.maxLives + '!', 130);
            } else {
              showFlash('HULL REPAIR +1', 110);
            }
            if (fly.lives < fly.maxLives) {
              fly.lives++;
              W.addFloater(floaters, fly.ufoX, fly.ufoY - 10, 'HULL +1', '#7dff3a');
              Audio.play('power');
            } else {
              showFlash('Hull already full — plastics banked for style', 90);
            }
            W.burst(particles, fly.ufoX, fly.ufoY, '#7dff3a', 18);
          } else if (Math.random() < 0.4) {
            showFlash(W.pick(W.PLASTICS_LINERS), 100);
          } else {
            const prog = fly.microplastics % thresh;
            showFlash('Microplastics ' + prog + '/' + thresh, 60);
          }
        } else if (tg.kind.loot === 'chicken') {
          fly.chicken = (fly.chicken | 0) + 1;
          let pts = tg.kind.points + (fly.beamWide ? 40 : 0);
          if (fly.scoreMultTimer > 0) pts = (pts * 2) | 0;
          score += pts;
          // Short moon-juice / wider beam + score mult buff
          fly.moonJuice = Math.max(fly.moonJuice, 160);
          fly.beamWide = true;
          fly.scoreMultTimer = Math.max(fly.scoreMultTimer, 220);
          W.burst(particles, fly.ufoX, CH * 0.7, '#ffb84a', 16);
          W.addFloater(floaters, fly.ufoX, CH * 0.55, '+' + pts + ' 🍗', '#ffcc66');
          Audio.play('power');
          showFlash(W.pick(W.CHICKEN_LINERS), 120);
        } else if (tg.kind.cow) {
          let pts = tg.kind.points + (fly.beamWide ? 40 : 0);
          // Cow itself isn't multiplied (grants the buff); still a big score pop
          score += pts;
          fly.scoreMultTimer = Math.max(fly.scoreMultTimer, 1800);
          W.burst(particles, fly.ufoX, CH * 0.7, '#ffe066', 22);
          W.burst(particles, fly.ufoX, fly.ufoY + 10, '#fff8d0', 10);
          W.addFloater(floaters, fly.ufoX, CH * 0.55, '+' + pts + ' 🐄', '#ffe066');
          Audio.play('power');
          showFlash('HOLY COW! 2× for 30s', 160);
        } else if (tg.kind.human) {
          let pts = tg.kind.points + (fly.beamWide ? 40 : 0);
          if (fly.scoreMultTimer > 0) pts = (pts * 2) | 0;
          score += pts;
          beamed++;
          W.burst(particles, fly.ufoX, CH * 0.7, '#7dff3a', 14);
          W.addFloater(floaters, fly.ufoX, CH * 0.55, '+' + pts, '#7dff3a');
          Audio.play('score');
          if (!recognizedDone && beamed >= 15) {
            recognizedDone = true; // lock immediately — once per run
            showFlash('SON OF A BITCH — you recognize that guy!', 160);
            // Defer cutaway so flash + score sync land first
            setTimeout(function () {
              if (mode === 'fly') startRecognizeOperate();
            }, 900);
          } else if (Math.random() < 0.45) {
            showFlash(W.pick(W.ONE_LINERS), 130);
          } else {
            showFlash('Beamed: ' + tg.kind.label + '!', 70);
          }
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
    // Whole-band beam if hovering a van/bus (Space path)
    if (!hit) {
      const nv = nearBandVehicle();
      if (nv && !nv.already) {
        // Allow beam even if not fully "low" — being over the prop is enough
        const worldX = fly.scrollX + fly.ufoX;
        if (Math.abs(worldX - nv.vehicle.x) < 72) {
          triggerBandBeam(nv.vehicle, false);
          hit = true;
        }
      }
    }
    if (!hit) {
      W.burst(particles, fly.ufoX, fly.ufoY + 40, '#88ffaa', 3);
    }
    syncHud();
  }

  const SURGERY_STAGES = [
    { dur: 70, msg: 'Scalpel… wait, is that a drumstick?', loot: 'chicken' },
    { dur: 75, msg: 'Finding #1: MORE KFC. Classic.', loot: 'chicken' },
    { dur: 80, msg: 'Finding #2: microplastics. So many microplastics.', loot: 'plastics' },
    { dur: 70, msg: 'Finding #3: another bucket. Finger lickin\' cosmic.', loot: 'chicken' },
    { dur: 65, msg: 'Closing… subject mostly chicken & sparkly trash.', loot: 'plastics' },
  ];


  const LANDMARK_USE_PROMPTS = {
    clockTower: 'ring the tower bell',
    museum: 'pocket the exhibit',
    royalHotel: 'order KFC room service',
    theatre: 'shred a one-bar riff',
    fireHall: 'slide the pole / hit the bell',
    vedderBridge: 'toss crumbs to the river',
  };

  const LANDMARK_DONE_LINERS = {
    clockTower: 'Bell already rang — ears still ringing.',
    museum: 'Security already knows your face.',
    royalHotel: 'One bucket per visit. House rules.',
    theatre: 'Encore already cashed.',
    fireHall: 'False alarm already filed.',
    vedderBridge: 'River took its offering. Come back next run.',
  };


  function nearBandVehicle() {
    if (mode !== 'fly' || !fly) return null;
    const worldX = fly.scrollX + fly.ufoX;
    const lowEnough = fly.ufoY >= CH * 0.48 || (fly.legExtend || 0) >= 0.4;
    for (let i = 0; i < FLY_VEHICLES.length; i++) {
      const v = FLY_VEHICLES[i];
      if (Math.abs(worldX - v.x) < 72) {
        return { vehicle: v, lowEnough: lowEnough, already: !!(fly[v.flag]) };
      }
    }
    return null;
  }

  function triggerBandBeam(vehicle, viaLand) {
    if (!fly || !vehicle) return false;
    if (fly[vehicle.flag]) {
      showFlash('Already beamed that crew this run.', 90);
      Audio.play('ui');
      return false;
    }
    fly[vehicle.flag] = true;
    let pts = BAND_BEAM_POINTS;
    if (fly.scoreMultTimer > 0) pts = (pts * 2) | 0;
    score += pts;
    beamed += W.BAND_SIZE | 6;
    W.burst(particles, fly.ufoX, CH * 0.7, '#ffe066', 28);
    W.burst(particles, fly.ufoX, fly.ufoY + 10, '#7dff3a', 16);
    W.addFloater(floaters, fly.ufoX, CH * 0.5, '+' + pts + ' BAND', '#ffe066');
    Audio.play('power');
    Audio.play('score');
    showFlash('WHOLE BAND BEAMED — welcome to the mothership!', 180);
    syncHud();
    // Cut to ship tour after a beat
    const vRef = vehicle;
    setTimeout(function () {
      if (mode === 'fly' && fly && fly[vRef.flag]) startBandTour(vRef);
    }, viaLand ? 400 : 700);
    return true;
  }

  function startBandTour(vehicle) {
    if (!fly) return;
    flyResume = snapshotFlyForResume();
    // park resume over the vehicle
    const ufoScreenX = fly.ufoX;
    flyResume.scrollX = Math.max(0, vehicle.x - ufoScreenX);
    flyResume.ufoX = ufoScreenX;
    flyResume.ufoY = Math.min(fly.ufoY, CH * 0.5);
    flyResume[vehicle.flag] = true;
    fly = null;
    landmarkVisit = null;
    operate = null;
    hideOperateChoice();
    mode = 'bandTour';
    interactQueued = false;
    jumpQueued = false;
    beamQueued = false;
    prevInteractHeld = true;
    camX = 0;
    avatar = makeAvatar(140, GROUND);
    tayler = { x: 95, y: GROUND, facing: 1, moving: false };
    const talked = {};
    bandTour = {
      vehicleKind: vehicle.kind,
      label: vehicle.label,
      phase: 'walk', // walk | choice
      talked: talked,
      talkCount: 0,
    };
    showScreen('play');
    syncHud();
    Audio.play('ui');
    showFlash('Retrofit aboard — Zakk & Tayler walk the lounge', 140);
    setPrompt('←→ walk · ↑/E/USE near bandmates · F fly again · L shed');
    syncInteractBtn();
  }

  function nearBandMate() {
    if (mode !== 'bandTour' || !avatar || !bandTour) return null;
    const roster = W.BAND_ROSTER || [];
    for (let i = 0; i < roster.length; i++) {
      if (Math.abs(avatar.x - roster[i].x) < 48) return roster[i];
    }
    return null;
  }

  function doBandMateTalk(mate) {
    if (!bandTour || !mate) return;
    if (bandTour.talked[mate.id]) {
      showFlash('Already caught that one-liner.', 70);
      Audio.play('ui');
      return;
    }
    bandTour.talked[mate.id] = true;
    bandTour.talkCount = (bandTour.talkCount | 0) + 1;
    score += 25;
    showFlash(mate.line, 160);
    Audio.play('score');
    W.burst(particles, mate.x - camX, GROUND - 50, '#ffe066', 10);
    W.addFloater(floaters, mate.x - camX, GROUND - 90, '+25', '#ffe066');
    syncHud();
    if (bandTour.talkCount >= (W.BAND_SIZE | 6)) {
      showFlash('Whole tour checked — Fly again or land at shed?', 130);
      bandTour.phase = 'choice';
      showOperateChoice();
      setPrompt('Tour done. F — Fly again · L — Land at shed');
    }
  }

  function updateBandTour() {
    if (!bandTour) return;
    if (bandTour.phase === 'choice') {
      setPrompt('F — Fly again · L — Land at shed');
      syncInteractBtn();
      return;
    }
    updateSideScroller(W.SHIP_WORLD_W);
    updateTaylerCompanion(W.SHIP_WORLD_W);
    const mate = nearBandMate();
    const nearHatch = avatar && avatar.x < 120;
    if (mate) {
      if (bandTour.talked[mate.id]) {
        setPrompt('▲ Already vibed — walk on · F fly · L shed');
      } else {
        setPrompt('▲ USE — talk to Retrofit ' + (mate.id || 'bandmate'));
      }
      if (wantsInteract()) doBandMateTalk(mate);
    } else if (nearHatch) {
      setPrompt('▲ USE — wrap tour (Fly / Land)');
      if (wantsInteract()) {
        bandTour.phase = 'choice';
        showOperateChoice();
        showFlash('Tour pause — Fly again or land at shed?', 110);
        setPrompt('F — Fly again · L — Land at shed');
      }
    } else {
      prevInteractHeld = interactHeld();
      setPrompt('←→ walk · USE near bandmates · hatch← wrap · F fly · L shed');
    }
    syncInteractBtn();
    syncHud();
  }

  function chooseFlyAgainFromBandTour() {
    if (mode !== 'bandTour') return;
    hideOperateChoice();
    Audio.play('power');
    bandTour = null;
    enterFly({ resume: true, fromLandmark: true });
    showFlash('Back in the cooler — Retrofit secured. Fly on!', 130);
  }

  function chooseLandShedFromBandTour() {
    if (mode !== 'bandTour') return;
    hideOperateChoice();
    Audio.play('landing');
    bandTour = null;
    flyResume = null;
    smokeDone = true;
    smoking = false;
    smokeProgress = 1;
    windowUfo = 1;
    ufoLanding = false;
    jointStage = null;
    jointPhase = null;
    returnToShed();
    showFlash('Landed at the shed. Band + score banked: ' + score, 140);
    setPrompt('← → walk · EXIT → yard · score kept');
  }

  function nearLandableLandmark() {
    if (mode !== 'fly' || !fly) return null;
    const lowEnough = fly.ufoY >= CH * 0.52 || (fly.legExtend || 0) >= 0.55;
    if (!lowEnough) return null;
    const worldX = fly.scrollX + fly.ufoX;
    for (let i = 0; i < FLY_LANDMARKS.length; i++) {
      const lm = FLY_LANDMARKS[i];
      if (Math.abs(worldX - lm.x) < 58) return lm;
    }
    return null;
  }

  function startLandmarkVisit(lm) {
    if (!fly || !lm) return;
    if (lm.home || lm.kind === 'homeShed') {
      landHomeFromFly();
      return;
    }
    flyResume = snapshotFlyForResume();
    // Park resume scroll so UFO sits over this landmark on takeoff
    const ufoScreenX = fly.ufoX;
    flyResume.scrollX = Math.max(0, lm.x - ufoScreenX);
    flyResume.ufoX = ufoScreenX;
    flyResume.ufoY = Math.min(fly.ufoY, CH * 0.62);
    flyResume.legExtend = 1;
    const visited = !!(fly.visitedLandmarks && fly.visitedLandmarks[lm.kind]);
    landmarkVisit = {
      kind: lm.kind,
      label: lm.label,
      interacted: visited,
      alreadyVisited: visited,
      phase: 'settle',
      timer: 0,
      pendingShake: 0,
    };
    mode = 'landmark';
    interactQueued = false;
    jumpQueued = false;
    beamQueued = false;
    prevInteractHeld = true;
    prevLandDownHeld = true;
    Audio.play('landing');
    showFlash('Touching down — ' + lm.label, 100);
    setPrompt('Landing…');
    showScreen('play');
    syncHud();
    syncInteractBtn();
  }

  function doLandmarkInteract() {
    if (!landmarkVisit || !flyResume) return;
    const kind = landmarkVisit.kind;
    if (landmarkVisit.alreadyVisited || landmarkVisit.interacted) {
      showFlash(LANDMARK_DONE_LINERS[kind] || 'Already visited this run.', 90);
      Audio.play('ui');
      return;
    }
    landmarkVisit.interacted = true;
    landmarkVisit.alreadyVisited = true;
    if (!flyResume.visitedLandmarks) flyResume.visitedLandmarks = {};
    flyResume.visitedLandmarks[kind] = true;

    const hx = W.LANDMARK_HOTSPOT_X - camX;
    const hy = GROUND - 40;

    if (kind === 'clockTower') {
      score += 150;
      landmarkVisit.pendingShake = 36;
      showFlash("Noon? It's alien o'clock.", 130);
      Audio.play('score');
      W.burst(particles, hx, hy, '#ffe066', 18);
      W.addFloater(floaters, hx, hy - 30, '+150 🔔', '#ffe066');
    } else if (kind === 'museum') {
      flyResume.microplastics = (flyResume.microplastics | 0) + 2;
      score += 80;
      showFlash('Educational theft.', 120);
      Audio.play('score');
      W.burst(particles, hx, hy, '#9ef0ff', 16);
      W.addFloater(floaters, hx, hy - 30, '+🧪×2', '#9ef0ff');
    } else if (kind === 'royalHotel') {
      flyResume.chicken = (flyResume.chicken | 0) + 2;
      score += 90;
      showFlash('The Royal still delivers.', 120);
      Audio.play('power');
      W.burst(particles, hx, hy, '#ffb84a', 16);
      W.addFloater(floaters, hx, hy - 30, '+🍗×2', '#ffb84a');
    } else if (kind === 'theatre') {
      flyResume.moonJuice = Math.max(flyResume.moonJuice | 0, 240);
      flyResume.beamWide = true;
      score += 100;
      showFlash('Encore for the mothership.', 120);
      Audio.play('power');
      W.burst(particles, hx, hy, '#88ffcc', 18);
      W.addFloater(floaters, hx, hy - 30, 'MOON JUICE', '#88ffcc');
    } else if (kind === 'fireHall') {
      if ((flyResume.lives | 0) < (flyResume.maxLives | 0)) {
        flyResume.lives = (flyResume.lives | 0) + 1;
        showFlash('False alarm: aliens.', 120);
        W.addFloater(floaters, hx, hy - 30, '+1 HULL', '#ff8866');
      } else {
        score += 60;
        showFlash('False alarm: aliens. (Hull full)', 110);
        W.addFloater(floaters, hx, hy - 30, '+60', '#ffcc33');
      }
      Audio.play('power');
      W.burst(particles, hx, hy, '#ffcc33', 16);
    } else if (kind === 'vedderBridge') {
      score += 75;
      flyResume.forceCowSoon = true;
      showFlash('Vedder takes another offering.', 120);
      Audio.play('score');
      W.burst(particles, hx, hy, '#9ef0ff', 14);
      W.addFloater(floaters, hx, hy - 30, '+75 🐄?', '#c8e8ff');
    } else {
      score += 50;
      showFlash('Chilliwack souvenir acquired.', 100);
      Audio.play('score');
    }
    syncHud();
  }

  function beginLandmarkLiftoff() {
    if (!landmarkVisit) return;
    landmarkVisit.phase = 'liftoff';
    landmarkVisit.timer = 0;
    Audio.play('power');
    showFlash('Back in the air — Chilliwack awaits', 120);
    setPrompt('Liftoff…');
  }

  function finishLandmarkTakeoff() {
    const shake = landmarkVisit ? (landmarkVisit.pendingShake | 0) : 0;
    landmarkVisit = null;
    avatar = null;
    enterFly({ resume: true, fromLandmark: true });
    if (fly && shake > 0) {
      fly.shake = Math.max(fly.shake | 0, shake);
      fly.hitFlash = Math.max(fly.hitFlash | 0, 20);
    }
  }

  function updateLandmark() {
    if (!landmarkVisit) return;

    if (landmarkVisit.phase === 'settle') {
      landmarkVisit.timer++;
      if (fly) {
        fly.legExtend = Math.min(1, (fly.legExtend || 0) + 0.08);
        fly.ufoY = Math.min(CH * 0.68, fly.ufoY + 1.4);
        fly.vx = 0;
        fly.vy = 0;
        fly.shake = Math.max(fly.shake | 0, 3);
      }
      setPrompt('Landing…');
      if (landmarkVisit.timer > 38) {
        fly = null;
        landmarkVisit.phase = 'walk';
        landmarkVisit.timer = 0;
        camX = 0;
        avatar = makeAvatar(160, GROUND);
        showFlash(landmarkVisit.label, 90);
        setPrompt('←→ walk · ▲ USE interact · hatch (left) to take off');
        syncHud();
      }
      syncInteractBtn();
      return;
    }

    if (landmarkVisit.phase === 'liftoff') {
      landmarkVisit.timer++;
      setPrompt('Liftoff…');
      if (landmarkVisit.timer > 26) {
        finishLandmarkTakeoff();
      }
      return;
    }

    // walk
    updateSideScroller(W.LANDMARK_WORLD_W);
    const nearHot = Math.abs(avatar.x - W.LANDMARK_HOTSPOT_X) < 60;
    const nearExit = Math.abs(avatar.x - W.LANDMARK_EXIT_X) < 55;

    if (nearHot) {
      if (landmarkVisit.interacted || landmarkVisit.alreadyVisited) {
        setPrompt('▲ Already done — ' + (LANDMARK_DONE_LINERS[landmarkVisit.kind] || 'come back next run'));
      } else {
        setPrompt('▲ USE — ' + (LANDMARK_USE_PROMPTS[landmarkVisit.kind] || 'interact'));
      }
      if (wantsInteract()) doLandmarkInteract();
    } else if (nearExit) {
      setPrompt('▲ USE — take off / UFO hatch');
      if (wantsInteract()) beginLandmarkLiftoff();
    } else {
      prevInteractHeld = interactHeld();
      setPrompt('←→ walk · interact hotspot · hatch (left) to leave');
    }
    syncInteractBtn();
    syncHud();
  }

  function snapshotFlyForResume() {
    if (!fly) return null;
    // Shallow clone + fresh target/prop arrays so resume is safe
    return {
      scrollX: fly.scrollX,
      ufoX: fly.ufoX,
      ufoY: fly.ufoY,
      vx: 0,
      vy: 0,
      districtIndex: fly.districtIndex,
      districtTimer: fly.districtTimer,
      lives: fly.lives,
      maxLives: fly.maxLives,
      microplastics: fly.microplastics,
      chicken: fly.chicken,
      scoreMultTimer: fly.scoreMultTimer,
      targets: (fly.targets || []).filter(function (tg) { return !tg.beamed; }).map(function (tg) {
        return { x: tg.x, kind: tg.kind, wobble: tg.wobble, beamed: false };
      }),
      props: (fly.props || []).slice(),
      spawnTimer: 30,
      propTimer: 10,
      beaming: false,
      beamTimer: 0,
      beamWide: !!fly.beamWide,
      moonJuice: fly.moonJuice,
      invuln: 40,
      hitFlash: 0,
      shake: 0,
      shakeX: 0,
      shakeY: 0,
      controlsUnlocked: true,
      legExtend: 0,
      ufoScale: fly.ufoScale != null ? fly.ufoScale : 0.92,
      cowSpawned: fly.cowSpawned | 0,
      visitedLandmarks: Object.assign({}, fly.visitedLandmarks || {}),
      forceCowSoon: !!fly.forceCowSoon,
      beamedVan: !!fly.beamedVan,
      beamedBus: !!fly.beamedBus,
    };
  }

  function startRecognizeOperate() {
    if (mode !== 'fly' || !fly) return;
    recognizedDone = true;
    flyResume = snapshotFlyForResume();
    // Preserve loot counters on resume object; also keep live refs for surgery gag increments
    const lootRef = flyResume;
    mode = 'operate';
    interactQueued = false;
    jumpQueued = false;
    prevInteractHeld = true;
    boardSit = null;
    fly = null;
    camX = Math.max(0, W.SHIP_TABLE_X - CW * 0.35);
    avatar = makeAvatar(160, GROUND);
    operate = {
      phase: 'walk', // walk | surgery | choice
      stage: 0,
      timer: 0,
      lootRef: lootRef,
      surgeryDone: false,
    };
    hideOperateChoice();
    showScreen('play');
    syncHud();
    Audio.play('ui');
    showFlash('Cutting to sickbay — walk to the table!', 130);
    setPrompt('←→ walk · ↑/E/USE — operate on that guy');
  }

  function nearOperateTable() {
    if (mode !== 'operate' || !avatar) return false;
    return Math.abs(avatar.x - W.SHIP_TABLE_X) < 70;
  }

  function updateOperate() {
    if (!operate) return;

    if (operate.phase === 'choice') {
      setPrompt('L — Land at shed · F — Fly again');
      syncInteractBtn();
      return;
    }

    if (operate.phase === 'surgery') {
      operate.timer++;
      const stage = SURGERY_STAGES[operate.stage];
      if (!stage) {
        operate.phase = 'choice';
        operate.surgeryDone = true;
        showOperateChoice();
        setPrompt('Surgery done. Land at shed or fly again?');
        showFlash('Only KFC & microplastics. Peak Chilliwack.', 140);
        Audio.play('power');
        syncHud();
        return;
      }
      setPrompt(stage.msg);
      if (operate.timer === 1) {
        showFlash(stage.msg, 100);
        Audio.play(stage.loot === 'chicken' ? 'power' : 'score');
        if (operate.lootRef) {
          if (stage.loot === 'chicken') {
            operate.lootRef.chicken = (operate.lootRef.chicken | 0) + 1;
            score += 40;
          } else {
            operate.lootRef.microplastics = (operate.lootRef.microplastics | 0) + 1;
            score += 25;
          }
        }
        W.burst(particles, W.SHIP_TABLE_X - camX, GROUND - 50,
          stage.loot === 'chicken' ? '#ffb84a' : '#9ef0ff', 14);
        W.addFloater(floaters, W.SHIP_TABLE_X - camX, GROUND - 80,
          stage.loot === 'chicken' ? '+🍗' : '+🧪',
          stage.loot === 'chicken' ? '#ffcc66' : '#9ef0ff');
        syncHud();
      }
      if (operate.timer >= stage.dur) {
        operate.stage++;
        operate.timer = 0;
      }
      return;
    }

    // walk phase
    updateSideScroller(W.SHIP_WORLD_W);
    if (nearOperateTable()) {
      setPrompt('↑ / E / USE — begin surgery');
      if (wantsInteract()) {
        operate.phase = 'surgery';
        operate.stage = 0;
        operate.timer = 0;
        Audio.play('ui');
        showFlash('Operating… this can\'t be hygienic.', 100);
      }
    } else {
      prevInteractHeld = interactHeld();
      setPrompt('Walk to the operating table — that guy looks familiar');
    }
    syncInteractBtn();
  }

  function chooseLandShed() {
    if (mode === 'bandTour') { chooseLandShedFromBandTour(); return; }
    if (mode !== 'operate') return;
    hideOperateChoice();
    Audio.play('landing');
    operate = null;
    flyResume = null;
    // Return to shed mid-run; keep score/beamed; unlock exit path
    smokeDone = true;
    smoking = false;
    smokeProgress = 1;
    windowUfo = 1;
    ufoLanding = false;
    jointStage = null;
    jointPhase = null;
    returnToShed();
    showFlash('Landed at the shed. Score banked: ' + score, 140);
    setPrompt('← → walk · EXIT → yard · score kept');
  }

  /** Voluntary home landing from fly — yard behind mom's house, score kept */
  function landHomeFromFly() {
    if (mode !== 'fly' || !fly) return;
    fly = null;
    flyResume = null;
    landmarkVisit = null;
    bandTour = null;
    operate = null;
    hideOperateChoice();
    selfDestructing = false;
    destructTimer = 0;
    // Preserve score/beamed/loot (globals); clear fly cleanly
    smokeDone = true;
    smoking = false;
    smokeProgress = 1;
    windowUfo = 1;
    ufoLanding = false;
    jointStage = null;
    jointPhase = null;
    boardSit = null;
    drivingCamino = false;
    enterYard({ fromFlyHome: true });
    syncInteractBtn();
  }

  function chooseFlyAgainFromOperate() {
    if (mode === 'bandTour') { chooseFlyAgainFromBandTour(); return; }
    if (mode !== 'operate') return;
    hideOperateChoice();
    Audio.play('power');
    operate = null;
    // recognizedDone already true — never re-triggers
    enterFly({ resume: true });
  }

  function update() {
    if (selfDestructing) {
      destructTimer++;
      if (fly) {
        fly.shake = Math.max(fly.shake, 28);
        fly.hitFlash = Math.max(fly.hitFlash, 24);
        if (destructTimer % 4 === 0) {
          W.burst(particles, fly.ufoX + (Math.random() - 0.5) * 80, fly.ufoY + (Math.random() - 0.5) * 50, '#ff4422', 10);
          W.burst(particles, fly.ufoX, fly.ufoY, '#ffcc66', 8);
        }
      }
      if (destructTimer > 55) goToTitleMenu();
      return;
    }
    if (mode === 'shed') updateShed();
    else if (mode === 'yard') updateYard();
    else if (mode === 'ship') updateShip();
    else if (mode === 'fly') updateFly();
    else if (mode === 'operate') updateOperate();
    else if (mode === 'landmark') updateLandmark();
    else if (mode === 'bandTour') updateBandTour();

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
      // Lit only after mid light progress, or smoke / done / landing
      let lightProg = 0;
      if (jointStage === 'light' && jointPhase === 'anim') {
        const li = jointStageIndex('light');
        const ld = li >= 0 ? JOINT_STEPS[li].dur : 42;
        lightProg = Math.min(1, jointTimer / Math.max(1, ld));
      }
      const jointLit = smokeDone || ufoLanding || jointStage === 'smoke' ||
        (jointStage === 'light' && lightProg >= 0.45) ||
        (jointPhase === 'await' && jointStepIndex >= 3);
      // Mute ashtray ambient during active unlit sesh (reads as joint smoke)
      const inUnlitSesh = !jointLit && (smoking || jointPhase === 'await' || jointPhase === 'anim');
      const shedCamino = camino && !camino.inYard;
      W.drawShed(ctx, CW, CH, camX, t, {
        cassetteTaken: true,
        tapeInStereo: true,
        windowUfo: windowUfo,
        doorLocked: !ufoLanded(),
        smoking: smoking || ufoLanding,
        smokeProgress: smokeProgress,
        jointLit: jointLit,
        ashSmoke: !inUnlitSesh,
        hideCamino: !shedCamino,
        caminoX: shedCamino ? camino.x : W.SHED_CAMINO_X,
        caminoDusty: false,
        caminoFacingRight: shedCamino ? !!camino.facingRight : false,
        caminoWheelRot: shedCamino ? camino.wheelRot : 0,
        caminoDrawDriver: (shedCamino && drivingCamino) ? makeCaminoDriverDraw() : null,
        caminoNoLabel: !!(shedCamino && drivingCamino),
      });
      // Sesh anim owns the joint prop — avoid double-drawing on characters
      const seshOwnsJoint = (jointPhase === 'anim' || ufoLanding) && !!jointStage &&
        (jointStage === 'gethigh' || jointStage === 'roll' || jointStage === 'light' || jointStage === 'smoke');
      // During late smoke anim (post-handoff), let Zakk draw joint for Up-puff
      const smokeAnimLate = jointStage === 'smoke' && jointPhase === 'anim' && (() => {
        const idx = jointStageIndex('smoke');
        const dur = idx >= 0 ? JOINT_STEPS[idx].dur : 64;
        return jointTimer / Math.max(1, dur) >= 0.7;
      })();
      const showCharJoint = (!seshOwnsJoint || smokeAnimLate) && (
        smokeDone || ufoLanding || smokeAnimLate ||
        (jointPhase === 'await' && jointStepIndex >= 2) ||
        (jointStage === 'smoke' && jointPhase !== 'anim')
      );
      const isPuffing = zakkPuffing();
      const pProg = puffProg();
      if (tayler) {
        // Tayler holds through roll/light await; after pass Zakk has it (no free plumes)
        const taylerHolds = showCharJoint && !smokeAnimLate &&
          !(smokeDone || ufoLanding || jointStage === 'smoke' || jointStepIndex >= 3);
        W.drawTayler(ctx, tayler.x - camX, tayler.y, 1, false, t, {
          seated: true,
          smoking: taylerHolds,
          jointLit: jointLit,
          puffing: false,
          heavySmoke: false,
        });
      }
      if (!drivingCamino) {
        W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, {
          smoking: showCharJoint && (smokeDone || ufoLanding || jointStage === 'smoke' || jointStepIndex >= 3 || smokeAnimLate),
          jointLit: jointLit,
          puffing: isPuffing,
          puffProg: pProg,
          heavySmoke: false,
        });
      }
      if ((jointPhase === 'anim' || ufoLanding) && jointStage && tayler && !smokeAnimLate) {
        const idx = jointStageIndex(jointStage);
        const stage = idx >= 0 ? JOINT_STEPS[idx] : { dur: 64 };
        const stageProg = jointPhase === 'anim'
          ? Math.min(1, jointTimer / Math.max(1, stage.dur))
          : 1;
        const drawStage = jointStage === 'gethigh' ? 'paper' : jointStage;
        W.drawJointSesh(
          ctx,
          tayler.x - camX,
          tayler.y,
          avatar.x - camX,
          avatar.y,
          drawStage,
          stageProg,
          t
        );
      }
      if (nearTaylerSesh()) {
        const step = currentJointPrompt();
        if (step) {
          const bob = Math.sin(t * 0.01) * 3;
          ctx.fillStyle = '#7dff3a';
          ctx.font = 'bold 15px Segoe UI, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('▲ ' + step.prompt, tayler.x - camX, GROUND - 118 + bob);
          // On-canvas button chip
          const label = step.btn;
          ctx.font = 'bold 13px Segoe UI, sans-serif';
          const tw = ctx.measureText(label).width;
          const bx = tayler.x - camX - tw / 2 - 14;
          const by = GROUND - 108 + bob;
          ctx.fillStyle = 'rgba(10,30,16,0.88)';
          ctx.strokeStyle = '#7dff3a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          const rw = tw + 28, rh = 28, rr = 8;
          ctx.moveTo(bx + rr, by);
          ctx.arcTo(bx + rw, by, bx + rw, by + rh, rr);
          ctx.arcTo(bx + rw, by + rh, bx, by + rh, rr);
          ctx.arcTo(bx, by + rh, bx, by, rr);
          ctx.arcTo(bx, by, bx + rw, by, rr);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#e8ffe0';
          ctx.fillText(label, tayler.x - camX, by + 19);
          ctx.textAlign = 'left';
        }
      }
      if ((smoking || ufoLanding || jointPhase === 'await') && !smokeDone) {
        const step = jointStage ? JOINT_STEPS[jointStageIndex(jointStage)] : currentJointPrompt();
        const banner = jointPhase === 'await' && currentJointPrompt()
          ? ('▲ ' + currentJointPrompt().prompt)
          : (step ? (step.prompt + ' — ' + step.label) : '…');
        ctx.fillStyle = 'rgba(10,30,16,0.78)';
        ctx.fillRect(CW / 2 - 170, 44, 340, 36);
        ctx.strokeStyle = '#c8e8a0';
        ctx.strokeRect(CW / 2 - 170, 44, 340, 36);
        ctx.fillStyle = '#e8ffe0';
        ctx.font = 'bold 13px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(banner, CW / 2, 67);
        ctx.textAlign = 'left';
        const chips = ['get high', 'roll', 'light', 'smoke'];
        const chipMap = { gethigh: 0, roll: 1, light: 2, smoke: 3 };
        const active = chipMap[jointStage] != null ? chipMap[jointStage] : jointStepIndex;
        for (let i = 0; i < chips.length; i++) {
          const cx = CW / 2 - 150 + i * 76;
          ctx.fillStyle = i === active ? '#9dff6a' : 'rgba(80,100,70,0.7)';
          ctx.fillRect(cx, 86, 70, 14);
          ctx.fillStyle = i === active ? '#102010' : '#c8e0b8';
          ctx.font = 'bold 9px Segoe UI, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(chips[i], cx + 35, 96);
        }
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(CW / 2 - 80, 106, 160, 7);
        ctx.fillStyle = '#9dff6a';
        ctx.fillRect(CW / 2 - 80, 106, 160 * smokeProgress, 7);
      }
      if (!drivingCamino && nearCaminoDoor()) {
        const bob = Math.sin(t * 0.01) * 3;
        ctx.fillStyle = '#ffd76a';
        ctx.font = 'bold 15px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ DRIVE EL CAMINO', caminoDoorX() - camX, GROUND - 130 + bob);
        ctx.textAlign = 'left';
      }
      if (nearDoor() && !drivingCamino) {
        ctx.fillStyle = ufoLanded() ? '#7dff3a' : '#ff8866';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        let doorLabel = '▲ ENTER';
        if (!ufoLanded()) {
          if (!smokeDone && !ufoLanding) doorLabel = '▲ get high with T';
          else doorLabel = '▲ WAIT FOR LANDING';
        }
        ctx.fillText(doorLabel, W.SHED_DOOR_X - camX, GROUND - 170);
        ctx.textAlign = 'left';
      }
    } else if (mode === 'yard') {
      const yardCamino = camino && camino.inYard;
      W.drawYard(ctx, CW, CH, camX, t, landing, {
        showCamino: !!yardCamino,
        caminoX: yardCamino ? camino.x : 420,
        caminoFacingRight: yardCamino ? !!camino.facingRight : true,
        caminoWheelRot: yardCamino ? camino.wheelRot : 0,
        caminoDrawDriver: (yardCamino && drivingCamino) ? makeCaminoDriverDraw() : null,
        caminoNoLabel: !!(yardCamino && drivingCamino),
      });
      if (tayler) {
        const tMoving = landing && landing.phase === 'landed';
        W.drawTayler(ctx, tayler.x - camX, tayler.y, 1, tMoving, t, {});
      }
      if (!drivingCamino) {
        W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, {});
      }
      if (!drivingCamino && nearCaminoDoor()) {
        const bob = Math.sin(t * 0.01) * 3;
        ctx.fillStyle = '#ffd76a';
        ctx.font = 'bold 15px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ DRIVE EL CAMINO', caminoDoorX() - camX, GROUND - 120 + bob);
        ctx.textAlign = 'left';
      } else if (nearYardShedDoor() && !drivingCamino) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ ENTER SHED', W.YARD_SHED_DOOR_X - camX, GROUND - 100);
        ctx.textAlign = 'left';
      } else if (landing && landing.phase === 'landed' && nearInteract() && !drivingCamino) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ BOARD MOTHERSHIP', landing.x - camX, landing.y - 70);
        ctx.textAlign = 'left';
      }
    } else if (mode === 'ship') {
      const yieldAmt = boardSit && boardSit.alienYield != null ? boardSit.alienYield : 0;
      const seatTaken = !!(boardSit && boardSit.seatTaken);
      W.drawShipInterior(ctx, CW, CH, camX, t, {
        alienYield: yieldAmt,
        seatTaken: seatTaken,
      });
      if (tayler && (!boardSit || boardSit.phase === 'yield')) {
        W.drawTayler(ctx, tayler.x - camX, tayler.y, tayler.facing != null ? tayler.facing : 1, !!tayler.moving, t, {});
      }
      if (!boardSit || boardSit.phase === 'yield') {
        W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, {});
      }
      if (!boardSit && nearInteract()) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("▲ DRIVER'S SEAT", W.SHIP_HELM_X - camX, GROUND - 120);
        ctx.textAlign = 'left';
      }
      if (boardSit) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 18px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        if (boardSit.phase === 'takeoff') {
          ctx.fillText('Landing legs tucking in…', CW / 2, 90);
          const ext = 1 - (boardSit.tuck != null ? boardSit.tuck : 0);
          ctx.fillStyle = 'rgba(10,30,16,0.75)';
          ctx.fillRect(CW / 2 - 70, 102, 140, 12);
          ctx.fillStyle = '#88c8ff';
          ctx.fillRect(CW / 2 - 68, 104, 136 * ext, 8);
          ctx.fillStyle = '#c8e0ff';
          ctx.font = 'bold 10px Segoe UI, sans-serif';
          ctx.fillText(ext > 0.5 ? 'GEAR DOWN' : 'GEAR UP', CW / 2, 126);
        } else if (boardSit.phase === 'sit') {
          ctx.fillText("Taking the driver's seat…", CW / 2, 90);
        } else {
          ctx.fillText('Aliens step aside…', CW / 2, 90);
        }
        ctx.textAlign = 'left';
      }
    } else if (mode === 'operate') {
      W.drawShipInterior(ctx, CW, CH, camX, t, {
        operate: true,
        surgeryDone: !!(operate && operate.surgeryDone),
        alienYield: 0,
        seatTaken: false,
      });
      if (avatar && (!operate || operate.phase !== 'surgery')) {
        W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, {});
      } else if (avatar && operate && operate.phase === 'surgery') {
        // Zakk leaning over the table
        W.drawZakk(ctx, W.SHIP_TABLE_X - camX - 36, avatar.y, 1, false, t, {});
      }
      if (operate && operate.phase === 'walk' && nearOperateTable()) {
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ OPERATE', W.SHIP_TABLE_X - camX, GROUND - 100);
        ctx.textAlign = 'left';
      }
      if (operate && operate.phase === 'surgery') {
        ctx.fillStyle = '#ffe066';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SURGERY IN PROGRESS…', CW / 2, 88);
        const total = 5;
        const prog = Math.min(1, (operate.stage + operate.timer / 80) / total);
        ctx.fillStyle = 'rgba(10,30,16,0.75)';
        ctx.fillRect(CW / 2 - 80, 100, 160, 12);
        ctx.fillStyle = '#ff8844';
        ctx.fillRect(CW / 2 - 78, 102, 156 * prog, 8);
        ctx.textAlign = 'left';
      }
    } else if (mode === 'bandTour') {
      W.drawShipInterior(ctx, CW, CH, camX, t, {
        bandTour: true,
        bandTalked: bandTour ? bandTour.talked : {},
        alienYield: 0,
        seatTaken: false,
      });
      if (avatar && bandTour && bandTour.phase === 'walk') {
        if (tayler) {
          W.drawTayler(ctx, tayler.x - camX, tayler.y, tayler.facing != null ? tayler.facing : 1, !!tayler.moving, t, {});
        }
        W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, {});
        const mate = nearBandMate();
        const bob = Math.sin(t * 0.01) * 3;
        if (mate) {
          ctx.fillStyle = '#7dff3a';
          ctx.font = 'bold 15px Segoe UI, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(bandTour.talked[mate.id] ? '▲ DONE' : '▲ USE', mate.x - camX, GROUND - 100 + bob);
          ctx.textAlign = 'left';
        } else if (avatar.x < 120) {
          ctx.fillStyle = '#7dff3a';
          ctx.font = 'bold 15px Segoe UI, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('▲ WRAP TOUR', 70 - camX, GROUND - 100 + bob);
          ctx.textAlign = 'left';
        }
      }
      if (bandTour && bandTour.phase === 'choice') {
        ctx.fillStyle = '#ffe066';
        ctx.font = 'bold 16px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BAND TOUR WRAP — Fly again or land?', CW / 2, 88);
        ctx.textAlign = 'left';
      }
    } else if (mode === 'landmark') {
      if (landmarkVisit && landmarkVisit.phase === 'settle' && fly) {
        W.drawFlyScene(ctx, CW, CH, fly, t);
        ctx.fillStyle = 'rgba(10,30,16,0.35)';
        ctx.fillRect(0, 0, CW, CH);
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 18px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LANDING — ' + (landmarkVisit.label || ''), CW / 2, 88);
        ctx.textAlign = 'left';
      } else if (landmarkVisit) {
        W.drawLandmarkInterior(ctx, CW, CH, camX, t, {
          kind: landmarkVisit.kind,
          label: landmarkVisit.label,
          interacted: !!landmarkVisit.interacted,
        });
        if (avatar && landmarkVisit.phase === 'walk') {
          W.drawZakk(ctx, avatar.x - camX, avatar.y, avatar.facing, Math.abs(avatar.vx) > 0.4, t, {});
          const bob = Math.sin(t * 0.01) * 3;
          if (Math.abs(avatar.x - W.LANDMARK_HOTSPOT_X) < 60) {
            ctx.fillStyle = '#7dff3a';
            ctx.font = 'bold 15px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            const tip = landmarkVisit.interacted ? '▲ DONE' : '▲ USE';
            ctx.fillText(tip, W.LANDMARK_HOTSPOT_X - camX, GROUND - 110 + bob);
            ctx.textAlign = 'left';
          }
          if (Math.abs(avatar.x - W.LANDMARK_EXIT_X) < 55) {
            ctx.fillStyle = '#88c8ff';
            ctx.font = 'bold 15px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('▲ TAKEOFF', W.LANDMARK_EXIT_X - camX, GROUND - 110 + bob);
            ctx.textAlign = 'left';
          }
        }
        if (landmarkVisit.phase === 'liftoff') {
          ctx.fillStyle = 'rgba(10,30,16,0.45)';
          ctx.fillRect(0, 0, CW, CH);
          ctx.fillStyle = '#88c8ff';
          ctx.font = 'bold 18px Segoe UI, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Legs tucking — back to the sky…', CW / 2, 90);
          ctx.textAlign = 'left';
        }
      }
    } else if (mode === 'fly') {
      W.drawFlyScene(ctx, CW, CH, fly, t);
      const tipLm = nearLandableLandmark();
      if (tipLm) {
        const bob = Math.sin(t * 0.012) * 3;
        ctx.fillStyle = '#7dff3a';
        ctx.font = 'bold 14px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('↓/E LAND — ' + tipLm.label, CW / 2, 100 + bob);
        ctx.textAlign = 'left';
      }
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
  renderLeaderboards(null);
  updateMuteUI();
  showScreen('title');
  syncBeamUi();
  fetchPlayCount();
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
