# Mothership — Chilliwack Skies

Arcade comedy game inspired by Retrofit’s song **“Mothership”**.  
**Retrofit presents: Mothership the game.**

**Title** is a **vintage car stereo**: insert the cassette (**“Retrofit — Mothership the game”**) to start — that same gesture kicks off `playTheme()` (iOS-safe) and drops you **in mom’s plywood shed by the El Camino**. Hang with **Tayler** via clear press steps (**get high with T → roll joint → light the joint → Smoke the joint**), then the clay UFO lands in the shed window, step outside and **sit in the driver’s seat** (landing legs tuck on takeoff), then **fly** over Chilliwack beaming locals.

**Tone:** absurd cheesy comedy.  
**Pilots:** **Zakk** (all-black western, flat cap, aviators, mustache) & **Tayler** (backwards maroon cap, aviators, plaid, stubble).

## How to run

No build step. Vanilla HTML / CSS / JS + Canvas.

```bash
cd mothership
npm start
# then open http://localhost:5173
```

Or: `npx serve .` / `python3 -m http.server 8080` / open `index.html`.

Works in modern Chrome / Safari; phone landscape supported (pad + USE / BEAM). Touch controls sit above the iOS Safari chrome / home indicator (`safe-area-inset-bottom`).

## Game flow

1. **Title (car stereo)** — click / tap / Enter / Space on the cassette or slot to **insert**; theme starts; play count increments (`recordPlay`)
2. **SHED** — spawn by the **El Camino**; walk to **Tayler** and press each step (not one auto-cutscene):
   1. **get high with T**
   2. **roll joint** (paper + weed animation)
   3. **light the joint**
   4. **Smoke the joint**
   5. **UFO** appears / lands in the framed shed window → door unlocks when landed → EXIT
3. **YARD** — mothership waiting (legs extended); **sit in the driver’s seat** — legs tuck on takeoff
4. **FLY** — free L/R/U/D over Chilliwack (**no auto-scroll**); beam while flying (**USE = beam** in fly)
5. **Results** — Enter from fly, or hull reaches 0 (theme keeps playing until title)

Mode path: `title (insert cassette) → shed (Tayler presses → UFO land) → yard (board/sit→legs tuck) → fly → results`  
HUD modes: **SHED / YARD / FLY**.

There is **no** shed cassette-hunt / shed-stereo play gate — music already started from the menu stereo. Door stays locked until `windowUfo` has landed.  
Shed/yard walk is ~1.8× snappier (still controllable). UFO `legExtend`: 1 on ground / window land, animates to 0 on yard→fly takeoff, stays 0 in fly.

## Controls

**Beam UI:** the BEAM touch button (and beamed counter) only appear in **FLY** mode — after you sit in the driver’s seat. Shed / yard hide Beam controls.


| Action | Desktop | Touch |
|--------|---------|--------|
| Insert cassette (title) | Click tape/slot · Enter · Space | Tap tape/slot |
| Walk (shed/yard) | ← → or A D | On-screen ◀ ▶ |
| Jump (shed/yard) | Space | ▲ (when not at a door/prop) |
| Tayler steps / enter / sit | ↑ / W / E / Enter / Space | USE (label follows step) |
| **Fly** L/R/U/D | Arrow keys or WASD | Pad |
| **Beam** (while flying) | Space / B / E (hold ok) | BEAM or USE |
| End mission | Enter (fly) only | — (USE beams in fly) |
| Mute | M or 🔊 | 🔊 |

## Shed UX

- Plywood studs / rafters vibe (garden-shed density): shelves with jars & seed trays, soil bags, hose, trash bin, orange sled in the rafters, lawnmower, garden wagon, pegboard, pots, cords, junk piles, posters.
- Major prop: life-sized dusty copper/bronze **El Camino** (hood ~chest height, chrome grille/bumper, black roof) — barn-find project car. Walk path stays in front of it.
- Start next to the Camino; lounge / **Tayler** mid-shed; EXIT on the right.
- Explicit on-world prompts + USE button labels for each Tayler step; staged props (paper, weed pinch, joint, lighter flame, smoke).
- Darker, dusty shed (soft haze / motes, readable). Large **framed** backyard window (wood frame + mullions) shows backyard + Cheam (**unlabeled**) + UFO fly-in → land (legs deploy), clipped inside the glass.
- Door locked until landed.

## Beam rules

- **People** (green halo): Local, Tourist, Fried Chicken Fan, Corn Farmer, Cheam Hiker, Vedder Floater → **score**  
- **Pets / other** (red ⚠): Dog, Cat, Chicken, Lawnmower, Trash Can, Mailbox → **hull damage** (lives down, shake, red flash)  
- Optional Moon Juice widens the beam  

## Chilliwack flavour / geography

Flight scrolls **RIGHT = south** when **you** fly right (camera/world is player-driven — no auto-scroll). Flying left reveals back toward north. Camera faces roughly south:

1. North Chilliwack  
2. Downtown / Yale Road  
3. Vedder Farmland  
4. South Chilliwack  
5. Cultus Lake Direction  

**Mt. Cheam (Lhílheqey)** is always visible toward the **EAST** = **LEFT side of the skyline** (slow parallax, never leaves the frame). Lady / Knight / Welch sit as secondary silhouettes. **No nameplate** — iconic pyramid + snow cap only. **West is behind the viewer** (right of screen).

## Music

Inserting the cassette into the **title car stereo** starts `assets/mothership-theme.mp3` (relative path for GitHub Pages) on loop for the **rest of that run** (shed + yard + fly + results). Music starting does **not** by itself land the UFO — that happens after the **Smoke the joint** step.

**iOS/Safari:** `playTheme()` calls `el.play()` **synchronously** in the cassette-insert / Start gesture stack. `unlock()` only resumes AudioContext — it never play/pause-primes the theme element (that burned the gesture). Theme `<audio id="theme-audio" playsinline loop preload="auto">` in `index.html`. Mute still pauses theme + SFX; theme continues the rest of the run; stops only on **title**.

## Art notes

- Mothership: clean metallic sci-fi saucer (brushed chrome, glass dome, polished rim lights) — clearly larger than Zakk & Tayler when landed. Shared across window / yard / fly.
- El Camino: copper/bronze metallic body, black vinyl roof, chrome grille/bumper, dual headlights, realistic tires/hubcaps (shed side view).
- Zakk & Tayler sprites use a taller default scale (~1.48×) so they dominate shed/yard room height; shed furniture is slightly scaled down.  
- Character refs: flat cap + aviators + mustache (Zakk); backwards maroon cap + aviators + plaid (Tayler).
- Style aim: richer canvas lighting/shading/materials (not flat childish shapes) while staying procedural 2D.
- Title UI: dash-deck vintage stereo (knobs, LCD, cassette slot) with labeled tape.

## File structure

```
mothership/
├── index.html
├── css/style.css
├── js/
│   ├── audio.js      # SFX + theme + mute + iOS unlock
│   ├── world.js      # scenes, Zakk/Tayler sprites, UFO, fly world
│   └── game.js       # modes: title stereo → shed→yard→fly
├── assets/
│   └── mothership-theme.mp3
├── package.json
└── README.md
```

Character refs live under `refs/` for artists (not required to play). Keep gameplay assets only in the shipped tree.

## High score / plays

`localStorage`: `mothership_highscore`. Mute: `mothership_muted`.  
Global play counter increments on cassette insert / start (`recordPlay`).

## License

MIT — fan homage; not affiliated with Retrofit. Procedural Canvas art.

---

## Also in this repo: Hole in the Wall (`tesla-shop/`)

Tesla EV repair shop apprentice sim — greasy hole-in-the-wall shop, FOH check-in, lot fetch, three techs, parts delivery.

```bash
cd tesla-shop
npx serve .
# or open tesla-shop/index.html
```

See [`tesla-shop/README.md`](tesla-shop/README.md).
