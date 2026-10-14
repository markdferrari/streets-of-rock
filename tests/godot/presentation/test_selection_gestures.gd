extends GutTest
const Catalogue = preload("res://game/content/catalogue.gd")
const Session = preload("res://game/app/run_session.gd")
const Screen = preload("res://game/ui/session_screen.gd")
const Gesture = preload("res://game/platform/gesture_button.gd")
func mouse(down: bool, point: Vector2) -> InputEventMouseButton:
 var event := InputEventMouseButton.new()
 event.button_index = MOUSE_BUTTON_LEFT
 event.pressed = down
 event.position = point
 return event
func test_same_selection_refresh_preserves_in_flight_mouse_gesture_exactly_once() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var session := Session.new(content)
 session.selection = {"step":"partner","focusedId":"crow","previewedId":"crow","fighterId":"cow","locked":false}
 var screen := Screen.new()
 add_child_autofree(screen)
 var env := {"width":844.0,"height":390.0,"safeInsets":{"left":0,"right":0,"top":0,"bottom":0}}
 var settings := {"musicVolume":.7,"effectsVolume":.8,"screenShake":true}
 screen.action.connect(func(id: String) -> void: session.select({"type":"activate","id":id.trim_prefix("character-"),"ready":true}))
 screen.render(session, content, env, settings, 0, null)
 var old: Button = screen.controls["character-crow"]
 var point := old.get_global_rect().get_center()
 old.handle_event(mouse(true, point))
 # Main invalidates render_key when an asynchronous cache-status message arrives.
 screen.render_key = ""
 screen.render(session, content, env, settings, 0, null, {"offline":"ready"})
 var current: Button = screen.controls["character-crow"]
 current.handle_event(mouse(false, point))
 assert_eq(session.phase, "preparing", "cache UI refresh must not swallow partner confirmation")
 assert_eq(session.generation, 1)
 old.handle_event(mouse(false, point))
 assert_eq(session.generation, 1, "hidden queued controls cannot activate a second time")
func test_hidden_button_cannot_capture_or_finish_gestures() -> void:
 var button := Gesture.new()
 button.size = Vector2(100,50)
 add_child_autofree(button)
 watch_signals(button)
 button.handle_event(mouse(true, Vector2(10,10)))
 button.hide()
 button.handle_event(mouse(false, Vector2(10,10)))
 assert_signal_not_emitted(button, "pressed")
 button.handle_event(mouse(true, Vector2(10,10)))
 button.handle_event(mouse(false, Vector2(10,10)))
 assert_signal_not_emitted(button, "pressed")
