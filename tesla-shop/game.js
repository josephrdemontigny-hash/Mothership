/**
 * Hole in the Wall — Tesla EV Repair Apprentice Simulator
 * Vanilla JS SPA
 */
(() => {
  "use strict";

  // ─── Data ───────────────────────────────────────────────────────────
  const LOCATIONS = {
    floor: {
      id: "floor",
      name: "Shop Floor",
      key: "1",
      art: "🛢️ 🔧 🐦",
      enter: (s) =>
        `Concrete slick with old oil. Overhead fluorescents buzz like dying bees. ` +
        `Pigeons argue in the rafters. You're ${s.name}, wet-behind-the-ears apprentice, standing in controlled chaos.`,
    },
    nima: {
      id: "nima",
      name: "Far Left Bay — Nima",
      key: "2",
      art: "🔌 💻 🚗",
      enter: () =>
        `Diagnostic screens glow blue-green. A Model 3 sits half-undressed on the hoist. ` +
        `Nima leans on a toolbox like he owns the building — and maybe he does, spiritually.`,
    },
    won: {
      id: "won",
      name: "Middle Bay — Won Song",
      key: "3",
      art: "🔩 ⚙️ 🚗",
      enter: () =>
        `Big jobs live here. Suspension arms, drive units, brake dust, the kind of work that needs a forklift and patience. ` +
        `Won Song doesn't look up when you arrive. He already knows you're there.`,
    },
    rolando: {
      id: "rolando",
      name: "Far Right Bay — Rolando",
      key: "4",
      art: "💧 🧴 🚗",
      enter: () =>
        `Smell of sealant and coffee. Rolando has towels everywhere and zero patience for rookies who track dirt. ` +
        `Water leaks are his religion. The bay floor has more puddles than the washroom.`,
    },
    parts: {
      id: "parts",
      name: "Parts Room — Moe",
      key: "5",
      art: "📦 🚜 🔋",
      enter: () =>
        `Shelves packed with modules, clips, and mystery boxes labeled in three handwritings. ` +
        `A forklift idles near the back. Moe appears from behind a pallet of 12V batteries.`,
    },
    office: {
      id: "office",
      name: "Front Office",
      key: "6",
      art: "📋 ☕ 🖥️",
      enter: () =>
        `The front desk: coffee rings on laminate, sticky notes everywhere, a cracked tablet for check-ins. ` +
        `Kim, Ryan, and Jordan Sham hold the line between customers and the grease pit.`,
    },
    washroom: {
      id: "washroom",
      name: "Washroom",
      key: "7",
      art: "🚿 🧻 🐦",
      enter: () =>
        `One working soap dispenser. A handwritten sign: "DO NOT WASH PARTS IN SINK — Moe". ` +
        `Someone left grease handprints on the mirror. A pigeon stares through the high window.`,
    },
    doors: {
      id: "doors",
      name: "Bay Doors",
      key: "8",
      art: "🚪 🌤️ 🐦",
      enter: () =>
        `Roll-up doors at both ends of the building. Draft cuts through like a knife. ` +
        `Outside: the lot (west). Inside: FOH & parts, then three bays on the east wall. Pigeons use the door tracks as a highway.`,
    },
    lot: {
      id: "lot",
      name: "Customer Lot",
      key: "9",
      art: "🅿️ 🚗 🐦",
      enter: () =>
        `Cracked asphalt west of the shop, faded Tesla logos on bumper stickers, pigeons strutting like they pay rent. ` +
        `Customer cars wait in uneven rows — some humming, some silent, all trusting this hole in the wall.`,
    },
  };

  const AMBIENT = [
    "A pigeon coos in the rafters.",
    "Somewhere, an impact gun chatters.",
    "The smell of brake cleaner drifts past.",
    "Fluorescent light flickers once, recovers.",
    "Someone laughs — then a wrench clatters.",
    "Forklift beep… beep… from Parts.",
    "A Model S door chimes for no reason.",
    "Grease drips. Slowly. Dramatically.",
    "Radio static under a half-heard podcast.",
    "Bay door rumbles open a crack, then stops.",
    "Moe's radio crackles: \"Who lost the TPMS kit again?\"",
  ];

  /**
   * Jobs: FOH assigns → lot fetch → bay → tech → (optional parts delivery) → complete
   * needsParts: tech radios Moe; player waits at bay (canonical) or can visit parts for flavour
   */
  const JOBS = {
    leak: {
      id: "leak",
      title: "Water Leak — White Model Y",
      short: "Water leak / wet carpet",
      repairType: "Water leak / drain clog",
      fohId: "kim",
      vehicle: {
        plate: "WET-Y-01",
        nickname: "Puddle Princess",
        desc: "White Model Y \"Puddle Princess\" — rear passenger footwell damp after rain",
        bay: "rolando",
      },
      tech: "rolando",
      needsParts: false,
      boardBlurb: "Carpet's a swamp. Clogged drains / weather seal.",
    },
    brakes: {
      id: "brakes",
      title: "Brake Service — Pearl White Model Y",
      short: "Brake service",
      repairType: "Brake service (pads/rotors)",
      fohId: "ryan",
      vehicle: {
        plate: "SQK-Y-88",
        nickname: "Squeaky Y",
        desc: "Pearl White Model Y \"Squeaky Y\" — grinding pads, warped rotor vibes",
        bay: "won",
      },
      tech: "won",
      needsParts: true,
      partsLabel: "Brake pads & rotors",
      partsHeavy: false,
      boardBlurb: "Noise on braking. Pads/rotors — Won Song + parts.",
    },
    drive: {
      id: "drive",
      title: "Drive Unit — Midnight Model 3",
      short: "Drive unit replacement",
      repairType: "Drive unit noise / replacement",
      fohId: "ryan",
      vehicle: {
        plate: "DU-M3-42",
        nickname: "Clunk Cub",
        desc: "Midnight Silver Model 3 \"Clunk Cub\" — rear drive unit howl + driveway clunk",
        bay: "won",
      },
      tech: "won",
      needsParts: true,
      partsLabel: "Rear drive unit (forklift)",
      partsHeavy: true,
      boardBlurb: "Heavy metal — drive unit out. Won + Moe's forklift.",
    },
    tire: {
      id: "tire",
      title: "Tire / TPMS — Blue Model X",
      short: "Tire puncture / TPMS",
      repairType: "Tire puncture / TPMS / wheel",
      fohId: "kim",
      vehicle: {
        plate: "FLAT-X9",
        nickname: "Flatliner",
        desc: "Deep Blue Model X \"Flatliner\" — nail in sidewall, TPMS light stuck on",
        bay: "won",
      },
      tech: "won",
      needsParts: true,
      partsLabel: "Tire + TPMS sensor",
      partsHeavy: false,
      boardBlurb: "Puncture + angry TPMS. Wheel work for Won.",
    },
    diag: {
      id: "diag",
      title: "Phantom Drain — Red Model S",
      short: "12V / phantom drain diag",
      repairType: "12V / HV / phantom drain diagnostics",
      fohId: "jordan",
      vehicle: {
        plate: "GHST-S7",
        nickname: "Ghost Plaid",
        desc: "Red Model S Plaid \"Ghost Plaid\" — phantom alerts, 12V sulking, charge-port sulk",
        bay: "nima",
      },
      tech: "nima",
      needsParts: true,
      partsLabel: "12V battery + charge-port clips",
      partsHeavy: false,
      boardBlurb: "Car gaslights everyone. Nima + electrical parts.",
    },
  };

  const JOB_ORDER = ["leak", "brakes", "tire", "drive", "diag"];

  /** Which jobs each FOH person can assign (in order) */
  const FOH_JOBS = {
    kim: ["leak", "tire"],
    ryan: ["brakes", "drive"],
    jordan: ["diag"],
  };

  const FOH = {
    kim: {
      id: "kim",
      name: "Kim",
      color: "#e8a838",
      greet: [
        "Kim glances up from the tablet, sticky note stuck to her sleeve like a warning label.",
        "\"Oh good — another greenhorn. Try not to bleed on the laminate, rook.\"",
      ],
      assign: {
        leak: (s) => [
          `Kim taps the screen hard enough to offend it. \"Listen up, knucklehead — this is a WATER LEAK job. White Model Y, plate WET-Y-01, nickname Puddle Princess. Wet carpet after every rain.\"`,
          `"Ticket's printed, ${s.name}. Grab it from the lot, roll it into Rolando's bay — far right, east wall. He speaks fluent drain clog. You speak fluent wrong turns, apparently."`,
          "She slides a warm ticket across the desk. \"And if Rolando offers you coffee from his thermos… it's not coffee, idiot.\"",
        ],
        tire: (s) => [
          `\"Wake up, parts-runner — TIRE PUNCTURE / TPMS job. Deep Blue Model X, plate FLAT-X9, they call it Flatliner. Nail in the sidewall, TPMS light having a meltdown."`,
          `"Lot → Won Song's middle bay. He'll radio Moe for the tire and sensor. Your job is not to lose the lug nuts, wet-behind-the-ears."`,
          `She squints. \"${s.name}, if you bring me the wrong car I will invent a new sticky-note colour just for your shame."`,
        ],
      },
      busy: "\"I already hung a ticket on you, grease-stain. Go find the car before the pigeons nest in it.\"",
      doneAll: "\"My tickets are closed. Miracles happen. Don't get cocky, rook — Ryan and Jordan still have pain to share.\"",
      other: "\"Different flavour of misery? Ryan does the heavy metal. Jordan does the ghost cars. I do wet and flat.\"",
      tip: "\"Water ingress? Rolando, far right. Tires and big iron? Won, middle. Don't ask Nima about puddles unless you want a 40-minute theory monologue, idiot.\"",
    },
    ryan: {
      id: "ryan",
      name: "Ryan",
      greet: [
        "Ryan looks like he slept here. He probably did, emotionally.",
        "\"Hey, greenhorn. You the apprentice? Cool. Try not to reverse into the parts cage. Moe still talks about the last knucklehead.\"",
      ],
      assign: {
        brakes: (s) => [
          `"${s.name} — pay attention, rook. BRAKE SERVICE. Pearl White Model Y, plate SQK-Y-88, nickname Squeaky Y. Pads are screaming, rotors are vibing like a cheap nightclub."`,
          `"Bring it to Won Song's middle bay. He'll call Moe for pads and rotors — you don't freelance brake parts, wet-behind-the-ears."`,
          "He hands you a ticket with grease already on the corner. \"How? Don't ask. The desk has a magnetic field for dirt — and for idiots.\"",
        ],
        drive: (s) => [
          `"Listen, grease-stain — DRIVE UNIT replacement. Midnight Silver Model 3, plate DU-M3-42, Clunk Cub. Rear unit howling, clunk over every driveway lip."`,
          `"Won Song, middle bay. When he radios Moe, you wait at the bay for the forklift like a civilized parts-runner — don't go spelunking the cage unless you're bored."`,
          `"Ticket. Try not to drop it in a puddle, ${s.name}. We've got standards. Low ones. Still."`,
        ],
      },
      busy: "\"You've got a live ticket, knucklehead. Lot's that way. Car isn't gonna levitate in.\"",
      doneAll: "\"My heavy jobs are done. Won grunted. That's a standing ovation. Don't smile too hard, rook.\"",
      other: "\"Kim does leaks and flats. Jordan does haunted electronics. I do brakes and drive units. Division of labour, idiot.\"",
      tip: "\"Big mechanical? Won Song, middle bay. He radios Moe for parts. You wait at the bay — that's the play, greenhorn.\"",
    },
    jordan: {
      id: "jordan",
      name: "Jordan Sham",
      greet: [
        "Jordan Sham spins a pen between his fingers like it's a tiny drive shaft.",
        "\"Apprentice! Welcome to the circus, rook. I'm Jordan — I check in the cars that gaslight their owners. You look gaslightable.\"",
      ],
      assign: {
        diag: (s) => [
          `"Eyes up, knucklehead — this is a 12V / PHANTOM DRAIN diagnostic. Red Model S Plaid, plate GHST-S7, Ghost Plaid. Phantom alerts, battery sulking, charge-port attitude."`,
          `"Pull it from the lot, drop it on Nima's far-left bay. He'll radio Moe for the 12V and clips when the laptop confesses. Don't poke HV with your feelings, wet-behind-the-ears."`,
          `He grins. \"Ticket, ${s.name}. Try not to let the car win the staring contest. You're already losing to the pigeons."`,
        ],
      },
      busy: "\"Ghost S is still out there, grease-stain. Lot. Red. Loud about nothing. Go.\"",
      doneAll: "\"Diag closed. Nima looked smug for thirty seconds. Record. You almost helped, rook.\"",
      other: "\"Different flavour of pain? Kim and Ryan have the other tickets. Shoo, parts-runner.\"",
      tip: "\"Weird electronics, phantom drain, charge drama — Nima, far left. Bring snacks for your brain, idiot.\"",
    },
  };

  const TECHS = {
    rolando: {
      name: "Rolando",
      wrong: (s) => [
        "Rolando wipes sealant off his hands with a rag that has seen wars.",
        `"${s.name}, you look lost in a helpful-idiot way. What's on the ticket, rook?"`,
        "He glances. \"Ah. That's not my puddle. Water leaks & drains: me — far right forever. " +
          "Brakes, tires, drive units? Won, middle. Ghost codes & 12V? Nima, left. Parts? Moe radios in — don't cosplay a forklift.\"",
        "\"Tiny tip, greenhorn: if the carpet smells like a basement, it's usually the body seam or a clogged drain. Ask me when you've got the wet Y.\"",
      ],
      early: [
        "\"No car, no leak, knucklehead. Go sweet-talk the front desk, then steal— borrow — the car from the lot.\"",
      ],
      help: (s) => [
        "Rolando circles the Model Y like a detective who enjoys bullying apprentices.",
        `"See this, grease-stain? Clogged drain + tired seal. Classic. Pass me that trim tool before you drop it, ${s.name}."`,
        "Twenty minutes of careful work. He tests with a water bottle like a ritual.",
        "\"Dry. Customer will cry happy tears — into a towel, hopefully. Nice assist for a wet-behind-the-ears. You're learning the language of drips. Don't let it go to your head.\"",
      ],
      after: "\"Leak's done. Grab another ticket from the desk if you're hungry for chaos, rook.\"",
      praise: "Rolando bumps your fist with a clean knuckle. \"Not terrible, idiot. Miracle.\"",
    },
    won: {
      name: "Won Song",
      wrong: (s) => [
        "Won Song doesn't stop torquing. He speaks to the bolt, then to you.",
        `"Wrong bay for that ticket, ${s.name}. Pay attention, greenhorn."`,
        "\"Leaks: Rolando. Diag: Nima. Heavy metal — brakes, tires, suspension, drive units: me. Parts: I radio Moe. Don't mix the playlist, knucklehead.\"",
        "A pause. \"Tip: listen to the clunk. Driveway lips tell the truth. You rarely do.\"",
      ],
      early: [
        "\"Where's the car, rook? I don't repair air. Front office, then lot, then here.\"",
      ],
      // Per-job "need parts" radio lines
      needParts: {
        brakes: (s) => [
          "Won Song spins a wheel, grimaces like the rotor insulted his family.",
          `"Brake service — pads cooked, rotors done. I'm radioing Moe for pads and rotors. Stay put, ${s.name}. Don't wander off like a lost parts-runner."`,
          "He keys the radio. \"Moe — middle bay, Squeaky Y. Pads and rotors. Send 'em before this greenhorn invents a new noise.\"",
        ],
        drive: (s) => [
          "Won Song inspects the Model 3, nods once.",
          `"Drive unit's coming out. Radioing Moe for the forklift and the unit. You wait at the bay, knucklehead — canonical path. Visiting parts for vibes is optional."`,
          "Radio crackles. \"Moe. Heavy. Clunk Cub. Forklift. Now.\"",
        ],
        tire: (s) => [
          "Won Song eyes the Model X sidewall like it owes him money.",
          `"Puncture's ugly. TPMS is lying for sport. Calling Moe for a tire and sensor. Park yourself here, rook — don't chase the forklift."`,
          "\"Moe — Flatliner needs rubber and a sensor. Middle bay. Try not to hit the apprentice; we still need the free labour.\"",
        ],
      },
      waiting: "\"Moe's rolling. Stand there and look decorative, grease-stain.\"",
      help: {
        brakes: (s) => [
          "Pads and rotors hit the cart. Won Song points. You fetch. He works.",
          `"Hold the caliper like you mean it, ${s.name}. Torque's not a suggestion, idiot."`,
          "Pedal feel returns. Squeal dies. He almost looks pleased.",
          "\"Road test later. Brakes are solid. Go tell Ryan before he drinks the whole pot, greenhorn.\"",
        ],
        drive: (s) => [
          "Moe's forklift hums at the bay edge. Won Song points. You spot. He works.",
          `"Hold that harness clear. Good. ${s.name}, you're not completely useless. Keep it that way."`,
          "The new unit seats home. Torque specs recited from memory.",
          "\"Road test later. Job's solid. Tell Ryan I grunted approvingly — he'll translate, rook.\"",
        ],
        tire: (s) => [
          "New tire, fresh TPMS. Won Song balances the wheel like he's done this since the dinosaurs.",
          `"Hand me the torque stick, knucklehead. Lug order matters. So does not cross-threading — look at me, ${s.name}."`,
          "TPMS light dies. He spins the wheel once.",
          "\"She's round again. Miracle. Go bother Kim before I invent more work for you.\"",
        ],
      },
      after: "\"We're good here. Next ticket, wet-behind-the-ears.\"",
      praise: "Won Song almost smiles. \"Competent-adjacent, idiot. The pigeons noticed.\"",
    },
    nima: {
      name: "Nima",
      wrong: (s) => [
        "Nima flips hair that somehow survives a shop environment.",
        `"Wrong specialty, ${s.name}. I do the mysteries — the ones that make Slack threads cry. You're in the wrong aisle, rook."`,
        "\"Wet carpets: Rolando. Heavy iron: Won. Me: when the car is lying — 12V, charge port, phantom drains, weird codes.\"",
        "\"Tip, greenhorn: if every module blames every other module, start with power and grounds before you rewrite the universe.\"",
      ],
      early: [
        "\"Bring me the haunted S first, knucklehead. Jordan checked it in. Lot's full of suspects.\"",
      ],
      needParts: {
        diag: (s) => [
          "Nima plugs in. Screens bloom. He winces at a voltage plot like it personally betrayed him.",
          `"Phantom drain + tired 12V + charge-port clips playing hard to get. Radioing Moe. Stay in the bay, ${s.name} — don't go on a parts safari."`,
          "\"Moe — far left. Ghost Plaid needs a 12V and charge-port clips. Send them before the apprentice trips over a cable.\"",
        ],
      },
      waiting: "\"Moe's en route. Try not to touch HV with your optimism, grease-stain.\"",
      help: {
        diag: (s) => [
          "Parts land on the bench. Nima guides your hands like you're a slightly dangerous intern.",
          `"Watch — intermittent drain on a harness the last shop 'fixed.' Classic swagger failure, rook."`,
          `12V seats. Clips click. Alerts evaporate like your dignity.`,
          `"${s.name}, you just outsmarted a Plaid. Don't let it go to your head. Let it go to your résumé — and maybe wash your hands, idiot."`,
        ],
      },
      after: "\"Mystery's boring now. I love that. Scram, greenhorn.\"",
      praise: "Nima finger-guns. \"Not bad for a wet-behind-the-ears. Somehow it works.\"",
    },
    moe: {
      name: "Moe",
      flavour: () => [
        "Moe leans on the forklift like it's a lounge chair.",
        "\"Looking for vibes, rook? Counter's open. Canonical path is the tech radios me and I deliver to the bay — you're the optional tour group.\"",
        "\"Drive units and packs — that's when I dance with Subtle the forklift. Clips and pads too. Be specific, knucklehead.\"",
      ],
      noJob: [
        "\"Parts counter's open. Your pockets look empty of purpose though, greenhorn. Hit the front desk before I invent a nickname worse than grease-stain.\"",
      ],
      needCarFirst: [
        "\"Ticket's cute. Car's still in the lot. I'm not forklifting the asphalt, idiot.\"",
      ],
      needTechFirst: [
        "\"Tech hasn't radioed the play yet. Get their blessing at the bay, then I roll. Don't freelance my schedule, parts-runner.\"",
      ],
      // Player visits parts after tech already radioed — flavour alternate
      alreadyRadioed: (s, job) => [
        "Moe checks the radio log, smirks.",
        `"Yeah, yeah — ${job.tech === "won" ? "Won" : "Nima"} already barked. ${job.partsLabel}. I'm heading to the bay."`,
        `He tosses you a glance. \"Or you can wait there like a civilized rook, ${s.name}. Either way, don't lose the ticket."`,
      ],
      deliverHere: (s, job) => [
        job.partsHeavy
          ? `Moe fires up Subtle the forklift. \"Heavy package for a light brain. Drive unit run. Buckle up emotionally, ${s.name}."`
          : `Moe pulls ${job.partsLabel} from a shelf with theatrical disdain. \"Catch, knucklehead — actually don't. Carry it properly."`,
        "He nods toward the bays. \"I'll meet you there. Try to arrive in the same decade, greenhorn.\"",
      ],
      after: "\"You know where to find me. Between the shelves and the legends. Scram, rook.\"",
      arriveBay: (s, job) => [
        job.partsHeavy
          ? `Moe beeps into the bay on the forklift. \"Package for Clunk Cub. Signed for by one apprentice idiot — that's you, ${s.name}."`
          : `Moe rolls a cart into the bay. \"${job.partsLabel}. Fresh from the cage. Try not to drop them, grease-stain."`,
        "\"Tell the tech the parts fairy arrived. And if anyone asks — I never speed indoors.\"",
      ],
    },
  };

  // ─── State ──────────────────────────────────────────────────────────
  const state = {
    name: "Apprentice",
    location: "floor",
    activeJob: null,
    jobs: Object.fromEntries(JOB_ORDER.map((id) => [id, { stage: null, done: false }])),
    inventory: [],
    rep: { rolando: 0, won: 0, nima: 0, moe: 0, kim: 0, ryan: 0, jordan: 0 },
    carInBay: {},
    introDone: false,
    ambientIdx: 0,
    partsArriving: false,
  };

  // ─── DOM ────────────────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const els = {
    title: $("#screen-title"),
    game: $("#screen-game"),
    nameInput: $("#player-name"),
    btnStart: $("#btn-start"),
    locNav: $("#location-nav"),
    schematic: $("#shop-schematic"),
    sceneArt: $("#scene-art"),
    sceneTitle: $("#scene-title"),
    narration: $("#narration"),
    dialogue: $("#dialogue"),
    actions: $("#actions"),
    statusLoc: $("#status-location"),
    statusJob: $("#status-job"),
    statusInv: $("#status-inventory"),
    statusRep: $("#status-rep"),
    ambient: $("#ambient-line"),
    helpModal: $("#modal-help"),
    winModal: $("#modal-win"),
    winText: $("#win-text"),
    btnHelp: $("#btn-help"),
    btnCloseHelp: $("#btn-close-help"),
    btnReplay: $("#btn-replay"),
  };

  // ─── Helpers ────────────────────────────────────────────────────────
  function addItem(id, label) {
    if (state.inventory.find((i) => i.id === id)) return;
    state.inventory.push({ id, label });
  }

  function removeItem(id) {
    state.inventory = state.inventory.filter((i) => i.id !== id);
  }

  function hasItem(id) {
    return state.inventory.some((i) => i.id === id);
  }

  function bumpRep(who, n = 1) {
    state.rep[who] = Math.min(5, (state.rep[who] || 0) + n);
  }

  function jobState(id) {
    return state.jobs[id];
  }

  function activeJobData() {
    return state.activeJob ? JOBS[state.activeJob] : null;
  }

  function allJobsDone() {
    return JOB_ORDER.every((id) => state.jobs[id].done);
  }

  function nextJobForFOH(fohId) {
    const list = FOH_JOBS[fohId] || [];
    return list.find((jid) => !state.jobs[jid].done && !state.jobs[jid].stage) || null;
  }

  function fohHasInProgress(fohId) {
    const list = FOH_JOBS[fohId] || [];
    return list.find((jid) => state.jobs[jid].stage && !state.jobs[jid].done) || null;
  }

  function fohAllDone(fohId) {
    return (FOH_JOBS[fohId] || []).every((jid) => state.jobs[jid].done);
  }

  function showDialogue(who, lines) {
    const box = els.dialogue;
    box.classList.remove("hidden");
    const text = Array.isArray(lines) ? lines : [lines];
    box.innerHTML =
      `<div class="who">${who}</div>` +
      text.map((l) => `<p class="line">${l}</p>`).join("");
  }

  function hideDialogue() {
    els.dialogue.classList.add("hidden");
    els.dialogue.innerHTML = "";
  }

  function setNarration(html) {
    els.narration.innerHTML = html;
  }

  function clearActions() {
    els.actions.innerHTML = "";
  }

  function addAction(label, fn, opts = {}) {
    const btn = document.createElement("button");
    btn.className = "btn action";
    btn.textContent = label;
    if (opts.disabled) btn.disabled = true;
    btn.addEventListener("click", fn);
    els.actions.appendChild(btn);
    return btn;
  }

  function stageHint(job, stage) {
    const map = {
      assigned: "Get the car from the lot",
      car_fetched: "Bring car to the right bay / talk to tech",
      tech_ok: job.needsParts ? "Wait at bay — tech radioed Moe for parts" : "Finish at the bay",
      parts_ok: "Finish the repair with the tech",
      done: "Complete",
    };
    return map[stage] || stage;
  }

  function refreshStatus() {
    const loc = LOCATIONS[state.location];
    els.statusLoc.textContent = loc.name;

    const job = activeJobData();
    if (!job) {
      const left = JOB_ORDER.filter((id) => !state.jobs[id].done).length;
      els.statusJob.innerHTML = left
        ? `<span class="muted">None — talk to Kim, Ryan, or Jordan (${left} jobs left)</span>`
        : `<span class="muted">All tickets closed. Shift's yours.</span>`;
    } else {
      const js = jobState(job.id);
      els.statusJob.innerHTML = `<strong>${job.repairType}</strong><br/>${job.title}<br/><span class="muted">${stageHint(job, js.stage)}</span>`;
    }

    if (state.inventory.length === 0) {
      els.statusInv.innerHTML = `<li class="muted">Empty pockets</li>`;
    } else {
      els.statusInv.innerHTML = state.inventory.map((i) => `<li>${i.label}</li>`).join("");
    }

    const repOrder = [
      ["kim", "Kim"],
      ["ryan", "Ryan"],
      ["jordan", "Jordan"],
      ["rolando", "Rolando"],
      ["won", "Won"],
      ["nima", "Nima"],
      ["moe", "Moe"],
    ];
    els.statusRep.innerHTML = repOrder
      .map(([id, label]) => {
        const v = state.rep[id] || 0;
        const pct = (v / 5) * 100;
        return `<li>${label} <span class="rep-bar"><span class="rep-fill" style="width:${pct}%"></span></span></li>`;
      })
      .join("");

    els.ambient.textContent = AMBIENT[state.ambientIdx % AMBIENT.length];
    highlightSchematic(state.location);
  }

  function buildMap() {
    els.locNav.innerHTML = "";
    Object.values(LOCATIONS).forEach((loc) => {
      const btn = document.createElement("button");
      btn.className = "loc-btn" + (state.location === loc.id ? " here" : "");
      btn.innerHTML = `<span class="key">${loc.key}</span><span>${loc.name}</span>`;
      btn.addEventListener("click", () => goTo(loc.id));
      els.locNav.appendChild(btn);
    });
  }

  function highlightSchematic(locId) {
    if (!els.schematic) return;
    els.schematic.querySelectorAll("[data-loc]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-loc") === locId);
    });
  }

  // ─── Navigation & scene ─────────────────────────────────────────────
  function goTo(locId) {
    if (!LOCATIONS[locId]) return;
    state.location = locId;
    state.ambientIdx++;
    hideDialogue();
    renderScene();
  }

  function renderScene() {
    const loc = LOCATIONS[state.location];
    els.sceneArt.textContent = loc.art;
    els.sceneTitle.textContent = loc.name;
    buildMap();
    refreshStatus();
    clearActions();

    let narr = "";
    if (!state.introDone && loc.id === "floor") {
      narr =
        `<p>You clock in. The air tastes like metal and yesterday's coffee.</p>` +
        `<p>${loc.enter(state)}</p>` +
        `<p class="ambient">A pigeon eyes your lunch from above. Welcome to the hole in the wall, rook.</p>` +
        `<p>Front office (west side of the shop) is where Kim, Ryan, and Jordan Sham check cars in. Three bays line the east wall: Nima · Won Song · Rolando. Start at FOH when you're ready.</p>`;
      state.introDone = true;
    } else {
      narr = `<p>${loc.enter(state)}</p><p class="ambient">${AMBIENT[state.ambientIdx % AMBIENT.length]}</p>`;
    }

    if (loc.id === "lot") narr += lotNarrationExtra();
    if (loc.id === "rolando" || loc.id === "won" || loc.id === "nima") narr += bayCarExtra(loc.id);

    setNarration(narr);
    renderLocationActions();
  }

  function lotNarrationExtra() {
    const parked = [];
    Object.values(JOBS).forEach((job) => {
      const js = jobState(job.id);
      if (js.stage === "assigned") {
        parked.push(
          `<strong>${job.repairType}</strong> — ${job.vehicle.desc} (plate ${job.vehicle.plate}) — waiting`
        );
      }
    });
    const holding = JOB_ORDER.filter((id) => hasItem(`car_${id}`));
    if (holding.length) {
      parked.push("You've got a car tagged for the shop — take it to the right bay, knucklehead.");
    }
    if (parked.length === 0) {
      return `<p class="ambient">Most spots empty of drama right now. Pigeons hold a union meeting near the dumpster.</p>`;
    }
    return `<p>Vehicles of interest:</p><ul>${parked.map((p) => `<li>${p}</li>`).join("")}</ul>`;
  }

  function bayCarExtra(bayId) {
    const job = activeJobData();
    if (!job || job.vehicle.bay !== bayId) return "";
    const js = jobState(job.id);
    if (["car_fetched", "tech_ok", "parts_ok"].includes(js.stage) && state.carInBay[job.id]) {
      let extra = `<p>The <strong>${job.vehicle.plate}</strong> (${job.vehicle.nickname}) sits on the hoist — <em>${job.repairType}</em>.</p>`;
      if (js.stage === "tech_ok" && job.needsParts) {
        extra += `<p class="ambient">Tech radioed Moe. Parts are inbound — wait here or wander to Parts for flavour.</p>`;
      }
      if (js.stage === "parts_ok") {
        extra += `<p class="ambient">Parts are here. Finish the repair with the tech.</p>`;
      }
      return extra;
    }
    return "";
  }

  function renderLocationActions() {
    const loc = state.location;
    switch (loc) {
      case "office":
        renderOffice();
        break;
      case "lot":
        renderLot();
        break;
      case "rolando":
        renderTechBay("rolando");
        break;
      case "won":
        renderTechBay("won");
        break;
      case "nima":
        renderTechBay("nima");
        break;
      case "parts":
        renderParts();
        break;
      case "floor":
        addAction("Look around / stretch", () => {
          showDialogue("You", [
            "You crack your knuckles. Grease has already found your sleeves. Rite of passage, greenhorn.",
          ]);
          clearActions();
          addAction("Continue", () => {
            hideDialogue();
            renderScene();
          });
        });
        addAction("Head toward front office", () => goTo("office"));
        addAction("Check the lot", () => goTo("lot"));
        break;
      case "washroom":
        addAction("Wash hands (optimistic)", () => {
          showDialogue("Washroom", [
            "The water is lukewarm. The soap is a suggestion. You emerge 4% cleaner, 100% still a rook.",
          ]);
          clearActions();
          addAction("Leave", () => {
            hideDialogue();
            renderScene();
          });
        });
        addAction("Read the graffiti", () => {
          showDialogue("Stall door", [
            "\"Torque is a lifestyle.\" — anonymous",
            "\"Kim's sticky notes know too much.\"",
            "\"Apprentices: rinse twice, still greasy.\"",
            "A tiny pigeon doodle. Respect.",
          ]);
          clearActions();
          addAction("Back", () => {
            hideDialogue();
            renderScene();
          });
        });
        break;
      case "doors":
        addAction("Step out toward the lot", () => goTo("lot"));
        addAction("Duck back to the shop floor", () => goTo("floor"));
        addAction("Watch the pigeons", () => {
          showDialogue("Bay doors", [
            "Two pigeons escort a third through the door gap like VIPs. You've seen worse onboarding, knucklehead.",
          ]);
          clearActions();
          addAction("Alright", () => {
            hideDialogue();
            renderScene();
          });
        });
        break;
      default:
        break;
    }
  }

  // ─── Front office ───────────────────────────────────────────────────
  function renderOffice() {
    addAction("Talk to Kim", () => talkFOH("kim"));
    addAction("Talk to Ryan", () => talkFOH("ryan"));
    addAction("Talk to Jordan Sham", () => talkFOH("jordan"));
    addAction("Ask anyone for a general tip", () => {
      const tips = [FOH.kim.tip, FOH.ryan.tip, FOH.jordan.tip];
      const t = tips[state.ambientIdx % tips.length];
      showDialogue("Front desk", [t]);
      clearActions();
      addAction("Thanks", () => {
        hideDialogue();
        renderScene();
      });
    });
  }

  function talkFOH(fohId) {
    const foh = FOH[fohId];
    clearActions();

    if (fohAllDone(fohId)) {
      showDialogue(foh.name, [...foh.greet.slice(0, 1), foh.doneAll, foh.other]);
      addAction("Back", () => {
        hideDialogue();
        renderScene();
      });
      return;
    }

    const inProg = fohHasInProgress(fohId);
    if (inProg) {
      showDialogue(foh.name, [foh.busy]);
      addAction("Back", () => {
        hideDialogue();
        renderScene();
      });
      return;
    }

    const nextId = nextJobForFOH(fohId);
    if (!nextId) {
      showDialogue(foh.name, [foh.other]);
      addAction("Back", () => {
        hideDialogue();
        renderScene();
      });
      return;
    }

    const job = JOBS[nextId];

    if (state.activeJob && state.activeJob !== job.id) {
      showDialogue(foh.name, [
        ...foh.greet,
        `"You've already got a live ticket, rook. Finish ${JOBS[state.activeJob].short} before I pile on. We're a hole in the wall, not a circus."`,
        foh.other,
      ]);
      addAction("Back", () => {
        hideDialogue();
        renderScene();
      });
      return;
    }

    showDialogue(foh.name, foh.greet);
    addAction(`Take job: ${job.repairType} (${job.vehicle.nickname})`, () => assignJob(fohId, nextId));
    addAction("Not yet", () => {
      hideDialogue();
      renderScene();
    });
  }

  function assignJob(fohId, jobId) {
    const foh = FOH[fohId];
    const job = JOBS[jobId];
    state.activeJob = job.id;
    state.jobs[job.id].stage = "assigned";
    addItem(`ticket_${job.id}`, `Ticket: ${job.repairType} · ${job.vehicle.plate}`);
    bumpRep(fohId, 1);

    const lines = foh.assign[jobId](state);
    showDialogue(foh.name, lines);
    clearActions();
    addAction("Head to the lot", () => {
      hideDialogue();
      goTo("lot");
    });
    addAction("Stay in the office", () => {
      hideDialogue();
      renderScene();
    });
    refreshStatus();
  }

  // ─── Lot ────────────────────────────────────────────────────────────
  function renderLot() {
    let any = false;
    Object.values(JOBS).forEach((job) => {
      const js = jobState(job.id);
      if (js.stage === "assigned" && state.activeJob === job.id) {
        any = true;
        addAction(
          `Get ${job.vehicle.plate} (${job.vehicle.nickname}) — ${job.repairType}`,
          () => fetchCar(job.id)
        );
      }
    });

    JOB_ORDER.forEach((id) => {
      if (hasItem(`car_${id}`)) {
        any = true;
        const job = JOBS[id];
        addAction(
          `Drive ${job.vehicle.plate} into ${LOCATIONS[job.vehicle.bay].name}`,
          () => deliverCar(id)
        );
      }
    });

    if (!any) {
      addAction("Wander the rows", () => {
        showDialogue("Lot", [
          "You pass a Cybertruck with a handwritten note under the wiper: \"Please don't.\"",
          "Pigeons have claimed a charging cable as a throne. Relatable energy, rook.",
        ]);
        clearActions();
        addAction("Enough wandering", () => {
          hideDialogue();
          renderScene();
        });
      });
    }

    addAction("Enter via bay doors", () => goTo("doors"));
    addAction("Back to shop floor", () => goTo("floor"));
  }

  function fetchCar(jobId) {
    const job = JOBS[jobId];
    const js = jobState(jobId);
    if (js.stage !== "assigned") return;

    js.stage = "car_fetched";
    addItem(`car_${jobId}`, `Car: ${job.vehicle.plate} (${job.vehicle.nickname})`);
    bumpRep(job.fohId, 1);

    showDialogue("Lot", [
      `You find ${job.vehicle.desc}.`,
      `Repair type on the ticket: <strong>${job.repairType}</strong>. Even you can read that, knucklehead.`,
      "Key card works. The car wakes with a soft whoom. Pigeons scatter like unpaid interns.",
      `Take it to ${LOCATIONS[job.vehicle.bay].name}.`,
    ]);
    clearActions();
    addAction(`Go to ${LOCATIONS[job.vehicle.bay].name}`, () => {
      hideDialogue();
      goTo(job.vehicle.bay);
    });
    addAction("Stay in the lot", () => {
      hideDialogue();
      renderScene();
    });
    refreshStatus();
  }

  function deliverCar(jobId) {
    const job = JOBS[jobId];
    state.carInBay[jobId] = true;
    removeItem(`car_${jobId}`);
    addItem(`baycar_${jobId}`, `${job.vehicle.plate} on hoist`);
    goTo(job.vehicle.bay);
    showDialogue("Bay", [
      `You ease ${job.vehicle.plate} (${job.vehicle.nickname}) onto the hoist lines. Chocks in. Hazards off.`,
      `${job.repairType} — the shop accepts another patient. Time to talk to the tech, rook.`,
    ]);
    clearActions();
    addAction("Continue", () => {
      hideDialogue();
      renderScene();
    });
    refreshStatus();
  }

  // ─── Tech bays ──────────────────────────────────────────────────────
  function renderTechBay(techId) {
    const tech = TECHS[techId];
    const job = activeJobData();

    addAction(`Talk to ${tech.name}`, () => talkTech(techId));

    if (job && job.vehicle.bay === techId && hasItem(`car_${job.id}`)) {
      addAction(`Park ${job.vehicle.plate} on this hoist`, () => deliverCar(job.id));
    }

    // Canonical parts wait beat
    if (
      job &&
      job.tech === techId &&
      job.needsParts &&
      jobState(job.id).stage === "tech_ok" &&
      state.carInBay[job.id]
    ) {
      addAction("Wait for Moe to deliver parts", () => waitForPartsDelivery());
    }

    if (job && canCompleteAtBay(job, techId)) {
      addAction("Complete the repair", () => completeJob(job.id));
    }
  }

  function canCompleteAtBay(job, techId) {
    if (job.tech !== techId) return false;
    const js = jobState(job.id);
    if (!state.carInBay[job.id]) return false;
    if (job.needsParts) return js.stage === "parts_ok";
    return js.stage === "tech_ok";
  }

  function needPartsLines(techId, job) {
    const tech = TECHS[techId];
    if (tech.needParts && tech.needParts[job.id]) {
      return tech.needParts[job.id](state);
    }
    return [
      `"Need parts for this ${job.repairType}, rook. Radioing Moe. Stay put."`,
    ];
  }

  function helpLines(techId, job) {
    const tech = TECHS[techId];
    if (typeof tech.help === "function") return tech.help(state);
    if (tech.help && tech.help[job.id]) return tech.help[job.id](state);
    return [`"Let's finish this ${job.repairType}, knucklehead."`];
  }

  function talkTech(techId) {
    const tech = TECHS[techId];
    const job = activeJobData();
    clearActions();

    if (!job) {
      showDialogue(
        tech.name,
        tech.wrong(state).slice(0, 2).concat([
          "\"No ticket? Front desk — Kim, Ryan, or Jordan. They feed us cars. Shoo, greenhorn.\"",
        ])
      );
      addAction("Back", () => {
        hideDialogue();
        renderScene();
      });
      return;
    }

    const js = jobState(job.id);

    if (job.tech !== techId) {
      showDialogue(tech.name, tech.wrong(state));
      bumpRep(techId, 1);
      addAction("Thanks for the redirect", () => {
        hideDialogue();
        renderScene();
      });
      return;
    }

    if (js.stage === "assigned") {
      showDialogue(tech.name, tech.early);
      addAction("Go to the lot", () => {
        hideDialogue();
        goTo("lot");
      });
      return;
    }

    if (js.stage === "car_fetched" && !state.carInBay[job.id]) {
      if (hasItem(`car_${job.id}`)) {
        showDialogue(tech.name, [
          `"You're holding the car in spirit, idiot. Park ${job.vehicle.plate} on my hoist and we'll talk."`,
        ]);
        addAction("Park it now", () => deliverCar(job.id));
        addAction("Back", () => {
          hideDialogue();
          renderScene();
        });
      } else {
        showDialogue(tech.name, tech.early);
        addAction("Back", () => {
          hideDialogue();
          renderScene();
        });
      }
      return;
    }

    // Right tech, car in bay, first real talk
    if (js.stage === "car_fetched" && state.carInBay[job.id]) {
      if (job.needsParts) {
        js.stage = "tech_ok";
        showDialogue(tech.name, needPartsLines(techId, job));
        bumpRep(techId, 1);
        clearActions();
        addAction("Wait for Moe to deliver parts", () => waitForPartsDelivery());
        addAction("Visit Parts anyway (flavour)", () => {
          hideDialogue();
          goTo("parts");
        });
        addAction("Stay", () => {
          hideDialogue();
          renderScene();
        });
        refreshStatus();
        return;
      }
      // No parts needed — do the repair
      js.stage = "tech_ok";
      showDialogue(tech.name, helpLines(techId, job));
      bumpRep(techId, 1);
      clearActions();
      addAction("Finish the job", () => completeJob(job.id));
      refreshStatus();
      return;
    }

    if (job.needsParts && js.stage === "tech_ok") {
      showDialogue(tech.name, [
        tech.waiting || "\"Moe's coming. Wait here, rook.\"",
        ...needPartsLines(techId, job).slice(-1),
      ]);
      addAction("Wait for Moe to deliver parts", () => waitForPartsDelivery());
      addAction("Wander to Parts", () => {
        hideDialogue();
        goTo("parts");
      });
      return;
    }

    if (job.needsParts && js.stage === "parts_ok") {
      showDialogue(tech.name, helpLines(techId, job));
      bumpRep(techId, 1);
      clearActions();
      addAction("Finish the job", () => completeJob(job.id));
      refreshStatus();
      return;
    }

    if (js.stage === "tech_ok" && !job.needsParts) {
      showDialogue(tech.name, [tech.after, tech.praise]);
      addAction("Complete repair", () => completeJob(job.id));
      return;
    }

    if (js.done) {
      showDialogue(tech.name, [tech.after]);
      addAction("Back", () => {
        hideDialogue();
        renderScene();
      });
      return;
    }

    showDialogue(tech.name, [tech.after]);
    addAction("Back", () => {
      hideDialogue();
      renderScene();
    });
  }

  function waitForPartsDelivery() {
    const job = activeJobData();
    if (!job || !job.needsParts) return;
    const js = jobState(job.id);
    if (js.stage !== "tech_ok") return;

    state.partsArriving = true;
    clearActions();
    showDialogue("Bay", [
      "You lean on a toolbox that definitely has a name. Somewhere a pigeon judges your posture.",
      "Radio static. Forklift beep — or cart wheels. Footsteps with purpose.",
    ]);
    addAction("…parts arrive", () => {
      js.stage = "parts_ok";
      state.partsArriving = false;
      addItem(
        `parts_${job.id}`,
        job.partsHeavy ? `${job.partsLabel} (forklift)` : job.partsLabel
      );
      bumpRep("moe", 2);
      showDialogue("Moe", TECHS.moe.arriveBay(state, job));
      clearActions();
      addAction("Talk to the tech — finish the repair", () => {
        hideDialogue();
        talkTech(job.tech);
      });
      addAction("Hang at the bay", () => {
        hideDialogue();
        renderScene();
      });
      refreshStatus();
    });
  }

  // ─── Parts / Moe ────────────────────────────────────────────────────
  function renderParts() {
    addAction("Talk to Moe", () => talkMoe());
    addAction("Admire the forklift", () => {
      showDialogue("Forklift", [
        "It has a name written in paint pen: \"Subtle.\" The irony is not subtle, rook.",
      ]);
      clearActions();
      addAction("Back", () => {
        hideDialogue();
        renderScene();
      });
    });
  }

  function talkMoe() {
    const moe = TECHS.moe;
    const job = activeJobData();
    clearActions();

    if (!job) {
      showDialogue(moe.name, moe.noJob);
      addAction("Back", () => {
        hideDialogue();
        renderScene();
      });
      return;
    }

    const js = jobState(job.id);

    if (!job.needsParts) {
      showDialogue(moe.name, moe.flavour());
      bumpRep("moe", 1);
      addAction("Got it", () => {
        hideDialogue();
        renderScene();
      });
      return;
    }

    if (js.stage === "assigned") {
      showDialogue(moe.name, moe.needCarFirst);
      addAction("Back", () => {
        hideDialogue();
        renderScene();
      });
      return;
    }

    if (js.stage === "car_fetched") {
      showDialogue(moe.name, moe.needTechFirst);
      addAction(`See ${TECHS[job.tech].name}`, () => {
        hideDialogue();
        goTo(job.tech);
      });
      return;
    }

    // Tech already radioed — player took the flavour path to parts
    if (js.stage === "tech_ok") {
      showDialogue(moe.name, [
        ...moe.alreadyRadioed(state, job),
        ...moe.deliverHere(state, job).slice(1),
      ]);
      js.stage = "parts_ok";
      addItem(
        `parts_${job.id}`,
        job.partsHeavy ? `${job.partsLabel} (forklift)` : job.partsLabel
      );
      bumpRep("moe", 2);
      clearActions();
      addAction(`Back to ${TECHS[job.tech].name}'s bay`, () => {
        hideDialogue();
        goTo(job.tech);
      });
      refreshStatus();
      return;
    }

    if (js.stage === "parts_ok" || js.done) {
      showDialogue(moe.name, [moe.after]);
      addAction("Back", () => {
        hideDialogue();
        renderScene();
      });
      return;
    }

    showDialogue(moe.name, moe.flavour());
    addAction("Back", () => {
      hideDialogue();
      renderScene();
    });
  }

  // ─── Complete job ───────────────────────────────────────────────────
  function completeJob(jobId) {
    const job = JOBS[jobId];
    const tech = TECHS[job.tech];
    const js = jobState(jobId);
    js.stage = "done";
    js.done = true;
    state.activeJob = null;
    removeItem(`ticket_${jobId}`);
    removeItem(`baycar_${jobId}`);
    removeItem(`parts_${jobId}`);
    delete state.carInBay[jobId];
    bumpRep(job.tech, 2);
    bumpRep(job.fohId, 1);

    showDialogue(tech.name, [tech.praise, tech.after]);
    setNarration(
      `<p>Job closed: <strong>${job.repairType}</strong> — ${job.title}. The hoist lowers. Somewhere, a pigeon applauds with its feet.</p>` +
        `<p class="ambient">Front desk will want the good news — and maybe another chance to call you rook.</p>`
    );
    clearActions();
    refreshStatus();

    if (allJobsDone()) {
      addAction("See how the shift went…", () => showWin());
    } else {
      addAction("Go to front office for another job", () => {
        hideDialogue();
        goTo("office");
      });
      addAction("Hang out here", () => {
        hideDialogue();
        renderScene();
      });
    }
  }

  function showWin() {
    const totalRep = Object.values(state.rep).reduce((a, b) => a + b, 0);
    els.winText.textContent =
      `${state.name}, you somehow closed all five tickets: water leak with Rolando, brakes & tires & drive unit with Won Song (Moe delivering like a parts fairy with insults), ` +
      `and the phantom-drain diag with Nima. Kim, Ryan, and Jordan might keep your name on the sticky notes — under "greenhorn, surprisingly not fired." ` +
      `Rep score: ${totalRep}. The pigeons are proud. The coffee still isn't. Don't get cocky, rook.`;
    els.winModal.classList.remove("hidden");
  }

  function resetGame() {
    state.location = "floor";
    state.activeJob = null;
    state.jobs = Object.fromEntries(JOB_ORDER.map((id) => [id, { stage: null, done: false }]));
    state.inventory = [];
    state.rep = { rolando: 0, won: 0, nima: 0, moe: 0, kim: 0, ryan: 0, jordan: 0 };
    state.carInBay = {};
    state.introDone = false;
    state.ambientIdx = 0;
    state.partsArriving = false;
    els.winModal.classList.add("hidden");
    goTo("floor");
  }

  // ─── Boot ───────────────────────────────────────────────────────────
  function startGame() {
    const raw = (els.nameInput.value || "").trim();
    state.name = raw || "Apprentice";
    els.title.classList.remove("active");
    els.game.classList.add("active");
    goTo("floor");
  }

  els.btnStart.addEventListener("click", startGame);
  els.nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startGame();
  });
  els.btnHelp.addEventListener("click", () => els.helpModal.classList.remove("hidden"));
  els.btnCloseHelp.addEventListener("click", () => els.helpModal.classList.add("hidden"));
  els.btnReplay.addEventListener("click", resetGame);


  // Schematic click-to-navigate
  if (els.schematic) {
    els.schematic.querySelectorAll("[data-loc]").forEach((el) => {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-loc");
        if (id && LOCATIONS[id]) goTo(id);
      });
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      els.helpModal.classList.add("hidden");
      return;
    }
    if (!els.game.classList.contains("active")) return;
    if (e.target.matches("input, textarea")) return;
    const loc = Object.values(LOCATIONS).find((l) => l.key === e.key);
    if (loc) goTo(loc.id);
  });
})();
