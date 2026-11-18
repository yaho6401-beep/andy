# Archive stability and lightweight visual polish

Baseline: production main `e6b25a2a5e005b3060fc3eef94a6fd9ec75d0eed`.
This patch targets the published garden/lobby/scents/books/cafe implementation.
The separate unpublished 3.0 checkout and Blue Horizon are outside this patch.

## Corrections

- Long cafe interaction labels expanded the action dock over the joystick on mobile. Constrain its width, wrap text and align action buttons to the right.
- Invalid/blocked local storage no longer prevents entry, appearance selection or private-thought settings. Saved thought lines are validated before use.
- Dispose replaced/departed avatars and NPC geometry and owned shadow materials, preserving shared materials. Rebuild avatars when appearance changes and refresh nickname labels.
- Merge rigid avatar parts per joint/material while keeping walk/sit/emote joints independent.
- Clear movement on focus, backgrounding, blur and lost pointer capture. Recover a back/forward-cache page with a fresh connection.
- Prevent repeated portal requests while a transition is awaiting acknowledgement; recover its pending state after a timeout.
- Advance cafe countdown using the latest server clock offset between snapshots.
- Ignore late responses from previous shared-transport generations, reset reconnect caches, guard duplicate connect calls and bound host login requests with a timeout.
- Ignore obsolete local WebSocket callbacks and malformed frames. Surface admission refusal back to the entry UI.
- Match the initial low-quality setting to actual pixel ratio/shadow settings. Reuse frame vectors; reduce sign texture pixels and environment sphere/cylinder complexity.

## Visual changes

Subtle daylight/interior exposure adjustments, garden stone edging and plants, lobby reception details and fountain inlay, exhibit numbering/blotters, book-spine details and cushions, cafe slatted counter/house menu and flowers above table height. These are static merged decorations on existing furniture/walls/beds; existing authoritative furniture collision layout is unchanged.
Refresh the four existing homepage lounge preview photographs using the actual scene renderer.

## Verification

- `npm test`: **25/25** passed, including 20 local WebSocket clients, capacity/duplicate admission, swept collisions, private whispers, owner moderation, order/pickup/nearest serving slot and shared state serialization.
- New regression coverage: corrupted/unavailable storage, clock-offset countdown, avatar disposal/animation, stale shared-session responses and idempotent action retry batches.
- `node scripts/verify-client.mjs`: mobile viewport 390x844, 24 appearance changes, actual joystick walking through garden → lobby → scents → lobby → books → lobby → cafe; 30-second order → pickup → movement → placement, focus stops movement, no page errors. Disabled storage entry also passed.
- Observed cafe viewport ~60 FPS / 99 draw calls in desktop Edge mobile emulation before the final reduction in environment geometry. This is not a physical-phone benchmark or a guarantee for 20 visible 3D avatars.
- Three repeated complete room cycles after geometry reduction: cafe 85 draw calls / 45,204 triangles; memory stable at 86 geometries / 13 textures in the isolated scene capture harness.
- `npm run build` and `node scripts/package-public.mjs`: passed.

The 20-client load check is local WebSocket only, not a Supabase production load test. No database migration, production Edge Function deployment, stored customer application/note mutation or paid service creation is part of this change. Review through the feature branch preview before production promotion.
