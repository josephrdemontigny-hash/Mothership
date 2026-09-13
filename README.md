# Mothership — Chilliwack Skies

Arcade comedy game inspired by Retrofit’s song **“Mothership”**.  
You start in **mom’s plywood shed** (El Camino project car, dense garden clutter, chilling with Tayler), **grab a cassette**, **play it on the stereo** (theme starts), watch the clay UFO land through the big shed window, step outside and **sit in the driver’s seat**, then **fly** over Chilliwack beaming locals.

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

1. **Title** → Start  
2. **SHED** — hang with **Tayler** in a densely cluttered shed; **grab the cassette**, bring it to the **stereo / boombox** and **PLAY**; theme starts; watch the **UFO fly in / land** through the large backyard window; leave through EXIT (locked until landed)  
3. **YARD** — cooler mothership is landed; walk up and **sit in the driver’s seat** (no cockpit cassette step, no boarding cutscene)  
4. **FLY** — free L/R/U/D side-scroller over Chilliwack; beam while flying  
5. **Results** — Enter from fly, or hull reaches 0 (theme keeps playing until title / new game)

Mode path: `title → shed (grab→stereo→watch land) → yard (board/sit) → fly → results`  
HUD modes: **SHED / YARD / FLY**. Inventory shows **📼 Cassette** while holding / **📼 Playing** after stereo insert.

## Controls

**Beam UI:** the BEAM touch button (and beamed counter) only appear in **FLY** mode — after you sit in the driver’s seat. Shed / yard hide Beam controls.


| Action | Desktop | Touch |
|--------|---------|--------|
| Walk (shed/yard) | ← → or A D | On-screen ◀ ▶ |
| Jump (shed/yard) | Space | ▲ (when not at a door/prop) |
| Grab / play stereo / enter / sit | ↑ / W / E / Enter / Space | USE |
| **Fly** L/R/U/D | Arrow keys or WASD | Pad |
| **Beam** (while flying) | Space / B / E (hold ok) | BEAM or USE |
| End mission | Enter (fly) only | — (USE beams in fly) |
| Mute | M or 🔊 | 🔊 |

**Stereo gate:** grab tape → insert/play on shed stereo (same user gesture starts music for iOS/Safari) → wait for UFO to land → exit → sit in driver’s seat to fly (mute still respected).

## Shed UX

- Plywood studs / rafters vibe (garden-shed density): shelves with jars & seed trays, soil bags, hose, trash bin, orange sled in the rafters, lawnmower, garden wagon, pegboard, pots, cords, junk piles, posters.
- Major prop: life-sized dusty copper/bronze **El Camino** (hood ~chest height, length dominates the left/mid shed) — barn-find project car. Walk path stays in front of it.
- Cassette (▲ GRAB) sits in the **Camino-end** clutter; stereo (▲ PLAY ON STEREO) is a **long walk** toward the exit — not next to each other.
- Darker, dusty shed (soft haze / motes, readable). Large backyard window shows UFO fly-in → land.
- Inventory shows holding cassette until inserted; door prompt “wait for it to land…” while approaching/descending.
- Clear walk path: El Camino (left) → cassette / stereo (mid) → lounge → EXIT (right).

## Beam rules

- **People** (green halo): Local, Tourist, Fried Chicken Fan, Corn Farmer, Cheam Hiker, Vedder Floater → **score**  
- **Pets / other** (red ⚠): Dog, Cat, Chicken, Lawnmower, Trash Can, Mailbox → **hull damage** (lives down, shake, red flash)  
- Optional Moon Juice widens the beam  

## Chilliwack flavour / geography

Flight scrolls **RIGHT = south** (camera faces roughly south):

1. North Chilliwack  
2. Downtown / Yale Road  
3. Vedder Farmland  
4. South Chilliwack  
5. Cultus Lake Direction  

**Mt. Cheam (Lhílheqey)** is always visible toward the **EAST** = **LEFT side of the skyline** (slow parallax, never leaves the frame). Lady / Knight / Welch sit as secondary silhouettes. **No nameplate** — iconic pyramid + snow cap only. **West is behind the viewer** (right of screen).

## Music

Inserting the cassette into the **shed stereo** starts `assets/mothership-theme.mp3` (relative path for GitHub Pages) on loop for the **rest of that run** (shed landing watch + yard + fly + results).  

**iOS/Safari:** `playTheme()` calls `el.play()` **synchronously** in the USE/E/Enter/touch handler (same user-gesture stack). `unlock()` only resumes AudioContext — it never play/pause-primes the theme element (that burned the gesture). Theme `<audio id="theme-audio" playsinline loop preload="auto">` in `index.html`. Mute still pauses theme + SFX; theme continues the rest of the run; stops only on **title** or **new game**.

## Art notes

- Mothership: clean metallic sci-fi saucer (brushed chrome, glass dome, polished rim lights) — clearly larger than Zakk & Tayler when landed. Shared across window / yard / fly.

- Zakk & Tayler sprites use a taller default scale (~1.48×) so they dominate shed/yard room height; shed furniture is slightly scaled down.  
- Character refs: flat cap + aviators + mustache (Zakk); backwards maroon cap + aviators + plaid (Tayler).

## File structure

```
mothership/
├── index.html
├── css/style.css
├── js/
│   ├── audio.js      # SFX + theme + mute + iOS unlock
│   ├── world.js      # scenes, Zakk/Tayler sprites, UFO, fly world
│   └── game.js       # modes: shed→yard→fly
├── assets/
│   └── mothership-theme.mp3
├── package.json
└── README.md
```

Character refs live under `refs/` for artists (not required to play). Keep gameplay assets only in the shipped tree.

## High score

`localStorage`: `mothership_highscore`. Mute: `mothership_muted`.

## License

MIT — fan homage; not affiliated with Retrofit. Procedural Canvas art.
