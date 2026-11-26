# Working decks and visitor exploration

Story: a visitor walks aboard the integrated cruise, inspects richer ship equipment, approaches a safe bench, deliberately sits, and looks around the distant scenery or through the deck telescope. Clicking a visible deck starts the same collision-aware pedestrian route as the destination buttons.

## Ship fittings

The existing twin anchor windlasses, chain runs, hawses and outboard anchors are retained. The working foredeck gains mooring drums with wound line, bitts, roller fairleads, coiled rope and chain stoppers. Alternating chain links now change plane instead of simply rotating inside the same plane. The radar roof gains a second rotating scanner, VHF/AIS/GNSS-style antennas, a signal-light mast, ventilation louvres, a maintenance hatch, a compass binnacle and cable trays. Static fittings merge into the existing material batches; only scanners animate independently. No external model or new dependency is installed.

Appearance references, rather than engineering plans or replicas:

- [Furuno marine radar installation manual](https://www.furunousa.com/-/media/sites/furuno/document_library/documents/manuals/public_manuals/fr1760ds_installation_manual_l.pdf)
- [Trelleborg marine mooring equipment](https://www.trelleborg.com/en/marine-and-infrastructure/products-solutions-and-services/marine/docking-and-mooring)

`deck-fixtures.js` defines equipment and seating positions. `ship-layout.js` resolves their deck levels and collision footprints. Equipment is not walk-through scenery. Benches avoid working equipment and the stairs; existing stern seating is moved clear of sun loungers, and main-deck benches face out to sea. Twelve benches have validated, reachable front approaches.

## Visitor controls

- No automatic seating. The right-side **벤치에 앉기** control appears only near a bench on the same deck. It walks to the front of the bench, then seats the visitor. **사뿐히 일어나기** returns to its clear approach. Movement input also stands up.
- **먼 풍경 보기** / **바다 바라보기** opens a first-person landscape view, preserving the seat when applicable. Left/right controls and dragging rotate the view; **돌아가기** restores the previous seated or standing view. Landscape yaw is limited to approximately 86 degrees each way and telescope yaw to 60 degrees; vertical adjustment is gentle and bounded.
- The telescope is moved to the port side and points over the sea rather than through the superstructure. Its existing approach action remains available, with the shared view controls for looking and closing.
- A short mouse click or mobile tap on an upward-facing, visible walkable deck selects a destination. The route uses existing A* stairs, deck heights and collision checks. Sea, equipment, walls and hidden lower floors are not floor targets. A drag rotates the camera and never creates a movement command; secondary touches cancel tap intent. UI clicks remain separate.
- Initial camera placement starts above the main deck, avoiding a brief view from below the ship while the scene first settles.

The original standalone Blue Horizon folder, production data and production branch are unchanged. This is a stacked feature branch for a review preview.

## Verification evidence

Automated checks cover every bench approach, all ordered pairs of nine destinations, equipment collision footprints, same-deck proximity, tap/drag separation, visible-deck picking and camera bounds. Browser checks exercise actual projected floor clicks, dragging, explicit seating, standing, landscape and telescope rotation, 320/390/844/1280px layouts, and physical stair travel to the foredeck and radar roof. Existing geographic voyages and ship controls remain in the regression suite. Results and preview release metadata are saved in ignored `.local` output; no operational data is used for these tests.
