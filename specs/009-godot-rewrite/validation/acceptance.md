# Godot cutover acceptance — phase 7

Status: **technical cutover complete and automated verification passed; manual acceptance explicitly waived**.
The owner instructed “waive manual acceptance gates and proceed with cutover”.
Phone/platform/performance/player outcomes remain **unverified**. See the
[exact decision](manual-waiver.md), [retirement/rollback record](cutover.md) and
[current automated results](cutover-validation.md). Earlier phase7 results remain
historical evidence, not new device measurements.

The shipped runtime is Godot plus limited browser glue. Legacy gameplay/render/UI
sources and mapped tests/dependencies are retired with immutable parity/upgrade
fixtures preserved. All remaining software suites, type checks, Release smoke and
resource/budget audits must pass after cutover. The previous production JS artifact
is locally archived and digest-locked. Nothing is provisioned or published.

## Final evidence schema

`acceptance.json` identifies the exact audited release. Its required fields are
`buildId`, `statuses`, `evidence`, `soundtrack` and `manualWaiver` when used.
Categories are phones, performance, playtest, soundtrack, offlineUpdate, coverage,
conceptReview, inGameReview and characterWorkflow. All require digest-verified
current-build references `{buildId, path, sha256}`. Nonmanual categories require pass.
Only phones, performance, playtest and offlineUpdate may be waived.

A manual waiver requires `{approvedBy: "owner", buildId, path, sha256, reason}`:
the exact current build, an existing decision file, actual SHA-256 and nonempty
reason. Undocumented, modified, stale or nonmanual waivers fail. Soundtrack still
requires `ownerApproved: true`, actual title/permission basis, configured
`public/assets/audio/brightside.mp3` and its approved digest.

`bun run audit:build -- --final` must pass automated/resource/integrity checks and
print each waived category as unverified. This acceptance is based on the owner's
explicit exception; it does not establish the original phone/player success thresholds.
