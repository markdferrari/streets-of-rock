# Streets of Rock

A landscape mobile browser game with four fighters and one four-room level.
The [Godot rewrite](specs/009-godot-rewrite/spec.md) is implemented and the JS runtime
is retired. Manual phone/player acceptance is explicitly waived by the owner and
remains unverified.
See [current acceptance](specs/009-godot-rewrite/validation/acceptance.md).

Use Bun 1.4.2, Node 24.21.0 and standard Godot 4.7.2. On a feature branch, run
`bun install --frozen-lockfile`, `bun run setup:godot`, then `bun run dev` to open
the root Godot project. Templates are verified and installed project-locally.

For browser development run `bun run build:test`, then
`bun run preview -- --dir dist-test --host 127.0.0.1 --port 4173`.
Open `http://127.0.0.1:4173/` to play the normal game. The approved KayKit-driven
Grunt and bartender rigs now appear during encounters: Grunts in the first wave,
and bartenders from the second wave. `/?fixture=enemy-art` opens the separate
motion review. Enforcer/Liam artwork and furnished rooms are still in progress;
see [feature 010 gameplay integration](specs/010-upgrade-game-artwork/reviews/gameplay-enemies.md).

For a production artifact run `bun run build` and `bun run audit:build`.
To play that build on another device on your local network, run
`bun run preview -- --dir dist --host 0.0.0.0 --port 4173`, then open
`http://<your-computer-IP>:4173/` on the other device. `hostname -I` lists the
computer's network addresses.
`bun run build:diagnostics` creates the isolated read-only diagnostics artifact.

Run `bun run typecheck` and `bun run test` for the full current checks: Godot units, browser/tooling, parity, both browser projects and Blender.
Install browser binaries with `bun run playwright install chromium webkit` and the
required host libraries. Blender 5.2.2 LTS is needed for asset tests.
[Quickstart](specs/009-godot-rewrite/quickstart.md) contains focused commands,
local library overrides, review procedures and current limitations.

The [cutover record](specs/009-godot-rewrite/validation/cutover.md) maps retired tests
to replacements and identifies the preserved legacy production rollback archive.
Immutable reference fixtures and cross-release upgrade tests remain active.

Serve the production artifact over static HTTPS with correct MIME types and an
error for missing immutable assets. Keep root HTML/worker revalidated and release
URLs immutable. [Release instructions](specs/009-godot-rewrite/validation/release.md)
cover installation identity, publication order and rollback. Local LAN HTTP can
support online review, but offline/service-worker facilities require HTTPS or localhost.
No hosting is provisioned by this work.

The 3D venue and all four enemy designs are documented in the
[artwork quickstart](specs/010-upgrade-game-artwork/quickstart.md).
Run `bun run validate:art` for full source/import validation and `bun run test:art`
for focused checks. `bun scripts/art/credits.ts` regenerates bundled artwork
notices; exports regenerate them automatically. Artwork Credits are available
from Home and paused Settings, including offline. Editable sources and supplier
archives stay outside production exports. Physical-phone and five-player
acceptance remain tracked separately from implementation and owner visual approval.
