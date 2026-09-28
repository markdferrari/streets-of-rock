# UI Contract: Expanded Combat View and GO Cue

## Combat presentation

The game view continues to fill the available landscape viewport, behind the existing left joystick, right diamond controls and HUD. Preserve DOM hit regions, simultaneous input and pointer-cancel handling. The actual visible room must be enlarged by the shared framing model; a CSS-only full-screen canvas does not meet acceptance.

HUD and controls stay inside safe insets. Fixed controls and large HUD elements cannot occupy the central combat space. Existing attack telegraphs must remain readable with sound muted and shake disabled. Camera angle, model appearance, world dimensions and gameplay speeds do not change.

At stable encounter positions capture the same room, fighter and partner coordinates at identical viewport sizes before/after. Compare projected floor coverage and unused surrounding area. Viewport covers at least 90% of available width/height; room coverage separately increases. Temporary wider framing during catch-up is intentional and must settle after the partner arrives.

## Direction cue

Render one inline SVG directional arrow and the exact visible text “GO” from the pure ProgressionCue. Provide one accessible status announcement when a new room's exit becomes available, with directional label; do not repeatedly announce on every frame or pause/resume. The graphic itself can be aria-hidden because the status supplies meaning.

Place in its own layer above scenery, below pause/result overlays, with pointer-events:none. Remove the old GO span from combatHudMarkup so only one cue exists. Use the existing gold/cream palette, dark backing and strong outline; the arrow's shape and text must suffice without colour/audio. Use a static cue by default, satisfying reduced-motion without new animation.

Use measured safe viewport/HUD/control rectangles and the placement algorithm in the data model. The cue persists while travelling to the next room. Pause/rotate UI may cover it, but Resume restores the current cue without restarting an arbitrary lifetime. Results, retry reset and next-room entry remove it according to state. No next route means no arrow, including the final boss.

## Observable acceptance

Automated browser checks cover non-overlap, accessible label, input pass-through, visibility timing, resize/orientation, reset/results and both partner assignments. Actual reference phones establish legibility, thumb reach and combat clarity. Five first-time players identify the next-room direction without coaching; at least four do so within three seconds.

No new image files, icons package, user setting, clickable navigation action or gameplay skip is part of this interface.
