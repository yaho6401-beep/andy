# Spacious camp and walk-in tents

Branch `feat/spacious-camp-tents-20261118`, based on the expanded lobby/café/camp preview `842b985`. Preview only: production homepage, database, hosted multiplayer and original separate camp-reading service are unchanged. Do not merge this branch's older root homepage over current production UI. Blue Horizon was not accessed.

## Visitor flow

Walk from the existing lobby doorway into the same-avatar camp. The land is now 30 × 26 metres, compared with the earlier 15.8 × 14.8-metre upper ground, approximately 3.3 times the footprint. The existing fire and six log seats retain their IDs and positions. A sea-view promenade, wider trails and boundary forest separate two 6 × 6.4-metre tents: 문장의 텐트 and 달빛 텐트. The return gate and arrivals are moved together to the enlarged southern entrance.

Both tents are part of the same camp scene, not separate pages. Walk through the real 2.6-metre opening. Side/back/front-wing cloth remains solid for movement validation. Near the cabin, roof/front cloth fades; low side/back walls retain more opacity so the interior remains legible. Inside, the camera eases closer and the place name changes. Departure restores cloth and the outside view. Reduced-motion users get immediate cloth state updates with no flame/wave oscillation.

Each tent has a rug, two reading cushions, low book table and lantern. Cushion sit/stand/private-thought behavior reuses the existing system. Each tent has a distinct whisper group; visitors in the other tent do not receive its whispers. Book interactions use the existing original/catalogue cards. No new database records or book-content services are created.

## Shared layout and performance

`camp/layout.js` is the single source for bounds, gate, spawn, tent dimensions, walls, tables and seats. Client pathfinding and server movement validation use it. Cloth remains a small set of dynamic meshes; flat-color geometry merges by material. No new model downloads, texture packs, physics engines, extra canvases or permanent servers. Scene-owned cloth materials, label textures and merged buffers are disposed on room departure. Client diagnostics expose only geometry/cutaway state, never tokens or private chat.

## Verification

- All 41 unit/protocol tests: expanded boundaries; safe portals; real paths into/out of both tents; solid walls; cushion approaches; separate whisper audiences; authoritative wall rejection; existing café/order/permission/persistence tests; local 20-client WebSocket protocol test.
- `tests/camp-tents-browser.mjs`: keyboard walking from lobby, both tents entered and exited, roof fade/restoration, both cushion seating/private thoughts, new sea promenade beyond old boundaries, return to lobby with the same avatar. Desktop and 390 × 844 screenshots. No production API requests and no server corrections.
- `tests/gallery-render.mjs`: static scene budgets, sample camp FPS, and five full rendered room cycles including entered/faded tents to verify GPU resource disposal. These are development-machine measurements, not physical-phone certification.
- Browser build and static preview packaging. Existing 72/30 composition and enlarged lobby/café are retained; the current review transport remains isolated single-player.

Ignored screenshots and result files: `archive/.local/camp-tents-review/` and `archive/.local/gallery-review/`.
