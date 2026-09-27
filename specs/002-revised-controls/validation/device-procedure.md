# Revised-controls device procedure

**Status:** Procedure defined before control UI work; results pending.

For each run, record date, device, OS/browser version, tab or installed mode, CSS viewport, visible safe-area insets, mute and shake settings, tester, and build/commit ID. Use the iPhone 12 in Safari and Pixel 6 in Chrome. Also use a 568×320 CSS-pixel browser viewport as a layout lower-bound check; emulation supplements the phones.

1. In landscape, start a new run without touching the playfield. Record whether the left ring and centered knob and all four labelled diamond buttons are immediately visible. Confirm no button, joystick ring, HUD item, or enemy warning overlaps.
2. With a normal two-thumb grip, hold movement and tap Light and Dodge, then Heavy and Special. Record missed touches, hand repositioning, reach discomfort, accidental actions, and label readability. Repeat with audio muted and shake disabled; verify press, cooldown, and meter feedback without relying on color.
3. Drag the stick inside its deadzone, diagonally, to the ring edge, and well beyond it. Record Cow direction, fixed anchor, capped knob, and release/cancel return to center. Start a second movement touch and tap the HUD; neither may steal movement ownership.
4. Hold movement or buffer an attack, then pause, background, blur, rotate portrait and back, and retry after a result. Record whether movement and pending actions clear, clock/audio stop, and explicit Resume and fresh touches are required. Check controls after browser resizing.
5. Repeat the controls in installed mode where supported. If installation or device access is unavailable, record the unperformed case and reason; do not mark it passed.

Pass CTRL-AC-012 only when labels, reach, safe areas, non-color readiness, and warning visibility work on both reference phones. Pass CTRL-AC-013 only after the interruption checks succeed on both phones. Attach observations and screenshots/video references where available; keep actual results in `us3-device.md`.
