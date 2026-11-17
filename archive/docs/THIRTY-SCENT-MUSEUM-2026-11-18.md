# Thirty-ingredient scent museum and actual public bulletin boards

Preview branch `feat/thirty-scent-museum-20261118`, based on expanded camp/tent preview `58d4c4d`. Keep this off production until approval. The preview root homepage is older than current main UI; never merge it wholesale. Blue Horizon is untouched.

## Exhibit experience

Thirty individual numbered exhibits follow the store catalogue exactly: T1–T10, M1–M10, L1–L10. The original JSON has names but empty single-ingredient descriptions. `scent-exhibits.js` therefore contains newly authored sensory exhibition commentary, not claimed supplier formulas, ingredient analyses, quoted text or therapeutic effects. Each has a specific character, full description, memory association, blending perspective and two related exhibits. T1 is 버가못, M10 is 바이올렛 리프, and L10 is 밤부.

The west TOP wing, east MIDDLE wing and southern LAST wing surround the existing main organ, central collection and blending desk. Following the owner's subsequent request, these thirty bottles are replaced with original ingredient still-life sculptures: individually shaped citrus/apple/berry fruit, cut citrus segments, grapes, seeded strawberry, paired cherries, flowers, herbs, moss, wood, cotton and bamboo. Abstract accords use a wave, soft fabric, resin-like sculpture or powder puff as a visual association, not a claim about their actual formula. The main72 organ and perfume-family collection stay intact. `ingredient-objects.js` uses cached, size-adaptive low-poly geometry and one vertex-colour material, baked into one static draw call. Objects are centered and fitted within each pedestal, with their lowest point resting on its top.

All thirty placards now show ONLY their T/M/L code; the shared 1024-square atlas never draws Korean or English answers. Hotspot labels and proximity headers also show codes, without names. `blind-exhibit-copy.js` provides specifically authored unnamed sensory, pairing and memory clues. Neither approaching an object nor opening its full explanation reveals the ingredient. Only the explicit **향 이름 확인하기** button discloses its Korean/English name and original named commentary. Disclosure is per ingredient and lasts only in the current page session; another exhibit remains hidden. Suggested partner labels remain codes even after revealing the current exhibit. This is an experiential guessing feature, not secrecy against inspecting a public browser bundle. The existing72/30 blending flow remains independently blind and unchanged.

Furniture, collisions, approach points and hotspot reach come from shared `museum-layout.js` data. Exhibit placement has not changed; server collision definitions are unchanged.

Walking close shows the matching text in a scrollable reading card. It can fold, and full reading is available by button. Movement stays active; no automatic modal interrupts the visitor. Mobile card height is limited to keep the character and controls visible. Existing museum/library/café/lobby/camp/tents/Beyond functionality is retained.

## Real bulletin boards

Museum, library and café public boards read the actual published homepage guestbook. Nine posts per page, nickname, Korean date/time, like count and comment count are shown; actual post text also paints onto the 3D board surface. Approaching a board loads the latest page and displays real post previews; full reading and pagination open on request. The Solo Project application board stays separate and private application data is never loaded into public boards.

The existing Edge Function allows the production homepage origin, so preview browsers cannot call it directly. `api/archive-public-board.mjs` is a same-origin, read-only Vercel function: fixed existing public endpoint, GET only, publishable key already present in the public website config, no user/admin/visitor token forwarding, strict field allowlist, bounded pages/timeouts and short-lived request deduplication. No service-role credentials, schema changes, RLS changes or hosted Edge deployment. A preview can read published posts without writing production data. The local source server calls the same helper. Vercel auto-detects the root `/api/*.mjs` function; it is not copied as static source into the output directory.

Public fields exposed: id, body, nickname, category, color, animal, created_at, hearts, comments. Fields such as admin_reviewed_at, editable, contact details and internal metadata are not forwarded. User text is escaped in DOM and drawn as plain text on canvas. The function cannot submit, edit, delete or like posts. A link takes visitors to the actual homepage guestbook to write; existing in-game experimental notes remain available with clear session-only labeling in the isolated preview.

## Verification

- 49 unit/protocol tests: 30 exact catalogue IDs/codes and complete copy; unnamed brief/full cards contain none of the30 Korean/English ingredient names or named partners; explicit reveal renders the correct answer; every botanical object is bounded/finite and shares one material; safe paths and pedestal collisions; existing public-board, café, permissions, network, tent and persistence coverage.
- `tests/thirty-museum-browser.mjs`: physically walk all30, verify unnamed proximity descriptions, open full T1 explanation without revealing, explicitly reveal T1 in the modal and T5 on mobile, ensure next exhibits stay unnamed, verify one guide instance, read live published posts, compare endpoint text and paginate, desktop/390×844 screenshots, zero corrections/browser errors/production writes.
- `tests/botanical-render.mjs`: render all30 original still-life objects for visual inspection. World render: museum55 static draws /65262 triangles; full rendered room cycles return to identical61 geometries /23 textures. Development-PC sample approximately59FPS; not physical-phone certification. Existing camp remains77 static draws.
- Build and preview packaging; minified preview flows verified separately before delivery. Public board source initially returned11 published posts across2 pages; counts can change as visitors post.

QA artifacts are ignored under `archive/.local/thirty-museum-review/`, `.local/botanical-review/` and `.local/gallery-review/`. No production release, no production mutation and no Blue Horizon changes. Latest successor branch: `feat/blind-botanical-exhibits-20261118`.
