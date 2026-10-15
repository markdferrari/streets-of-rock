# Final artwork release artifacts

All artifacts use pinned Godot 4.7.2 standard Compatibility web templates. Exact emitted files, inventory hashes, ownership and stock-engine fingerprints are archived in `evidence/complete-art/*-report.json`. The strict manual acceptance gate remains pending; these are verified local builds, not a deployment.

| Artifact | Build ID | Content bytes | Verified engine bytes | Packs |
| --- | --- | ---: | ---: | ---: |
| dist | `be1468cb326533addf2759f2188ff443d31e7dbfe7b65e48f7b870d05c1f4be4` | 6047601 | 39804840 | 1 |
| dist-diagnostics | `4710b40647ff4d445476b192930c88f6d18a13b8b5ff34ea241f5e002a71c836` | 6051164 | 39804840 | 1 |
| dist-art-review | `4eae6e07614320ed746c1558aea3d3c48489cbdb0d03b7ddc2f4fefdfb375f8b` | 7326330 | 38228054 | 1 |
| dist-art-split | `2554e8cc1180b81f2e84f4b4ff1d3d285d34c5ce7e4ea8e0fa56f72d6f0f3588` | 7329786 | 38228054 | 2 |

Content stays below 30 MiB aggregate and every physical content file below 16 MiB. Only byte-verified stock engine payloads receive the inherited engine exception. Raw inventories count all emitted content, packaging overhead and cached bytes; supplemental packs contain each actual exported application resource once, with bootstrap metadata first and all packs mounted before dependent scenes load.

The final five-MiB forced-split test export has two real packs and passes eight cold-browser checks with two declared capability skips. Three MiB is below the unchanged soundtrack resource size and correctly fails rather than arbitrarily splitting that resource. The complete full export is partitioned at actual PCK entry boundaries; per-category duplicate exports were removed.

Production excludes authoring validators, supplier archives, provenance records, Blender/source inputs, tests, neutral/pilot fixtures, diagnostic hooks and review media. Both generated artwork notice files are included in the inventory/worker cache and audited as mandatory paths. Query parameters cannot activate test or diagnostic hooks in Release. The test export additionally contains intentional review fixtures and retained SVG regression references; the production export no longer ships the obsolete eight SVG backdrops.

| Artifact | Complete cached bytes | gzip estimate | Brotli estimate |
| --- | ---: | ---: | ---: |
| dist | 45852441 | 16165940 | 14206650 |
| dist-diagnostics | 45856004 | 16169164 | 14209299 |

Compression figures are local estimates, not measurements of hosted transfer. No hosting was provisioned. Real Release smoke passes three cases with three mode/capability skips; both engines download diagnostics reports. The same production build ID was retained after the report-status-only regeneration. See [final checks](final-checks.md).

Current feature acceptance uses `bun run audit:build -- --final --evidence specs/010-upgrade-game-artwork/validation/acceptance.json`. It fails on pending physical phone evidence, as required. The inherited default still reads feature 009 and cannot silently transfer its older waiver. See [acceptance](acceptance.md).
