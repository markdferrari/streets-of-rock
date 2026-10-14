extends GutTest
const Controller = preload("res://game/input/input_controller.gd")
func fresh() -> Node:
 var input := Controller.new()
 input.enabled = true
 input.action_bounds = {"light": Rect2(600, 260, 80, 80), "heavy": Rect2(690, 260, 80, 80)}
 return autofree(input)
func test_fixed_sixty_radius_deadzone_and_simultaneous_action() -> void:
 var input := fresh()
 input.down(1, input.center + Vector2(8, 0))
 assert_eq(input.frame().move.x, 0.0)
 input.drag(1, input.center + Vector2(90, -30))
 input.down(2, Vector2(610, 270))
 var frame: Dictionary = input.frame()
 assert_almost_eq(sqrt(pow(frame.move.x, 2) + pow(frame.move.depth, 2)), 1.0, 1e-9)
 assert_eq(frame.requests.size(), 1)
 if frame.requests.size() == 1: assert_eq(frame.requests[0].kind, "light")
 assert_eq(input.frame().requests.size(), 0)
 input.cancel(2)
 assert_eq(input.frame().canceledPointerIds, [2])
 assert_gt(input.frame().move.x, 0.0)
 input.cancel(1)
 assert_eq(input.frame().move.x, 0.0)
func test_keyboard_freshness_cancel_geometry_and_carried_input() -> void:
 var input := fresh()
 input.key(KEY_J, true)
 input.key(KEY_J, true, true)
 assert_eq(input.frame().requests.size(), 1)
 input.key(KEY_J, false)
 input.key(KEY_J, true)
 assert_eq(input.frame().requests.size(), 1)
 input.key(KEY_D, true)
 assert_eq(input.frame().move.x, 1.0)
 input.clear()
 assert_eq(input.frame().move.x, 0.0)
 assert_eq(input.frame().requests.size(), 0)
 input.enabled = false
 input.down(4, Vector2(610, 270))
 assert_eq(input.frame().requests.size(), 0)
