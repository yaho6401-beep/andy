# Scent stories and 3D lounge preview

Current monochrome brand and five bottom tabs are retained.

- The Community entrance now explains the avatar-based 3D lounge, previews four real spaces, shows simple movement/interaction instructions and links to the existing /archive/ entry. Home features a book-lounge teaser. No live 3D code is loaded on the main website.
- Preview JPEGs were captured from the existing ArchiveWorld, createAvatar, Three.js geometry, materials and main-renderer lighting/tone-mapping. They are actual rendered space views, not concept art. No other project or unpublished 3.0 assets were used. Each image is 1200x750 and lazy-loaded; only the selected Community room image loads initially.
- Today's word, prompt and proposed blend rotate through seven editorial themes on Korean calendar days. The blend opens in the existing composer. Users may collect one card per date and optionally a short thought. Cards upsert by date, retain the latest 60 dates, escape user text, and can be cleared.
- Completed blends emit a small event containing only existing scent IDs. The five most recent unique recipes can be reopened or cleared on Home. Private journal records and customer names are not copied into this history.
- Daily cards and recent recipes are browser-only localStorage features, clearly labeled. They do not sync across devices, create customer accounts, issue rewards or affect production database schemas. Existing cloud journal remains unchanged.
- Tool cards, social links, home shortcuts, VIP and camping entries have a clearer monochrome hierarchy and touch feedback. Mobile overflow in the inherited Explore/Books & Scents container is corrected. New primary content is translated using the existing English/Chinese/Japanese system.

Validation: node scripts/verify-engagement.mjs exercises real frontend with API writes intercepted: KST date rollover, daily save/update/persistence/escape, actual composer deep links, history dedupe/limit/validation/clear, four real scene images, existing entrances, 360/390/768/1440 widths, translation, deletion and storage failures. Screenshots go to ignored .release/. Existing journal and analytics end-to-end checks are run as regressions. Main package build is unchanged.
