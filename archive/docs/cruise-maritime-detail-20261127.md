# Coast feathering and maritime exterior refinement

The integrated cruise preview keeps its twelve harbors, geographic routes, 60–180-second sailing times, physical stairs, bridge crew, steering and borrowed-book flow.

## Coast

The old 700–1320m transparency range extended past the camera's 1200m far plane, so the still-visible panorama could be clipped into a faint straight line. The new 500–1040m range, with at most 55m of irregular fog variation, finishes before that clipping boundary. Headlands and water reflections fade sooner as well. Broad, irregular UV feathering replaces the straight vertical edge mask. The central harbor image is preserved, while its extremities disappear into the atmospheric horizon rather than exposing a rectangular edge. No camera far-plane increase, extra textures, or full-screen postprocessing is needed.

## Vessels

All six traffic types now have indexed curved hulls with sheer, flared topsides, a chine, raked forefoot, boot stripe, submerged keel and closed ends. Original native geometry replaces the previous stacked blocks. Passenger vessels have separated raked glazing, roof overhangs, open rails, navigation masts and upper decks. Cargo vessels use 6.05m containers with ribbing, an aft accommodation block and bridge wings. Tugs have exhaust stacks, towing gear and a continuous bow fender; fishing boats have rigging, a winch and working gear; sailboats have rigging and a softly curved sail. Metal, painted steel, glass, rubber and teak use separate restrained PBR finishes. Static fittings batch by finish, and duplicate vessel types share cached geometry and materials.

The visitor's existing 140m cruise has a lofted underwater hull meeting the existing deck edges, enclosed shaped lifeboats, canopy windows, davits and exhaust details. Its walkable decks and route/collision authority remain unchanged. Wake foam uses nonperiodic value noise to reduce the previous repeated chevron/grid appearance.

Reference for vessel construction and proportions, not copied models or manufacturer replicas:

- [Damen ASD Tug 2813](https://www.damen.com/vessels/tugs/asd-tugs/asd-tug-2813)
- [Princess Sun Princess fact sheet](https://www.princess.com/en-int/news/backgrounders-and-fact-sheets/sun-princess-fact-sheet)

No new dependency, downloaded model, database change or change to the separate original Blue Horizon folder is involved. Production is not promoted or merged; publish a review preview only.

## Verification

- Build and all 353 Node tests pass, including submerged hull bounds, outward normals, deck-edge continuity, resource sharing/disposal, per-model triangle limits and coast fade before clipping.
- Six moving vessels total under 60,000 model triangles; each model uses at most ten finish batches. Only the active harbor is allocated.
- Browser verification covers gradual approach and both landscape and portrait coast views; all twelve harbors, chained travel, refresh and return; bridge crew visibility; and physical ship traversal.
- Browser FPS is a regression observation, not a claim of measured performance on a physical low-end phone.

Local and deployed browser evidence is saved in ignored `.local` test output. Release metadata records the preview commit and deployment separately from operational data.
