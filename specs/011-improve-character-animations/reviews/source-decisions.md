# Source comparison and decisions

T015; FR-001/010, SC-001 and PRD AC-066. Eight actual-character trials and four matched current/KayKit/Universal comparisons are prepared. **Owner source selection is complete: Universal Animation Library Standard for Cow, Crow, Lion and Plates.** On 2026-10-16 the project owner stated: “I like universal in all cases - lets go with that”. This supersedes the earlier mixed-source recommendation.

| Character | Matched playback (Current / KayKit / Universal) | Production source | Decision |
| --- | --- | --- | --- |
| Cow | [Video](comparisons/chromium-cow.webm), [details](cow-candidates.md) | Universal Animation Library Standard | Selected by owner, 2026-10-16 |
| Crow | [Video](comparisons/chromium-crow.webm), [details](crow-candidates.md) | Universal Animation Library Standard | Selected by owner, 2026-10-16 |
| Lion | [Video](comparisons/chromium-lion.webm), [details](lion-candidates.md) | Universal Animation Library Standard | Selected by owner, 2026-10-16 |
| Plates | [Video](comparisons/chromium-plates.webm), [details](plates-candidates.md) | Universal Animation Library Standard | Selected by owner, 2026-10-16 |

Each video covers Idle, Move and Attack in both facings at native 1× speed, with every donor cycle shown. PNGs capture matched normalized midpoints. Detailed records link WebKit equivalents, exact source clips/hashes, editable targets, numeric validation, adaptation limits and missing production coverage. [Source inventory](candidate-inventory.json) and `content/art-provenance.json` retain supplier/license identities without assuming the libraries suit every action.

The reusable review is Web Test only: build with `bun scripts/godot/export.ts test --output-dir dist-hero-review`, serve `bun run preview -- --dir dist-hero-review --host 127.0.0.1 --port 4184`, then open `http://127.0.0.1:4184/?fixture=hero-animation&character=cow` (also crow/lion/plates). Controls change character, action, facing and Pause/Resume. `__sorHeroReview.command('sample', 0.25)` in the test page samples a normalized landmark explicitly. The full production profile validator is unchanged by partial trials; no review/source files enter Release.

T015 is complete. Universal is the primary motion source for all four characters in both fighter and companion roles. Adapt its clips to each character's anatomy and existing gameplay timing. No action-specific exclusions were requested. Existing Specials and other unsupported coverage may require custom motion; selecting the source does not declare those missing actions produced or accepted.

KayKit is not selected for the four heroes because the owner preferred Universal in all four comparisons. Its trials and source evidence remain retained; its accepted license and existing enemy usage are unaffected. The existing provenance ledger records this hero-specific decision separately from source licensing.

The generated trial reports, screenshots/videos and fixture build retain their generation-time pending labels; this dated decision and the manifest's `sourceDecision` are the current source-choice authority. Their hashes and build identity remain valid. Final production, full-action/role review, phone measurements and five-player acceptance remain pending under later tasks. Full production T023–T026 now has its T015 source-review prerequisite satisfied. No phase 4 implementation is included here.
