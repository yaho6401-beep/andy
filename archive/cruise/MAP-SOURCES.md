# Geographic chart source

Coastline: Natural Earth **1:50m land**, release **v5.1.2**.

- Publisher: https://www.naturalearthdata.com/
- License: https://www.naturalearthdata.com/about/terms-of-use/ — public domain, including commercial use.
- Original: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_land.geojson
- Rebuild: run `node scripts/build-cruise-map.mjs` from `archive/`. This optional asset-generation command downloads the pinned public data. The normal build is offline and uses the checked-in `world-land.json`.

Rings retain coast outlines and holes, with Douglas–Peucker simplification (0.025 degrees) and coordinates rounded to three decimals. The result is a small-scale regional/world basemap; small waterways and islands are generalized. It is not an ENC, bathymetric chart or navigational product.

Route waypoints are original illustrative WGS84 positions. The virtual home port is offshore Busan. Singapore and Indian Ocean routes use the Korea, Luzon, Singapore and Malacca straits. Atlantic/Northern Europe itineraries round the Cape of Good Hope, followed by the Atlantic and (for Northern Europe) English Channel/North Sea. Displayed progress comes from the existing personal game voyage, interpolated along cumulative waypoint distances. COG follows the Mercator segment's rhumb bearing, distances are approximate nautical miles, and time is compressed. No live ship position, GPS or AIS feed is connected.

Ship-layout references (principles, not a copied vessel plan):

- IMO Resolution A.708(17), navigation bridge visibility and functions: https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/AssemblyDocuments/A.708(17).pdf
- Transport Canada, Navigation bridge visibility, SSB 03/1992: https://tc.canada.ca/en/marine-transportation/marine-safety/ship-safety-bulletins/navigation-bridge-visibility-ssb-no-03-1992

The implementation is an original lightweight visitor model. It does not assert statutory vessel-design compliance.
