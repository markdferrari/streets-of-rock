# Release evidence and static-host rollback — phase 7

Evaluated 2026-10-14. Ordinary build audits **pass**; final acceptance is **pending**.
Release and Diagnostics were freshly exported with pinned Godot 4.7.2 and project-local
locked templates. Test was exported by the current browser suite. All required art,
models/portraits/clips/props and bundled audio are present; compiled legacy/test/source
resources are excluded by the audit. The intended MP3 is [owner approved](soundtrack.md).

| Mode/output | Build ID | Content bytes | Verified engine bytes | Required cached payload bytes | gzip estimate | Brotli estimate |
|---|---|---:|---:|---:|---:|---:|
| dist | `9b5f79acdfb0eed7bd4faf117c29f16f61c09f0c371cad3614a9167eea429beb` | 5675730 | 39804840 | 45480570 | 15837227 | 13886785 |
| dist-test | `7e2d5cd7d5fb7e1758fed73a1806989d187565918bb364f3cdaf0a5f2497f3b0` | 6149235 | 38228054 | 44377289 | 16267639 | 14415810 |
| dist-diagnostics | `3847c7405ada9a55db6b1d2e779511650b831f551822625231dc21aea5f523a9` | 5677949 | 39804840 | 45482789 | 15838740 | 13888252 |

The [Release report](evidence/phase7-dist-report.json),
[Test report](evidence/phase7-dist-test-report.json) and
[Diagnostics report](evidence/phase7-dist-diagnostics-report.json) retain engine
fingerprints, worker/inventory digests, per-resource pack ownership and import paths.
Every mode uses one content pack. Complete content is below 30 MiB and every physical
content file below 16 MiB. Only verified official engine bytes receive the exception.
Backdrop decoded texture bytes including mipmaps: 55,924,064 (<64 MiB).

## Estimates and measured transfers

The gzip/Brotli columns are deterministic per-file estimates, not hosted-transfer or
phone startup measurements. A real localhost HTTP fetch of all 13 emitted Release
files measured **45,480,570 response-body bytes** with identity encoding. Each request
returned 200 with appropriate MIME/cache headers; a missing immutable WASM returned
404. See [actual request measurements](evidence/phase7-transfer.json). This local
measurement excludes HTTP headers/TLS overhead and does not claim production CDN or
phone performance. Required cached payload includes inventory/worker/shell duplicates;
browser-controlled Cache Storage metadata is excluded from the byte total.

## Hosting instructions

Serve `dist/` over HTTPS with root scope. Preserve manifest `id: "/"`, `start_url: "/"`,
`scope: "/"`, landscape orientation and existing icon identity. Use `application/wasm`
for WASM, JavaScript MIME for scripts, `application/octet-stream` for PCK,
`application/json` for JSON and `application/manifest+json` for the manifest.
Missing immutable assets must return 404, never the root HTML. Revalidate root HTML,
manifest and `/sw.js`; serve `releases/<buildId>/` with immutable long-term caching.
The single-thread build needs no cross-origin-isolation headers.

Stage and verify immutable release assets first. Publish root shell/worker references
last, only after checking inventory SHA-256, exact mount order and every required URL.
Registration is `/sw.js` at root scope. Activation is natural after all old controlled
windows close. Do not force worker activation, claim clients or reload active runs.
No hosting resources or publication were performed by this task.

## Preservation and rollback

The previous deployable JS fixture remains at `tests/reference/releases/legacy/`:
build `184f564e58e31647`, 41 files, tree digest
`2abcf3d1e1b0a1aaed7cbb509153e7c4c946061704d62e11586491a09ebf06b3`.
Its immutable lock is `tests/reference/releases/legacy.json`. The migration fixture
at `tests/reference/releases/godot/` also remains unchanged, locked by `godot.json`.
Browser upgrade tests verify their tree identities. These are historical fixtures;
the actual currently hosted release must also be archived before a deployment.

Retain the prior host root shell, worker, inventory, immutable release trees and
original JS `/assets/` URLs for the migration window. Do not replace the host with a
cleaned local output directory that deletes those URLs. Roll back by restoring the
archived previous root shell/worker references while keeping both generations' assets.
Old running clients keep their existing build. The prior worker becomes active at
the natural close-all-windows boundary. Verify saved data, offline cold launch,
results/retry and new-window identity after rollback.

## Final gate

Current suite results are in [phase7.md](phase7.md). The final audit
[rejects the pending phones status](evidence/phase7-audit-final.log) in the actual
current-build acceptance.json. `audit:build -- --final` must fail
until phone, performance and five-player evidence for this exact Release exists.
Owner soundtrack/art/character decisions are approved; physical measurements and
participant outcomes remain unavailable. Cutover is governed by [cutover.md](cutover.md).

## Subsequent owner-authorized cutover

The owner explicitly [waived the outstanding manual acceptance gates](manual-waiver.md).
Earlier pending labels and results above remain historical. See [cutover](cutover.md)
and [post-cutover validation](cutover-validation.md) for the current technical state.
No phone/player observation was converted into a measured pass.

Current post-cutover Release identity and bytes are unchanged. The
[post-cutover final audit](evidence/cutover-audit-final.log) passes with the explicit
manual waiver and prints waived categories as unverified. The source runtime has
been retired; the actual prior production archive and its digest/file lock are
identified in cutover.md. Retain those original hosted URLs during publication.
