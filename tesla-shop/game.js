/**
 * Hole in the Wall — Tesla EV Repair Apprentice
 * Walk-around canvas game (WASD + E/Space interact)
 */
(() => {
  "use strict";

  // ─── Canvas / sizing ────────────────────────────────────────────────
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const CW = canvas.width;
  const CH = canvas.height;

  const WORLD_W = 1760;
  const WORLD_H = 980;

  // ─── Job / NPC data (same design as prior version) ──────────────────
  const JOB_ORDER = ["leak", "brakes", "tire", "drive", "diag"];

  const JOBS = {
    leak: {
      id: "leak",
      title: "Water Leak — White Model Y",
      repairType: "Water leak / drain clog",
      fohId: "kim",
      plate: "WET-Y-01",
      nickname: "Puddle Princess",
      model: "Y",
      color: "#f0f0f0",
      bay: "rolando",
      tech: "rolando",
      needsParts: false,
      lotSpot: { x: 300, y: 350 },
    },
    brakes: {
      id: "brakes",
      title: "Brake Service — Pearl White Model Y",
      repairType: "Brake service (pads/rotors)",
      fohId: "ryan",
      plate: "SQK-Y-88",
      nickname: "Squeaky Y",
      model: "Y",
      color: "#e8e4d8",
      bay: "won",
      tech: "won",
      needsParts: true,
      partsLabel: "Brake pads & rotors",
      partsHeavy: false,
      lotSpot: { x: 380, y: 480 },
    },
    tire: {
      id: "tire",
      title: "Tire / TPMS — Blue Model X",
      repairType: "Tire puncture / TPMS",
      fohId: "kim",
      plate: "FLAT-X9",
      nickname: "Flatliner",
      model: "X",
      color: "#2a5a9e",
      bay: "won",
      tech: "won",
      needsParts: true,
      partsLabel: "Tire + TPMS sensor",
      partsHeavy: false,
      lotSpot: { x: 300, y: 560 },
    },
    drive: {
      id: "drive",
      title: "Drive Unit — Midnight Model 3",
      repairType: "Drive unit replacement",
      fohId: "ryan",
      plate: "DU-M3-42",
      nickname: "Clunk Cub",
      model: "3",
      color: "#2a2e34",
      bay: "won",
      tech: "won",
      needsParts: true,
      partsLabel: "Rear drive unit (forklift)",
      partsHeavy: true,
      lotSpot: { x: 420, y: 320 },
    },
    diag: {
      id: "diag",
      title: "Phantom Drain — Red Model S",
      repairType: "12V / phantom drain diag",
      fohId: "jordan",
      plate: "GHST-S7",
      nickname: "Ghost Plaid",
      model: "S",
      color: "#c42828",
      bay: "nima",
      tech: "nima",
      needsParts: true,
      partsLabel: "12V battery + charge-port clips",
      partsHeavy: false,
      lotSpot: { x: 340, y: 620 },
    },
  };

  const FOH_JOBS = {
    kim: ["leak", "tire"],
    ryan: ["brakes", "drive"],
    jordan: ["diag"],
  };

  const BAYS = {
    nima: { x: 1280, y: 180, w: 280, h: 200, label: "Nima — Elec", park: { x: 1380, y: 260 } },
    won: { x: 1280, y: 400, w: 280, h: 200, label: "Won Song — Mech", park: { x: 1380, y: 480 } },
    rolando: { x: 1280, y: 620, w: 280, h: 200, label: "Rolando — Water", park: { x: 1380, y: 700 } },
  };

  const NPC_DEFS = [
    { id: "kim", name: "Kim", role: "foh", x: 840, y: 200, color: "#e8a838", emoji: "👩" },
    { id: "ryan", name: "Ryan", role: "foh", x: 920, y: 200, color: "#6ecf6a", emoji: "🧔" },
    { id: "jordan", name: "Jordan Sham", role: "foh", x: 1000, y: 200, color: "#6a9ee8", emoji: "🧑" },
    { id: "moe", name: "Moe", role: "parts", x: 860, y: 720, color: "#d08040", emoji: "👷", homeX: 860, homeY: 720 },
    { id: "nima", name: "Nima", role: "tech", bay: "nima", x: 1480, y: 220, color: "#c06ae8", emoji: "👨‍💻" },
    { id: "won", name: "Won Song", role: "tech", bay: "won", x: 1480, y: 440, color: "#e86060", emoji: "🔧" },
    { id: "rolando", name: "Rolando", role: "tech", bay: "rolando", x: 1480, y: 660, color: "#40c0c0", emoji: "💧" },
  ];

  const AMBIENT = [
    "A pigeon coos in the rafters.",
    "Somewhere, an impact gun chatters.",
    "The smell of brake cleaner drifts past.",
    "Fluorescent light flickers once, recovers.",
    "Forklift beep… beep… from Parts.",
    "A Model S door chimes for no reason.",
    "Moe's radio crackles: \"Who lost the TPMS kit again?\"",
  ];

  // ─── DOM ────────────────────────────────────────────────────────────
  const els = {
    hud: document.getElementById("hud"),
    hudJob: document.getElementById("hud-job"),
    hudInv: document.getElementById("hud-inv"),
    hudProgress: document.getElementById("hud-progress"),
    prompt: document.getElementById("prompt-label"),
    title: document.getElementById("screen-title"),
    nameInput: document.getElementById("player-name"),
    btnStart: document.getElementById("btn-start"),
    dialogue: document.getElementById("dialogue"),
    dlgWho: document.getElementById("dlg-who"),
    dlgLines: document.getElementById("dlg-lines"),
    dlgNext: document.getElementById("dlg-next"),
    help: document.getElementById("modal-help"),
    btnHelp: document.getElementById("btn-help"),
    btnCloseHelp: document.getElementById("btn-close-help"),
    win: document.getElementById("modal-win"),
    winText: document.getElementById("win-text"),
    btnReplay: document.getElementById("btn-replay"),
    touch: document.getElementById("touch"),
    btnUse: document.getElementById("btn-use"),
  };

  // ─── Input ──────────────────────────────────────────────────────────
  const keys = Object.create(null);
  const touchDirs = Object.create(null);
  let interactQueued = false;
  let prevInteract = false;

  function onKeyDown(e) {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "space"].includes(k)) e.preventDefault();
    if (k === "escape") {
      if (!els.help.classList.contains("hidden")) els.help.classList.add("hidden");
      else if (!els.dialogue.classList.contains("hidden")) advanceDialogue();
      return;
    }
    // While dialogue is open, E/Space/Enter advances instead of world-interact
    if (!els.dialogue.classList.contains("hidden")) {
      if (k === "e" || k === " " || k === "enter") {
        e.preventDefault();
        advanceDialogue();
      }
      return;
    }
    if (k === "e" || k === " " || k === "enter") interactQueued = true;
  }
  function onKeyUp(e) {
    keys[e.key.toLowerCase()] = false;
  }
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  function bindPad(btn) {
    const dir = btn.getAttribute("data-dir");
    const on = (e) => { e.preventDefault(); touchDirs[dir] = true; };
    const off = (e) => { e.preventDefault(); touchDirs[dir] = false; };
    btn.addEventListener("touchstart", on, { passive: false });
    btn.addEventListener("touchend", off, { passive: false });
    btn.addEventListener("touchcancel", off, { passive: false });
    btn.addEventListener("mousedown", on);
    btn.addEventListener("mouseup", off);
    btn.addEventListener("mouseleave", off);
  }
  document.querySelectorAll("#touch .pad").forEach(bindPad);

  function queueInteract(e) {
    if (e) e.preventDefault();
    interactQueued = true;
  }
  els.btnUse.addEventListener("click", queueInteract);
  els.btnUse.addEventListener("touchstart", queueInteract, { passive: false });

  function moveVec() {
    let dx = 0, dy = 0;
    if (keys["a"] || keys["arrowleft"] || touchDirs.left) dx -= 1;
    if (keys["d"] || keys["arrowright"] || touchDirs.right) dx += 1;
    if (keys["w"] || keys["arrowup"] || touchDirs.up) dy -= 1;
    if (keys["s"] || keys["arrowdown"] || touchDirs.down) dy += 1;
    if (dx && dy) { dx *= 0.707; dy *= 0.707; }
    return { dx, dy };
  }

  function wantsInteract() {
    const held = !!(keys["e"] || keys[" "] || keys["enter"]);
    let edge = false;
    if (interactQueued) { interactQueued = false; edge = true; }
    if (held && !prevInteract) edge = true;
    prevInteract = held;
    return edge;
  }

  // ─── State ──────────────────────────────────────────────────────────
  let playing = false;
  let playerName = "Apprentice";
  let player = null;
  let cam = { x: 0, y: 0 };
  let npcs = [];
  let solids = [];
  let cars = []; // decorative + job cars
  let pigeons = [];
  let particles = [];
  let floaters = [];
  let t = 0;
  let lastTs = 0;
  let dialogueQueue = null; // { who, lines:[], idx, onDone }
  let nearTarget = null; // { kind, id, label, fn }
  let cutscene = null; // { type, timer, ... }
  let moeDelivery = null; // { jobId, phase, timer }
  let flash = null;
  let ambientIdx = 0;
  let ambientTimer = 0;

  const state = {
    activeJob: null,
    jobs: {},
    inventory: [],
    carInBay: {},
    introShown: false,
  };

  function resetJobs() {
    state.activeJob = null;
    state.jobs = Object.fromEntries(JOB_ORDER.map((id) => [id, { stage: null, done: false }]));
    state.inventory = [];
    state.carInBay = {};
    state.introShown = false;
  }

  function jobState(id) { return state.jobs[id]; }
  function activeJob() { return state.activeJob ? JOBS[state.activeJob] : null; }
  function allDone() { return JOB_ORDER.every((id) => state.jobs[id].done); }
  function doneCount() { return JOB_ORDER.filter((id) => state.jobs[id].done).length; }

  function nextJobForFOH(fohId) {
    return (FOH_JOBS[fohId] || []).find((jid) => !state.jobs[jid].done && !state.jobs[jid].stage) || null;
  }
  function fohInProgress(fohId) {
    return (FOH_JOBS[fohId] || []).find((jid) => state.jobs[jid].stage && !state.jobs[jid].done) || null;
  }
  function fohAllDone(fohId) {
    return (FOH_JOBS[fohId] || []).every((jid) => state.jobs[jid].done);
  }

  function addItem(id, label) {
    if (!state.inventory.find((i) => i.id === id)) state.inventory.push({ id, label });
  }
  function removeItem(id) {
    state.inventory = state.inventory.filter((i) => i.id !== id);
  }
  function hasItem(id) {
    return state.inventory.some((i) => i.id === id);
  }

  function stageHint(job, stage) {
    const map = {
      assigned: "Get the car from the lot",
      car_fetched: "Bring car to bay / talk to tech",
      tech_ok: job.needsParts ? "Wait — Moe delivering parts" : "Finish at the bay",
      parts_ok: "Finish the repair with the tech",
      done: "Done",
    };
    return map[stage] || stage;
  }

  // ─── World build ────────────────────────────────────────────────────
  function rect(x, y, w, h) { return { x, y, w, h }; }

  function buildWorld() {
    solids = [];
    // Outer fence / property bounds (thin walls)
    solids.push(rect(20, 40, WORLD_W - 40, 24)); // north
    solids.push(rect(20, WORLD_H - 60, WORLD_W - 40, 24)); // south
    solids.push(rect(20, 40, 24, WORLD_H - 100)); // west
    solids.push(rect(WORLD_W - 44, 40, 24, WORLD_H - 100)); // east

    // Shop exterior west wall with doorway gap (y 420-560)
    solids.push(rect(680, 60, 28, 360)); // wall above door
    solids.push(rect(680, 560, 28, 360)); // wall below door

    // Shop north/south interior walls
    solids.push(rect(700, 60, 1000, 20));
    solids.push(rect(700, WORLD_H - 80, 1000, 20));

    // Interior divider between FOH/parts and bays — with openings
    solids.push(rect(1100, 80, 20, 120)); // top stub
    solids.push(rect(1100, 320, 20, 60)); // between nima/won aisle
    solids.push(rect(1100, 540, 20, 60));
    solids.push(rect(1100, 760, 20, 140)); // bottom stub

    // FOH desk
    solids.push(rect(780, 120, 260, 36));

    // Parts shelves
    solids.push(rect(760, 640, 40, 200));
    solids.push(rect(920, 640, 40, 200));
    solids.push(rect(760, 860, 200, 30));

    // Washroom alcove on west interior wall — door faces east; center corridor clear
    solids.push(rect(708, 300, 100, 12)); // north
    solids.push(rect(708, 300, 12, 130)); // west
    solids.push(rect(708, 418, 100, 12)); // south
    solids.push(rect(796, 300, 12, 50)); // east stub (door gap below)

    // Bay hoists / lifts (collision props)
    solids.push(rect(1320, 200, 18, 100));
    solids.push(rect(1500, 200, 18, 100));
    solids.push(rect(1320, 420, 18, 100));
    solids.push(rect(1500, 420, 18, 100));
    solids.push(rect(1320, 640, 18, 100));
    solids.push(rect(1500, 640, 18, 100));

    // Bay door frames on east wall
    solids.push(rect(1680, 140, 40, 40));
    solids.push(rect(1680, 360, 40, 40));
    solids.push(rect(1680, 580, 40, 40));

    // NPCs
    npcs = NPC_DEFS.map((d) => ({
      ...d,
      w: 28,
      h: 28,
      facing: 1,
      delivering: false,
      vx: 0,
      vy: 0,
    }));

    // Decorative lot cars + job cars
    cars = [];
    const deco = [
      { x: 100, y: 120, color: "#555", plate: "" },
      { x: 280, y: 120, color: "#888", plate: "" },
      { x: 520, y: 140, color: "#222", plate: "" },
      { x: 100, y: 760, color: "#a33", plate: "" },
      { x: 280, y: 800, color: "#336", plate: "" },
      { x: 520, y: 780, color: "#777", plate: "" },
      { x: 100, y: 400, color: "#444", plate: "" },
    ];
    deco.forEach((c, i) => {
      cars.push({
        id: "deco_" + i,
        jobId: null,
        x: c.x, y: c.y, w: 70, h: 36,
        color: c.color, plate: c.plate,
        model: "3", inLot: true, inBay: false, interactable: false,
      });
      solids.push(rect(c.x - 4, c.y - 4, 78, 44));
    });

    JOB_ORDER.forEach((jid) => {
      const job = JOBS[jid];
      cars.push({
        id: "job_" + jid,
        jobId: jid,
        x: job.lotSpot.x,
        y: job.lotSpot.y,
        w: job.model === "X" ? 84 : 72,
        h: job.model === "X" ? 40 : 34,
        color: job.color,
        plate: job.plate,
        model: job.model,
        nickname: job.nickname,
        inLot: true,
        inBay: false,
        interactable: true,
      });
    });

    pigeons = [
      { x: 240, y: 100, phase: 0 },
      { x: 600, y: 880, phase: 1.2 },
      { x: 1050, y: 100, phase: 2.4 },
      { x: 1600, y: 300, phase: 0.7 },
      { x: 900, y: 500, phase: 3.1 },
    ];

    player = {
      x: 920,
      y: 500,
      w: 26,
      h: 26,
      speed: 180,
      facing: 1,
      name: playerName,
    };
  }

  function carSolid(car) {
    return rect(car.x - 2, car.y - 2, car.w + 4, car.h + 4);
  }

  function collides(px, py, pw, ph, ignoreCarId) {
    const box = { x: px, y: py, w: pw, h: ph };
    for (const s of solids) {
      if (aabb(box, s)) return true;
    }
    for (const c of cars) {
      if (!c.inLot && !c.inBay) continue;
      if (ignoreCarId && c.id === ignoreCarId) continue;
      if (c.inBay) continue; // parked in bay — walk around via hoist solids
      // collide with lot cars (deco + job)
      if (aabb(box, carSolid(c))) return true;
    }
    // NPC soft collision (tight — leave room to stand in interact range)
    for (const n of npcs) {
      if (n.delivering) continue;
      const nb = { x: n.x - 8, y: n.y - 8, w: 16, h: 16 };
      if (aabb(box, nb)) return true;
    }
    return false;
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function dist(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.hypot(dx, dy);
  }

  // ─── Dialogue ───────────────────────────────────────────────────────
  function showDialogue(who, lines, onDone) {
    const arr = Array.isArray(lines) ? lines.slice() : [lines];
    dialogueQueue = { who, lines: arr, idx: 0, onDone: onDone || null };
    renderDialoguePage();
    els.dialogue.classList.remove("hidden");
  }

  function renderDialoguePage() {
    if (!dialogueQueue) return;
    const raw = dialogueQueue.lines[dialogueQueue.idx];
    // Support multi-speaker beats: { who, text } — used for Jordan "Yuuh" interrupt gag
    if (raw && typeof raw === "object") {
      els.dlgWho.textContent = raw.who || dialogueQueue.who;
      els.dlgLines.innerHTML = `<p>${raw.text || ""}</p>`;
    } else {
      els.dlgWho.textContent = dialogueQueue.who;
      els.dlgLines.innerHTML = `<p>${raw || ""}</p>`;
    }
    const last = dialogueQueue.idx >= dialogueQueue.lines.length - 1;
    els.dlgNext.textContent = last ? "Done" : "Continue";
  }

  function advanceDialogue() {
    if (!dialogueQueue) return;
    if (dialogueQueue.idx < dialogueQueue.lines.length - 1) {
      dialogueQueue.idx++;
      renderDialoguePage();
      return;
    }
    const done = dialogueQueue.onDone;
    dialogueQueue = null;
    els.dialogue.classList.add("hidden");
    if (done) done();
  }

  els.dlgNext.addEventListener("click", advanceDialogue);

  function showFlash(msg, frames) {
    flash = { msg, t: frames || 90 };
  }

  // ─── Interactions ───────────────────────────────────────────────────
  function findNearTarget() {
    if (!player || dialogueQueue || cutscene) return null;

    // NPCs
    let best = null;
    let bestD = 72;
    for (const n of npcs) {
      if (n.delivering && n.id === "moe") {
        // can still talk if close during wait? skip while moving
        if (moeDelivery && moeDelivery.phase === "walk") continue;
      }
      const d = dist(player.x + 13, player.y + 13, n.x, n.y);
      if (d < bestD) {
        bestD = d;
        best = { kind: "npc", id: n.id, label: promptForNpc(n), npc: n };
      }
    }

    // Job cars in lot
    for (const c of cars) {
      if (!c.interactable || !c.inLot || !c.jobId) continue;
      const js = jobState(c.jobId);
      if (js.stage !== "assigned") continue;
      const d = dist(player.x + 13, player.y + 13, c.x + c.w / 2, c.y + c.h / 2);
      if (d < 110 && d < bestD + 40) {
        bestD = d;
        best = { kind: "car", id: c.id, label: `Get ${c.plate}`, car: c };
      }
    }

    // Washroom interact
    const washCx = 760, washCy = 365;
    if (dist(player.x + 13, player.y + 13, washCx, washCy) < 50) {
      if (!best || bestD > 48) {
        best = { kind: "wash", id: "wash", label: "Use washroom" };
      }
    }

    // Bay doors flavour
    const doorSpots = [
      { x: 1700, y: 240, label: "Peek bay door" },
      { x: 1700, y: 460, label: "Peek bay door" },
      { x: 1700, y: 680, label: "Peek bay door" },
    ];
    for (const dspot of doorSpots) {
      if (dist(player.x + 13, player.y + 13, dspot.x, dspot.y) < 48) {
        if (!best) best = { kind: "baydoor", id: "door", label: dspot.label };
      }
    }

    // Shop entrance marker (optional flavour when near door from lot)
    if (player.x < 700 && dist(player.x + 13, player.y + 13, 690, 490) < 55) {
      if (!best) best = { kind: "entrance", id: "ent", label: "Enter shop" };
    }

    return best;
  }

  function promptForNpc(n) {
    if (n.role === "foh") return `Talk to ${n.name}`;
    if (n.id === "moe") {
      if (moeDelivery && moeDelivery.phase === "arrive") return "Wait for Moe";
      return "Talk to Moe";
    }
    return `Talk to ${n.name}`;
  }

  function doInteract() {
    const tgt = nearTarget;
    if (!tgt) return;
    if (tgt.kind === "npc") interactNpc(tgt.npc);
    else if (tgt.kind === "car") fetchCar(tgt.car);
    else if (tgt.kind === "wash") {
      showDialogue("Washroom", [
        "One working soap dispenser. Sign: \"DO NOT WASH PARTS IN SINK — Moe\".",
        "You emerge 4% cleaner, 100% still a rook. A pigeon stares through the high window.",
      ]);
    } else if (tgt.kind === "baydoor") {
      showDialogue("Bay Doors", [
        "Roll-up doors rattle in the draft. Outside: alley grit. Inside: hoist drama.",
        "Pigeons use the door tracks as a highway. Classic hole-in-the-wall infrastructure.",
      ]);
    } else if (tgt.kind === "entrance") {
      player.x = 720;
      player.y = 480;
      showFlash("Into the grease pit.", 60);
    }
  }

  // ─── FOH / Tech / Moe logic ─────────────────────────────────────────
  function interactNpc(n) {
    if (n.role === "foh") return talkFOH(n);
    if (n.role === "tech") return talkTech(n);
    if (n.id === "moe") return talkMoe(n);
  }

  function talkFOH(n) {
    const id = n.id;
    const name = n.name;

    if (state.activeJob && fohInProgress(id) === state.activeJob) {
      const job = JOBS[state.activeJob];
      if (id === "jordan") {
        showDialogue(name, jordanBusyLines(job));
      } else {
        showDialogue(name, [
          `"I already hung a ticket on you, grease-stain. ${job.plate} — lot's that way. Car isn't gonna levitate in, rook."`,
        ]);
      }
      return;
    }

    if (state.activeJob && !fohInProgress(id)) {
      if (id === "jordan") {
        showDialogue(name, jordanOtherTicketLines());
        return;
      }
      const tips = {
        kim: "\"Different flavour of misery? Ryan does the heavy metal. Jordan does the ghost cars. I do wet and flat, knucklehead.\"",
        ryan: "\"Kim does leaks and flats. Jordan does haunted electronics. I do brakes and drive units. Division of labour, idiot.\"",
      };
      showDialogue(name, [tips[id] || "\"Busy ticket elsewhere, greenhorn.\""]);
      return;
    }

    if (fohAllDone(id)) {
      if (id === "jordan") {
        showDialogue(name, jordanDoneLines());
        return;
      }
      const done = {
        kim: "\"My tickets are closed. Miracles happen. Don't get cocky, rook.\"",
        ryan: "\"My heavy jobs are done. Won grunted. That's a standing ovation.\"",
      };
      showDialogue(name, [done[id]]);
      return;
    }

    const nextId = nextJobForFOH(id);
    if (!nextId) {
      showDialogue(name, ["\"Nothing for you right now, wet-behind-the-ears. Check the others.\""]);
      return;
    }

    const job = JOBS[nextId];
    const assignLines = assignDialogue(id, job);
    showDialogue(name, assignLines, () => {
      state.activeJob = nextId;
      jobState(nextId).stage = "assigned";
      addItem("ticket_" + nextId, `Ticket: ${job.plate}`);
      refreshHUD();
      showFlash(`Ticket: ${job.repairType}`, 100);
    });
  }


  /** Jordan Sham — "Yuuh" interrupt quirk. Lines may be {who,text} for mid-sentence cut-ins. */
  function jordanAssignLines(job) {
    const s = playerName;
    return [
      { who: "Jordan Sham", text: `Jordan spins a pen like a tiny drive shaft. "Yuuh. Apprentice. Circus called — they want their rook back, ${s}."` },
      { who: s, text: `"Hey Jordan, I was hopi—"` },
      { who: "Jordan Sham", text: `"Yuh. Didn't ask. Eyes up, knucklehead."` },
      { who: "Jordan Sham", text: `"Yuuh — this is a 12V / PHANTOM DRAIN diag. Red Model S Plaid, plate ${job.plate}, nickname Ghost Plaid. Phantom alerts, 12V sulking, charge-port attitude."` },
      { who: s, text: `"So I should grab it from the lo—"` },
      { who: "Jordan Sham", text: `"Yuuh. Lot. Then Nima's far-left bay. He radios Moe for the 12V and clips. Don't poke HV with your feelings, wet-behind-the-ears."` },
      { who: s, text: `"Got it, I'll head out and—"` },
      { who: "Jordan Sham", text: `"Yuh. Ticket. Try not to lose a staring contest to a Plaid, grease-stain. You're already losing to the pigeons. Yuuh."` },
    ];
  }

  function jordanBusyLines(job) {
    const s = playerName;
    return [
      { who: s, text: `"Jordan, about the ticke—"` },
      { who: "Jordan Sham", text: `"Yuuh. Already hung one on you, ${s}. ${job.plate} — Ghost Plaid. Lot's that way."` },
      { who: s, text: `"I was gonna say I might need—"` },
      { who: "Jordan Sham", text: `"Yuh. Car isn't gonna levitate in, rook. Scram. Yuuh."` },
    ];
  }

  function jordanOtherTicketLines() {
    const s = playerName;
    return [
      { who: s, text: `"Hey, do you have anythin—"` },
      { who: "Jordan Sham", text: `"Yuuh. Different flavour of pain. Kim and Ryan own the other tickets."` },
      { who: "Jordan Sham", text: `"Yuh. Shoo, parts-runner. Come back when your live ticket stops haunting you. Yuuh."` },
    ];
  }

  function jordanDoneLines() {
    const s = playerName;
    return [
      { who: s, text: `"Jordan, diag's closed, so I thought maybe—"` },
      { who: "Jordan Sham", text: `"Yuuh. Diag closed. Nima looked smug for thirty seconds. Record."` },
      { who: "Jordan Sham", text: `"Yuh. You almost helped, ${s}. Don't let it go to your head, idiot. Yuuh."` },
    ];
  }

  function assignDialogue(fohId, job) {
    const s = playerName;
    if (fohId === "kim" && job.id === "leak") {
      return [
        `Kim glances up, sticky note stuck to her sleeve. "Oh good — another greenhorn."`,
        `"Listen up, knucklehead — WATER LEAK. White Model Y, plate ${job.plate}, nickname ${job.nickname}. Wet carpet after every rain."`,
        `"Grab it from the lot, roll it into Rolando's bay — far right. He speaks fluent drain clog. You speak fluent wrong turns, ${s}."`,
      ];
    }
    if (fohId === "kim" && job.id === "tire") {
      return [
        `"Wake up, parts-runner — TIRE / TPMS. Deep Blue Model X, plate ${job.plate}, Flatliner. Nail in the sidewall."`,
        `"Lot → Won Song's middle bay. He'll radio Moe for the tire and sensor. Don't lose the lug nuts, wet-behind-the-ears."`,
      ];
    }
    if (fohId === "ryan" && job.id === "brakes") {
      return [
        `Ryan looks like he slept here. "${s} — BRAKE SERVICE. Pearl White Model Y, ${job.plate}, Squeaky Y. Pads screaming."`,
        `"Won Song, middle bay. He'll call Moe for pads and rotors — you don't freelance brake parts, rook."`,
      ];
    }
    if (fohId === "ryan" && job.id === "drive") {
      return [
        `"Listen, grease-stain — DRIVE UNIT. Midnight Model 3, ${job.plate}, Clunk Cub. Rear unit howling."`,
        `"Won Song, middle bay. When he radios Moe, wait at the bay for the forklift like a civilized parts-runner."`,
      ];
    }
    if (fohId === "jordan" && job.id === "diag") {
      return jordanAssignLines(job);
    }
    return [`"Ticket for ${job.plate}. Lot. Then the right bay. Go, idiot."`];
  }

  function talkTech(n) {
    const techId = n.id;
    const job = activeJob();
    const s = playerName;

    if (!job) {
      showDialogue(n.name, [
        `"No ticket, no show, ${s}. Front desk first — Kim, Ryan, or Jordan. Don't decorate my bay empty-handed, rook."`,
      ]);
      return;
    }

    const js = jobState(job.id);

    // Wrong tech
    if (job.tech !== techId) {
      showDialogue(n.name, wrongTechLines(techId, job, s));
      return;
    }

    // Right tech, no car yet
    if (js.stage === "assigned") {
      showDialogue(n.name, [
        `"Where's the car, rook? I don't repair air. Lot's west — fetch ${job.plate}, then come back."`,
      ]);
      return;
    }

    // Car fetched / in bay — first contact
    if (js.stage === "car_fetched") {
      if (job.needsParts) {
        const lines = needPartsLines(techId, job, s);
        showDialogue(n.name, lines, () => {
          js.stage = "tech_ok";
          startMoeDelivery(job.id);
          refreshHUD();
        });
      } else {
        // leak — finish immediately
        showDialogue(n.name, finishLines(techId, job, s), () => {
          completeJob(job.id);
        });
      }
      return;
    }

    if (js.stage === "tech_ok") {
      showDialogue(n.name, [
        `"Moe's rolling. Stand there and look decorative, grease-stain. Parts aren't here yet."`,
      ]);
      return;
    }

    if (js.stage === "parts_ok") {
      showDialogue(n.name, finishLines(techId, job, s), () => {
        completeJob(job.id);
      });
      return;
    }

    if (js.done) {
      showDialogue(n.name, [`"We're good here. Next ticket, wet-behind-the-ears."`]);
    }
  }

  function wrongTechLines(techId, job, s) {
    if (techId === "rolando") {
      return [
        `Rolando wipes sealant off a rag that has seen wars.`,
        `"${s}, you look lost in a helpful-idiot way. That's not my puddle."`,
        `"Water leaks: me — far right. Brakes/tires/drive units: Won, middle. Ghost codes: Nima, left. Parts: Moe. Don't cosplay a forklift, greenhorn."`,
      ];
    }
    if (techId === "won") {
      return [
        `Won Song doesn't stop torquing. He speaks to the bolt, then to you.`,
        `"Wrong bay for that ticket, ${s}. Pay attention, greenhorn."`,
        `"Leaks: Rolando. Diag: Nima. Heavy metal — me. Parts: I radio Moe. Don't mix the playlist, knucklehead."`,
      ];
    }
    return [
      `Nima flips hair that somehow survives a shop environment.`,
      `"Wrong specialty, ${s}. I do the mysteries. You're in the wrong aisle, rook."`,
      `"Wet carpets: Rolando. Heavy iron: Won. Me: when the car is lying — 12V, phantom drains, weird codes."`,
    ];
  }

  function needPartsLines(techId, job, s) {
    if (job.id === "brakes") {
      return [
        `Won Song spins a wheel, grimaces like the rotor insulted his family.`,
        `"Brake service — pads cooked, rotors done. Radioing Moe. Stay put, ${s}."`,
        `"Moe — middle bay, Squeaky Y. Pads and rotors. Send 'em before this greenhorn invents a new noise."`,
      ];
    }
    if (job.id === "drive") {
      return [
        `Won Song inspects the Model 3, nods once.`,
        `"Drive unit's coming out. Radioing Moe for the forklift. Wait at the bay, knucklehead."`,
        `"Moe. Heavy. Clunk Cub. Forklift. Now."`,
      ];
    }
    if (job.id === "tire") {
      return [
        `Won Song eyes the Model X sidewall like it owes him money.`,
        `"Puncture's ugly. Calling Moe for a tire and sensor. Park yourself here, rook."`,
        `"Moe — Flatliner needs rubber and a sensor. Middle bay."`,
      ];
    }
    if (job.id === "diag") {
      return [
        `Nima plugs in. Screens bloom. He winces at a voltage plot.`,
        `"Phantom drain + tired 12V. Radioing Moe. Stay in the bay, ${s}."`,
        `"Moe — far left. Ghost Plaid needs a 12V and charge-port clips."`,
      ];
    }
    return [`"Radioing Moe for ${job.partsLabel}. Wait here, idiot."`];
  }

  function finishLines(techId, job, s) {
    if (job.id === "leak") {
      return [
        `Rolando circles the Model Y like a detective who enjoys bullying apprentices.`,
        `"Clogged drain + tired seal. Classic. Pass me that trim tool before you drop it, ${s}."`,
        `"Dry. Nice assist for a wet-behind-the-ears. Don't let it go to your head, idiot."`,
      ];
    }
    if (job.id === "brakes") {
      return [
        `Pads and rotors hit the cart. Won points. You fetch. He works.`,
        `"Hold the caliper like you mean it, ${s}. Torque's not a suggestion."`,
        `"Brakes are solid. Go tell Ryan before he drinks the whole pot, greenhorn."`,
      ];
    }
    if (job.id === "drive") {
      return [
        `Moe's forklift hums. Won points. You spot.`,
        `"Hold that harness clear. ${s}, you're not completely useless. Keep it that way."`,
        `"Job's solid. Tell Ryan I grunted approvingly — he'll translate, rook."`,
      ];
    }
    if (job.id === "tire") {
      return [
        `New tire, fresh TPMS. Won balances the wheel.`,
        `"Hand me the torque stick, knucklehead. Lug order matters — look at me, ${s}."`,
        `"She's round again. Miracle. Go bother Kim before I invent more work for you."`,
      ];
    }
    if (job.id === "diag") {
      return [
        `Parts on the bench. Nima guides your hands like you're a slightly dangerous intern.`,
        `"Intermittent drain on a harness the last shop 'fixed.' Classic swagger failure, rook."`,
        `"${s}, you just outsmarted a Plaid. Wash your hands, idiot."`,
      ];
    }
    return [`"Done. Scram, rook."`];
  }

  function talkMoe() {
    const s = playerName;
    const job = activeJob();

    if (moeDelivery && moeDelivery.phase === "arrive") {
      showDialogue("Moe", [
        moeDelivery.heavy
          ? `Moe beeps in on the forklift. "Package for Clunk Cub. Signed for by one apprentice idiot — that's you, ${s}."`
          : `Moe rolls a cart over. "${JOBS[moeDelivery.jobId].partsLabel}. Fresh from the cage. Try not to drop them, grease-stain."`,
        `"Tell the tech the parts fairy arrived. And if anyone asks — I never speed indoors."`,
      ], () => {
        finishMoeDelivery();
      });
      return;
    }

    if (!job) {
      showDialogue("Moe", [
        `"Parts counter's open. Your pockets look empty of purpose though, greenhorn. Hit the front desk."`,
      ]);
      return;
    }

    const js = jobState(job.id);
    if (js.stage === "assigned" || js.stage === "car_fetched") {
      showDialogue("Moe", [
        `"Tech hasn't radioed the play yet. Get their blessing at the bay, then I roll. Don't freelance my schedule, parts-runner."`,
      ]);
      return;
    }
    if (js.stage === "tech_ok") {
      showDialogue("Moe", [
        `"Yeah yeah — already barked. ${job.partsLabel}. I'm heading over. Wait at the bay like a civilized rook, ${s}."`,
      ]);
      return;
    }
    showDialogue("Moe", [
      `"Looking for vibes? Canonical path is the tech radios me and I deliver. You're the optional tour group, knucklehead."`,
    ]);
  }

  function startMoeDelivery(jobId) {
    const job = JOBS[jobId];
    const moe = npcs.find((n) => n.id === "moe");
    const bay = BAYS[job.bay];
    moeDelivery = {
      jobId,
      phase: "walk",
      timer: 0,
      heavy: !!job.partsHeavy,
      targetX: bay.park.x - 80,
      targetY: bay.park.y + 40,
    };
    moe.delivering = true;
    showFlash(job.partsHeavy ? "Moe en route (forklift)…" : "Moe delivering parts…", 100);
  }

  function finishMoeDelivery() {
    if (!moeDelivery) return;
    const jobId = moeDelivery.jobId;
    jobState(jobId).stage = "parts_ok";
    const moe = npcs.find((n) => n.id === "moe");
    moe.delivering = false;
    moe.x = moe.homeX;
    moe.y = moe.homeY;
    moeDelivery = null;
    addItem("parts_" + jobId, JOBS[jobId].partsLabel);
    refreshHUD();
    showFlash("Parts delivered!", 80);
  }

  function completeJob(jobId) {
    const job = JOBS[jobId];
    const js = jobState(jobId);
    js.stage = "done";
    js.done = true;
    state.activeJob = null;
    removeItem("ticket_" + jobId);
    removeItem("parts_" + jobId);
    removeItem("car_" + jobId);
    // leave car in bay as done prop
    const car = cars.find((c) => c.jobId === jobId);
    if (car) {
      car.inBay = true;
      car.inLot = false;
      car.interactable = false;
    }
    refreshHUD();
    showFlash(`Job done: ${job.repairType}`, 110);
    addFloater(player.x, player.y - 20, "+1 SHIFT", "#6ecf6a");

    if (allDone()) {
      setTimeout(() => {
        els.winText.textContent =
          `${playerName} survived the hole in the wall. Five tickets closed. ` +
          `The pigeons remain unimpressed. The techs remain lightly abusive. You, somehow, are still employed.`;
        els.win.classList.remove("hidden");
      }, 600);
    }
  }

  function fetchCar(car) {
    const job = JOBS[car.jobId];
    const js = jobState(car.jobId);
    if (!job || js.stage !== "assigned") return;
    if (state.activeJob !== car.jobId) {
      showDialogue("You", ["Wrong car, knucklehead. Check the ticket plate."]);
      return;
    }

    showDialogue("Lot", [
      `You unlock ${job.plate} (${job.nickname}). The ${job.model === "X" ? "Model X" : "Model " + job.model} sighs awake.`,
      `"Alright, rook — rolling it into ${job.bay === "nima" ? "Nima's" : job.bay === "won" ? "Won Song's" : "Rolando's"} bay. Try not to scrape the door seals."`,
    ], () => {
      startCarCutscene(car, job);
    });
  }

  function startCarCutscene(car, job) {
    const bay = BAYS[job.bay];
    const tech = npcs.find((n) => n.id === job.tech);
    cutscene = {
      type: "drive",
      timer: 0,
      dur: 90,
      car,
      job,
      fromX: car.x,
      fromY: car.y,
      toX: bay.park.x - car.w / 2,
      toY: bay.park.y - car.h / 2,
      // Stand next to the right tech so interact is immediate
      playerToX: (tech ? tech.x : bay.park.x) - 50,
      playerToY: (tech ? tech.y : bay.park.y) + 36,
    };
    showFlash("Driving into bay…", 70);
  }

  // ─── Update ─────────────────────────────────────────────────────────
  function update(dt) {
    t += dt;
    ambientTimer += dt;
    if (ambientTimer > 8) {
      ambientTimer = 0;
      ambientIdx = (ambientIdx + 1) % AMBIENT.length;
    }

    if (flash) {
      flash.t--;
      if (flash.t <= 0) flash = null;
    }

    updateFx(dt);

    if (dialogueQueue || !playing) {
      nearTarget = null;
      setPrompt("");
      return;
    }

    if (els.help && !els.help.classList.contains("hidden")) return;
    if (els.win && !els.win.classList.contains("hidden")) return;

    // Cutscene: auto-drive car to bay
    if (cutscene && cutscene.type === "drive") {
      cutscene.timer++;
      const u = Math.min(1, cutscene.timer / cutscene.dur);
      const ease = u * u * (3 - 2 * u);
      const car = cutscene.car;
      car.x = cutscene.fromX + (cutscene.toX - cutscene.fromX) * ease;
      car.y = cutscene.fromY + (cutscene.toY - cutscene.fromY) * ease;
      car.inLot = false;
      // camera follows car
      cam.x = car.x + car.w / 2 - CW / 2;
      cam.y = car.y + car.h / 2 - CH / 2;
      clampCam();
      if (u >= 1) {
        car.inBay = true;
        car.interactable = false;
        player.x = cutscene.playerToX;
        player.y = cutscene.playerToY;
        const job = cutscene.job;
        jobState(job.id).stage = "car_fetched";
        state.carInBay[job.id] = true;
        addItem("car_" + job.id, `Car: ${job.plate}`);
        removeItem("ticket_" + job.id);
        addItem("ticket_" + job.id, `Ticket: ${job.plate} (in bay)`);
        cutscene = null;
        refreshHUD();
        showFlash(`${job.plate} parked in bay`, 90);
      }
      setPrompt("");
      return;
    }

    // Moe delivery walk
    if (moeDelivery && moeDelivery.phase === "walk") {
      const moe = npcs.find((n) => n.id === "moe");
      const tx = moeDelivery.targetX;
      const ty = moeDelivery.targetY;
      const dx = tx - moe.x;
      const dy = ty - moe.y;
      const d = Math.hypot(dx, dy) || 1;
      const spd = moeDelivery.heavy ? 90 : 120;
      moe.x += (dx / d) * spd * dt;
      moe.y += (dy / d) * spd * dt;
      moe.facing = dx >= 0 ? 1 : -1;
      if (d < 12) {
        moe.x = tx;
        moe.y = ty;
        moeDelivery.phase = "arrive";
        showFlash("Moe arrived — talk to him", 100);
      }
    }

    // Player move
    const { dx, dy } = moveVec();
    if (dx || dy) {
      const sp = player.speed * dt;
      let nx = player.x + dx * sp;
      let ny = player.y + dy * sp;
      if (!collides(nx, player.y, player.w, player.h)) player.x = nx;
      else {
        // slide
        if (!collides(player.x + dx * sp * 0.5, player.y, player.w, player.h)) player.x += dx * sp * 0.5;
      }
      if (!collides(player.x, ny, player.w, player.h)) player.y = ny;
      else {
        if (!collides(player.x, player.y + dy * sp * 0.5, player.w, player.h)) player.y += dy * sp * 0.5;
      }
      if (dx) player.facing = dx > 0 ? 1 : -1;
      // keep in world
      player.x = Math.max(40, Math.min(WORLD_W - 60, player.x));
      player.y = Math.max(70, Math.min(WORLD_H - 90, player.y));
    }

    // Camera
    cam.x = player.x + player.w / 2 - CW / 2;
    cam.y = player.y + player.h / 2 - CH / 2;
    clampCam();

    // Proximity
    nearTarget = findNearTarget();
    setPrompt(nearTarget ? nearTarget.label + "  [E / USE]" : "");

    if (wantsInteract()) {
      if (nearTarget) doInteract();
    }

    // Idle intro ping
    if (!state.introShown && playing) {
      state.introShown = true;
      showDialogue("Shop Floor", [
        `You clock in as ${playerName}. Concrete slick with old oil. Pigeons argue in the rafters.`,
        "Front desk is west of the bays — Kim, Ryan, and Jordan Sham. Lot is further west. Three bays on the east wall: Nima · Won · Rolando.",
        "Walk over. Talk to FOH. Try not to reverse into the parts cage, rook.",
      ]);
    }
  }

  function clampCam() {
    cam.x = Math.max(0, Math.min(WORLD_W - CW, cam.x));
    cam.y = Math.max(0, Math.min(WORLD_H - CH, cam.y));
  }

  function setPrompt(text) {
    els.prompt.textContent = text || "";
  }

  function refreshHUD() {
    const job = activeJob();
    if (!job) {
      const left = JOB_ORDER.length - doneCount();
      els.hudJob.textContent = left
        ? `No ticket — talk to Kim / Ryan / Jordan (${left} left)`
        : "All tickets closed";
    } else {
      const js = jobState(job.id);
      els.hudJob.innerHTML = `<strong>${job.repairType}</strong><br/>${job.plate} · ${stageHint(job, js.stage)}`;
    }
    if (state.inventory.length === 0) {
      els.hudInv.textContent = "Pockets: empty";
    } else {
      els.hudInv.textContent = "Inv: " + state.inventory.map((i) => i.label).join(" · ");
    }
    els.hudProgress.textContent = `Jobs ${doneCount()}/5`;
  }

  // ─── FX ─────────────────────────────────────────────────────────────
  function addFloater(x, y, text, color) {
    floaters.push({ x, y, text, color: color || "#e8a838", life: 90 });
  }
  function updateFx() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i];
      f.y -= 0.4; f.life--;
      if (f.life <= 0) floaters.splice(i, 1);
    }
  }

  // ─── Draw ───────────────────────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, CW, CH);
    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    drawGround();
    drawLot();
    drawShop();
    drawCars();
    drawNPCs();
    drawPlayer();
    drawPigeons();
    drawLabels();
    drawFx();

    ctx.restore();

    if (flash) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(CW / 2 - 160, 40, 320, 36);
      ctx.strokeStyle = "#e8a838";
      ctx.strokeRect(CW / 2 - 160, 40, 320, 36);
      ctx.fillStyle = "#f2efe6";
      ctx.font = "bold 14px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(flash.msg, CW / 2, 63);
      ctx.textAlign = "left";
    }

    // minimap
    drawMinimap();
  }

  function drawGround() {
    // asphalt lot
    ctx.fillStyle = "#3a4240";
    ctx.fillRect(0, 0, 700, WORLD_H);
    // shop floor
    ctx.fillStyle = "#2e3430";
    ctx.fillRect(700, 0, WORLD_W - 700, WORLD_H);
    // lot stripes
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    for (let y = 100; y < WORLD_H - 80; y += 90) {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }
    // concrete stain
    ctx.fillStyle = "rgba(20,20,16,0.25)";
    ctx.beginPath();
    ctx.ellipse(900, 500, 120, 60, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawLot() {
    // lot label
    ctx.fillStyle = "rgba(232,168,56,0.35)";
    ctx.font = "bold 22px Segoe UI, sans-serif";
    ctx.fillText("CUSTOMER LOT", 200, 90);
    // dumpster
    ctx.fillStyle = "#2a5028";
    ctx.fillRect(560, 820, 70, 50);
    ctx.fillStyle = "#1a3018";
    ctx.fillRect(560, 815, 70, 10);
    ctx.fillStyle = "#8a9488";
    ctx.font = "10px sans-serif";
    ctx.fillText("DUMPSTER", 568, 848);
  }

  function drawShop() {
    // shop walls visual
    ctx.fillStyle = "#1a201c";
    // west wall segments
    ctx.fillRect(680, 60, 28, 360);
    ctx.fillRect(680, 560, 28, 360);
    // door opening glow
    ctx.fillStyle = "rgba(232,168,56,0.15)";
    ctx.fillRect(680, 420, 28, 140);
    ctx.fillStyle = "#e8a838";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("DOOR", 682, 495);

    // north/south
    ctx.fillStyle = "#1a201c";
    ctx.fillRect(700, 60, 1000, 20);
    ctx.fillRect(700, WORLD_H - 80, 1000, 20);
    ctx.fillRect(WORLD_W - 44, 60, 24, WORLD_H - 140);

    // FOH area
    ctx.fillStyle = "#3a3228";
    ctx.fillRect(780, 120, 260, 36);
    ctx.fillStyle = "#e8a838";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("FRONT DESK — FOH", 820, 112);
    // monitors
    ctx.fillStyle = "#4a8";
    ctx.fillRect(800, 128, 30, 18);
    ctx.fillRect(860, 128, 30, 18);
    ctx.fillRect(920, 128, 30, 18);

    // Parts
    ctx.fillStyle = "#3a3020";
    ctx.fillRect(760, 640, 40, 200);
    ctx.fillRect(920, 640, 40, 200);
    ctx.fillRect(760, 860, 200, 30);
    ctx.fillStyle = "#d08040";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("PARTS — MOE", 800, 630);
    // forklift parked
    ctx.fillStyle = "#c8a020";
    ctx.fillRect(980, 780, 50, 28);
    ctx.fillStyle = "#222";
    ctx.beginPath(); ctx.arc(990, 810, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1020, 810, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#888";
    ctx.font = "9px sans-serif";
    ctx.fillText("FORKLIFT", 982, 798);

    // Washroom alcove
    ctx.fillStyle = "#252a28";
    ctx.fillRect(720, 312, 76, 106);
    ctx.strokeStyle = "#4a5550";
    ctx.strokeRect(720, 312, 76, 106);
    ctx.fillStyle = "#8af";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("🚻", 744, 360);
    ctx.fillText("WASH", 732, 378);

    // Divider
    ctx.fillStyle = "#1a201c";
    ctx.fillRect(1100, 80, 20, 120);
    ctx.fillRect(1100, 320, 20, 60);
    ctx.fillRect(1100, 540, 20, 60);
    ctx.fillRect(1100, 760, 20, 140);

    // Bays
    Object.entries(BAYS).forEach(([id, b]) => {
      ctx.fillStyle = "rgba(50,70,90,0.35)";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "rgba(232,168,56,0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "#e8a838";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(b.label, b.x + 16, b.y + 22);
      // hoist arms
      ctx.fillStyle = "#555";
      ctx.fillRect(b.x + 40, b.y + 40, 14, 90);
      ctx.fillRect(b.x + 200, b.y + 40, 14, 90);
      ctx.fillStyle = "#777";
      ctx.fillRect(b.x + 30, b.y + 120, 200, 8);
    });

    // Bay doors east
    ["NIMA", "WON", "ROL"].forEach((lab, i) => {
      const y = 160 + i * 220;
      ctx.fillStyle = "#4a5560";
      ctx.fillRect(1680, y, 36, 100);
      ctx.fillStyle = "#222";
      ctx.font = "9px sans-serif";
      ctx.save();
      ctx.translate(1698, y + 70);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(lab, 0, 0);
      ctx.restore();
    });

    // Shop title
    ctx.fillStyle = "rgba(232,168,56,0.25)";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("SHOP FLOOR", 860, 560);
  }

  function drawCars() {
    for (const c of cars) {
      if (!c.inLot && !c.inBay) continue;
      drawCarSprite(c);
    }
    // Moe forklift during heavy delivery
    if (moeDelivery && moeDelivery.heavy && moeDelivery.phase === "walk") {
      const moe = npcs.find((n) => n.id === "moe");
      ctx.fillStyle = "#c8a020";
      ctx.fillRect(moe.x - 30, moe.y - 10, 50, 24);
      ctx.fillStyle = "#222";
      ctx.beginPath(); ctx.arc(moe.x - 20, moe.y + 16, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(moe.x + 10, moe.y + 16, 6, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawCarSprite(c) {
    const highlight = c.jobId && jobState(c.jobId).stage === "assigned" && c.inLot;
    if (highlight) {
      ctx.strokeStyle = "#e8a838";
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x - 4, c.y - 4, c.w + 8, c.h + 8);
      // pulse
      ctx.globalAlpha = 0.3 + 0.2 * Math.sin(t * 4);
      ctx.fillStyle = "#e8a838";
      ctx.fillRect(c.x - 4, c.y - 4, c.w + 8, c.h + 8);
      ctx.globalAlpha = 1;
    }
    // body
    ctx.fillStyle = c.color;
    roundRect(c.x, c.y, c.w, c.h, 6);
    ctx.fill();
    // windows
    ctx.fillStyle = "rgba(40,60,80,0.7)";
    ctx.fillRect(c.x + c.w * 0.2, c.y + 4, c.w * 0.45, c.h * 0.4);
    // wheels
    ctx.fillStyle = "#111";
    ctx.fillRect(c.x + 6, c.y + c.h - 4, 12, 6);
    ctx.fillRect(c.x + c.w - 18, c.y + c.h - 4, 12, 6);
    // plate
    if (c.plate) {
      ctx.fillStyle = "#f2efe6";
      ctx.fillRect(c.x + c.w * 0.25, c.y + c.h - 14, c.w * 0.5, 10);
      ctx.fillStyle = "#111";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "center";
      ctx.fillText(c.plate, c.x + c.w / 2, c.y + c.h - 6);
      ctx.textAlign = "left";
    }
    // model badge
    if (c.model) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.font = "9px sans-serif";
      ctx.fillText("M" + c.model, c.x + 4, c.y + 12);
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawNPCs() {
    for (const n of npcs) {
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(n.x, n.y + 14, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // body
      ctx.fillStyle = n.color;
      ctx.fillRect(n.x - 12, n.y - 16, 24, 28);
      // head
      ctx.fillStyle = "#e8c8a0";
      ctx.beginPath();
      ctx.arc(n.x, n.y - 22, 10, 0, Math.PI * 2);
      ctx.fill();
      // emoji hint
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(n.emoji, n.x, n.y - 18);
      // name tag
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(n.x - 28, n.y + 14, 56, 14);
      ctx.fillStyle = "#f2efe6";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText(n.name.split(" ")[0], n.x, n.y + 24);
      ctx.textAlign = "left";

      // proximity ring
      if (nearTarget && nearTarget.kind === "npc" && nearTarget.id === n.id) {
        ctx.strokeStyle = "#e8a838";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 28 + Math.sin(t * 6) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function drawPlayer() {
    if (!player) return;
    const bob = Math.sin(t * 10) * (moveVec().dx || moveVec().dy ? 2 : 0);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(player.x + 13, player.y + 24, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tesla red shirt apprentice
    ctx.fillStyle = "#c43828";
    ctx.fillRect(player.x + 2, player.y + 4 + bob, 22, 20);
    ctx.fillStyle = "#e8c8a0";
    ctx.beginPath();
    ctx.arc(player.x + 13, player.y + bob, 9, 0, Math.PI * 2);
    ctx.fill();
    // eyes
    ctx.fillStyle = "#222";
    ctx.fillRect(player.x + 9 + player.facing * 2, player.y - 2 + bob, 3, 3);
    ctx.fillRect(player.x + 15 + player.facing * 2, player.y - 2 + bob, 3, 3);
    // name
    ctx.fillStyle = "#e8a838";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(playerName.slice(0, 12), player.x + 13, player.y + 36 + bob);
    ctx.textAlign = "left";
  }

  function drawPigeons() {
    for (const p of pigeons) {
      const px = p.x + Math.sin(t * 0.7 + p.phase) * 18;
      const py = p.y + Math.cos(t * 0.5 + p.phase) * 6;
      ctx.font = "14px sans-serif";
      ctx.fillText("🐦", px, py);
    }
  }

  function drawLabels() {
    ctx.fillStyle = "rgba(242,239,230,0.5)";
    ctx.font = "11px sans-serif";
    ctx.fillText("← LOT", 620, 500);
    ctx.fillText("BAYS →", 1125, 500);
  }

  function drawFx() {
    for (const f of floaters) {
      ctx.globalAlpha = Math.min(1, f.life / 30);
      ctx.fillStyle = f.color;
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
    }
  }

  function drawMinimap() {
    const mw = 140, mh = 78;
    const mx = CW - mw - 10, my = CH - mh - 10;
    ctx.fillStyle = "rgba(10,12,10,0.75)";
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = "#e8a838";
    ctx.strokeRect(mx, my, mw, mh);
    const sx = mw / WORLD_W, sy = mh / WORLD_H;
    // lot
    ctx.fillStyle = "#3a4240";
    ctx.fillRect(mx, my, 700 * sx, mh);
    // shop
    ctx.fillStyle = "#2e3430";
    ctx.fillRect(mx + 700 * sx, my, (WORLD_W - 700) * sx, mh);
    // bays
    ctx.fillStyle = "#4a6a8a";
    Object.values(BAYS).forEach((b) => {
      ctx.fillRect(mx + b.x * sx, my + b.y * sy, b.w * sx, b.h * sy);
    });
    // npcs
    for (const n of npcs) {
      ctx.fillStyle = n.color;
      ctx.fillRect(mx + n.x * sx - 1, my + n.y * sy - 1, 3, 3);
    }
    // player
    if (player) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(mx + player.x * sx - 2, my + player.y * sy - 2, 4, 4);
    }
    // job cars assigned
    for (const c of cars) {
      if (c.jobId && c.inLot && jobState(c.jobId).stage === "assigned") {
        ctx.fillStyle = "#e8a838";
        ctx.fillRect(mx + c.x * sx - 1, my + c.y * sy - 1, 3, 3);
      }
    }
  }

  // ─── Loop ───────────────────────────────────────────────────────────
  function frame(ts) {
    if (!lastTs) lastTs = ts;
    let dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if (dt > 0.05) dt = 0.05;
    if (playing) update(dt);
    if (playing) draw();
    requestAnimationFrame(frame);

  }
  requestAnimationFrame(frame);


  // ─── Start / reset ──────────────────────────────────────────────────
  function startGame() {
    playerName = (els.nameInput.value || "").trim() || "Apprentice";
    resetJobs();
    buildWorld();
    playing = true;
    moeDelivery = null;
    cutscene = null;
    dialogueQueue = null;
    flash = null;
    els.title.classList.add("hidden");
    els.hud.classList.remove("hidden");
    els.touch.classList.remove("hidden");
    els.win.classList.add("hidden");
    els.dialogue.classList.add("hidden");
    refreshHUD();
    setPrompt("");
    // center cam
    cam.x = player.x - CW / 2;
    cam.y = player.y - CH / 2;
    clampCam();
  }

  els.btnStart.addEventListener("click", startGame);
  els.nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startGame();
  });

  els.btnHelp.addEventListener("click", () => els.help.classList.remove("hidden"));
  els.btnCloseHelp.addEventListener("click", () => els.help.classList.add("hidden"));

  els.btnReplay.addEventListener("click", () => {
    els.win.classList.add("hidden");
    startGame();
  });

  // Show touch on coarse pointers
  if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
    els.touch.style.opacity = "1";
  }
})();
