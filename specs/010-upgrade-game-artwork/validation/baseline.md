# Baseline — T003

2026-10-14; branch `010-upgrade-game-artwork`; application source `71f148a412bf39e1b50855ed7901736a3eb0990b`. [Tracked blobs/source commits](evidence/runtime-sources.json) distinguish working tooling edits. The provenance-exclusion regression changes tooling only; actual Test/Release payload identities remain unchanged.

## Commands and actual outcomes

| Command / environment | Result | Evidence |
| --- | --- | --- |
| `bun install --frozen-lockfile --cache-dir .bun-cache` | PASS; 370 installed packages checked, no changes | [install](evidence/baseline-install.txt) |
| `bun run test` (sandbox) | FAIL at Test export: local socket restriction; browser and later suites not reached | [restricted attempt](evidence/baseline-tests.txt) |
| `bun run test` (local socket access, default browser environment) | 59 platform tests, 54 GUT tests and 26 parity fixtures pass; Chromium 47 pass; WebKit 47 cannot launch due missing libavif16; release/Blender not reached | [default host attempt](evidence/baseline-tests-unrestricted.txt) |
| `PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers LD_LIBRARY_PATH="$PWD/.browser-libs/usr/lib/x86_64-linux-gnu" bun run test` (local socket access) | FAIL: 88 browser passes, 5 declared skips, 1 WebKit Lion/Crow selection failure (remained selecting after four clicks). Platform 59/GUT 54/parity 26 passed before the browser failure. Release/Blender were not reached by this combined command | [configured full suite](evidence/baseline-tests-configured.txt) |
| `bun run typecheck` | PASS TypeScript + Godot; repeated after tooling fix | [baseline](evidence/baseline-typecheck.txt), [post-change](evidence/final-typecheck.txt) |
| `bun run build` | PASS actual Web Release export | [baseline export](evidence/baseline-build.txt), [post-change export](evidence/provenance-build.txt) |
| `bun run audit:build` | PASS 5.41 MiB content / 37.96 MiB verified stock engine / 45,480,570 cached bytes; gzip 15,837,227 and Brotli 13,886,785 are estimates | [baseline audit](evidence/baseline-audit.txt), [post-change audit](evidence/provenance-audit.txt) |
| `bun run test:platform` after regression fix | PASS all 60 current platform/tooling tests (15 files); observed expected assertion failure first | [red](evidence/provenance-export-red.txt), [green](evidence/provenance-export-green.txt), [TDD record](tdd.md) |
| Real release PCK inspection | PASS no art-provenance, supplier source/evidence or concept resources; runtime release identity unchanged | [membership](evidence/provenance-pck.txt) |

[Tool versions](evidence/tool-versions.txt): Bun 1.4.2, Node v24.21.0, Godot 4.7.2.stable.official.ed1daf0bf, Blender 5.2.2 LTS/d13f752e3b9c, Python 3.12.3. GUT 9.7.1 and engine/template hashes are pinned in the tracked lock/vendor record; export verifies installed bytes rather than trusting version labels.

Additional independent checks after the failed combined run:

| Command | Actual outcome | Evidence |
| --- | --- | --- |
| Configured `SOR_SKIP_EXPORT=1 bun run test:e2e:godot -- --project webkit --grep 'lion with crow'` | PASS 1; isolated nonreproduction does not make the combined run green | [isolated retry](evidence/baseline-webkit-retry.txt) |
| Configured `bun run test:e2e:release` | PASS 3, SKIP 3 by existing project/mode rules (insecure-origin CDP and Diagnostics-only checks) | [Release smoke](evidence/baseline-release-smoke.txt) |
| `bun run test:blender` (restricted) | Fresh-process geometry probe failed; subsequent probe hung, run interrupted with exit 130. Same restricted-probe issue documented in 009 baseline | [restricted Blender](evidence/baseline-blender.txt) |
| `bun run test:blender` (unrestricted retry) | PASS all 24 retained Blender tests; fresh-process probes complete outside the restricted sandbox | [Blender retry](evidence/baseline-blender-unrestricted.txt) |

The five Web Test skips are existing WebKit limitations: two native CDP touch cases and three offline/worker scenarios. They are not passing Safari/phone evidence. No commit is made because the combined automated gate is unresolved; no retries or timeouts are changed to conceal it.

## Build identities and captures

Web Test: `7d04c356665d60d6c4f69a32ea1d2fbfdb3246f8b83afc67d4a76e60c78a614d`.
Web Release: `9b5f79acdfb0eed7bd4faf117c29f16f61c09f0c371cad3614a9167eea429beb`.

[36 room/layout captures](evidence/baseline-views/captures.json) cover each area's entry/center/right edge at 667x375, 844x390 and 915x412, using Cow/Crow. Each records screenshot SHA-256 and full simulation/camera/layout/settings snapshot, plus actual Test inventory. [17 additional action/connector/boss captures and one pending outcome](evidence/baseline-actions/captures.json) use Cow/Crow and Lion/Plates at 844x390: Light/Heavy/Dodge/Special, all three connector positions, Liam phase one in each duo and an actual phase-two snapshot at HP 760 using Lion/Plates. Cow did not reach phase two within the capture budget; that attempted view is honestly pending, not a fake capture.

Capture drivers: [rooms](capture-baseline.ts), [actions](capture-actions.ts). Run against the existing locally served Web Test at port 4181. Snapshot sampling precedes screenshot capture and can differ by a browser frame; these are comparison references, not exact contact-tick validation. Captured poses/actions and camera state allow matched later comparisons. Immutable parity records remain the exact deterministic traces.

[29 hero source/runtime/portrait fingerprints](evidence/hero-fingerprints.json) were captured before visual work and rechecked unchanged. Concept sources import references without saving over them. Existing e2e tests overwrite historical 009 Lion/Plates PNGs as a side effect; restore those test-generated changes after the run so this feature does not relabel old reviews.

## Setup/acceptance limits

Existing `.gitignore` covers Node/build/cache/editor/Blender generated files, logs and environment files. No Docker, ESLint, Prettier, Terraform, Helm or publishing configuration requires a new ignore file. Existing `specs/.gdignore` and new `assets/art-sources/.gdignore` exclude review/authoring inputs from Godot import; explicit source groups exclude provenance from every web build mode. Node dependencies use Bun with a frozen lockfile.

No new production art, imported enemy clips, representative busy-scene export proof, physical iPhone 12/Pixel 6 checks, owner approvals or five-player outcomes are established. Feature 009's cutover waiver does not apply to new artwork acceptance. T006 remains pending owner concept review; subsequent foundation/story tasks must keep this status visible.
