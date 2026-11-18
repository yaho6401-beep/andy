# Spacious scent museum and reading lounge — review build

This branch upgrades the existing 3.0 review (`d18890c`), retaining its original avatars, garden, lobby, café, camp link, personal Beyond world and interactions. It is not a production release. Blue Horizon is untouched.

## Spaces

- Scent museum: 28 × 24 versus the old 16 × 16 floor (2.625× area), 6.2-high cutaway architecture, elevated clerestory beams, landscape windows, stone floor, five independent scent-family exhibits, 72-bottle organ, 30 blind-note display and mixing desk. The curator stands well inside the left wing.
- Reading lounge: 30 × 26 floor (3.047× area), 6.8-high architecture, tall wall shelves, two low independent stacks, recommended-book island, central sofa area, two window sofas, a six-seat shared reading table, sticky-note wall and the existing Beyond portal.
- Original book information, original illustrations and procedural window landscapes are used; no third-party book-cover art or quoted prose was added.
- Exhibition models use physical proportions rather than scaling the old furniture. Natural perspective follows the visitor in the two new rooms; the other rooms retain their quarter-view camera.

## Interaction and collision

`gallery-layout.js` is shared by the mesh builder, collision bounds, café/reading seats, pathfinding and local authoritative store. The museum's return gate is x=13.2, the library's is x=-14.2. Lobby return spawns and gate directions are preserved. Desk, shelf, chair, island and column obstacles are swept-validated.

Tap walking uses a bounded grid search and swept line-of-sight smoothing. Keyboard or joystick input cancels a tap path. Dragging rotates the view, and camera distance/reset and low/standard quality controls remain available.

All 72 main scents and T1–T10/M1–M10/L1–L10 combinations retain their original IDs and reveal behavior. Reading-table and window seats use the existing auto-sit, stand and private-thought behavior. The original local server, room chat, whispers, café ordering and host controls remain implemented.

## Review isolation and later multiplayer rollout

This branch sets `ArchiveDemoConfig.mode = "gallery-review"`. On a public preview it always uses a browser-local PublicDemoTransport: no shared guest session, admin password, analytics, production function calls or persistent room data. `/archive/?start=scents` and `?start=books` offer immediate room entry after choosing a nickname/avatar.

The solo application opens an explicit link to the current production application, rather than silently posting from the review build. The site and database are not modified. For local multiplayer only, use `?localMultiplayer=1` on localhost; this flag cannot enable the local-server branch on a public domain.

The larger collision geometry must be deployed to the authoritative backend together with a later shared release. `prepare-edge.mjs` includes the new shared layout dependency. Do not merge the frontend alone into production or point it at the old room geometry. No Edge Function or database changes have been deployed.

## Performance

No new model or texture downloads. Original GLB assets are reused. Stone, wood, landscape and contact shading textures are generated at 256×256 and cached. Static meshes, including shared textured surfaces, are merged by material. Default quality has no real-time shadows, postprocessing or expensive transparent glass.

Same-camera static room rendering in headless Edge on the development PC:

| Room | Previous draws | New draws | Previous triangles | New triangles |
|---|---:|---:|---:|---:|
| Museum | 72 | 44 | 105,318 | 18,152 |
| Library | 68 | 51 | 105,192 | 17,374 |

Five repeated all-room rebuild cycles hold stable at 44 geometries / 17 textures when ending in the museum. The two-second rendering sample is approximately 60 FPS. Active-avatar/NPC calls are additional. These are development-PC measurements, not a physical-phone or 20-phone load certification.

## Validation

- `gallery-layout.test.mjs`: bounds, all fixture collisions, swept routes to every exhibit, doors and every reading seat's safe stand position.
- `gallery-browser.mjs`: actual walking through garden → lobby → museum → lobby → library; mobile/desktop screenshots, scent interaction, window-seat sitting and standing, no page errors.
- `gallery-direct.mjs`: both direct entries, tap movement around a blocked route, 72/30 combination UI, blind T1 selection and reveal, new reading-table seat, mobile layout, zero production API requests.
- `gallery-render.mjs`: old/new draw counts and triangles, five resource-lifecycle cycles and a frame sample.
- Existing café-social (9), client-reliability (5), room-store (8) plus gallery-layout (2) unit tests pass. One old cabinet-coordinate assertion was updated to the moved cabinet position.
- Browser bundle and public packaging succeed. The private Beyond build is retained.

Run the source locally with `ARCHIVE_PORT=4184 node server/dev-server.mjs` (localhost only). Existing dev servers on 4173/4174 are not stopped or replaced.
