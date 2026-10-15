# Bundled artwork credits

Producer: `scripts/art/credits.ts`; player view: `game/ui/art_credits.gd`; entries: Home and paused Settings. Notices are project-local packed text/JSON; no network access is required to read them.

`tests/unit/art/credits.test.ts` checks stable ordering, exact notices, used-source projection, original declarations, rejected/missing/pending records and inherited shipped prop attribution. GUT checks actual bundled text, scroll container and selection preservation. `artwork-credits.spec.ts` checks Home/paused return and nested semantic focus. `artwork-offline.spec.ts` opens credits after a cold offline launch and exercises all rooms/roles/results/retry. WebKit's unavailable offline emulation is declared skipped, with physical Safari acceptance pending.

Packaging requires both notice paths and every registered art resource. Final production and diagnostics exports are independently audited; source provenance archives are excluded. Evidence and current build identities are linked from `final-checks.md` and `release.md`.
