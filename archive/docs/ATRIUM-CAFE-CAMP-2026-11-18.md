# Expanded atrium, scent café and integrated camp

Preview branch: `feat/atrium-cafe-camp-20261118`. Built on the spacious-gallery preview (`1db4492`), not the older production homepage. This branch must not be merged wholesale into production: the current production homepage has newer independent UI work.

## Spaces and preserved behavior

- Lobby: 30 × 28 metres, 7.2-metre cutaway ceiling. Central perfume fountain, welcome desk, small scent collection, original Solo Project application board, benches, daylight windows and separate entrances for garden, museum, library, café and camp.
- Café: 30 × 28 metres, 6-metre cutaway ceiling. Wide central circulation, 8-person and 6-person rectangular tables, 4-person and 2-person round tables, 4 bar stools, bakery and tea counters, window view and sticky-note wall. Table and seat IDs remain stable. The existing 20-menu, 30-second preparation, pickup, nearest available serving slot, private thoughts, table whispers and host-as-barista behavior are retained.
- Camp: original scene/layout reused from `feat/camp-reading-and-graphics`, commit `afd9cef25cd72ffa4435311b1b1dcd40c3b63413`. One `camp` room within the existing renderer, movement protocol, nickname and avatar session; physical bidirectional door in the lobby. Six fire-circle log seats, sea, tents, forest, animated fire and original sentence board. A tree blocking the new entrance was removed. The original separate camp service and its personal reading records are not migrated or modified; its existing link is retained in Settings.
- Scent museum, library and Beyond remain available. The 72-main/30-blind-note composition remains unchanged.

## Shared navigation and resource ownership

`gallery-layout.js` supplies lobby/café dimensions, fixtures, NPC and door locations. Rendering and collision validation derive from the same layout. `seats.js` preserves table IDs and imports original camp seat positions. `protocol.js` validates real doorway proximity, safe arrival positions, swept movement and camp obstacles. `prepare-edge.mjs` now includes the camp layout in its dependency list; no Edge function was deployed.

Rooms load one at a time. Static gallery furnishings merge by shared material. Camp normalizes indexed geometry before merging, owns its textures/materials/geometries and disposes them on departure. No added large texture/model downloads, postprocessing or permanent paid server. Camp uses one small non-shadow point light. Low graphics mode remains the default.

## Review URLs

- `/archive/?start=lobby`
- `/archive/?start=salon`
- `/archive/?start=camp`
- Existing museum/library direct entries still work; default entry still starts in the outdoor garden.

All direct starts are restricted to the isolated public-demo transport. This review does not assert that a production multiplayer backend has adopted these new room definitions. The preview makes no production Supabase requests; simulated orders and notes do not alter operation data. Production multiplayer integration would require separately approved matching server code deployment.

## Verification

- `npm test`: 38 passing tests, including all-seat approach/stand, every portal's safe destination, all five lobby routes, camp round trip, whisper audience, order timer, host permissions, persistence, old-room packets and 20 local WebSocket connections. The 20-client run is a local protocol test, not Supabase or device performance certification.
- `tests/gallery-browser.mjs`: physical garden → enlarged lobby → museum → enlarged lobby → library, mobile/desktop views and seating; zero corrections and no browser exceptions.
- `tests/gallery-direct.mjs`: 72/30 composition, blind labels, furniture-avoiding tap movement, reading-table sit/stand, zero production API calls.
- `tests/atrium-browser.mjs`: actual walking lobby ↔ camp and lobby ↔ café; same avatar identity; log seating/private thoughts; actual 30-second order, pickup, close serving and round-table sit/stand. 390 × 844 and desktop screenshots. Results are stored in `.local/atrium-review/`.
- Static world-only draw calls: lobby 46, café 40, camp approximately 59; avatars/UI add calls. Five complete room cycles finish at an identical 50 geometries / 17 textures. Development-machine render sample approximately 60 FPS; physical mobile 30 FPS has not been certified.

Production website, production database and Blue Horizon were not modified. Only a Vercel preview is intended for this change.
