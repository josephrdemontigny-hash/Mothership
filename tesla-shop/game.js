/**
 * Hole in the Wall — 3D Animal Crossing–style Tesla EV shop walkaround
 * Zero-build Three.js (CDN import map). Playable on GitHub Pages.
 */
import * as THREE from "three";

// ─── Scale: original 2D map (1760×980) → world units ─────────────────
const S = 0.05;
const WORLD_W = 1760 * S; // 88
const WORLD_D = 980 * S;  // 49
const sx = (x) => x * S;
const sz = (y) => y * S;

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
    color: 0xf0f0f0,
    bay: "rolando",
    tech: "rolando",
    needsParts: false,
    lotSpot: { x: sx(300), z: sz(350) },
  },
  brakes: {
    id: "brakes",
    title: "Brake Service — Pearl White Model Y",
    repairType: "Brake service (pads/rotors)",
    fohId: "ryan",
    plate: "SQK-Y-88",
    nickname: "Squeaky Y",
    model: "Y",
    color: 0xe8e4d8,
    bay: "won",
    tech: "won",
    needsParts: true,
    partsLabel: "Brake pads & rotors",
    partsHeavy: false,
    lotSpot: { x: sx(380), z: sz(480) },
  },
  tire: {
    id: "tire",
    title: "Tire / TPMS — Blue Model X",
    repairType: "Tire puncture / TPMS",
    fohId: "kim",
    plate: "FLAT-X9",
    nickname: "Flatliner",
    model: "X",
    color: 0x2a5a9e,
    bay: "won",
    tech: "won",
    needsParts: true,
    partsLabel: "Tire + TPMS sensor",
    partsHeavy: false,
    lotSpot: { x: sx(300), z: sz(560) },
  },
  drive: {
    id: "drive",
    title: "Drive Unit — Midnight Model 3",
    repairType: "Drive unit replacement",
    fohId: "ryan",
    plate: "DU-M3-42",
    nickname: "Clunk Cub",
    model: "3",
    color: 0x2a2e34,
    bay: "won",
    tech: "won",
    needsParts: true,
    partsLabel: "Rear drive unit (forklift)",
    partsHeavy: true,
    lotSpot: { x: sx(420), z: sz(320) },
  },
  diag: {
    id: "diag",
    title: "Phantom Drain — Red Model S",
    repairType: "12V / phantom drain diag",
    fohId: "jordan",
    plate: "GHST-S7",
    nickname: "Ghost Plaid",
    model: "S",
    color: 0xc42828,
    bay: "nima",
    tech: "nima",
    needsParts: true,
    partsLabel: "12V battery + charge-port clips",
    partsHeavy: false,
    lotSpot: { x: sx(340), z: sz(620) },
  },
};

const FOH_JOBS = {
  kim: ["leak", "tire"],
  ryan: ["brakes", "drive"],
  jordan: ["diag"],
};

const BAYS = {
  nima: { x: sx(1280), z: sz(180), w: sx(280), d: sz(200), label: "Nima — Elec", park: { x: sx(1380), z: sz(260) } },
  won: { x: sx(1280), z: sz(400), w: sx(280), d: sz(200), label: "Won Song — Mech", park: { x: sx(1380), z: sz(480) } },
  rolando: { x: sx(1280), z: sz(620), w: sx(280), d: sz(200), label: "Rolando — Water", park: { x: sx(1380), z: sz(700) } },
};

const NPC_DEFS = [
  { id: "kim", name: "Kim", role: "foh", x: sx(840), z: sz(200), color: 0xe8a838, height: 1.55, vibe: "foh" },
  { id: "ryan", name: "Ryan", role: "foh", x: sx(920), z: sz(200), color: 0x6ecf6a, height: 1.7, vibe: "beard" },
  { id: "jordan", name: "Jordan Sham", role: "foh", x: sx(1000), z: sz(200), color: 0x6a9ee8, height: 1.65, vibe: "foh" },
  { id: "moe", name: "Moe", role: "parts", x: sx(860), z: sz(720), color: 0xd08040, height: 1.6, vibe: "hardhat", homeX: sx(860), homeZ: sz(720) },
  { id: "nima", name: "Nima", role: "tech", bay: "nima", x: sx(1480), z: sz(220), color: 0xc06ae8, height: 1.78, vibe: "swagger" },
  { id: "won", name: "Won Song", role: "tech", bay: "won", x: sx(1480), z: sz(440), color: 0xe86060, height: 1.35, vibe: "short" },
  { id: "rolando", name: "Rolando", role: "tech", bay: "rolando", x: sx(1480), z: sz(660), color: 0x40c0c0, height: 1.68, vibe: "tech" },
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

// ─── DOM ─────────────────────────────────────────────────────────────
const canvas = document.getElementById("game");
const labelLayer = document.getElementById("label-layer");
const els = {
  hud: document.getElementById("hud"),
  hudJob: document.getElementById("hud-job"),
  hudInv: document.getElementById("hud-inv"),
  hudProgress: document.getElementById("hud-progress"),
  prompt: document.getElementById("prompt-label"),
  flashMsg: document.getElementById("flash-msg"),
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
  minimap: document.getElementById("minimap"),
};
const mmCtx = els.minimap.getContext("2d");

// ─── Input ───────────────────────────────────────────────────────────
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
  let dx = 0, dz = 0;
  if (keys["a"] || keys["arrowleft"] || touchDirs.left) dx -= 1;
  if (keys["d"] || keys["arrowright"] || touchDirs.right) dx += 1;
  if (keys["w"] || keys["arrowup"] || touchDirs.up) dz -= 1;
  if (keys["s"] || keys["arrowdown"] || touchDirs.down) dz += 1;
  if (dx && dz) { dx *= 0.707; dz *= 0.707; }
  return { dx, dz };
}

function wantsInteract() {
  const held = !!(keys["e"] || keys[" "] || keys["enter"]);
  let edge = false;
  if (interactQueued) { interactQueued = false; edge = true; }
  if (held && !prevInteract) edge = true;
  prevInteract = held;
  return edge;
}

// ─── Game state ──────────────────────────────────────────────────────
let playing = false;
let playerName = "Apprentice";
let player = null;
let npcs = [];
let solids = [];
let cars = [];
let pigeons = [];
let dialogueQueue = null;
let nearTarget = null;
let cutscene = null;
let moeDelivery = null;
let flash = null;
let ambientIdx = 0;
let ambientTimer = 0;
let clock = 0;
let forkliftMesh = null;

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

// ─── Three.js scene ──────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87a0b4);
scene.fog = new THREE.Fog(0x87a0b4, 55, 110);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 200);
const camTarget = new THREE.Vector3();
const camIdeal = new THREE.Vector3();
// Animal Crossing–style elevated soft angle (not FPS)
const CAM_OFFSET = new THREE.Vector3(11, 16, 13);

const hemi = new THREE.HemisphereLight(0xfff2dd, 0x3a4038, 0.85);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d0, 1.15);
sun.position.set(30, 45, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 5;
sun.shadow.camera.far = 120;
sun.shadow.camera.left = -50;
sun.shadow.camera.right = 50;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -50;
sun.shadow.bias = -0.0003;
sun.shadow.radius = 2.5;
scene.add(sun);
scene.add(new THREE.AmbientLight(0x405040, 0.25));

const worldRoot = new THREE.Group();
scene.add(worldRoot);

const labelEntries = []; // { el, obj, offsetY }

function makeLabel(text, className) {
  const el = document.createElement("div");
  el.className = "world-label" + (className ? " " + className : "");
  el.textContent = text;
  labelLayer.appendChild(el);
  return el;
}

function projectLabels() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  for (const L of labelEntries) {
    if (!L.obj || !L.el) continue;
    if (L.hidden) {
      L.el.style.display = "none";
      continue;
    }
    const v = new THREE.Vector3();
    L.obj.getWorldPosition(v);
    v.y += L.offsetY || 2.2;
    v.project(camera);
    const behind = v.z > 1;
    const x = (v.x * 0.5 + 0.5) * w;
    const y = (-v.y * 0.5 + 0.5) * h;
    if (behind || x < -40 || y < -40 || x > w + 40 || y > h + 40) {
      L.el.style.display = "none";
    } else {
      L.el.style.display = "block";
      L.el.style.left = x + "px";
      L.el.style.top = y + "px";
    }
  }
}

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.75,
    metalness: opts.metalness ?? 0.05,
    flatShading: opts.flat ?? false,
  });
}

function boxMesh(w, h, d, color, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function roundBox(w, h, d, color, radius = 0.12) {
  // Approximate rounded feel with slightly beveled look via capsule-ish stacking
  const g = new THREE.Group();
  const body = boxMesh(w, h * 0.7, d, color, { roughness: 0.65 });
  body.position.y = h * 0.35;
  g.add(body);
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(Math.min(w, d) * 0.35, 12, 10),
    mat(color, { roughness: 0.6 })
  );
  top.scale.set(w / (Math.min(w, d) * 0.7), h * 0.35 / (Math.min(w, d) * 0.35), d / (Math.min(w, d) * 0.7));
  top.position.y = h * 0.72;
  top.castShadow = true;
  g.add(top);
  return g;
}

/** Stylized AC-like character: capsule body + sphere head */
function makeCharacter(def) {
  const g = new THREE.Group();
  const H = def.height || 1.6;
  const R = def.vibe === "short" ? 0.38 : def.vibe === "swagger" ? 0.32 : 0.34;
  const skin = 0xe8c8a0;
  const bodyCol = def.color;

  // soft shadow disc
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(R * 1.1, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  g.add(shadow);

  // legs
  const legMat = mat(0x2a2e32);
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(R * 0.28, H * 0.22, 4, 8), legMat);
  const legR = legL.clone();
  legL.position.set(-R * 0.35, H * 0.22, 0);
  legR.position.set(R * 0.35, H * 0.22, 0);
  legL.castShadow = legR.castShadow = true;
  g.add(legL, legR);

  // body capsule
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(R, H * 0.42, 6, 12),
    mat(bodyCol, { roughness: 0.55 })
  );
  body.position.y = H * 0.55;
  body.castShadow = true;
  g.add(body);

  // head
  const headR = R * 0.85;
  const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 16, 14), mat(skin, { roughness: 0.7 }));
  head.position.y = H * 0.55 + H * 0.28 + headR * 0.85;
  head.castShadow = true;
  g.add(head);

  // eyes
  const eyeMat = mat(0x1a1a1a);
  const eyeGeo = new THREE.SphereGeometry(headR * 0.14, 8, 8);
  const eL = new THREE.Mesh(eyeGeo, eyeMat);
  const eR = new THREE.Mesh(eyeGeo, eyeMat);
  eL.position.set(-headR * 0.32, head.position.y + headR * 0.05, headR * 0.78);
  eR.position.set(headR * 0.32, head.position.y + headR * 0.05, headR * 0.78);
  g.add(eL, eR);

  // vibe extras
  if (def.vibe === "beard") {
    const beard = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.55, 10, 8), mat(0x5a4030));
    beard.scale.set(1, 0.7, 0.8);
    beard.position.set(0, head.position.y - headR * 0.55, headR * 0.35);
    g.add(beard);
  }
  if (def.vibe === "hardhat") {
    const hat = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.05, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(0xf0c040, { roughness: 0.4 }));
    hat.position.y = head.position.y + headR * 0.15;
    g.add(hat);
  }
  if (def.vibe === "swagger") {
    // hair swoop
    const hair = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.95, 12, 10), mat(0x1a1210));
    hair.scale.set(1.05, 0.7, 1.05);
    hair.position.set(0, head.position.y + headR * 0.35, -headR * 0.1);
    g.add(hair);
  }
  if (def.vibe === "short") {
    // tool belt accent
    const belt = boxMesh(R * 2.2, 0.12, R * 2.2, 0x333333);
    belt.position.y = H * 0.42;
    g.add(belt);
  }

  g.userData.height = H;
  g.userData.headY = head.position.y + headR;
  return g;
}

function makeCar(color, model) {
  const g = new THREE.Group();
  const len = model === "X" ? 4.6 : model === "S" ? 4.5 : 4.2;
  const wid = model === "X" ? 2.1 : 1.9;
  const h = 1.15;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(len, h * 0.55, wid),
    mat(color, { roughness: 0.35, metalness: 0.35 })
  );
  body.position.y = 0.55;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(len * 0.55, h * 0.5, wid * 0.9),
    mat(color, { roughness: 0.4, metalness: 0.25 })
  );
  cabin.position.set(-len * 0.05, 0.95, 0);
  cabin.castShadow = true;
  g.add(cabin);

  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(len * 0.48, h * 0.38, wid * 0.82),
    new THREE.MeshStandardMaterial({ color: 0x2a4058, roughness: 0.2, metalness: 0.6, transparent: true, opacity: 0.75 })
  );
  glass.position.copy(cabin.position);
  glass.position.y += 0.05;
  g.add(glass);

  const wheelMat = mat(0x111111, { roughness: 0.9 });
  const wh = new THREE.CylinderGeometry(0.32, 0.32, 0.28, 12);
  const spots = [
    [len * 0.32, 0.32, wid * 0.52],
    [len * 0.32, 0.32, -wid * 0.52],
    [-len * 0.32, 0.32, wid * 0.52],
    [-len * 0.32, 0.32, -wid * 0.52],
  ];
  for (const [x, y, z] of spots) {
    const w = new THREE.Mesh(wh, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, y, z);
    w.castShadow = true;
    g.add(w);
  }

  // plate
  const plate = boxMesh(0.7, 0.18, 0.04, 0xf2efe6, { roughness: 0.9 });
  plate.position.set(-len * 0.48, 0.4, 0);
  g.add(plate);

  g.userData.len = len;
  g.userData.wid = wid;
  return g;
}

function makeForklift() {
  const g = new THREE.Group();
  const body = boxMesh(1.6, 0.7, 1.0, 0xc8a020);
  body.position.y = 0.55;
  g.add(body);
  const mast = boxMesh(0.15, 1.4, 0.5, 0x888888);
  mast.position.set(0.7, 1.0, 0);
  g.add(mast);
  const fork = boxMesh(0.9, 0.08, 0.5, 0xaaaaaa);
  fork.position.set(1.2, 0.45, 0);
  g.add(fork);
  const cab = boxMesh(0.7, 0.6, 0.8, 0x333333);
  cab.position.set(-0.2, 1.1, 0);
  g.add(cab);
  return g;
}

function makePigeon() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mat(0x888890));
  body.scale.set(1.3, 0.9, 1);
  body.position.y = 0.12;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), mat(0x777780));
  head.position.set(0.1, 0.2, 0);
  g.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 6), mat(0xd4a050));
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.18, 0.2, 0);
  g.add(beak);
  return g;
}

function addWall(x, z, w, d, h = 2.4, color = 0x2a322c) {
  const m = boxMesh(w, h, d, color, { roughness: 0.9 });
  m.position.set(x + w / 2, h / 2, z + d / 2);
  worldRoot.add(m);
  solids.push({ x, z, w, d });
}

function addProp(mesh, x, z, y = 0) {
  mesh.position.set(x, y, z);
  worldRoot.add(mesh);
}

function buildWorld() {
  // clear
  while (worldRoot.children.length) worldRoot.remove(worldRoot.children[0]);
  solids = [];
  labelEntries.length = 0;
  labelLayer.innerHTML = "";

  // Ground: lot (west) + shop (east)
  const lot = new THREE.Mesh(
    new THREE.PlaneGeometry(sx(700), WORLD_D),
    mat(0x3a4240, { roughness: 0.95 })
  );
  lot.rotation.x = -Math.PI / 2;
  lot.position.set(sx(350), 0, WORLD_D / 2);
  lot.receiveShadow = true;
  worldRoot.add(lot);

  const shopFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(sx(1060), WORLD_D),
    mat(0x2e3430, { roughness: 0.92 })
  );
  shopFloor.rotation.x = -Math.PI / 2;
  shopFloor.position.set(sx(700 + 530), 0.01, WORLD_D / 2);
  shopFloor.receiveShadow = true;
  worldRoot.add(shopFloor);

  // grease stain
  const stain = new THREE.Mesh(
    new THREE.CircleGeometry(4, 24),
    new THREE.MeshStandardMaterial({ color: 0x1a1810, roughness: 1, transparent: true, opacity: 0.45 })
  );
  stain.rotation.x = -Math.PI / 2;
  stain.position.set(sx(900), 0.02, sz(500));
  stain.scale.set(1.8, 1, 1);
  worldRoot.add(stain);

  // lot stripes
  for (let y = 100; y < 900; y += 90) {
    const stripe = boxMesh(sx(580), 0.02, 0.08, 0xffffff);
    stripe.material.transparent = true;
    stripe.material.opacity = 0.12;
    stripe.position.set(sx(350), 0.03, sz(y));
    stripe.castShadow = false;
    worldRoot.add(stripe);
  }

  // Outer fence
  addWall(sx(20), sz(40), sx(1720), sz(24), 1.2, 0x4a5548);
  addWall(sx(20), sz(WORLD_D / S - 60), sx(1720), sz(24), 1.2, 0x4a5548);
  addWall(sx(20), sz(40), sx(24), sz(WORLD_D / S - 100), 1.2, 0x4a5548);
  addWall(sx(WORLD_W / S - 44), sz(40), sx(24), sz(WORLD_D / S - 100), 2.8, 0x1a201c);

  // Shop west wall with door gap (y 420-560)
  addWall(sx(680), sz(60), sx(28), sz(360), 3.2, 0x1a201c);
  addWall(sx(680), sz(560), sx(28), sz(360), 3.2, 0x1a201c);

  // Shop N/S walls
  addWall(sx(700), sz(60), sx(1000), sz(20), 3.2, 0x1a201c);
  addWall(sx(700), sz(WORLD_D / S - 80), sx(1000), sz(20), 3.2, 0x1a201c);

  // Divider FOH/bays
  addWall(sx(1100), sz(80), sx(20), sz(120), 2.6, 0x1a201c);
  addWall(sx(1100), sz(320), sx(20), sz(60), 2.6, 0x1a201c);
  addWall(sx(1100), sz(540), sx(20), sz(60), 2.6, 0x1a201c);
  addWall(sx(1100), sz(760), sx(20), sz(140), 2.6, 0x1a201c);

  // FOH desk
  addWall(sx(780), sz(120), sx(260), sz(36), 1.1, 0x3a3228);
  // monitors
  for (let i = 0; i < 3; i++) {
    const mon = boxMesh(0.5, 0.35, 0.08, 0x44aa88);
    mon.position.set(sx(815 + i * 60), 1.35, sz(138));
    worldRoot.add(mon);
  }

  // Parts shelves
  addWall(sx(760), sz(640), sx(40), sz(200), 2.2, 0x3a3020);
  addWall(sx(920), sz(640), sx(40), sz(200), 2.2, 0x3a3020);
  addWall(sx(760), sz(860), sx(200), sz(30), 1.0, 0x3a3020);

  // Washroom
  addWall(sx(708), sz(300), sx(100), sz(12), 2.4, 0x252a28);
  addWall(sx(708), sz(300), sx(12), sz(130), 2.4, 0x252a28);
  addWall(sx(708), sz(418), sx(100), sz(12), 2.4, 0x252a28);
  addWall(sx(796), sz(300), sx(12), sz(50), 2.4, 0x252a28);

  // Bay hoists
  const hoistYs = [200, 420, 640];
  for (const hy of hoistYs) {
    addWall(sx(1320), sz(hy), sx(18), sz(100), 2.8, 0x555555);
    addWall(sx(1500), sz(hy), sx(18), sz(100), 2.8, 0x555555);
    const beam = boxMesh(sx(200), 0.15, 0.2, 0x777777);
    beam.position.set(sx(1410), 2.5, sz(hy + 50));
    worldRoot.add(beam);
  }

  // Bay door frames
  addWall(sx(1680), sz(140), sx(40), sz(40), 3.0, 0x4a5560);
  addWall(sx(1680), sz(360), sx(40), sz(40), 3.0, 0x4a5560);
  addWall(sx(1680), sz(580), sx(40), sz(40), 3.0, 0x4a5560);

  // Bay floor tint planes
  Object.entries(BAYS).forEach(([id, b], i) => {
    const tint = new THREE.Mesh(
      new THREE.PlaneGeometry(b.w, b.d),
      new THREE.MeshStandardMaterial({ color: 0x32465a, transparent: true, opacity: 0.35, roughness: 0.9 })
    );
    tint.rotation.x = -Math.PI / 2;
    tint.position.set(b.x + b.w / 2, 0.04, b.z + b.d / 2);
    worldRoot.add(tint);

    const sign = makeLabel(b.label);
    const dummy = new THREE.Object3D();
    dummy.position.set(b.x + b.w / 2, 0, b.z + 0.5);
    worldRoot.add(dummy);
    labelEntries.push({ el: sign, obj: dummy, offsetY: 3.2 });
  });

  // Dumpster
  const dump = boxMesh(sx(70), 1.4, sz(50), 0x2a5028);
  dump.position.set(sx(595), 0.7, sz(845));
  worldRoot.add(dump);

  // Forklift parked at parts
  forkliftMesh = makeForklift();
  forkliftMesh.position.set(sx(1000), 0, sz(790));
  forkliftMesh.rotation.y = Math.PI / 2;
  worldRoot.add(forkliftMesh);

  // Area labels
  [["CUSTOMER LOT", sx(350), sz(90)], ["FRONT DESK", sx(900), sz(100)], ["PARTS", sx(860), sz(620)], ["SHOP FLOOR", sx(900), sz(520)]].forEach(([t, x, z]) => {
    const el = makeLabel(t);
    el.style.opacity = "0.7";
    const d = new THREE.Object3D();
    d.position.set(x, 0, z);
    worldRoot.add(d);
    labelEntries.push({ el, obj: d, offsetY: 0.5 });
  });

  // NPCs
  npcs = NPC_DEFS.map((d) => {
    const mesh = makeCharacter(d);
    mesh.position.set(d.x, 0, d.z);
    worldRoot.add(mesh);
    const el = makeLabel(d.name.split(" ")[0]);
    labelEntries.push({ el, obj: mesh, offsetY: (d.height || 1.6) + 0.35 });
    return {
      ...d,
      mesh,
      labelEl: el,
      delivering: false,
      facing: 0,
      radius: 0.45,
    };
  });

  // Cars
  cars = [];
  const deco = [
    { x: 100, z: 120, color: 0x555555 },
    { x: 280, z: 120, color: 0x888888 },
    { x: 520, z: 140, color: 0x222222 },
    { x: 100, z: 760, color: 0xaa3333 },
    { x: 280, z: 800, color: 0x333366 },
    { x: 520, z: 780, color: 0x777777 },
    { x: 100, z: 400, color: 0x444444 },
  ];
  deco.forEach((c, i) => {
    const mesh = makeCar(c.color, "3");
    mesh.position.set(sx(c.x), 0, sz(c.z));
    mesh.rotation.y = Math.PI / 2;
    worldRoot.add(mesh);
    const len = mesh.userData.len;
    const wid = mesh.userData.wid;
    // collision in world XZ (car oriented along Z when rot Y=90... actually Box along X, rotated 90 → along Z)
    solids.push({
      x: sx(c.x) - wid / 2 - 0.15,
      z: sz(c.z) - len / 2 - 0.15,
      w: wid + 0.3,
      d: len + 0.3,
    });
    cars.push({
      id: "deco_" + i,
      jobId: null,
      x: sx(c.x),
      z: sz(c.z),
      mesh,
      color: c.color,
      plate: "",
      model: "3",
      inLot: true,
      inBay: false,
      interactable: false,
      highlight: null,
    });
  });

  JOB_ORDER.forEach((jid) => {
    const job = JOBS[jid];
    const mesh = makeCar(job.color, job.model);
    mesh.position.set(job.lotSpot.x, 0, job.lotSpot.z);
    mesh.rotation.y = Math.PI / 2;
    worldRoot.add(mesh);

    // highlight ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.5, 32),
      new THREE.MeshBasicMaterial({ color: 0xe8a838, transparent: true, opacity: 0.0, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    mesh.add(ring);

    const plateEl = makeLabel(job.plate);
    const plateLabel = { el: plateEl, obj: mesh, offsetY: 1.8, hidden: true };
    labelEntries.push(plateLabel);

    cars.push({
      id: "job_" + jid,
      jobId: jid,
      x: job.lotSpot.x,
      z: job.lotSpot.z,
      mesh,
      ring,
      plateEl,
      plateLabel,
      color: job.color,
      plate: job.plate,
      model: job.model,
      nickname: job.nickname,
      inLot: true,
      inBay: false,
      interactable: true,
    });
  });

  // Pigeons
  pigeons = [
    { x: sx(240), z: sz(100), phase: 0 },
    { x: sx(600), z: sz(880), phase: 1.2 },
    { x: sx(1050), z: sz(100), phase: 2.4 },
    { x: sx(1600), z: sz(300), phase: 0.7 },
    { x: sx(900), z: sz(500), phase: 3.1 },
  ].map((p) => {
    const mesh = makePigeon();
    mesh.position.set(p.x, 2.8 + Math.sin(p.phase) * 0.2, p.z);
    worldRoot.add(mesh);
    return { ...p, mesh };
  });

  // Player
  player = {
    x: sx(920),
    z: sz(500),
    radius: 0.4,
    speed: 9,
    facing: 0,
    name: playerName,
    mesh: makeCharacter({ color: 0xc43828, height: 1.58, vibe: "foh" }),
  };
  player.mesh.position.set(player.x, 0, player.z);
  worldRoot.add(player.mesh);
  const pLab = makeLabel(playerName, "player");
  labelEntries.push({ el: pLab, obj: player.mesh, offsetY: 2.0 });
  player.labelEl = pLab;

  // Shop roof hint (partial translucent for AC diorama feel — open top)
  // Soft fill light in shop
  const shopLight = new THREE.PointLight(0xffe8c0, 0.55, 40);
  shopLight.position.set(sx(1000), 6, sz(500));
  worldRoot.add(shopLight);
  const bayLight = new THREE.PointLight(0xc0d8ff, 0.4, 35);
  bayLight.position.set(sx(1400), 5, sz(480));
  worldRoot.add(bayLight);
}

function carSolid(car) {
  const len = car.mesh.userData.len || 4.2;
  const wid = car.mesh.userData.wid || 1.9;
  // cars face along Z (rot Y = PI/2 means local X → world -Z)
  return {
    x: car.x - wid / 2 - 0.1,
    z: car.z - len / 2 - 0.1,
    w: wid + 0.2,
    d: len + 0.2,
  };
}

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.z < b.z + b.d && a.z + a.d > b.z;
}

function collides(px, pz, ignoreCarId) {
  const box = { x: px - player.radius, z: pz - player.radius, w: player.radius * 2, d: player.radius * 2 };
  for (const s of solids) {
    if (aabb(box, s)) return true;
  }
  for (const c of cars) {
    if (!c.inLot && !c.inBay) continue;
    if (ignoreCarId && c.id === ignoreCarId) continue;
    if (c.inBay) continue;
    if (aabb(box, carSolid(c))) return true;
  }
  for (const n of npcs) {
    if (n.delivering) continue;
    const nb = { x: n.x - 0.35, z: n.z - 0.35, w: 0.7, d: 0.7 };
    if (aabb(box, nb)) return true;
  }
  return false;
}

function dist2(ax, az, bx, bz) {
  return Math.hypot(ax - bx, az - bz);
}

// ─── Dialogue ────────────────────────────────────────────────────────
function showDialogue(who, lines, onDone) {
  const arr = Array.isArray(lines) ? lines.slice() : [lines];
  dialogueQueue = { who, lines: arr, idx: 0, onDone: onDone || null };
  renderDialoguePage();
  els.dialogue.classList.remove("hidden");
}

function renderDialoguePage() {
  if (!dialogueQueue) return;
  const raw = dialogueQueue.lines[dialogueQueue.idx];
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
  els.flashMsg.textContent = msg;
  els.flashMsg.classList.remove("hidden");
}

// ─── Interactions (same loop as 2D) ──────────────────────────────────
function findNearTarget() {
  if (!player || dialogueQueue || cutscene) return null;
  let best = null;
  let bestD = 2.8;

  for (const n of npcs) {
    if (n.delivering && n.id === "moe" && moeDelivery && moeDelivery.phase === "walk") continue;
    const d = dist2(player.x, player.z, n.x, n.z);
    if (d < bestD) {
      bestD = d;
      best = { kind: "npc", id: n.id, label: promptForNpc(n), npc: n };
    }
  }

  for (const c of cars) {
    if (!c.interactable || !c.inLot || !c.jobId) continue;
    const js = jobState(c.jobId);
    if (js.stage !== "assigned") continue;
    const d = dist2(player.x, player.z, c.x, c.z);
    if (d < 4.5 && d < bestD + 1.5) {
      bestD = d;
      best = { kind: "car", id: c.id, label: `Get ${c.plate}`, car: c };
    }
  }

  if (dist2(player.x, player.z, sx(760), sz(365)) < 2.2) {
    if (!best || bestD > 2.0) best = { kind: "wash", id: "wash", label: "Use washroom" };
  }

  const doorSpots = [
    { x: sx(1700), z: sz(240) },
    { x: sx(1700), z: sz(460) },
    { x: sx(1700), z: sz(680) },
  ];
  for (const dspot of doorSpots) {
    if (dist2(player.x, player.z, dspot.x, dspot.z) < 2.2) {
      if (!best) best = { kind: "baydoor", id: "door", label: "Peek bay door" };
    }
  }

  if (player.x < sx(700) && dist2(player.x, player.z, sx(690), sz(490)) < 2.5) {
    if (!best) best = { kind: "entrance", id: "ent", label: "Enter shop" };
  }

  return best;
}

function promptForNpc(n) {
  if (n.id === "moe") {
    if (moeDelivery && moeDelivery.phase === "arrive") return "Talk to Moe (parts)";
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
    player.x = sx(720);
    player.z = sz(480);
    player.mesh.position.set(player.x, 0, player.z);
    showFlash("Into the grease pit.", 60);
  }
}

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
    if (id === "jordan") showDialogue(name, jordanBusyLines(job));
    else showDialogue(name, [`"I already hung a ticket on you, grease-stain. ${job.plate} — lot's that way. Car isn't gonna levitate in, rook."`]);
    return;
  }

  if (state.activeJob && !fohInProgress(id)) {
    if (id === "jordan") { showDialogue(name, jordanOtherTicketLines()); return; }
    const tips = {
      kim: "\"Different flavour of misery? Ryan does the heavy metal. Jordan does the ghost cars. I do wet and flat, knucklehead.\"",
      ryan: "\"Kim does leaks and flats. Jordan does haunted electronics. I do brakes and drive units. Division of labour, idiot.\"",
    };
    showDialogue(name, [tips[id] || "\"Busy ticket elsewhere, greenhorn.\""]);
    return;
  }

  if (fohAllDone(id)) {
    if (id === "jordan") { showDialogue(name, jordanDoneLines()); return; }
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
  showDialogue(name, assignDialogue(id, job), () => {
    state.activeJob = nextId;
    jobState(nextId).stage = "assigned";
    addItem("ticket_" + nextId, `Ticket: ${job.plate}`);
    refreshHUD();
    showFlash(`Ticket: ${job.repairType}`, 100);
  });
}

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
  if (fohId === "jordan" && job.id === "diag") return jordanAssignLines(job);
  return [`"Ticket for ${job.plate}. Lot. Then the right bay. Go, idiot."`];
}

function talkTech(n) {
  const techId = n.id;
  const job = activeJob();
  const s = playerName;

  if (!job) {
    showDialogue(n.name, [`"No ticket, no show, ${s}. Front desk first — Kim, Ryan, or Jordan. Don't decorate my bay empty-handed, rook."`]);
    return;
  }

  const js = jobState(job.id);
  if (job.tech !== techId) {
    showDialogue(n.name, wrongTechLines(techId, job, s));
    return;
  }
  if (js.stage === "assigned") {
    showDialogue(n.name, [`"Where's the car, rook? I don't repair air. Lot's west — fetch ${job.plate}, then come back."`]);
    return;
  }
  if (js.stage === "car_fetched") {
    if (job.needsParts) {
      showDialogue(n.name, needPartsLines(techId, job, s), () => {
        js.stage = "tech_ok";
        startMoeDelivery(job.id);
        refreshHUD();
      });
    } else {
      showDialogue(n.name, finishLines(techId, job, s), () => completeJob(job.id));
    }
    return;
  }
  if (js.stage === "tech_ok") {
    showDialogue(n.name, [`"Moe's rolling. Stand there and look decorative, grease-stain. Parts aren't here yet."`]);
    return;
  }
  if (js.stage === "parts_ok") {
    showDialogue(n.name, finishLines(techId, job, s), () => completeJob(job.id));
    return;
  }
  if (js.done) showDialogue(n.name, [`"We're good here. Next ticket, wet-behind-the-ears."`]);
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
    ], () => finishMoeDelivery());
    return;
  }

  if (!job) {
    showDialogue("Moe", [`"Parts counter's open. Your pockets look empty of purpose though, greenhorn. Hit the front desk."`]);
    return;
  }
  const js = jobState(job.id);
  if (js.stage === "assigned" || js.stage === "car_fetched") {
    showDialogue("Moe", [`"Tech hasn't radioed the play yet. Get their blessing at the bay, then I roll. Don't freelance my schedule, parts-runner."`]);
    return;
  }
  if (js.stage === "tech_ok") {
    showDialogue("Moe", [`"Yeah yeah — already barked. ${job.partsLabel}. I'm heading over. Wait at the bay like a civilized rook, ${s}."`]);
    return;
  }
  showDialogue("Moe", [`"Looking for vibes? Canonical path is the tech radios me and I deliver. You're the optional tour group, knucklehead."`]);
}

function startMoeDelivery(jobId) {
  const job = JOBS[jobId];
  const moe = npcs.find((n) => n.id === "moe");
  const bay = BAYS[job.bay];
  moeDelivery = {
    jobId,
    phase: "walk",
    heavy: !!job.partsHeavy,
    targetX: bay.park.x - 4,
    targetZ: bay.park.z + 2,
  };
  moe.delivering = true;
  if (job.partsHeavy) {
    if (forkliftMesh) forkliftMesh.visible = false;
    moeDelivery.fork = makeForklift();
    worldRoot.add(moeDelivery.fork);
    moeDelivery.fork.position.set(moe.x, 0, moe.z);
  }
  showFlash(job.partsHeavy ? "Moe en route (forklift)…" : "Moe delivering parts…", 100);
}

function finishMoeDelivery() {
  if (!moeDelivery) return;
  const jobId = moeDelivery.jobId;
  jobState(jobId).stage = "parts_ok";
  const moe = npcs.find((n) => n.id === "moe");
  moe.delivering = false;
  moe.x = moe.homeX;
  moe.z = moe.homeZ;
  moe.mesh.position.set(moe.x, 0, moe.z);
  if (moeDelivery.fork) {
    worldRoot.remove(moeDelivery.fork);
  }
  if (forkliftMesh) forkliftMesh.visible = true;
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
  const car = cars.find((c) => c.jobId === jobId);
  if (car) {
    car.inBay = true;
    car.inLot = false;
    car.interactable = false;
    if (car.ring) car.ring.material.opacity = 0;
    if (car.plateLabel) car.plateLabel.hidden = true;
  }
  refreshHUD();
  showFlash(`Job done: ${job.repairType}`, 110);

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
  ], () => startCarCutscene(car, job));
}

function startCarCutscene(car, job) {
  const bay = BAYS[job.bay];
  const tech = npcs.find((n) => n.id === job.tech);
  cutscene = {
    type: "drive",
    timer: 0,
    dur: 2.4,
    car,
    job,
    fromX: car.x,
    fromZ: car.z,
    toX: bay.park.x,
    toZ: bay.park.z,
    playerToX: (tech ? tech.x : bay.park.x) - 2.2,
    playerToZ: (tech ? tech.z : bay.park.z) + 1.5,
  };
  showFlash("Driving into bay…", 70);
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
  if (state.inventory.length === 0) els.hudInv.textContent = "Pockets: empty";
  else els.hudInv.textContent = "Inv: " + state.inventory.map((i) => i.label).join(" · ");
  els.hudProgress.textContent = `Jobs ${doneCount()}/5`;
}

function setPrompt(text) {
  els.prompt.textContent = text || "";
}

// ─── Update / render ─────────────────────────────────────────────────
function update(dt) {
  clock += dt;
  ambientTimer += dt;
  if (ambientTimer > 8) {
    ambientTimer = 0;
    ambientIdx = (ambientIdx + 1) % AMBIENT.length;
  }

  if (flash) {
    flash.t -= dt * 60;
    if (flash.t <= 0) {
      flash = null;
      els.flashMsg.classList.add("hidden");
    }
  }

  // pigeons bob
  for (const p of pigeons) {
    p.mesh.position.y = 2.6 + Math.sin(clock * 2 + p.phase) * 0.25;
    p.mesh.rotation.y = Math.sin(clock * 0.7 + p.phase) * 0.5;
  }

  if (dialogueQueue || !playing) {
    nearTarget = null;
    setPrompt("");
    updateCamera(dt);
    return;
  }
  if (!els.help.classList.contains("hidden")) return;
  if (!els.win.classList.contains("hidden")) return;

  // Cutscene
  if (cutscene && cutscene.type === "drive") {
    cutscene.timer += dt;
    const u = Math.min(1, cutscene.timer / cutscene.dur);
    const ease = u * u * (3 - 2 * u);
    const car = cutscene.car;
    car.x = cutscene.fromX + (cutscene.toX - cutscene.fromX) * ease;
    car.z = cutscene.fromZ + (cutscene.toZ - cutscene.fromZ) * ease;
    car.mesh.position.set(car.x, 0, car.z);
    car.inLot = false;
    camTarget.set(car.x, 1.2, car.z);
    if (u >= 1) {
      car.inBay = true;
      car.interactable = false;
      if (car.ring) car.ring.material.opacity = 0;
      if (car.plateLabel) car.plateLabel.hidden = true;
      player.x = cutscene.playerToX;
      player.z = cutscene.playerToZ;
      player.mesh.position.set(player.x, 0, player.z);
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
    updateCamera(dt);
    return;
  }

  // Moe delivery
  if (moeDelivery && moeDelivery.phase === "walk") {
    const moe = npcs.find((n) => n.id === "moe");
    const dx = moeDelivery.targetX - moe.x;
    const dz = moeDelivery.targetZ - moe.z;
    const d = Math.hypot(dx, dz) || 1;
    const spd = moeDelivery.heavy ? 4.5 : 6;
    moe.x += (dx / d) * spd * dt;
    moe.z += (dz / d) * spd * dt;
    moe.mesh.position.set(moe.x, 0, moe.z);
    moe.mesh.rotation.y = Math.atan2(dx, dz);
    if (moeDelivery.fork) {
      moeDelivery.fork.position.set(moe.x + 1.2, 0, moe.z);
      moeDelivery.fork.rotation.y = moe.mesh.rotation.y;
    }
    if (d < 0.6) {
      moe.x = moeDelivery.targetX;
      moe.z = moeDelivery.targetZ;
      moe.mesh.position.set(moe.x, 0, moe.z);
      moeDelivery.phase = "arrive";
      showFlash("Moe arrived — talk to him", 100);
    }
  }

  // Player move
  const { dx, dz } = moveVec();
  if (dx || dz) {
    const sp = player.speed * dt;
    let nx = player.x + dx * sp;
    let nz = player.z + dz * sp;
    if (!collides(nx, player.z)) player.x = nx;
    else if (!collides(player.x + dx * sp * 0.5, player.z)) player.x += dx * sp * 0.5;
    if (!collides(player.x, nz)) player.z = nz;
    else if (!collides(player.x, player.z + dz * sp * 0.5)) player.z += dz * sp * 0.5;
    player.x = Math.max(sx(40), Math.min(WORLD_W - 3, player.x));
    player.z = Math.max(sz(70), Math.min(WORLD_D - 4, player.z));
    player.facing = Math.atan2(dx, dz);
    player.mesh.rotation.y = player.facing;
    // walk bob
    const bob = Math.sin(clock * 12) * 0.04;
    player.mesh.position.set(player.x, bob, player.z);
  } else {
    player.mesh.position.set(player.x, 0, player.z);
  }

  camTarget.set(player.x, 1.0, player.z);

  // Job car highlights
  for (const c of cars) {
    if (!c.ring) continue;
    const js = c.jobId && jobState(c.jobId);
    const on = js && js.stage === "assigned" && c.inLot;
    c.ring.material.opacity = on ? 0.55 + 0.25 * Math.sin(clock * 4) : 0;
    if (c.plateLabel) c.plateLabel.hidden = !on;
  }

  // Label highlight near
  nearTarget = findNearTarget();
  setPrompt(nearTarget ? nearTarget.label + "  [E / USE]" : "");
  for (const n of npcs) {
    if (n.labelEl) {
      n.labelEl.classList.toggle("highlight", !!(nearTarget && nearTarget.kind === "npc" && nearTarget.id === n.id));
    }
  }

  if (wantsInteract() && nearTarget) doInteract();

  if (!state.introShown && playing) {
    state.introShown = true;
    showDialogue("Shop Floor", [
      `You clock in as ${playerName}. Concrete slick with old oil. Pigeons argue in the rafters.`,
      "Front desk is west of the bays — Kim, Ryan, and Jordan Sham. Lot is further west. Three bays on the east wall: Nima · Won · Rolando.",
      "Walk over. Talk to FOH. Try not to reverse into the parts cage, rook.",
    ]);
  }

  updateCamera(dt);
}

function updateCamera(dt) {
  camIdeal.copy(camTarget).add(CAM_OFFSET);
  camera.position.lerp(camIdeal, 1 - Math.pow(0.001, dt));
  const look = camTarget.clone();
  look.y = 0.8;
  // smooth look via temp
  if (!camera.userData.look) camera.userData.look = look.clone();
  camera.userData.look.lerp(look, 1 - Math.pow(0.002, dt));
  camera.lookAt(camera.userData.look);
}

function drawMinimap() {
  const w = els.minimap.width;
  const h = els.minimap.height;
  mmCtx.clearRect(0, 0, w, h);
  mmCtx.fillStyle = "#1a221c";
  mmCtx.fillRect(0, 0, w, h);
  const scX = w / WORLD_W;
  const scZ = h / WORLD_D;
  // lot
  mmCtx.fillStyle = "#3a4240";
  mmCtx.fillRect(0, 0, sx(700) * scX, h);
  // shop
  mmCtx.fillStyle = "#2e3430";
  mmCtx.fillRect(sx(700) * scX, 0, w, h);
  // bays
  mmCtx.fillStyle = "rgba(80,120,160,0.4)";
  Object.values(BAYS).forEach((b) => {
    mmCtx.fillRect(b.x * scX, b.z * scZ, b.w * scX, b.d * scZ);
  });
  // npcs
  for (const n of npcs) {
    mmCtx.fillStyle = "#" + n.color.toString(16).padStart(6, "0");
    mmCtx.fillRect(n.x * scX - 2, n.z * scZ - 2, 4, 4);
  }
  // cars
  for (const c of cars) {
    if (!c.inLot && !c.inBay) continue;
    mmCtx.fillStyle = c.jobId && jobState(c.jobId).stage === "assigned" ? "#e8a838" : "#666";
    mmCtx.fillRect(c.x * scX - 2, c.z * scZ - 1, 4, 3);
  }
  // player
  if (player) {
    mmCtx.fillStyle = "#c43828";
    mmCtx.beginPath();
    mmCtx.arc(player.x * scX, player.z * scZ, 3, 0, Math.PI * 2);
    mmCtx.fill();
  }
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener("resize", onResize);

let lastTs = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016);
  lastTs = ts;
  if (playing) update(dt);
  else updateCamera(dt);
  // idle NPC facing player slightly
  if (player) {
    for (const n of npcs) {
      if (n.delivering) continue;
      const dx = player.x - n.x;
      const dz = player.z - n.z;
      if (dx * dx + dz * dz < 100) {
        const target = Math.atan2(dx, dz);
        n.mesh.rotation.y += (target - n.mesh.rotation.y) * 0.04;
      }
    }
  }
  renderer.render(scene, camera);
  projectLabels();
  if (playing) drawMinimap();
  requestAnimationFrame(frame);
}

// ─── Boot / UI ───────────────────────────────────────────────────────
function startGame() {
  playerName = (els.nameInput.value || "").trim() || "Apprentice";
  resetJobs();
  buildWorld();
  playing = true;
  els.title.classList.add("hidden");
  els.hud.classList.remove("hidden");
  els.touch.classList.remove("hidden");
  els.win.classList.add("hidden");
  camTarget.set(player.x, 1, player.z);
  camera.position.copy(camTarget).add(CAM_OFFSET);
  camera.userData.look = camTarget.clone();
  refreshHUD();
}

function replay() {
  els.win.classList.add("hidden");
  startGame();
}

els.btnStart.addEventListener("click", startGame);
els.btnReplay.addEventListener("click", replay);
els.btnHelp.addEventListener("click", () => els.help.classList.remove("hidden"));
els.btnCloseHelp.addEventListener("click", () => els.help.classList.add("hidden"));

// Preview scene behind title
resetJobs();
buildWorld();
camTarget.set(sx(920), 1, sz(500));
camera.position.copy(camTarget).add(CAM_OFFSET);
camera.lookAt(camTarget);
requestAnimationFrame(frame);

// Touch visibility: always show on coarse pointers
if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
  els.touch.style.opacity = "1";
}
