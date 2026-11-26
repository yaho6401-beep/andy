# Distance-based voyage duration — 2026-11-27

Preview extension of `feat/cruise-twelve-coasts`. No production, database or separate Blue Horizon project changes.

New voyages use the existing sea-waypoint distance, rather than the destination's old fixed trial time. All twelve home departures and 132 port-to-port legs take **60–180 seconds total**. The six-second port departure turn is included. The square-root distance curve preserves a useful difference between regional passages and intercontinental routes while compressing real shipping distances into a playable interval.

Examples from the current illustrative sea routes:

| Passage | Trial duration |
| --- | --- |
| Virtual home → Busan North Port | 1:03 |
| Hong Kong → Shenzhen Yantian | 1:09 |
| Dubai Rashid → Abu Dhabi Zayed | 1:09 |
| Bergen → Copenhagen | 1:24 |
| Busan → Southampton | 2:57 |
| Virtual home → Copenhagen | 3:00 |

Return to the virtual home also uses the remaining geographic sea route, including turns, within one to three minutes. Menu estimates, countdowns, speed/progress and arrival deadlines use the same duration.

At departure the sailing duration is saved in the existing version-1 personal record as optional `sailSeconds`. A reload uses that saved value. Previously saved outbound voyages without the field retain their original home or inter-port timing. Old return records remain valid; new returns allow longer bounded durations. No record is reset or re-timed just because the app was updated.

Validation covers all 144 outward legs, monotonic distance/duration ordering, exact arrival deadlines, reload continuity, old records, invalid fields and return distances. Browser checks compare nearby/far menu estimates with the real countdown, refresh mid-leg, arrive at the expected port and verify return estimates. Existing sailing regressions were updated to use the advertised duration instead of fixed test clock offsets. These are compressed game voyages, not real-world shipping ETAs.
