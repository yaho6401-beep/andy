# Living harbors — 2026-11-27

Preview-only extension of `feat/cruise-realship-layout`. Existing books, cabins, stairs, captain, chart, personal voyage persistence and camp return are preserved. No production database or separate `blue-horizon` project changes.

## Behavior

- Five regional harbor panoramas replace the previous simple distant buildings. Native 3D piers, bollards, fenders, breakwaters, lamps, six moving vessels and wakes remain in front. A lightweight water reflection ties the panorama to the sea.
- Bergen, Copenhagen, Madeira, Seychelles and Singapore each offer the other four ports directly. A six-second heading change precedes departure. No forced home-port reset; the geographic chart follows connected sea waypoints between the current and next port.
- Refresh resumes the same leg. Returning home from a chained leg starts from the current physical and geographic location.
- The current harbor alone loads its JPEG (334–400 KB). Late texture loads and disposed harbor traffic are cleaned up. Harbor geometry is batched; no additional runtime dependency or paid service.

## Validation

`cruise-multiport.test.mjs` exercises all twenty ordered port pairs, continuous positions, bounded sailing speeds, direct geographic tracks, chained returns, persistence and fleet disposal. `cruise-harbors.browser.mjs` checks two consecutive legs, chart continuity, refresh, return, all five loaded panoramas, moving traffic and 320/390/844/1280px layouts. It records page/WebGL errors and missing assets. Performance samples are desktop-browser observations, not a mobile-device FPS guarantee.

## Generated scenery and provenance

Generated with the **built-in image_gen tool**, one call per region, `photorealistic-natural`. These are fictional regional interpretations, not documentary photographs, exact reconstructions or live AIS traffic. Source PNGs remain under the Codex generated-images directory; final JPEGs are 2172×724, quality 86. Conversion only changed the file format/compression.

Final workspace assets (relative to this document):

- [Bergen](../cruise/scenery/ports/bergen-v1.jpg)
- [Copenhagen](../cruise/scenery/ports/copenhagen-v1.jpg)
- [Madeira](../cruise/scenery/ports/madeira-v1.jpg)
- [Seychelles](../cruise/scenery/ports/seychelles-v1.jpg)
- [Singapore](../cruise/scenery/ports/singapore-v1.jpg)

### Final Bergen prompt

```text
Use case: photorealistic-natural. Asset type: wide photographic harbor background texture for a lightweight 3D maritime simulation. Primary request: A spectacular, highly realistic Bergen Norway fjord waterfront, viewed FROM A SHIP at water level offshore, long photographic panorama, authentic scale. Bryggen timber warehouses with weathered red ochre and pale wooden facades, many tiny windows, stone waterfront, layered steep green rocky mountains receding with subtle atmospheric haze, forest and scattered realistic homes. Clear pale overcast daylight, elegant subdued photographic colors, detailed natural materials, believable architectural proportions. Composition: very wide landscape panorama 3:1 or wider, uninterrupted shoreline across the FULL width, horizon straight at about 60% down from top, lower 35% dark muted Nordic seawater, distant architecture center band, upper part pale sky and mountains. View from about 500 meters offshore with a normal lens, not aerial, not closeup. Scene quiet; no large foreground vessels, no text, no UI, no collage, no borders. NOT cartoon, NOT illustration, NOT toy buildings, NOT low-poly. This is a fictional scene inspired by Bergen, not an assertion of documentary photography. High fidelity natural photographic realism suitable for a travel film.
```

### Shared prompt for the other four regions

The exact shared prompt below was followed by `Scene: ` and the corresponding regional text.

```text
Use case: photorealistic-natural. Asset: a very wide cinematic 3:1 photographic panorama texture for a 3D maritime simulation, from a vessel approximately 500 metres offshore at water level, normal lens, no aerial view. Highly realistic natural travel photography, authentic scale and materials, intricate windows, weathered stone and wood, subdued daylight, subtle atmospheric haze. Shoreline unbroken across whole width, shoreline at 68% from top, LOWER 30% seawater, horizon horizontal. Upper area natural pale sky. No UI, no letters, no collage, no frames, no large foreground ships. Not illustration, not cartoon, not toy, not lowpoly. An original fictional scene inspired by the named region.
```

**Copenhagen**
```text
Copenhagen Denmark harbor waterfront inspired by Nyhavn seen from broad water. Elegant colorful historic 4–6 storey Danish townhouses, refined slate roofs and copper church spires, stone quays and occasional very tiny moored sailboats. Rich architectural detail and restrained ochre, muted brick red, warm cream facades. Long waterfront recedes into layered urban background. Gentle partly cloudy Danish afternoon.
```

**Madeira**
```text
Funchal Madeira Portugal Atlantic harbor. Vast dramatic green volcanic mountains and terraced white real houses with terracotta roofs, a detailed low sea-front promenade and substantial harbor breakwater. Palms and marina details along foreground shoreline. Warm natural light through a little maritime haze. Real distant geography, atmospheric depth, believable irregular mountain cliffs. Dark blue Atlantic seawater.
```

**Seychelles**
```text
Seychelles Victoria harbor region and Mahe tropical island. Realistic lush mountains with granite outcrops and mature tropical forest, exquisite pale sandy shoreline with tiny low pavilions and palms, a tasteful working marina and stone pier off one side, patches of turquoise shallows beside darker deep blue water. Warm natural afternoon light, atmospheric perspective, realistic NOT fantasy tropical island.
```

**Singapore**
```text
Singapore harbor and Marina waterfront, impressive real-scale tropical maritime skyline, glass and steel high-rise towers with convincing dense urban layering and a few distinctive three towers supporting a broad rooftop sky park; far to the side a real working container port with gantry cranes and stacked containers, low waterfront promenade and small realistic palms. Sophisticated blue gray reflective glazing, authentic intricate architectural details, tropical late afternoon haze with neutral sunlight. Wide Singapore Strait seawater below.
```
