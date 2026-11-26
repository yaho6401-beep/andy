# Cruise ocean voyage trial — 2026-11-26

The integrated Blue Horizon cruise now leaves its home coast for five original, lightweight 3D harbor scenes. The captain and helmsman use the village avatar system. Visit the bridge, approach the captain and choose a route. Walking, stairs, the visitor helm and borrowed books remain available throughout the journey.

## Trial routes

| Destination | Region | Compressed outbound time |
| --- | --- | --- |
| Bergen / fjord | Northern Europe, Norway | 1:50 |
| Copenhagen | Northern Europe, Denmark | 1:55 |
| Madeira | Atlantic, Portugal | 2:15 |
| Seychelles | Indian Ocean | 2:10 |
| Singapore harbor | Southeast Asia | 2:05 |

These are original regional motifs, not geographically accurate reconstructions. The route picker explicitly labels the experience as a compressed virtual trial. A different route is recommended each day; visitors can choose any of the five.

At arrival, the voyage panel offers a wider harbor camera. Requesting a return while at sea starts a six-second turn and a distance-dependent return (8–60 seconds), instead of teleporting to the camping ground. Once home, the existing camping-ground link works normally.

## Implementation boundaries

- Personal single-player voyages use validated, versioned localStorage state. Reloading resumes the journey using elapsed wall-clock time; reading does not pause the vessel.
- A floating origin moves the coast, harbor and water coordinates relative to the stationary ship-local walking/collision system. The departure arc clears the original coast with a conservative hull-radius check.
- Only the selected destination is allocated. Static native geometry is merged by material and disposed when returning home. No new dependencies, remote assets, database changes or paid resources.
- The original standalone `G:/github/blue-horizon` project is unchanged. All changes are inside the integrated `archive/cruise` implementation and its build/tests.
- The trial does not synchronize a ship itinerary between different visitors. Existing village multiplayer remains unchanged.

## Verification

- All 332 automated Node tests passed, including five new voyage/terrain/resource tests and the existing movement, account, sea-route and multiplayer checks.
- Browser flow passed: stairs → captain/helmsman → five routes → real-time departure → refresh/resume → reading while moving → arrival → harbor view → timed return → camping ground.
- Five final harbor scenes were inspected at a 390 × 844 viewport with no WebGL or page errors. Final harbor-camera measurements: 19–26 draw calls, 9,150–26,818 rendered triangles and approximately 60 FPS on the test desktop browser. This is not a physical low-end-phone benchmark.
- Browser layout checks cover widths 320, 390, 844 (landscape) and 1280. Route, return, camera and existing room controls remain accessible.

Release target for this request: a test preview, with production kept unchanged until the voyage trial is reviewed.
