# Hole in the Wall — Tesla EV Repair Apprentice

A short browser game: you're the new apprentice at a greasy, pigeon-haunted Tesla repair shop (not a sleek Service Center). Check in cars with front-of-house, pull them from the lot, and work with the techs — while everyone calls you rook, greenhorn, knucklehead, etc.

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

Files: `index.html`, `styles.css`, `game.js` — pure vanilla. Optional `layout-ref.jpeg` is a real-lot reference for the schematic.

## How to play

1. Enter a name (or leave blank → **Apprentice**) and **Clock In**.
2. Go to the **Front Office**. FOH names the **repair type** upfront:
   - **Kim** — water leak (Model Y) → Rolando; then tire/TPMS (Model X) → Won Song
   - **Ryan** — brake service (Model Y) → Won Song; then drive unit (Model 3) → Won Song
   - **Jordan Sham** — 12V / phantom drain diag (Model S) → Nima
3. Take the ticket to the **Customer Lot** (west), get the car, bring it into the correct bay (east wall).
4. Talk to the right tech (wrong specialty = insults + redirect).
5. **Parts flow:** if the tech needs parts, **they radio Moe**. Wait at the bay — Moe delivers (forklift for drive unit). Visiting Parts is optional flavour.
6. Complete all **five** jobs to finish the shift.

**Map keys:** `1`–`9` jump to locations · `?` help · `Esc` closes help.

## Layout (top-down)

```
WEST                         EAST
┌─────────┐  ┌──────────────────────────────┐
│  LOT    │  │  FOH / Parts / Floor         │  Bays on east wall:
│ (cars)  │  │         ┌──────────────────┤  · Nima (far left)
│         │  │         │ Nima | Won | Rol  │  · Won Song (middle)
└─────────┘  └─────────┴──────────────────┘  · Rolando (far right)
```

Schematic is also drawn in the left map panel in-game.

## Jobs & win conditions

| Job | FOH | Plate / nickname | Bay / tech | Parts | Win |
|-----|-----|------------------|------------|-------|-----|
| Water leak / drain clog | Kim | WET-Y-01 · Puddle Princess (White Model Y) | Rolando | — | Repair complete |
| Brake service (pads/rotors) | Ryan | SQK-Y-88 · Squeaky Y (Pearl White Model Y) | Won Song | Moe delivers pads/rotors | Repair complete |
| Tire puncture / TPMS | Kim | FLAT-X9 · Flatliner (Blue Model X) | Won Song | Moe delivers tire + TPMS | Repair complete |
| Drive unit replacement | Ryan | DU-M3-42 · Clunk Cub (Midnight Model 3) | Won Song | Moe forklift + unit | Repair complete |
| 12V / phantom drain diag | Jordan Sham | GHST-S7 · Ghost Plaid (Red Model S) | Nima | Moe delivers 12V + clips | Repair complete |

**Specialists:** Rolando = water/weather/drains · Won Song = brakes, tires, drive units, heavy mechanical · Nima = electrical / charge / phantom / codes · Moe = parts delivery to bay.

**Shift complete** when all five jobs are done. Rep bars track favour with FOH and techs (earned under a layer of hazing).

## Locations

Shop floor · Far left bay (Nima) · Middle bay (Won Song) · Far right bay (Rolando) · Parts (Moe) · Front office (Kim / Ryan / Jordan Sham) · Washroom · Bay doors · Customer lot

## Tone

Classic greasy-shop ribbing: rook, greenhorn, parts-runner, grease-stain, knucklehead, wet-behind-the-ears, idiot. Helpful info still comes through. Praise is backhanded. No bigoted slurs.

## Known limitations

- Single loop; no save/load.
- No audio; atmosphere is text + CSS.
- One active job at a time.
- Repairs resolve through dialogue and stage flags (no physics sim).
- Desktop and mobile layouts supported; very small phones stack the map/status panels.
