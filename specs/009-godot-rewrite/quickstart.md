# Quickstart and Validation: Godot Rewrite

Feature: [spec.md](spec.md). The runtime cutover is implemented. Manual phone/player
acceptance is [explicitly waived and unverified](validation/manual-waiver.md).
Current results are in [cutover-validation.md](validation/cutover-validation.md).
The [cutover record](validation/cutover.md) preserves replacements and rollback artifacts.

## Setup and development

Use a feature branch, Bun 1.4.2, Node 24.21.0, standard Godot 4.7.2 with matching
project-local official templates, GUT 9.7.1, Blender 5.2.2 LTS and Python 3.12.3.

```sh
bun install --frozen-lockfile
bun run setup:godot
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers bun run playwright install chromium webkit
bun run dev
```

`dev` opens the root Godot editor. For browser iteration:

```sh
bun run build:test
bun run preview -- --dir dist-test --host 127.0.0.1 --port 4173
```

WASM/PCK receive correct MIME types; missing immutable assets return errors. Open
`http://127.0.0.1:4173/?review=rooms&room=0` through normal distinct-duo selection
for a local room review. Room values 0–3 select entrance, bar, dance floor and
stage/VIP. Review fixtures are absent from Release/Diagnostics. WASD/arrows move;
J Light, K Heavy, Space Dodge, L Special. Native HUD buttons support touch/mouse.

## Automated verification

| Command | Current owner |
|---|---|
| `bun run typecheck` | TypeScript tooling plus all Godot static script checks. |
| `bun run test:platform` | Browser adapter/cache/semantics and packaging/authoring tool contracts. |
| `bun run test:godot` | GUT simulation, session, content, input and presentation tests. |
| `bun run test:unit` | Platform/tooling plus GUT; retired JS suites are mapped in the cutover manifest. |
| `bun run test:parity` | All 26 immutable pinned-reference fixtures / 780 ordered state/event/camera checkpoints. |
| `bun run test:e2e` | Web Test journeys and actual Release smoke in Chromium/WebKit. |
| `bun run test:blender` | Retained native Blender asset suite with propagated failures. |
| `bun run test` | All units, parity, e2e and Blender gates. |
| `bun run test:foundation` | Platform/GUT/Web Test/Release integration owners. |
| `bun run build` | Actual Web Release to static `dist/`. |
| `bun run build:test` | Web Test to `dist-test/`, including isolated fixtures. |
| `bun run build:diagnostics` | Isolated read-only Diagnostics to `dist-diagnostics/`. |
| `bun run audit:build` | Physical resources, inventory, ownership, engine fingerprints and budgets. |
| `bun run audit:build -- --final` | Current-build evidence and explicit owner waiver; prints waived categories as unverified. |

On this host WebKit needs the documented project-local libavif bundle:

```sh
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers LD_LIBRARY_PATH="$PWD/.browser-libs/usr/lib/x86_64-linux-gnu" bun run test:e2e
```

A restricted sandbox may need host execution for local servers/importer sockets.
A bind or browser-install failure is infrastructure failure, not a passing game test.
WebKit offline emulation and Chromium-CDP native multi-touch scenarios have explicit
browser-specific skips. Their physical Safari counterparts remain waived/unverified.

To smoke-test an already exported Diagnostics artifact with the Release test owner:

```sh
SOR_SKIP_EXPORT=1 SOR_RELEASE_DIR=dist-diagnostics PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers LD_LIBRARY_PATH="$PWD/.browser-libs/usr/lib/x86_64-linux-gnu" bun run test:e2e:release
```

## Authoring, reference and delivery

```sh
bun scripts/characters/validate.ts --full
bun scripts/characters/validate.ts --character lion --root .
bun scripts/characters/validate.ts --character plates --root .
```

Normal validation is the authoritative Godot validator and always checks source and
imported resources. Preserve unrelated assets when scaffolding or using Blender tools.
Lion/Plates reports and owner decisions remain in this feature's review records.

Reference fixtures and both immutable release-upgrade trees remain active. The old
reference generation scripts and JS game are recoverable from `ddca43f`; current
parity consumes the committed snapshots without regenerating them. Legacy dev/build/
test commands are retired. The actual previous production archive is identified in
[cutover.md](validation/cutover.md).

Use [release.md](validation/release.md) for static HTTPS MIME/cache rules, immutable
asset publication order, legacy URL retention and natural worker activation/rollback.
No host provisioning or publication is performed by these commands. The phone,
art/audio/accessibility/offline and five-player criteria remain available in
[procedures.md](validation/procedures.md), [performance.md](validation/performance.md)
and [playtest.md](validation/playtest.md). The owner waiver closes those manual gates
for this cutover without inventing measurements or participant outcomes.
