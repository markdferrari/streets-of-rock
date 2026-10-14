# Baseline — 2026-10-09

Pinned gameplay reference: `58137537a7d4ef992bd27e3fdf7efe92e5e2add1`. Current checkout before implementation: `45ccaf0e7aef03fe0544c117f5ab528fe52b0381`; clean working tree, new branch `009-godot-rewrite-phase-2`.

Versions: Godot 4.7.2.stable.official.ed1daf0bf; Bun 1.4.2; Node 24.21.0; Blender 5.2.2 LTS; host Python 3.12.3 (Blender embeds Python 3.13.13); package pins TypeScript 6.0.3, Vitest 4.1.11 and Playwright 1.63.0.

| Command | Actual result | Evidence |
| --- | --- | --- |
| bun run test:unit | PASS: 47 files, 167 tests | evidence/legacy-unit.log |
| bun run typecheck | PASS | evidence/legacy-typecheck.log |
| bun run build | PASS | evidence/legacy-build.log |
| bun run audit:build | PASS: 22 assets, 7.05 MiB; intended soundtrack acceptance pending | evidence/legacy-audit.log |
| bun run test:e2e (sandbox) | BLOCKED: local preview server cannot bind | evidence/legacy-browser.log |
| approved browser suite with project browsers/libavif | FAIL: 76 pass, 8 skipped, 2 Chromium failures (12-duo journey timeout; real-time combo timing). Isolated reruns cannot establish a green combined suite. | evidence/legacy-browser-approved.log |
| blender --background --python-exit-code 1 --python tests/blender/run_tests.py | FAIL in restricted sandbox: 22 pass, 2 fail after fresh-process probe timeouts; Blender cleanup then hung | evidence/legacy-blender.log |

Existing suites remain active; no commit is authorized by incomplete/failed checks. Approved `bun run test:blender`: PASS, all 24 tests in 26.290 seconds (evidence/legacy-blender-approved.log). The restricted sandbox results remain recorded separately. No physical device, final-art, soundtrack confirmation or participant evidence is established.

Final full retained browser suite: `bun run test:e2e:legacy`, with one worker and 90-second per-test budget, passed all 78 executable tests in 5.1 minutes; eight existing skips remain (evidence/final-legacy-browser.log). This is a complete suite rerun, separate from the failed parallel baseline. Legacy output is isolated in dist-legacy.
