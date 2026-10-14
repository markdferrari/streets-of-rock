# Godot runtime cutover — phase 7

Status: **complete; post-cutover automated validation passed** (T080/T081).
The [explicit owner waiver](manual-waiver.md) authorizes this transition with manual
phone/player evidence unverified. Automated owners and asset integrity remain required.

## Retired and preserved owners

The [deletion/replacement manifest](evidence/cutover-manifest.json) enumerates every
retired file, all 64 old unit/integration/browser test mappings and the new runtime
owners. The 132 retired files include `src/`, legacy fixtures, mapped JS tests, the
Vite game entry/config and old reference generation scripts. Immutable replay fixtures,
comparator, historical releases/tree locks and the upgrade driver's selection helper
remain. That helper controls the archived legacy release during the Godot upgrade
test and imports no live JS game runtime. Reference generation is retired because
those snapshots are immutable; its original scripts remain in commit `ddca43f`.

Normal character validation is now exclusively the headless Godot adapter. Tooling
contract tests exercise real imported resources and alternate project roots; they
cannot opt into a JS definition validator that bypasses assets. The old JS inventory/
audit branch is retired; all current audits consume Godot release inventories.

Three.js/@types/three, vite-plugin-pwa, Workbox range/strategy dependencies and legacy
commands are removed from package.json and Bun's lockfile. Vite remains because
Vitest needs it. Unit tests now run platform/tooling and GUT; browser tests run Web
Test journeys plus actual Release smoke. `playwright test` defaults to Godot journeys.

## Actual rollback artifact

Before deletion, a real legacy production build was generated and passed its audit:
build `8a1f739e4d934900`, 22 inventoried assets, 7.05 MiB. It is preserved at
`.tools/cutover/legacy-release/` and `.tools/cutover/legacy-release.tar.gz`.
[The archive/file lock](evidence/cutover-legacy-rollback.json) records every file digest
and the archive SHA-256. These ignored artifacts are preserved locally; move the
archive into deployment artifact storage before any publication. The original source
and lockfile remain recoverable from commit `ddca43f`.

The first archival audit found unused Godot `.import` editor metadata copied by Vite
from `public/`; removing only that metadata from the archive output and regenerating
its inventory produced a passing production audit. Runtime assets and worker bytes
were retained. Both preexisting immutable upgrade fixture trees remain byte-identical.
Keep the original hosted JS asset URLs during migration; see [release.md](release.md).

## Verification

See [cutover-validation.md](cutover-validation.md) for post-cutover results and exact
build IDs. The initial check caught the upgrade test's retained selection helper;
it was restored before rerunning. Prior review screenshots are preserved under their
historical IDs; fresh browser captures are recorded separately. No hosting is published.
