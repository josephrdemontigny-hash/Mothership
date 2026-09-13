# Mothership — Chilliwack Skies

Arcade flyer MVP inspired by Retrofit’s song **“Mothership”**.  
You pilot a clay/cartoon UFO over **Chilliwack, BC / Fraser Valley**, beam up ground targets for points, and dodge birds, towers, mountains, and rival UFOs.

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

Works in modern Chrome / Safari; phone landscape is supported (on-screen pad + BEAM button).

## Controls

| Action | Desktop | Touch |
|--------|---------|--------|
| Steer | Arrow keys or WASD | On-screen ◀▶▲▼ |
| Beam up | Space | BEAM button / tap right side of canvas |
| Mute | M or 🔊 button | 🔊 button |
| Start / again | Start button or Enter / Space | Tap buttons |

**Moon Juice** power-up: temporary wider beam + slight speed boost (cyan bottle / orb).

## Chilliwack landmarks (in-game)

The scrolling world cycles labelled districts — not a generic city:

- **Downtown / Yale Road** — road stripe, storefront blocks, Yale Rd sign
- **Highway / Suburban Blocks**
- **Farmland / Corn** — corn rows, U-Pick sign
- **Vedder River** — winding blue river
- **Cultus Lake Direction** — lake ellipse + “→ CULTUS LAKE”
- **Cheam Peak / Coast Mountains** — mountain silhouette + snowcaps on the horizon always

Ground targets include locals, tourists, fried-chicken fans, corn farmers, Cheam hikers, Vedder floaters — with cheesy one-liners (chicken, microplastics, moon juice).

## File structure

```
mothership/
├── index.html          # shell + screens + HUD
├── css/style.css       # layout, title/results, touch UI
├── js/
│   ├── audio.js        # Web Audio beeps + mute (localStorage)
│   ├── world.js        # Chilliwack districts, targets, hazards, drawing
│   └── game.js         # loop, UFO, beam, score/lives, high score
├── package.json        # npm start / npm run dev → serve
└── README.md
```

Tweak copy in `js/world.js` (`ONE_LINERS`, `RESULTS_LINERS`, `DISTRICTS`, `TARGET_KINDS`) and UI strings in `index.html`.

## High score

Stored in `localStorage` under `mothership_highscore`. Mute preference: `mothership_muted`.

## Suggested next features

- **Garage intro** — short pre-flight cutscene of Zakk & T climbing into the clay UFO
- **Chicken operating table** — bonus mini-scene after beaming a fried-chicken target
- **Guitar shred** — score-multiplier moment / boss fanfare with chiptune shred
- More Fraser Valley POIs (Promontory, Sardis, Bridal Falls)
- Local co-op: Zakk steers, Taylor beams (or vice versa)

## License

MIT — fan homage; not affiliated with Retrofit. No paid assets; all art is procedural Canvas drawing.
