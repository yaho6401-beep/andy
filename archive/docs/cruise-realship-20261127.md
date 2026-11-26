# Blue Horizon — ship layout and geographic voyage chart

This revision extends the personal cruise voyage trial. Existing five destinations, captain/helmsman, timed return, walking, steering experience and borrowed books remain available. Production and operational data are unchanged; publish a preview for review.

## Visitor flow

- **항해 지도** in the top toolbar opens a responsive world chart. The actual screen on the central ECDIS console also opens it when clicked/tapped within five metres, on the bridge level. Drag to pan; use zoom, current position, route fit or world fit.
- Actual Natural Earth 50m coastlines are packaged locally, without external map tiles or a paid map account. An own-ship symbol moves along illustrative WGS84 sea waypoints with the existing voyage's progress. Planned route, sailed track, latitude/longitude, approximate NM to destination, COG and next waypoint update during transit. Northern Europe and Atlantic voyages round the Cape of Good Hope. All five tracks were sampled against the shipped land polygons to catch coast crossings.
- The chart prominently identifies **compressed simulation, GPS/AIS disconnected, not an official ENC or usable for real navigation**. It represents the game voyage on real geography; it does not claim a real vessel's live location. Home is explicitly a fictional home port off Busan.
- **나의 객실** walks down the port-side staircase into the accommodation deck and through a doorway into the visitor's furnished cabin (bed, wardrobe, desk/TV, light fittings and original wall art). Rest beside the bed or open a previously borrowed book. With no borrowed book, the reading control explains where to borrow one.
- The enclosed forward wheelhouse has solid bulkheads, a ceiling, panoramic glazing, mullions, wipers, overhead instruments and chart/safety storage. Doorways lead to both open wing bridges with maneuvering consoles. A starboard staircase leads onto the roof/radar deck; the radar scanner rotates independently of static batching.
- Bow and stern sit below the promenade and require actual stair traversal. The foredeck has two windlasses, chain runs, hawses and outboard anchors. The lower quarterdeck has mooring bollards and a winch.

## Movement and performance

Nine destinations and eight staircase flights share a single layout for visuals, collisions, height transitions and route finding. Stair wells are real openings in the rendered decks. Navigation prevents graph edges that silently select a different overlapping floor, excludes the underside of cabin stairs, and checks narrow collision boundaries at fine movement intervals. Static architecture is merged by material; animated radar and map texture remain separate. The additional cabin light has no shadows and is active only on the accommodation deck. Destination buttons scroll horizontally on narrow phones rather than covering the scene with multiple rows.

All nine destinations were physically walked in browser tests, with final heights 8.1m fore/aft, 14.4m bridge/wings/dining, 18.9m radar deck, and 7m cabin. Unit tests also traverse all 81 ordered destination pairs in fine steps and every staircase in both directions. Browser chart tests exercise live geographic progress, drag/zoom, 320/390/844/1280px layouts and resumption after reload. Desktop-browser FPS is useful for regression checks only; physical low-end-phone performance has not been benchmarked.

Source and license details: `cruise/MAP-SOURCES.md`. No Supabase schema, Edge Function, authentication, operational data or original standalone `G:/github/blue-horizon` changes are required.
