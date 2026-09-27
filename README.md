# Streets of Rock

One level mobile browser game, specified in [the feature spec](specs/001-neon-velvet-mvp/spec.md).

Use Node 24.21.0 and Bun 1.4.2. Install with `bun install --frozen-lockfile`, then run `bun run dev`. In a restricted environment, set `TMPDIR` and `BUN_INSTALL_CACHE_DIR` to writable project paths and pass `--cache-dir` with that cache path. Bun is the package manager and script runner; Vitest and Playwright remain the test tools. Run `bun run test:unit`, `bun run test:e2e`, `bun run typecheck`, and `bun run build` as the corresponding milestones become available. Playwright browser binaries require `bun run playwright install chromium webkit` after install.

If Bun blocks a dependency lifecycle script during installation, review the named package and approve only the required trusted package with `bun pm trust <package>`, then repeat the frozen install. No lifecycle-script permissions are required by the initial project configuration.

The browser build is static and compatible with HTTPS hosting on AWS S3 behind CloudFront. AWS deployment itself is a later milestone.
