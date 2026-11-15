# Visitor analytics

Admin entry: `/admin.html` (also linked in the main footer). Existing admin login is required; detailed events are never exposed by the public stats endpoint.

## Scope

- Today / 7 / 30 / 90-day visitors, first-time and returning browsers, pageviews, sessions and reservation-link clicks.
- Daily counts, referral source, UTM campaign/content, menu/button interactions, device category, paginated anonymous browser history and a bounded timeline.
- UTM link generator for Instagram, YouTube, Naver and store QR; browser-level collection exclusion for owner/test use and visitors.
- Archive entry shares the main site's anonymous ID and session. No metaverse world/content changes.

## Definitions and privacy

Visitors are browsers, not known people. Existing UUIDs are preserved and HMAC-hashed on the server. A new session starts after 30 minutes without a tracked event. New means first observed during the selected range; returning means an earlier observed visit or multiple sessions in-range. These can overlap. Legacy events have no session/source fields and use distinct KST dates for session counts.

Only allowlisted menu names, a bounded entry-page path, referrer hostname, ASCII UTM labels and coarse device type are collected. No full referrer URL, URL query, story text, phone number, IP address or account name is stored in analytics. Existing abuse rate limiting remains unchanged. Browser storage clearing, device switching, bots and testing affect counts. Missing referrers are labeled direct/unknown, never confidently attributed. Clicks are not completed reservations or conversions.

Browser opt-out prevents future collection only. No existing production records are deleted or rewritten. Old sources cannot be recovered. Client telemetry is not suitable for issuing rewards or authorizing access.

## Security

The existing service-only RLS table is extended additively. `workshop_analytics` is SECURITY INVOKER, executable only by service_role. The Edge endpoint checks a valid, unexpired existing admin session before querying. No service key appears in browser code. Existing public stats and legacy visit clients remain compatible.

## Verification

With archive dependencies installed, run `node scripts/verify-visitor-analytics.mjs`. It tests the Edge router with fake keys/network and the real frontend against mocked APIs in Edge at mobile/desktop widths. Browser screenshots are saved under ignored `.release/`. SQL aggregation/session/calendar and role permissions were additionally checked using transaction fixtures rolled back without altering customer records. Run archive unit tests with the existing local development server running for the network test (`node server/dev-server.mjs`, then `npm test` in `archive`).

Deployment scope is analytics only, based on the current black-and-white production main. The separate unpublished 3.0 work and Blue Horizon are untouched.
