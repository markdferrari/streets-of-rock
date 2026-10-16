# Browser validation

2026-10-16; Linux desktop Chromium and WebKit through pinned Playwright 1.63.0, landscape 844×390 unless an inherited layout test specifies otherwise. The default development port 4181 was occupied and was preserved. Temporary configs inherit the repository projects/test lists and change only absolute test/output paths, fixture selection and local server ports.

## Executed scopes

| Scope | Command / actual outcome |
|---|---|
| Existing Web Test regressions | `bunx playwright test --config .tmp/hero-existing.config.ts --grep-invert 'ordinary gameplay samples' --workers=2`: 125 pass, 6 declared skips, 5 timing failures under concurrent load |
| Existing failures, isolated | Same config with `--last-failed --workers=1`: all 5 pass; combined existing scope is 130 pass / 6 declared skips |
| New hero journeys | `.tmp/hero-browser.config.ts`, selected ordinary-gameplay, twelve-duo, readiness-repair, reduced-motion/terminal Resume and cold-offline tests: 36 pass, 1 declared skip, one aggregate offline timeout |
| Four-role cached journey rerun | Same hero config, `--project=chromium -g 'verified cached hero'`: pass. Combined hero scope is 37 pass / 1 declared skip |
| Final Web Test smoke | Same hero config, `-g 'ordinary gameplay samples'`: both browsers pass on final Web Test `207cfb69917d561536926727190ea7e10201da5f73d38405276882170cb93ff0` |
| Final actual Release | `SOR_SKIP_EXPORT=1 SOR_RELEASE_DIR=dist-hero-final bun run test:e2e:release`: 5 pass / 3 declared skips on `86082f722997c4a9a94fee878d8202507e7cbedb7f8fb985f11491c4951d2d95` |
| Final Diagnostics captures | `bunx playwright test --config .tmp/hero-diagnostics.config.ts`: both browsers pass; four ordinary fighter/partner gameplay captures per browser and bounded reports on `7efc1a66604dc042640424dbb5685f3474f5ca8bd6650ee5cfbf92ff594e9bed` |

The existing regression bundle was `db9133fd4e3566dc78b1753e98b58c5fbd0a1bdaccf83306bfdc9a3c21525f25` at port 4188. The hero asset/delivery bundle was `97125b5e8dbedd393f3213f1ace88ba4e51acca461eac94b79e1653db49039e0` at port 4187. Unchanged checks were retained across the final contact-timing/overlay fixes; affected source/export/contact checks passed natively, and ordinary gameplay was rechecked in both browsers on the final bundle. [Release validation](release.md) identifies the final immutable Release/Diagnostics candidates and their final boot/exclusion/capture checks.

The initial failures were explicit deadline failures: a boot predicate used five seconds, three countdown-first-second interruptions missed that short interval under concurrent load, and long multi-role offline journeys exhausted their aggregate budgets. The shared selection helper now uses the existing 60-second boot allowance. The new four-role/offline/retry test has an explicit 180-second total budget, retaining its individual cache/readiness deadlines; it passed in 2.1 minutes under load. All five inherited failures passed in a single-worker rerun without changing gameplay/countdown timing; the inherited offline journey took 30.5 seconds alone. Missing/empty reports were never counted as passing.

## Coverage and limits

- All twelve ordered duos: independent skeletons, fighter actions after partner knockout, endpoint hold and retained-duo Retry with fresh view ownership.
- Real ordinary gameplay profile sampling, Heavy, bounded terminal fall, frozen simulation tick/active time and fresh Retry.
- Four-character load failure and repair through the cached-template boundary with locked duo and actionable Retry.
- Still reduced-motion previews, explicit terminal Resume, frozen results and unchanged active time.
- Verified cold cached launch, source credits, all four characters in both roles and results/retry. Fixture victory/room shortcuts remain supplementary rather than physical full-run evidence.
- Inherited simultaneous/cancelled input, lifecycle/countdown/Special interruption, safe updates, denied audio/storage, scenery/enemy presentation, selection, offline and teardown checks.
- Candidate playback uses retained original GLBs; original feature 010/011 comparison screenshots and recordings were restored after automated recapture so historical review evidence remains intact.

Declared skips retain their existing browser limitations: WebKit cold-offline emulation and native simultaneous-touch checks, the Chromium-only insecure-LAN case, and diagnostics-only checks when running Release. These do not establish Safari offline or physical touchscreen acceptance. [Phone](iphone-12.md), [Pixel](pixel-6.md), [offline](offline-reliability.md), [player](playtest.md) and final owner fighter/companion review records remain pending.

## Recorded desktop baseline

The final [Chromium report](gameplay/chromium-diagnostics.json) records Chromium 153.0.8010.12, 38 frame samples, 13.31 rolling FPS, 58 draw calls, 34,752 triangles and 9 owned resources. The final [WebKit report](gameplay/webkit-diagnostics.json) records WebKit 26.6, 77 samples, 40.76 rolling FPS and the same draw/triangle/ownership counts. These are short Linux desktop runs in the first encounter, not reference-phone or sustained busiest-encounter measurements. Neither establishes the 30 FPS phone minimum or 60 FPS target.
