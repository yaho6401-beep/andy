# Garden cruise-map discovery

The garden's southeastern corner contains a small wrapped gift, ticket and brass compass. Approaching reveals “크루즈 가는 지도를 발견했다!” with “가볼까?” and “나중에”. The map can be opened again nearby; dismissal does not repeatedly interrupt the same approach.

Accepting starts a physical guided route through the existing garden/campsite portal and campsite paths to the eastern shore rowboat. The boat follows the existing obstacle-safe offshore route to BLUE HORIZON. After arrival, the existing server-validated boarding action opens the cruise. No coordinates, permissions, login requirements or voyage duration checks are bypassed. The cruise remains a separate lazy-loaded world.

Manual movement, shortcut cancellation, changing destinations, disconnection and rejected actions stop the automatic intent. During the sea crossing “자동 승선 그만하기” keeps the regular boat and arrival controls available without forcing navigation. Request timeouts do not create repeat boarding loops.

Implementation is limited to the archive application. No database/schema changes, new dependencies, new public cruise shortcut or changes to the separate Blue Horizon project. The chest uses shared geometry/materials and the existing static geometry batching. Its collision box is shared by rendering/navigation/server source.

Validation:

- `npm run build`.
- Full Node suite: 372 tests passed before the final additional cancellation regression; focused map suite includes 5 passing cases.
- `tests/garden-cruise-map.browser.mjs`: 320/390/844/1280 pixel viewports; both choices visible, no horizontal overflow, later/cancellation/automatic proximity discovery, actual portal walking, rowboat voyage, automatic validated cruise entry, no movement corrections or browser exceptions.
- Local WebSocket journey is additionally exercised with keyboard movement from the real garden spawn, without position fixtures.
- Original `G:/github/blue-horizon/index.html` SHA256 remains `C4AF2AAA9D7AFD2DBEE26BFBD9BD096C2002631C8530213DD9F9DD48E119A7A6`.

Browser screenshots and runtime results are ignored under `archive/.local/cruise-map-*`. Mobile results describe responsive browser viewports, not a physical-phone FPS benchmark.
