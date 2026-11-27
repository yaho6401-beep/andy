# Enclosed passenger decks

The accommodation level previously had missing end bulkheads, a largely open floor
between its only furnished cabin and the outer shell, glass laid over solid walls,
and a camera that could leave the intended compartment. The dining deck had no
continuous enclosure or ceiling.

The shared `interior-layout.js` plan now defines the guest passage, aft stair lobby,
private suite, full-height end and side bulkheads, actual window openings, restaurant
walls and doorway, and matching furniture footprints. Neighboring closed cabins are
no longer navigable empty spaces. The starboard restaurant door and the accommodation
stairwell remain open and use the existing continuous stair navigation.

`passenger-interiors.js` builds the enclosed spaces, original wall artwork, carpet
runners, flush guest doors, open suite doorway, beds scaled to the shared avatars,
desk, wardrobe, sofa, buffet and ceiling panels. Twenty glazed openings have genuine
holes in the opaque walls. All small wayfinding plaques use one original canvas
atlas; static geometry joins the existing material batches. Two unshadowed practical
lights replace the previous single cabin light and illuminate occupied indoor spaces
at night. No new package, downloaded asset or service is required.

`interior-camera.js` keeps the camera below the ceiling and inside the current room,
corridor, lobby or stairwell; the existing bridge camera also gains a compartment
clamp. The outdoor deck, wings, working fore/aft decks, radar deck, voyages, star map,
marine encounters, borrowed books and shared avatar system remain connected.

The arrangement is an original fictional ship layout informed by the separation of
staterooms, passages and public spaces in official references:
[Royal Caribbean deck-plan guide](https://www.royalcaribbean.com/guides/cruise-deck-plans),
[Vision deck-two plan](https://media.royalcaribbean.com/content/pdf/decks/VI/shp_vi_deck02_rc3_dpl.pdf).

Verification includes all 81 directional routes between the nine existing spaces,
fine-step stair navigation, closed-room exclusion, camera bounds through a full orbit,
ray tests for enclosed corridor ends and ceilings, a genuinely open glazed window,
and a restaurant ceiling. The full suite passed 368 tests. The mobile/desktop browser
flow visits the suite, looks toward the window, walks into the corridor, changes to
night lighting, reaches the dining room and bridge, then returns outdoors. Screen
captures cover 320, 390 and 1280px widths; a separate crew check covers 844px landscape.
Physical-phone frame rates are not established by desktop browser emulation.
