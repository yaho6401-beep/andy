# BLUE HORIZON · Grand Promenade

The integrated cruise is expanded from the former 73 m × 17 m composition to a
140 m × 28 m connected vessel. This change affects only the integrated Archive
experience; the independent Blue Horizon source is preserved.

## Space and presentation

- One tapered hull, three lower cabin/balcony rows and a continuous main deck at
  10.2 m. The two upper pavilions remain physically reachable at 14.4 m.
- Lido pool, full-size deck chairs, parasols, ocean bar, observation foredeck,
  stern terrace and a nine-table panoramic dining room. Furniture retains human
  proportions; the walkable floor area grows rather than scaling the avatar.
- Panoramic glazing, thin mullions, structural supports, enclosed lifeboats,
  davits, funnel, communications domes, navigation mast and teak deck seams.
- Canvas dragging changes the view. The optional full-vessel camera pauses
  walking and hides unnecessary controls; selecting a destination resumes the
  ordinary walk-through experience.
- The exterior uses the same length/beam with a separate lightweight mesh. It is
  anchored relative to the existing dock, leaving the authoritative voyage,
  boarding location and return paths unchanged. Background traffic is moved
  farther offshore, outside the full vessel footprint.

## Existing functions

The shared Archive avatar, physical stairs, automatic walking, manual movement,
helm, telescope, seating actions, time-of-day settings, same-origin return,
borrowed books, full-screen reader, bookmarks and notebook excerpts are retained.
No database migration, server protocol change or production data modification is
needed. The village does not load the full cruise interior.

## Performance

Static opaque fittings and static glass are merged by material. Rounded furniture
uses fewer segments. The pool is one small shader surface. No new libraries,
downloaded model packs, dynamic shadows or per-frame reflection passes are added.
The existing DPR cap of 1.35 remains. A small generated environment texture and
shared teak texture improve surfaces without adding network image downloads.

Local Edge/Chromium viewport checks observed approximately 60 FPS, 112–113 draw
calls and 144k triangles at 320, 390, 844 and 1280 px widths. These are desktop
browser measurements with mobile viewports, not physical handset benchmarks.

## Verification

- `npm test`: 327 tests passed, including all ordered pairs of ship destinations,
  continuous stair ascent/descent, furniture/pool exclusions, enlarged hull/dock
  clearance and background shipping separation.
- `node tests/grand-cruise.browser.mjs`: overview, touch camera, readable mobile
  controls, physical stairs, helm and bounded rendering cost.
- `node tests/cruise-reading-walk.browser.mjs`: village borrowing → cruise reading,
  Bible/classic text, bookmarks, full screen, notebook excerpt and all five spaces.
- `node tests/boat-clearance.browser.mjs`: shore/island departures and returns,
  sampled authoritative routes and cruise boarding.

Browser test destinations can be changed with `GRAND_BASE`,
`CRUISE_READING_BASE` and `BOAT_BASE`. Preview tests use isolated `soloPreview=1`
for the village and do not modify customer records.
