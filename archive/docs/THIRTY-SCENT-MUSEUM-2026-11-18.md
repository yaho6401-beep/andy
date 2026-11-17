# Thirty-ingredient scent museum and actual public bulletin boards

Preview branch `feat/thirty-scent-museum-20261118`, based on expanded camp/tent preview `58d4c4d`. Keep this off production until approval. The preview root homepage is older than current main UI; never merge it wholesale. Blue Horizon is untouched.

## Exhibit experience

Thirty individual numbered bottle exhibits follow the store catalogue exactly: T1–T10, M1–M10, L1–L10. The original JSON has names but empty single-ingredient descriptions. `scent-exhibits.js` therefore contains newly authored sensory exhibition commentary, not claimed supplier formulas, ingredient analyses, quoted text or therapeutic effects. Each has a specific character, full description, memory association, blending perspective and two related exhibits. T1 is 버가못, M10 is 바이올렛 리프, and L10 is 밤부.

The west TOP wing, east MIDDLE wing and southern LAST wing surround the existing main organ, central collection and blending desk. Original botanical study objects, different zone colors and numbered/name placards accompany each bottle. All 30 placards share a single 1024-square texture atlas and one material rather than 30 separate draw calls. Furniture, collisions, approach points and hotspot reach come from shared `museum-layout.js` data. The 72/30 blending flow stays blind; explicit names are for the educational museum exhibition requested by the owner.

Walking close shows the matching text in a scrollable reading card. It can fold, and full reading is available by button. Movement stays active; no automatic modal interrupts the visitor. Mobile card height is limited to keep the character and controls visible. Existing museum/library/café/lobby/camp/tents/Beyond functionality is retained.

## Real bulletin boards

Museum, library and café public boards read the actual published homepage guestbook. Nine posts per page, nickname, Korean date/time, like count and comment count are shown; actual post text also paints onto the 3D board surface. Approaching a board loads the latest page and displays real post previews; full reading and pagination open on request. The Solo Project application board stays separate and private application data is never loaded into public boards.

The existing Edge Function allows the production homepage origin, so preview browsers cannot call it directly. `api/archive-public-board.mjs` is a same-origin, read-only Vercel function: fixed existing public endpoint, GET only, publishable key already present in the public website config, no user/admin/visitor token forwarding, strict field allowlist, bounded pages/timeouts and short-lived request deduplication. No service-role credentials, schema changes, RLS changes or hosted Edge deployment. A preview can read published posts without writing production data. The local source server calls the same helper. Vercel auto-detects the root `/api/*.mjs` function; it is not copied as static source into the output directory.

Public fields exposed: id, body, nickname, category, color, animal, created_at, hearts, comments. Fields such as admin_reviewed_at, editable, contact details and internal metadata are not forwarded. User text is escaped in DOM and drawn as plain text on canvas. The function cannot submit, edit, delete or like posts. A link takes visitors to the actual homepage guestbook to write; existing in-game experimental notes remain available with clear session-only labeling in the isolated preview.

## Verification

- 47 unit/protocol tests: 30 exact catalogue IDs/codes and complete copy; safe path to every exhibit; pedestal collision; public-only field sanitization, hidden-row removal, fixed GET upstream, cache coalescing/expiry, retry, POST rejection, bad-page rejection and HTML escaping; existing café/permissions/network/tent/persistence tests.
- `tests/thirty-museum-browser.mjs`: physically walk all 30 exhibits, confirm each exact matching guide, open full T1 commentary, verify one guide instance, read live published posts at the museum board, compare actual endpoint text, paginate, desktop/390×844 screenshots, zero server corrections/browser errors and no production writes.
- World render: museum54 static draws /30686 triangles; full rendered room cycles return to identical60 geometries /23 textures. Development-PC sample approximately58FPS; not physical-phone certification. Existing camp remains77 static draws.
- Build and preview packaging; minified preview flows verified separately before delivery. Public board source initially returned11 published posts across2 pages; counts can change as visitors post.

QA artifacts are ignored under `archive/.local/thirty-museum-review/` and `.local/gallery-review/`. No production release, no production mutation and no Blue Horizon changes.
