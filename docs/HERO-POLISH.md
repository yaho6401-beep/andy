# Hero and public footer polish

Adds the owner's exact supporting line immediately below the hero reservation CTA: 체험 약 60분 · 성심당 본점 도보 1분 · 누적 200회+ 출강 공방. Each phrase is translated through the existing locale system.

The admin footer link and visit-count box are hidden by default, including with JavaScript disabled. An early, static flag check reveals them only when URLSearchParams.get('admin') === '1'. The deferred public-shell helper keeps display aligned with client navigation. This is presentation only, never authorization; /admin.html retains existing password/session verification. The public page no longer fetches the aggregate stats when the flag is absent, but visit/action recording and the privacy/opt-out notice remain available.

Only the hero photo has brightness(.97) contrast(.92) saturate(.82) sepia(.12), preserving the original asset. On phones the hero copy wrapper uses display:contents to place photo before the secondary introduction/directions links. Vertical spacing, header/logo size and title sizes are reduced conservatively; short portrait screens get a capped photo height. The five-tab navigation remains, with only its Books & Scents label renamed to 더보기 (More/更多/もっと見る).

Validation: node scripts/verify-hero-polish.mjs. Exact text, default/false/true/admin=1 flags, no-JS visibility, aggregate-request behavior and continued visitor collection, translated label, real CSS filter and above-fold title/CTA/photo are checked at 320x568, 360x640, 375x667, 390x844, 430x932 and desktop 1440x900. Updated journal picker regression passes. Production package build passes. No schema, backend, metaverse or other-project changes.
