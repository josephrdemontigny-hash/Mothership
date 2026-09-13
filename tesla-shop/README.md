# Hole in the Wall — Tesla EV Repair Apprentice

Walk-around browser game. You're the new apprentice at a greasy, pigeon-haunted Tesla repair shop. Check in cars with front-of-house, pull them from the lot, and work with the techs — while everyone calls you rook, greenhorn, knucklehead, etc.

**This is a top-down walk-around** (WASD + interact), not a click-a-location menu adventure.

## How to run

No build step. Any of these:

```bash
# Option A — open the file
open index.html          # macOS
xdg-open index.html      # Linux

# Option B — local static server (from this folder)
npx serve .
# or
python3 -m http.server 8080
```

Then open the URL shown (e.g. `http://localhost:3000` or `http://localhost:8080`).

Files: `index.html`, `styles.css`, `game.js` — vanilla HTML/CSS/JS + Canvas. Optional `layout-ref.jpeg` is a satellite lot/building reference (lot west, shop east, three bays on the east wall).

## Controls

| Device | Move | Interact |
|--------|------|----------|
| Desktop | **WASD** or **arrow keys** | **E** or **Space** (or Enter) when a prompt appears |
| Mobile / touch | On-screen D-pad (bottom left) | **USE** button (bottom right) |

Other: **?** help · **Esc** closes help / advances dialogue · click **Continue** in dialogue boxes.

Proximity prompts appear when you walk near someone or something, e.g. `Talk to Kim`, `Get WET-Y-01`, `Wait for Moe`.

## How to play

1. Enter a name (or leave blank → **Apprentice**) and **Clock In**.
2. Walk to the **Front Desk** (west side of the shop building). Talk to:
   - **Kim** — water leak (Model Y) → Rolando; then tire/TPMS (Model X) → Won Song
   - **Ryan** — brake service (Model Y) → Won Song; then drive unit (Model 3) → Won Song
   - **Jordan Sham** — 12V / phantom drain diag (Model S) → Nima
3. Walk west into the **Customer Lot**, interact with the assigned car (highlighted + plate). The car auto-drives into the correct bay (cutscene).
4. Talk to the **right tech**. Wrong tech = roast + redirect.
5. If parts are needed, the tech radios **Moe**. Wait at the bay — Moe walks over (forklift for the drive unit). Talk to Moe when he arrives, then finish with the tech.
6. Repeat. Complete all **five** jobs to finish the shift.

## Layout (top-down)

```
WEST (left)                                              EAST (right)
┌──────────────┐  door  ┌──────────────────────────────────────────┐
│              │        │  FOH desk: Kim · Ryan · Jordan Sham      │
│  PARKING LOT │  ════  │  Washroom                                │  Bays:
│  (cars)      │        │  Parts: Moe + forklift                   │  Nima (N / far left)
│              │        │                                          │  Won Song (middle)
└──────────────┘        └──────────────────────────────────────────┘  Rolando (S / far right)
```

Collide with walls, parked cars, desks, shelves, hoists. Minimap is bottom-right.

## Jobs & win conditions

| Job | FOH | Plate / nickname | Bay / tech | Parts | Win |
|-----|-----|------------------|------------|-------|-----|
| Water leak / drain clog | Kim | WET-Y-01 · Puddle Princess (White Model Y) | Rolando | — | Repair complete |
| Brake service (pads/rotors) | Ryan | SQK-Y-88 · Squeaky Y (Pearl White Model Y) | Won Song | Moe delivers pads/rotors | Repair complete |
| Tire puncture / TPMS | Kim | FLAT-X9 · Flatliner (Blue Model X) | Won Song | Moe delivers tire + TPMS | Repair complete |
| Drive unit replacement | Ryan | DU-M3-42 · Clunk Cub (Midnight Model 3) | Won Song | Moe forklift + unit | Repair complete |
| 12V / phantom drain diag | Jordan Sham | GHST-S7 · Ghost Plaid (Red Model S) | Nima | Moe delivers 12V + clips | Repair complete |

**Specialists:** Rolando = water/weather/drains · Won Song = brakes, tires, drive units, heavy mechanical · Nima = electrical / charge / phantom / codes · Moe = parts delivery to bay.

**Shift complete** when all five jobs are done. First loop is ~10 minutes if you know the path.

## Tone

Classic greasy-shop ribbing: rook, greenhorn, parts-runner, grease-stain, knucklehead, wet-behind-the-ears, idiot. Helpful info still comes through. Praise is backhanded. No bigoted slurs.

## Known limitations / gaps

- Single loop; no save/load.
- No audio.
- One active job at a time (FOH will roast you if you already have a live ticket).
- Car fetch is an auto-walk/cutscene into the assigned bay (smoother than escorting).
- Repairs resolve through dialogue + stage flags (no physics sim).
- Moe pathing is a straight-line walk (clips through some props while delivering).
- Decorative lot cars are solid; job cars become walk-around props once parked in a bay.
