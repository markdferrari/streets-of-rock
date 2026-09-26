# Asset, Storage, and PWA Delivery Contract

**Version:** 1; same-origin static application, no network API or account.
**Related:** [Research R3–R6](../research.md), [quickstart](../quickstart.md).

## Build and asset inputs

- Root entry is `/`; manifest start_url and scope are `/`, display is standalone, preferred
  orientation is landscape, and icons include 192/512 PNG plus a maskable icon.
- All runtime content is same-origin and included in the release. No CDN fonts, libraries,
  music, external GLB resources, or runtime analytics calls.
- `assets/source/music/` holds the supplied source track plus a short provenance note; a
  prepared looping MP3 under `public/assets/audio/` is the runtime asset. Manual conversion
  is allowed; artist/conversion tools are not required to launch or test the app.
- `public/assets/catalog.json` lists logical asset IDs and runtime URLs/types. The build
  produces an inventory of emitted bytes and SHA-256 digests, plus a build ID shared by
  page and worker. A generated audit list excludes itself, worker bundles, and source maps;
  the shell, app chunks, styles, web manifest, icons, and catalog are included.
- Hash/version every content asset URL, including public music/models, as part of packaging.
  Preserve the mapping from logical IDs to packaged URLs. Check nested GLB resources or
  embed them. Fail packaging for absent, external, or omitted required resources.
- Initial budgets: complete required build ≤30 MiB; each asset ≤16 MiB. These are engineering
  guardrails, with evidence-based adjustment allowed in the plan; never silently exclude a
  large soundtrack to make a build pass.
- Release build must have no test fixture entry points. Diagnostics build has no state-changing
  test controls and is clearly identified when recording device evidence.

## Worker lifecycle and media

Use injectManifest to inject all required build URLs and revisions. Give Workbox caches an
application-specific prefix. Register range support with the precache strategy before its
route registration; register navigation fallback to the cached shell after asset routes.
Music is fully precached as a 200 response. Requests with valid byte ranges receive the
appropriate 206 response from that complete cached object; invalid ranges receive 416.
Do not treat streamed partial responses as evidence of a cached full track.

No skipWaiting, clientsClaim, auto-update reload, or forced controller change. A downloaded
worker waits until all clients of the previous worker close. A notice appears only at title
or results: “Update ready. Close all game windows and reopen to update.” Paused tabs count
as existing clients. A first installation can become active while its first page is still
uncontrolled; query registration.active for readiness and explain that reopening uses the
installed offline version. Do not equate a waiting worker with the current playable build.

## Page-to-worker messages

Use a MessageChannel; all messages carry `requestId`, `protocolVersion: 1`, and `buildId`.
Ignore unknown message types/versions and reject build mismatches. Requests time out after
5 seconds, except repair (60 seconds); timeout becomes unavailable status, not gameplay failure.

| Request | Response | Behavior |
| --- | --- | --- |
| AUDIT_CACHE | CACHE_STATUS { buildId, ready, missingUrls, reason } | Match every required entry to the active build inventory. On initial audit verify stored bytes against digests; cached local audit may be reused until resume/reload or repair, with existence recheck on return. Never persist readiness. |
| REPAIR_CACHE | CACHE_STATUS, optionally CACHE_PROGRESS { completed, total } | Explicit retry online: fetch missing/corrupt full responses, verify digests, write correct revisioned keys, and audit again. Do not replace valid current-build assets with another release. |

Cache failures, rejected storage, timeouts, or mismatched build IDs show “Offline play is not
ready” plus retry/reopen guidance. Already loaded playable assets permit an online run.
Do not block Start solely on offline preparation. Corrupt or absent required visual assets
still block a usable run; audio playback failure permits silent play but not offline-ready
status if the soundtrack itself is missing from cache.

An old shell cannot be repaired from a new release's HTML unless its digest matches. In that
case show close/reopen guidance at title/results to obtain a coherent new build. If browser
storage has been removed entirely, the browser may display its own offline failure before
any application can load; never promise a first-visit offline screen.

## Persistence and deployment

Store only the two versioned local records described in [data model](../data-model.md).
Clamp/validate known fields, reject invalid records, and fall back without blocking play.
No cookies, account identifiers, saved run, or remote results are needed.

Serve the release over HTTPS at a static origin root. Mark hashed content immutable; require
revalidation of HTML, the web manifest, and worker script. Publish complete assets before the
new shell/worker references them; keep previous hashed assets for at least one following
release. Vite preview is for local verification, not the production hosting service.

Future deployment targets AWS. Use the existing static output with a private S3 REST origin
and CloudFront origin access control as the reference topology. Redirect viewers to HTTPS,
use signed HTTPS requests to the origin, and set the default root object to index.html.
The game runs in the browser; no Node server, Lambda, database, or browser AWS credentials
are required by this architecture.

For mutable entry files (HTML, worker, manifest, and any unversioned inventory/catalog), use
Cache-Control: no-cache, max-age=0, must-revalidate and a CloudFront behavior with minimum,
default, and maximum TTL zero. Hash-named content uses public, max-age=31536000, immutable.
Preserve correct content types for JavaScript, JSON/manifests, models, and audio, and byte-range
delivery for music. Keep missing-asset errors as errors; do not broadly rewrite all 403/404
responses to index.html, which would hide missing precache resources. The game uses only the
root entry and needs no server-side application routing.

[AWS documents S3-origin HTTPS behavior](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/RequestAndResponseBehaviorS3Origin.html)
and [the effect of minimum cache TTL](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistValuesCacheBehavior.html).

Provisioning, AWS account/region/domain selection, and deployment automation remain future
work. This clarification establishes compatibility and a reference deployment, not a request
to create AWS resources or publish the game.
