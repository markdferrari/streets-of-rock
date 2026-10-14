extends GutTest
const GestureButton = preload("res://game/platform/gesture_button.gd")
func touch(index: int, pressed: bool, point: Vector2, canceled: bool = false) -> InputEventScreenTouch:
 var event := InputEventScreenTouch.new()
 event.index = index
 event.pressed = pressed
 event.position = point
 event.canceled = canceled
 return event
func test_only_fresh_completed_inside_gestures_activate() -> void:
 var button := GestureButton.new()
 button.size = Vector2(180,60)
 add_child_autofree(button)
 watch_signals(button)
 button.handle_event(touch(1, true, Vector2(10,10)))
 button.handle_event(touch(1, false, Vector2(10,10)))
 assert_signal_emit_count(button, "pressed", 1)
 button.handle_event(touch(1, true, Vector2(10,10)))
 button.handle_event(touch(1, false, Vector2(10,10), true))
 button.handle_event(touch(2, true, Vector2(10,10)))
 button.handle_event(touch(2, false, Vector2(200,100)))
 assert_signal_emit_count(button, "pressed", 1)
 button.handle_event(touch(3, true, Vector2(10,10)))
 button.cancel_all()
 button.handle_event(touch(3, false, Vector2(10,10)))
 assert_signal_emit_count(button, "pressed", 1)
