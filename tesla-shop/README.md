# Hole in the Wall — Tesla EV Repair Apprentice (3D)

**3D Animal Crossing–style** walk-around browser game. Soft elevated follow camera, stylized capsule characters, greasy hole-in-the-wall Tesla shop (concrete, grease, pigeons, hoists) — AC *camera & silhouette*, not pastel paradise.

You're the new apprentice. Check in cars with front-of-house, pull them from the lot, and work with the techs — while everyone calls you rook, greenhorn, knucklehead, etc.

## How to run

**Zero build.** Three.js loads from a CDN via an import map. Serve over HTTP (required for ES modules):

```bash
# from this folder (tesla-shop/)
npx serve .
# or
python3 -m http.server 8080
```

Then open the URL shown (e.g. `http://localhost:3000` or `http://localhost:8080`).

Entry: `index.html` — also works on **GitHub Pages** with no build step (same folder as Pages root or nested path).

Files: `index.html`, `styles.css`, `game.js`, optional `layout-ref.jpeg` (satellite lot/building reference).

## Controls

| Device | Move | Interact |
|--------|------|----------|
| Desktop | **WASD** or **arrow keys** (XZ plane) | **E** or **Space** (or Enter) when a prompt appears |
| Mobile / touch | On-screen D-pad (bottom left) | **USE** button (bottom right) |

Other: **?** help · **Esc** closes help / advances dialogue · **Continue** in dialogue boxes.

Proximity prompts: e.g. `Talk to Kim`, `Get WET-Y-01`, `Talk to Moe (parts)`.

## Camera

Elevated soft-angled **third-person follow** (Animal Crossing / diorama vibe) — not FPS. Camera lerps behind-above the player; gentle hemisphere + directional soft shadows.

## How to play

1. Enter a name (or leave blank → **Apprentice**) and **Clock In**.
2. Walk to the **Front Desk** (west side of the shop building). Talk to:
   - **Kim** — water leak (Model Y) → Rolando; then tire/TPMS (Model X) → Won Song
   - **Ryan** — brake service (Model Y) → Won Song; then drive unit (Model 3) → Won Song
   - **Jordan Sham** — 12V / phantom drain diag (Model S) → Nima *(constantly says Yuuh/yuh and interrupts you mid-sentence)*
3. Walk west into the **Customer Lot**, interact with the assigned car (glowing ring + plate). Auto-drive cutscene into the correct bay.
4. Talk to the **right tech**. Wrong tech = roast + redirect.
5. If parts are needed, the tech radios **Moe**. Wait at the bay — Moe walks over (forklift for the drive unit). Talk to Moe when he arrives, then finish with the tech.
6. Complete all **five** jobs → shift complete.

## Layout

```
WEST (left)                                              EAST (right)
┌──────────────┐  door  ┌──────────────────────────────────────────┐
│              │        │  FOH desk: Kim · Ryan · Jordan Sham      │
│  PARKING LOT │  ════  │  Washroom                                │  Bays:
│  (cars)      │        │  Parts: Moe + forklift                   │  Nima (N)
│              │        │                                          │  Won Song (middle)
└──────────────┘        └──────────────────────────────────────────┘  Rolando (S)
```

Collision with walls, parked cars, desks, shelves, hoists. Minimap bottom-right.

## Jobs

| Job | FOH | Plate | Bay / tech | Parts |
|-----|-----|-------|------------|-------|
| Water leak / drain clog | Kim | WET-Y-01 · Puddle Princess | Rolando | — |
| Brake service | Ryan | SQK-Y-88 · Squeaky Y | Won Song | Moe (pads/rotors) |
| Tire / TPMS | Kim | FLAT-X9 · Flatliner | Won Song | Moe (tire + TPMS) |
| Drive unit | Ryan | DU-M3-42 · Clunk Cub | Won Song | Moe **forklift** |
| 12V / phantom drain | Jordan Sham | GHST-S7 · Ghost Plaid | Nima | Moe (12V + clips) |

## Characters (stylized 3D)

Player (red shirt apprentice), Kim (gold), Ryan (green + beard), Jordan (blue), Moe (orange + hard hat), Nima (purple, tall swagger), Won Song (red, **short**), Rolando (teal).

## Tone

Classic greasy-shop ribbing: rook, greenhorn, parts-runner, grease-stain, knucklehead, wet-behind-the-ears, idiot. No bigoted slurs.

## Gaps / limitations

- Single loop; no save/load; no audio.
- One active job at a time.
- Car fetch is an auto-drive cutscene (not free driving).
- Repairs resolve through dialogue + stage flags (no physics sim).
- Moe pathing is straight-line (may clip props while delivering).
- Requires network once to load Three.js from CDN (or cache).
