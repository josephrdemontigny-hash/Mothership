# Mothership — Chilliwack Skies

Arcade comedy game inspired by Retrofit’s song **“Mothership”**.  
You start in **mom’s shed** (chilling with Taylor), watch a clay UFO land in the backyard, board it, **fly** from the **cockpit**, then drop into **Beam Mode** to abduct Chilliwackians.

**Tone:** absurd cheesy comedy, green B-movie aliens (the band in bad costumes).  
**Pilots (copy/UI):** Zakk & Taylor (T).

## How to run

No build step. Vanilla HTML / CSS / JS + Canvas.

**Option A — open the file**

```bash
open index.html
# or double-click index.html in a file browser
```

**Option B — static server (recommended)**

```bash
cd mothership
npm start
# or: npm run dev
# then open http://localhost:5173
```

Or any static server:

```bash
npx serve .
python3 -m http.server 8080
```

Works in modern Chrome / Safari; phone landscape is supported (on-screen pad + USE / BEAM).

## Game flow

1. **Title** → Start  
2. **SHED** (tight side-scroller) — hang with **Taylor**, smoke, leave through the nearby exit door  
3. **YARD** (side-scroller) — mothership landing beat (lights + fog), walk up and **enter** the UFO  
4. **COCKPIT** — full 2D flight (bank / climb / dive); dodge birds, towers, power lines; theme song plays  
5. **BEAM** — separate side-scroller mode; align over ground targets and beam them up  
6. Exit beam → cockpit again, or **Enter** from cockpit for mission debrief / results  

HUD mode label always shows: **SHED / YARD / COCKPIT / BEAM**.

## Controls

| Action | Desktop | Touch |
|--------|---------|--------|
| Walk (shed/yard) | ← → or A D | On-screen ◀ ▶ |
| Jump (shed/yard) | Space | ▲ (when not at a door) |
| Interact / enter | ↑ / W / E / Enter | USE button |
| **Fly — bank** | ← → or A D | ◀ ▶ |
| **Fly — climb / dive** | ↑ ↓ or W S | ▲ ▼ |
| **Boost** | Shift (stronger with Moon Juice) | — |
| Beam Mode on/off | **B** (cockpit ↔ beam) | BEAM (cockpit) / USE (exit beam) |
| Fire beam | Space (in Beam Mode) | BEAM button |
| End mission | Enter (cockpit) | USE in cockpit |
| Mute | M or 🔊 button | 🔊 button |
| Start / again | Start button or Enter / Space | Tap buttons |

**Moon Juice:** random cockpit power-up — wider beam + stronger Shift boost while it lasts.

**Cockpit hazards:** birds, radio towers, power lines. Collisions cost a life (−75 score, screen shake). Three lives.

## Music

Boarding the mothership (`enterCockpit`) starts `assets/mothership-theme.mp3` on loop.  
Mute pauses/stops playback; unmute resumes if you are still in cockpit or beam.  
Theme stops on title, results, or ending the mission.

## Chilliwack flavour

Cockpit windows and Beam Mode show scrolling Fraser Valley vibes (not a top-down map):

- Downtown / Yale Road  
- Farmland / Corn  
- Vedder River  
- Cultus Lake Direction  
- Cheam Peak / Coast Mountains  

Ground targets: locals, tourists, fried-chicken fans, corn farmers, Cheam hikers, Vedder floaters — with cheesy one-liners (chicken, microplastics, moon juice).

## File structure

```
mothership/
├── index.html          # shell + screens + HUD
├── css/style.css       # layout, title/results, touch UI
├── js/
│   ├── audio.js        # SFX beeps + theme music + mute
│   ├── world.js        # Shed / yard / cockpit / beam drawing + copy
│   └── game.js         # modes, avatar, landing, flight, beam, score
├── assets/
│   └── mothership-theme.mp3
├── package.json        # npm start / npm run dev → serve
└── README.md
```

Tweak copy in `js/world.js` (`ONE_LINERS`, `RESULTS_LINERS`, `SHED_GAGS`, `TARGET_KINDS`, `DISTRICTS`) and UI strings in `index.html`.

## High score

Stored in `localStorage` under `mothership_highscore`. Mute preference: `mothership_muted`.

## Suggested next features

- Chicken operating table bonus after beaming a fried-chicken target  
- Guitar shred score-multiplier / boss fanfare  
- More Fraser Valley POIs (Promontory, Sardis, Bridal Falls)  
- Local co-op: Zakk steers, Taylor beams  

## License

MIT — fan homage; not affiliated with Retrofit. No paid assets; all art is procedural Canvas drawing.
