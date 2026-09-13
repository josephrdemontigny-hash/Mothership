# Mothership — Chilliwack Skies

Arcade comedy game inspired by Retrofit’s song **“Mothership”**.  
You start in **mom’s shed** (chilling with Tayler), watch a clay UFO land in the backyard, **board together**, insert a **cassette** to start the theme, then **fly** over Chilliwack beaming locals.

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

Works in modern Chrome / Safari; phone landscape supported (pad + USE / BEAM).

## Game flow

1. **Title** → Start  
2. **SHED** — hang with **Tayler**, smoke, leave through the exit door  
3. **YARD** — mothership landing; walk up and board  
4. **BOARDING** cutscene — **both** Zakk & Tayler walk the ramp (Space/Enter/click to skip)  
5. **CASSETTE** — Zakk inserts the tape → **theme music starts** → flight unlocks  
6. **FLY** — free L/R/U/D side-scroller over Chilliwack; beam while flying  
7. **Results** — Enter from fly, or hull reaches 0  

HUD modes: **SHED / YARD / BOARDING / CASSETTE / FLY**.

## Controls

| Action | Desktop | Touch |
|--------|---------|--------|
| Walk (shed/yard) | ← → or A D | On-screen ◀ ▶ |
| Jump (shed/yard) | Space | ▲ (when not at a door) |
| Interact / enter / cassette | ↑ / W / E / Enter / Space | USE |
| Skip boarding cutscene | Space / Enter / click | USE / BEAM |
| **Fly** L/R/U/D | Arrow keys or WASD | Pad |
| **Beam** (while flying) | Space / B (hold ok) | BEAM |
| End mission | Enter (fly) | USE in fly |
| Mute | M or 🔊 | 🔊 |

**Cassette gate:** music and flight controls only after the tape is in (mute still respected).

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

Inserting the cassette starts `assets/mothership-theme.mp3` on loop.  
Mute pauses theme + SFX; unmute resumes if still in flight.  
Theme stops on title / results.

## File structure

```
mothership/
├── index.html
├── css/style.css
├── js/
│   ├── audio.js      # SFX + theme + mute
│   ├── world.js      # scenes, Zakk/Tayler sprites, UFO, fly world
│   └── game.js       # modes: shed→yard→board→cassette→fly
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
