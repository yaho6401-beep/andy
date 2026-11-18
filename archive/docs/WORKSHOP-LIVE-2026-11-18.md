# Production integration: photographic museum and workshop MVP

The owner's latest request explicitly authorizes moving the reviewed museum into the actual site, adding photo-like ingredient explanations, and adding a standalone mobile workshop page. This supersedes older preview-only instructions for this release. Blue Horizon is excluded.

## Integration and preservation

Start from production main899ebc398f6e5c1be7f8d49979c261fd168a644a, not the older preview homepage. Bring in the reviewed archive subtree from d2aaf9f3afbfcf8e83cfba89a4c7b096d3d29dcd, plus its owned models, gallery snapshots and read-only public-board API. Preserve the production white/black homepage, plum bottom navigation, three journey choices, existing72/30 blending, personal server journal, comments, game/coupons, VIP/community/application and all existing data. The homepage has an additive **공방에서, 한 방울씩 조향하기** entry under its three choices. The existing journal links to the workshop's local records. Old external3.0-test links now point to same-site `/archive/` and `/beyond/`.

`/archive/` uses existing authenticated shared transport in production; it is no longer forced to the isolated gallery review. `?soloPreview=1` remains an explicitly labeled single-visitor simulation for non-writing exploration and QA. Direct `?start=scents|books|lobby|salon|camp` entry uses a fixed server-owned validated safe spawn on new admission, not supplied coordinates. Existing session validation, adult consent, duplicate connection handling, host authentication, capacity19guests+host, persisted notes, rate limiting and private results remain unchanged.

The hosted archive-live v6 entrypoint was downloaded and compared with the repository: the only entrypoint changes are the direct-entry helper import and safe entry placement after normal admission. Its dependent room definitions must be deployed alongside the updated client to match expanded galleries, café/lobby/camp, tents and museum pedestal collisions. No schema, role, RLS, secrets, billing or feedback-wall function changes. The previous full hosted function bundle is backed up under ignored `.local/archive-live-v6-backup.json` for rollback.

## Ingredient photography

Thirty owned photo-style reference scenes are provided in three5×2 JPEG atlases plus a dedicated softer T1 picture under `assets/ingredient-photos/` (roughly870KB total). Generated with the built-in image_gen tool, inspected, and targeted botanical edits made for bergamot/violet leaves. Following the owner's feedback, T1 uses `t1-soft-v2.jpg`: a rounded, finely grained pale citrus with a gentle silhouette instead of the rough atlas fruit. Full prompts and targeted changes are recorded next to the images. They are labeled **AI 연출 이미지**, not actual supplier/raw-material photos. Marine/musk/amber/powder pictures are visual associations, not composition claims.

Approach a numbered exhibit to see its matching thumbnail and blind sensory clue; full reading shows a larger picture. Identity remains hidden from text, image alt labels, scene placards and named partners until **향 이름 확인하기** is clicked. Photo cropping is only CSS background positioning; the shared3D scene gains no textures/draw calls from the UI images. The full guide links directly to the workshop page.

## Workshop MVP — `/workshop/`

`model.js` imports the exact existing30 store IDs and authored character data. Each code has a descriptive fragrance family used only for a qualitative preview. Users choose3–8 distinct T/M/L notes and input positive integer drop counts. Editable target defaults70, bounded1–9999. Completion requires all drops present and a sum exactly equal to the target. UI provides count, sum, progress and specific invalid/over-limit guidance. All validation repeats inside the pure preview function.

Rule-based three-line description, a color/mood bottle visual, top/middle/base ratio bar, family percentages and exact per-ingredient drop/percentage table help customers imagine the result. Names are disclosed at the completed result. Drop ratios are not an assertion of measured intensity, longevity, actual perfume color or safety/concentration; the preview explicitly explains the sensory limitation. There is no runtime AI or additional paid service.

Users give their perfume a1–40-character name and save under the separate localStorage key `books-scents-workshop-records-v1`. Versioned records include date, name, exact ingredient IDs/codes/names/drop counts, target, total, generated explanation and preview metadata. `{kind:'individual',base:null}` reserves a future distinction for50–60-drop brand-type base plus10–20custom drops; no such mode is falsely exposed yet. Existing server journals/visitor identities are never overwritten or migrated.

**나의 조향 기록** on the same page opens records without login, supports full composition reading, reusing a recipe and two-step deletion. Records persist only in the current browser/device, disclosed before saving. Blocked/full/corrupt storage produces a visible error; corrupt records are not overwritten, and failed writes never claim success. Saving is idempotent for the current result. Names/text render escaped. This MVP does not upload local records to staff/admin; the pre-existing server-backed journal remains separate.

## Verification and rollout

Local56 protocol/model tests pass, including existing20-client local load, security, café/tents/record persistence and new workshop bounds/exact sum/weighted preview/storage failure/direct spawn/photo-cell mapping. Browser workshop tests cover30 choices, ninth-note rejection, integer inputs, editable target, result, reload/reuse/delete, escaped names, blocked storage,320/390/1200 widths and preservation of old journey/journal entries. Local museum browser physically visits all30 with photos/hidden names/full explanation/button reveal, real public board pagination, zero corrections/errors/production writes. Build and packaging include `/workshop/`, `/beyond/` and root API.

Before promoting main: verify the compiled preview workshop and museum, deploy synchronized archive-live dependencies with unchanged authentication, validate2actual independent clients + guest-admin rejection and safe movement on preview, then advance main with an expected-head lease and verify production URLs. Do not force-overwrite a newly changed main. Do not run20synthetic clients against the live public room. No unrelated application records or schema are changed. Final URLs/commit/function version/results are recorded in ignored `.local/WORKSHOP-LIVE-HANDOFF.md`.
