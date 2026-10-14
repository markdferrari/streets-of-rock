# Tooling checks — 2026-10-09

Godot 4.7.2 import/static checks passed with project-local XDG config/data/cache and explicit log paths (evidence/godot-import.log). Editor import opens a local socket, so this host requires approved execution outside the network-restricted sandbox. No global templates or settings are installed.

`bun run test:godot --self-test-failure` creates a disposable `.tmp/gut-failure-*/test_failure.gd` and runs GUT 9.7.1 against it. One deliberate `assert_true(false)` failed, GUT reported one failing test, and the wrapper exited 1 (evidence/gut-runner-failure.log). The wrapper removes the fixture afterward; it is ignored and never part of the ordinary suite/export.

`bun run test:blender --self-test-failure` ran Blender's real unittest runner: one deliberate assertion failed and the wrapper exited 1 (evidence/blender-runner-failure.log). No production asset was regenerated.

Vitest setup tests additionally reject nonzero/null status and parser/resource-load errors even if the underlying tool returns zero (evidence/setup-green.log). Static checks parse each application/test GDScript after resource import; missing loaders are failures.

## Pinned web cancellation correction

Actual Chromium CDP multi-touch cancellation exposed an engine-level difference: Godot's web callback maps touchcancel to the same release type as touchend, so InputEventScreenTouch.canceled is false. This is confirmed in the pinned [web touch listener](https://github.com/godotengine/godot/blob/4.7/platform/web/js/libs/library_godot_input.js) and [native callback](https://github.com/godotengine/godot/blob/4.7/platform/web/display_server_web.cpp). The callback passes Touch.identifier directly to the native touch index; no DOM pointerId mapping is assumed.

The browser adapter captures touchcancel before the engine listener and synchronously forwards only the canceled native identifiers through the retained callback. Godot clears the originating inputs/gesture owners before the engine's ordinary release event arrives. There is no JavaScript movement/action translator and no modification to verified stock engine bytes. Browser and GUT regressions cover cancellation, drag/outside release and fresh completed activation.
