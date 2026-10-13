extends "res://tests/godot/support/rules.gd"
func test_light_windows_hit_once_meter_and_combo_buffer() -> void:
 var run := fresh()
 run.actors.append(Actor.enemy(3, "grunt", {"x": 1.0, "depth": 0.0}, 0, content.tuning.enemyDefinitions.grunt))
 run.encounter.aliveEnemyIds = [3]
 Step.step_run(run, input("light"), content)
 assert_eq(run.actors[0].action.get("kind"), "windup")
 for tick in range(1, 8): Step.step_run(run, input(), content)
 assert_eq(run.actors[2].hp, 120.0)
 Step.step_run(run, input(), content)
 assert_eq(run.actors[2].hp, 108.0)
 assert_eq(run.actors[0].specialMeter, 10.0)
 for tick in range(9, 28): Step.step_run(run, input("light" if tick == 26 else ""), content)
 Step.step_run(run, input(), content)
 assert_eq(run.actors[0].action.get("moveId"), "light2")
func test_dodge_direction_protection_and_cooldown() -> void:
 var run := fresh()
 run.actors[0].position.x = 5.0
 Step.step_run(run, input("dodge", {"x": 0.0, "depth": -1.0}), content)
 assert_eq(run.actors[0].action.get("kind"), "dodge")
 assert_eq(run.actors[0].protectionUntilTick, 12)
 assert_eq(run.actors[0].position.x, 5.0)
 assert_almost_eq(run.actors[0].position.depth, -0.1, 1e-12)
 run.tick = 18
 Step.step_run(run, input("dodge"), content)
 assert_eq(run.actors[0].action.get("kind"), "idle")
 run.tick = 54
 Step.step_run(run, input("dodge"), content)
 assert_eq(run.actors[0].action.get("kind"), "dodge")
func test_depth_only_preserves_facing_diagonal_is_normalized_and_nonfinite_ignored() -> void:
 var run := fresh("crow")
 run.actors[0].facing = -1
 Step.step_run(run, input("", {"x": 0.0, "depth": 1.0}), content)
 assert_eq(run.actors[0].facing, -1)
 assert_almost_eq(run.actors[0].position.depth, 3.4 / 60.0, 1e-12)
 var before: Dictionary = run.actors[0].position.duplicate()
 Step.step_run(run, input("", {"x": NAN, "depth": 0.0}), content)
 assert_eq(run.actors[0].position, before)
func test_unavailable_preserves_single_buffer_and_source_cancel() -> void:
 var run := fresh()
 run.actors[0].action = Actor.action("recovery", 0, 5)
 Step.step_run(run, input("light"), content)
 Step.step_run(run, input("special"), content)
 assert_eq(run.actors[0].get("pendingAction", {}).get("kind"), "light")
 Step.step_run(run, {"move": {"x": 0.0, "depth": 0.0}, "canceledPointerIds": [9]}, content)
 assert_false(run.actors[0].has("pendingAction"))
func test_same_sample_priority_and_expiry_never_cancel_recovery() -> void:
 var run := fresh()
 run.actors[0].specialMeter = 100
 var sample := input("light")
 for kind in ["heavy", "dodge", "special"]: sample.requests.append({"kind": kind, "sourcePointerId": 2, "order": 0})
 Step.step_run(run, sample, content)
 assert_eq(run.actors[0].action.get("moveId"), "special")
 assert_eq(run.actors[0].specialMeter, 0)
 run.actors[0].action = Actor.action("recovery", 1, 30)
 Step.step_run(run, input("heavy"), content)
 for tick in range(2, 31): Step.step_run(run, input(), content)
 assert_eq(run.actors[0].action.kind, "idle")
 assert_false(run.actors[0].has("pendingAction"))
