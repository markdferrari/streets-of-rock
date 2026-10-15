# Source provenance and offline artwork notices

Final room/enemy exports reference accepted original project artwork, retained Kenney Furniture Kit 2.0, KayKit Character Animations 1.1 and the KayKit Dungeon bottle. Supplier archives, exact license/source-page evidence, hashes, selected files and modification decisions remain under `assets/art-sources/` and in `content/art-provenance.json`. No new download or paid source was introduced. Original fallback sources identify their authorship and supporting script hashes. Prototype-only source records are excluded from shipping credits.

The nonmutating Godot validator checks accepted source status, original declarations, acquired/license-evidence hashes, zero-cost permission assessments, runtime/editable file hashes and actual imported dependencies/clips. Fixture cases reject pending/rejected records, changed sources/GLBs, missing license evidence, stale imports, missing roles and undeclared dependencies. Full and focused validation use the same underlying checks; definitions-only is explicitly insufficient for release readiness.

`bun scripts/art/credits.ts` deterministically projects used accepted resource/prop sources into `public/assets/credits/art-credits.json` and `ARTWORK-NOTICES.txt`. Exact required notices, author declarations and recorded adaptations are included. Both files are generated before export/inventory hashing and packed/cached with the game. The inherited bottle prop registry is included, avoiding omission of KayKit Dungeon from notices.

Credits are scrollable within safe bounds, available on Home and paused Settings, and exposed through semantic controls. Back preserves selection and paused timing. Keyboard focus enters the dialog, returns through nested Settings and wraps in descriptor order. No source URL is fetched to display credits. See dedicated unit/GUT/browser suites and [credits evidence](credits.md).

The owner's blanket visual approval is recorded separately from rights evidence and device/participant observations. No source inspection or owner approval is relabeled as a measured recognition outcome.
