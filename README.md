# Mothership — Chilliwack Skies

Arcade comedy game inspired by Retrofit’s song **“Mothership”**.  
You start in **mom’s shed** (chilling with Tayler), **grab a cassette**, watch a clay UFO land in the backyard, **board together**, **insert the tape** into the dash deck to start the theme, then **fly** over Chilliwack beaming locals.

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
2. **SHED** — hang with **Tayler**, **find & grab the cassette** (near the amp), then leave through the exit door (blocked until you have it)  
3. **YARD** — mothership landing; walk up and board  
4. **BOARDING** cutscene — **both** Zakk & Tayler walk the ramp (Space/Enter/click to skip)  
5. **CASSETTE** — cockpit with a **visible cassette deck** on the dash; insert the tape you grabbed → **theme music starts** → flight unlocks  
6. **FLY** — free L/R/U/D side-scroller over Chilliwack; beam while flying  
7. **Results** — Enter from fly, or hull reaches 0 (theme keeps playing until title / new game)

HUD modes: **SHED / YARD / BOARDING / CASSETTE / FLY**. Inventory shows **📼 Cassette** after pickup / **In deck** after insert.

## Controls

| Action | Desktop | Touch |
|--------|---------|--------|
| Walk (shed/yard) | ← → or A D | On-screen ◀ ▶ |
| Jump (shed/yard) | Space | ▲ (when not at a door/prop) |
| Grab cassette / interact / enter / insert | ↑ / W / E / Enter / Space | USE |
| Skip boarding cutscene | Space / Enter / click | USE / BEAM |
| **Fly** L/R/U/D | Arrow keys or WASD | Pad |
| **Beam** (while flying) | Space / B (hold ok) | BEAM |
| End mission | Enter (fly) | USE in fly |
| Mute | M or 🔊 | 🔊 |

**Cassette gate:** must grab the tape in the shed before leaving; music and flight only after it is inserted in the cockpit deck (mute still respected).

## Beam rules

- **People** (green halo): Local, Tourist, Fried Chicken Fan, Corn Farmer, Cheam Hiker, Vedder Floater → **score**  
- **Pets / other** (red ⚠): Dog, Cat, Chicken, Lawnmower, Trash Can, Mailbox → **hull damage** (lives down, shake, red flash)  
- Optional Moon Juice widens the beam  

## Chilliwack flavour

Side-scroller flyover with **Mt. Cheam** + Coast Mountains always readable:

- Downtown / Yale Road  
- Vedder Farmland  
- Vedder River  
- Cultus Lake Direction  
- Mt. Cheam / Coast Mountains  

## Music

Inserting the cassette in the cockpit deck starts `assets/mothership-theme.mp3` on loop for the **rest of that run** (fly + results).  
Mute pauses theme + SFX; unmute resumes if theme is still wanted.  
Theme stops only on **return to title** or **new game** start.

## File structure

```
mothership/
├── index.html
├── css/style.css
├── js/
│   ├── audio.js      # SFX + theme + mute
│   ├── world.js      # scenes, Zakk/Tayler sprites, UFO, fly world
│   └── game.js       # modes: shed(grab tape)→yard→board→cassette→fly
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
