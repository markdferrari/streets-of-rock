# Post-cutover validation — 2026-10-14

Branch: `009-phase-7-validation`. The owner's [explicit manual waiver](manual-waiver.md)
is applied; automated gates retain their requirements. Runtime/dependency retirement
is recorded in [cutover.md](cutover.md) and its exact replacement manifest.

## Current results

- Platform/tooling: 59 tests pass, including two waiver regression cases.
- GUT: 54 tests / 753 assertions pass; 14 existing float/int warnings remain.
- TypeScript tooling and Godot script checks pass after restoring the helper used
  only by immutable legacy-upgrade browser fixtures.
- All 26 reference fixtures / 780 state/event/camera checkpoints match.
- Blender: 24 tests pass.
- Frozen Bun install verifies the updated lockfile. Five obsolete packages are removed.
- Fresh Release and Diagnostics exports/ordinary audits pass; gameplay output identity
  is unchanged by retirement of ignored JS sources and tools.
- Complete post-cutover Chromium/WebKit journeys: 89 pass, five capability skips.
- Actual Release smoke: three pass, three mode/browser-specific skips.
- Owner-waiver final audit passes and prints the waived categories as unverified.

See `evidence/cutover-*.log` for actual commands. The waiver tests first failed for
expected rejection/acceptance behavior before the validator changed. Tool contract
checks were migrated to the actual Godot validator before removing the JS fallback.
The initial cutover type/browser check found the upgrade-only selection helper;
it was retained and the complete check rerun. No test assertion was weakened.

## Remaining empirical limitations

Phones, active-run performance, installed/offline/update mobile procedures and
five-player outcomes are waived/unverified. Original thresholds and procedures are
retained in their records. Native multitouch/offline WebKit emulator limitations
remain explicitly skipped; the owner waiver covers the missing physical evidence.
Final audit must explicitly report these limitations when it succeeds.

## Verified artifacts and final audit

Post-cutover release artifact reports are [Release](evidence/cutover-dist-report.json),
[Web Test](evidence/cutover-dist-test-report.json) and
[Diagnostics](evidence/cutover-dist-diagnostics-report.json). The actual final audit
[passes](evidence/cutover-audit-final.log) and prints phones/performance/playtest/
offlineUpdate as owner-waived and unverified. The 30 MiB content, 16 MiB physical-file,
64 MiB decoded-backdrop and verified engine exceptions remain enforced.

Evidence logs: [units](evidence/cutover-unit.log), [typecheck](evidence/cutover-typecheck.log),
[parity](evidence/cutover-parity.log), [Blender](evidence/cutover-blender.log),
[frozen lockfile](evidence/cutover-frozen.log),
[ordinary Release audit](evidence/cutover-audit-release.log) and
[Diagnostics audit](evidence/cutover-audit-diagnostics.log).
The locally preserved legacy production build also
[passes its original audit](evidence/cutover-legacy-audit.log).

Diagnostics smoke after cutover: five browser checks pass with one Chromium-only
scenario skipped on WebKit (46.1 seconds). Both browsers download the structured
local report. See [actual Diagnostics log](evidence/cutover-diagnostics-e2e.log).

## Completion

The full [post-cutover browser command](evidence/cutover-e2e.log) exits successfully:
89 Web Test journey checks pass (five explicit WebKit offline/CDP skips; 14.1 minutes),
then three actual Release smoke checks pass (three mode/browser skips; 27.7 seconds).
Separate Diagnostics smoke passes five checks with one browser-specific skip.
All 113 platform/GUT tests, 780 replay checkpoints, 97 browser checks and 24 Blender
tests pass. Type checks, frozen lockfile and all-mode exports/ordinary audits pass.
The current final audit succeeds with the documented manual waiver.

All 81 tasks are closed. T066's manual portion and T076/T077 are closed by waiver,
not measured passes. T078 reconciles that exception; T080/T081 complete runtime
retirement and final verification. The retirement/replacement/archive hashes and
local documentation links pass consistency checks. Original review screenshot bytes
are preserved; [current captures](evidence/cutover-character-captures.json) record
this run separately. No runtime gameplay/asset bytes changed: all exported build IDs
match the preceding Godot implementation. No hosting was published and changes are
uncommitted on the feature branch.

No `.specify/extensions.yml` exists; pre/post extension hooks are skipped accordingly.
