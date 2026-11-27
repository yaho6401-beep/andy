# Offshore cruise spacing

Move the boarding cruise and its dock 30 world metres farther offshore, preserving the full-size 140 × 28 metre hull. The moored centre follows the shared dock as before, with the same ladder/platform spacing. The approach retains the clear eastern passage around the headlands and returns through the same corridor.

Crossing durations remain 15 seconds from shore and 11 seconds from the small island, including return trips. The greater world distance uses a slightly faster rowboat; neither the hidden garden-map journey nor the existing boarding permission checks change. No new models or textures are loaded.

Both application and `supabase/functions/archive-live/shared/camp/sea-travel-state.js` contain the same route. The live function preserves its downloaded source and existing JWT/application authentication. A real shared-server crossing also exposed a persistence guard that treated offshore riders as land walkers: skip that land relocation for server-owned voyages. A regression serializes/restores every 500 ms in both directions from both ports. Only the route and persistence modules change in the function; all other deployed files remain untouched. No schema or record migration is needed. The old edge-function source is backed up under `.local/offshore-edge-v46-backup.json` for rollback.

Validation covers timed boarding, source parity, both return paths, perspective distance, every headland and shipping-lane clearance. Browser checks compare projected ship height at 390/1280 pixels, capture the sea-bench view, follow a real-time crossing, and enter the cruise. Existing safety tests allow the slightly greater world speed needed to preserve the requested travel time. The boat browser test counts the WebGL canvas directly under `body`, since the navigation chart has its own legitimate 2D canvas.

All existing Node suites are exercised (375 cases); affected speed-bound tests are rerun after adjusting their expectations to the longer timed route. Runtime results and screenshots are retained in ignored `.local/cruise-distance-*` and `.local/boat-clearance-*` folders. The separate original Blue Horizon project is unchanged.
