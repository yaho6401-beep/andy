# Moonlit voyage

The cruise reuses `camp/sky-visual.js`, its 5,018-star catalog, 11 recognition targets,
observation-time modes, NASA moon texture and constellation captions. The viewer
explicitly labels the map **Daejeon / Korean time**, matching the campsite rather
than claiming to show a different harbor's current sky. See `camp/SKY-SOURCES.md`
for the catalog sources, astronomical approximations and image attribution.

The sky camera pauses walking, preserves the seat and previous scenic view, and
leaves the voyage clock running. Drag or use arrow keys to look around; Escape or
“갑판으로” restores the previous view. It is available from outdoor decks and the
scenic/telescope controls. Departure preserves the selected day/night lighting.

Night lighting uses one batched window mesh, six small practical halos, two nearby
unshadowed lights, and a shared 64px glow texture. A small mask derived locally
from the existing harbor photograph adds warm building windows and reflections.
No new external assets, libraries, service calls or database writes are needed.

The ordinary moon is rendered behind world geometry, so buildings can occlude it.
The water's rippled reflection follows its horizontal direction. In the star map,
the shared astronomical moon replaces the decorative voyage moon.

Marine encounters are client-local: first eligible sighting after 30–65 seconds,
then a quiet 75–180-second interval after each 20–26-second encounter. There is at
most one encounter (two dolphins or one whale), and all geometry is reused.
Dolphins reuse the campsite's original tapered model; the whale is an original
streamlined mesh. Neither swims through the ship or continuously circles it.
Silhouette references: [NOAA bottlenose dolphin](https://www.fisheries.noaa.gov/species/common-bottlenose-dolphin/management)
and [NOAA observer field manual](https://www.fisheries.noaa.gov/s3/2021-07/Southwest-Region-Observer-Program-Field-Manual.pdf).

Verification: `tests/cruise-moonlit.test.mjs` covers encounter spacing, hull
clearance, geometry disposal, camera bounds and water/sky exclusion from city
lights. `tests/cruise-moonlit.browser.mjs` covers four viewports, shared star
recognition, drag input isolation, seat restoration, an encounter, harbor windows,
night departure and continued sailing during stargazing. Screenshots from desktop
browser emulation do not establish a frame-rate guarantee on physical phones.
