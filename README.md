# Mothership — Chilliwack Skies

Arcade comedy game inspired by Retrofit’s song **“Mothership”**.  
You start in **mom’s shed** (chilling with Tayler), **grab a cassette**, watch the clay UFO land through the shed window, step outside and **enter the UFO**, **insert the tape** into the dash deck to start the theme, **sit in the driver’s seat**, then **fly** over Chilliwack beaming locals.

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
2. **SHED** — hang with **Tayler**, watch the **UFO fly in / land** through the backyard window, **find & grab the cassette** (near the amp), then leave through the exit door (blocked until you have it)  
3. **YARD** — UFO is landed or finishing a short settle; walk up and **ENTER** (no boarding cutscene)  
4. **COCKPIT** — visible cassette deck on the dash; **insert the tape** → **theme music starts immediately** → then **sit in the driver’s seat** → flight unlocks  
5. **FLY** — free L/R/U/D side-scroller over Chilliwack; beam while flying  
6. **Results** — Enter from fly, or hull reaches 0 (theme keeps playing until title / new game)

Mode path: `title → shed → yard → cockpit (insert tape) → seat → fly → results`  
HUD modes: **SHED / YARD / COCKPIT / FLY**. Inventory shows **📼 Cassette** after pickup / **In deck** after insert.

## Controls

**Beam UI:** the BEAM touch button (and beamed counter) only appear in **FLY** mode — after you insert the cassette and sit in the driver’s seat. Shed / yard / cockpit hide Beam controls.


| Action | Desktop | Touch |
|--------|---------|--------|
| Walk (shed/yard) | ← → or A D | On-screen ◀ ▶ |
| Jump (shed/yard) | Space | ▲ (when not at a door/prop) |
| Grab cassette / interact / enter / insert / sit | ↑ / W / E / Enter / Space | USE |
| **Fly** L/R/U/D | Arrow keys or WASD | Pad |
| **Beam** (while flying) | Space / B (hold ok) | BEAM |
| End mission | Enter (fly) | USE in fly |
| Mute | M or 🔊 | 🔊 |

**Cassette gate:** must grab the tape in the shed before leaving; music starts on cockpit insert (same user gesture for iOS/Safari); flight only after sitting in the driver’s seat (mute still respected).

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

**Mt. Cheam (Lhílheqey)** is always visible toward the **EAST** = **LEFT side of the skyline** (slow parallax, never leaves the frame). Cheam Range companions sit beside it. **West is behind the viewer** (right of screen) — no Cheam there. Distinctive pyramidal snow-capped Cascade silhouette, labelled occasionally.

## Music

Inserting the cassette in the cockpit deck starts `assets/mothership-theme.mp3` (relative path for GitHub Pages) on loop for the **rest of that run** (fly + results).  

**iOS/Safari:** `audio.play()` is invoked on the **same tick** as the insert key/tap (gesture unlock), not after the insert animation. Theme element is warmed on Start and on shed cassette grab. Mute pauses theme + SFX; unmute resumes if theme is still wanted. Theme stops only on **return to title** or **new game** start.

## Art notes

- Mothership: layered clay/chrome saucer with fins, energy rings, thruster pods, and animated running lights — shared across shed-window preview, yard landing, and flight.

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
│   └── game.js       # modes: shed→yard→cockpit→seat→fly
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
