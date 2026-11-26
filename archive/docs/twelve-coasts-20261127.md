# Twelve coasts — 2026-11-27

Preview extension of `fix/cruise-bridge-visibility`. The separate Blue Horizon project and production data are unchanged.

## Ports and navigation

Seven destinations join the existing five: Southampton, Busan North Port, Hong Kong Victoria Harbour, Ningbo–Zhoushan, Shenzhen Yantian, Dubai Port Rashid, Abu Dhabi Zayed Port. Each port offers the other eleven. Personal sailing, reload resumption, captain/helmsman, stairs, borrowed books, return and geographic chart remain available. Chart paths use illustrative sea waypoints, not an ENC or navigational passage plan.

The UK route approaches east of the Isle of Wight; Gulf routes round Oman and Musandam before the Strait of Hormuz. All plotted segments are sampled against the shipped Natural Earth coast polygons. Inter-port routes avoid forced return through the virtual home port, including the new Busan branch.

## Continuous coastline

The old 1260m flat background and late progress-based alpha switch were replaced by a 3200m coast with a central 1860m panorama that bends away at both ends, with mirrored continuation outside its central framing, broad edge/sky blending, distance-dependent haze and gently sloped 3D headlands. A photograph becomes readable as its distance falls through 1320–700m, with per-pixel depth. Inter-port scene handover is concealed at maximum optical distance, not exposed as a late opaque postcard. Return during a leg preserves the same coast and haze. Water palette changes are damped. Only one regional texture is allocated at a time; each new JPEG is 194–300KB. Geometry remains bounded, with no new dependencies.

## Reference material

Regional interpretation, not an exact reconstruction or documentary photograph:

- [Southampton: ABP port plan](https://www.abports.co.uk/media/d30dzahj/abp-southampton-masterplan-2026-vfinal.pdf)
- [Busan North Port: Busan Metropolitan City](https://www.busan.go.kr/eng/north-port)
- [Hong Kong: Marine Department harbour guide](https://www.mardep.gov.hk/filemanager/en/share/pub-services/pdf/hkwaterlk_guide.pdf)
- [Ningbo–Zhoushan port operator](https://www.nbport.com.cn/gfww/gksc/)
- [Shenzhen Yantian port operator](https://www.yict.com.cn/)
- [Dubai: Mina Rashid](https://www.dpworld.com/en/ports-terminals/uae/mina-rashid)
- [Abu Dhabi: Cruise Terminal at Zayed Port](https://www.adports.ae/ports-terminals/cruise-terminals/abu-dhabi-cruise-terminal/)

## Generated art: final files and prompts

Mode: **built-in image_gen**, seven independent generation calls. Original PNGs were preserved; System.Drawing converted them to 2172×724 JPEGs at quality 86, without retouching. The source images are original fictional regional interpretations. Existing five art prompts remain in `living-harbors-20261127.md`.

### southampton

Final saved asset: [southampton-v1.jpg](../cruise/scenery/ports/southampton-v1.jpg)

Source PNG: `C:\Users\신재용\.codex\generated_images\01a187e2-039e-72c1-8f2f-3038bade3b4e\exec-cff15dd1-0aa9-4b28-85b4-bb84c6930a22.png`

Final generation prompt:

```text
Use case: photorealistic-natural. Create an ultra-wide 3:1 cinematic harbor panorama texture for a light 3D sailing world. View FROM A SHIP at sea level 600 metres offshore, NOT aerial. Sophisticated realistic natural travel photography with authentic full-scale maritime infrastructure, refined atmospheric depth, intricate material details. Center harbor shoreline at 66% down from top, lower third realistic sea, pale natural daylight sky above. CRITICAL COMPOSITION: coast and land continue uninterrupted beyond BOTH left and right frame edges, gently curving irregular headlands, receding in distant haze. Never depict an isolated rectangular city strip or island cutout, no abrupt straight vertical land edges. No giant foreground boats, no text, no borders, no collage, no cartoon, no illustration. Original fictional regional interpretation, not documentary photography. Scene: Southampton Water England, long broad estuary with English wooded low hills, working docks and realistic white cruise terminal buildings, container gantry cranes and warehouses, a small pale cruise liner moored DISTANTLY, English brick city blocks receding behind. Low continuous green coastline extends far beyond both sides, grey-green tidal sea, soft silvery English afternoon.
```

### busan

Final saved asset: [busan-v1.jpg](../cruise/scenery/ports/busan-v1.jpg)

Source PNG: `C:\Users\신재용\.codex\generated_images\01a187e2-039e-72c1-8f2f-3038bade3b4e\exec-eef92aee-19f3-40a6-9d35-eecaa4696741.png`

Final generation prompt:

```text
Use case: photorealistic-natural. Create an ultra-wide 3:1 cinematic harbor panorama texture for a light 3D sailing world. View FROM A SHIP at sea level 600 metres offshore, NOT aerial. Sophisticated realistic natural travel photography with authentic full-scale maritime infrastructure, refined atmospheric depth, intricate material details. Center harbor shoreline at 66% down from top, lower third realistic sea, pale natural daylight sky above. CRITICAL COMPOSITION: coast and land continue uninterrupted beyond BOTH left and right frame edges, gently curving irregular headlands, receding in distant haze. Never depict an isolated rectangular city strip or island cutout, no abrupt straight vertical land edges. No giant foreground boats, no text, no borders, no collage, no cartoon, no illustration. Original fictional regional interpretation, not documentary photography. Scene: Busan North Port South Korea, harbor bridge spanning part of the broad bay in the middle distance, dense modern Korean city climbing steep layered forested mountains, detailed container piers and maritime passenger terminal, contemporary port infrastructure. Authentic mountainous Busan skyline with atmospheric depth. Broad dark blue Korean seawater; natural coastal land curls away at both left and right edges.
```

### hongkong

Final saved asset: [hongkong-v1.jpg](../cruise/scenery/ports/hongkong-v1.jpg)

Source PNG: `C:\Users\신재용\.codex\generated_images\01a187e2-039e-72c1-8f2f-3038bade3b4e\exec-301330f3-71cb-4990-8f89-45a546c955c2.png`

Final generation prompt:

```text
Use case: photorealistic-natural. Create an ultra-wide 3:1 cinematic harbor panorama texture for a light 3D sailing world. View FROM A SHIP at sea level 600 metres offshore, NOT aerial. Sophisticated realistic natural travel photography with authentic full-scale maritime infrastructure, refined atmospheric depth, intricate material details. Center harbor shoreline at 66% down from top, lower third realistic sea, pale natural daylight sky above. CRITICAL COMPOSITION: coast and land continue uninterrupted beyond BOTH left and right frame edges, gently curving irregular headlands, receding in distant haze. Never depict an isolated rectangular city strip or island cutout, no abrupt straight vertical land edges. No giant foreground boats, no text, no borders, no collage, no cartoon, no illustration. Original fictional regional interpretation, not documentary photography. Scene: Hong Kong Victoria Harbour viewed toward Hong Kong Island. Vast elegant densely layered glass-and-steel skyline backed by steep lush green Victoria Peak, sophisticated realistic tower proportions and clear window detail, waterfront promenade, a tiny distant green-and-white ferry. Natural coastal mountains extend to the two sides and softly recede in haze; subdued subtropical blue-green sea.
```

### ningbo

Final saved asset: [ningbo-v1.jpg](../cruise/scenery/ports/ningbo-v1.jpg)

Source PNG: `C:\Users\신재용\.codex\generated_images\01a187e2-039e-72c1-8f2f-3038bade3b4e\exec-b42e63f4-da3c-4a30-8795-8cce8bfb7d57.png`

Final generation prompt:

```text
Use case: photorealistic-natural. Create an ultra-wide 3:1 cinematic harbor panorama texture for a light 3D sailing world. View FROM A SHIP at sea level 600 metres offshore, NOT aerial. Sophisticated realistic natural travel photography with authentic full-scale maritime infrastructure, refined atmospheric depth, intricate material details. Center harbor shoreline at 66% down from top, lower third realistic sea, pale natural daylight sky above. CRITICAL COMPOSITION: coast and land continue uninterrupted beyond BOTH left and right frame edges, gently curving irregular headlands, receding in distant haze. Never depict an isolated rectangular city strip or island cutout, no abrupt straight vertical land edges. No giant foreground boats, no text, no borders, no collage, no cartoon, no illustration. Original fictional regional interpretation, not documentary photography. Scene: Ningbo Zhoushan port East China Sea, immense authentic deep-water working harbor with intricate blue and red container gantry cranes, layered multicolored container stacks and grey warehouses, green rocky Zhoushan island hills behind and to both sides, distant bridges and industrial maritime infrastructure. Subtle Chinese coastal haze and muted blue-gray seawater, realistic not futuristic city.
```

### shenzhen

Final saved asset: [shenzhen-v1.jpg](../cruise/scenery/ports/shenzhen-v1.jpg)

Source PNG: `C:\Users\신재용\.codex\generated_images\01a187e2-039e-72c1-8f2f-3038bade3b4e\exec-2791269a-913a-4601-ba07-46fa288270e2.png`

Final generation prompt:

```text
Use case: photorealistic-natural. Create an ultra-wide 3:1 cinematic harbor panorama texture for a light 3D sailing world. View FROM A SHIP at sea level 600 metres offshore, NOT aerial. Sophisticated realistic natural travel photography with authentic full-scale maritime infrastructure, refined atmospheric depth, intricate material details. Center harbor shoreline at 66% down from top, lower third realistic sea, pale natural daylight sky above. CRITICAL COMPOSITION: coast and land continue uninterrupted beyond BOTH left and right frame edges, gently curving irregular headlands, receding in distant haze. Never depict an isolated rectangular city strip or island cutout, no abrupt straight vertical land edges. No giant foreground boats, no text, no borders, no collage, no cartoon, no illustration. Original fictional regional interpretation, not documentary photography. Scene: Shenzhen Yantian harbor China, impressive long deep-water container quay with tall detailed gantry cranes and layered stacked containers, backed by dramatic dark green Wutong mountain slopes, distant modern Shenzhen city blocks only modest in scale. Wide Dapeng Bay, wooded irregular coastal headlands extend at both edges, soft hazy subtropical afternoon, photographic authenticity.
```

### dubai

Final saved asset: [dubai-v1.jpg](../cruise/scenery/ports/dubai-v1.jpg)

Source PNG: `C:\Users\신재용\.codex\generated_images\01a187e2-039e-72c1-8f2f-3038bade3b4e\exec-96308c64-2808-4924-ad83-4a8eb1337951.png`

Final generation prompt:

```text
Use case: photorealistic-natural. Create an ultra-wide 3:1 cinematic harbor panorama texture for a light 3D sailing world. View FROM A SHIP at sea level 600 metres offshore, NOT aerial. Sophisticated realistic natural travel photography with authentic full-scale maritime infrastructure, refined atmospheric depth, intricate material details. Center harbor shoreline at 66% down from top, lower third realistic sea, pale natural daylight sky above. CRITICAL COMPOSITION: coast and land continue uninterrupted beyond BOTH left and right frame edges, gently curving irregular headlands, receding in distant haze. Never depict an isolated rectangular city strip or island cutout, no abrupt straight vertical land edges. No giant foreground boats, no text, no borders, no collage, no cartoon, no illustration. Original fictional regional interpretation, not documentary photography. Scene: Dubai Port Rashid UAE, authentic Gulf cruise harbor and low modern white terminal, working port cranes subtly to one side, long sandy low coastline and cream urban fabric with Dubai glass skyscrapers FAR IN THE DISTANCE with a very slender tall Burj Khalifa in subtle haze. No giant landmark right on the quay. Realistic warm stone, small dhows distant, subtle golden desert haze, pale turquoise-grey sea, elegant not fantasy.
```

### abudhabi

Final saved asset: [abudhabi-v1.jpg](../cruise/scenery/ports/abudhabi-v1.jpg)

Source PNG: `C:\Users\신재용\.codex\generated_images\01a187e2-039e-72c1-8f2f-3038bade3b4e\exec-2db0a6f0-85a3-43a2-8144-598ced84614d.png`

Final generation prompt:

```text
Use case: photorealistic-natural. Create an ultra-wide 3:1 cinematic harbor panorama texture for a light 3D sailing world. View FROM A SHIP at sea level 600 metres offshore, NOT aerial. Sophisticated realistic natural travel photography with authentic full-scale maritime infrastructure, refined atmospheric depth, intricate material details. Center harbor shoreline at 66% down from top, lower third realistic sea, pale natural daylight sky above. CRITICAL COMPOSITION: coast and land continue uninterrupted beyond BOTH left and right frame edges, gently curving irregular headlands, receding in distant haze. Never depict an isolated rectangular city strip or island cutout, no abrupt straight vertical land edges. No giant foreground boats, no text, no borders, no collage, no cartoon, no illustration. Original fictional regional interpretation, not documentary photography. Scene: Abu Dhabi Zayed Port UAE, modern low white cruise terminal and long breakwaters foreground middle distance, pale warm sand-colored waterfront and distant Abu Dhabi glass skyline with realistic elegant clustered high-rise towers, subtle modern arched or domed cultural buildings far to the side. Low Gulf coastal land extends in soft haze beyond left and right. Restrained warm cream and blue-glass palette, refined turquoise-gray sea, photographic not fantasy.
```

## Verification

- `cruise-coasts.test.mjs`: curved geometry bounds, gradual distance reveal, hidden scene handover and continuous return.
- Existing sailing, geography and multiport tests expanded to twelve ports and all 132 ordered pairs. Plotted sea routes are tested for land intersections.
- `cruise-approach.browser.mjs`: seven approach samples, increasing coastline visibility, wide and portrait screenshots, eleven onward choices and WebGL/page errors.
- `cruise-harbors.browser.mjs`: all twelve JPEGs, native 3D vessels, disposal, chained voyages, reload, geographic continuity and responsive menus.
- `cruise-crew.browser.mjs`: captain/helmsman framing on four viewport sizes and after captain interaction.

Desktop headless-browser FPS samples are not a physical mobile performance guarantee.

