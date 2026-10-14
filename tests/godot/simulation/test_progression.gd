extends "res://tests/godot/support/rules.gd"
func test_all_waves_tables_connectors_and_terminal_no_later_tick() -> void:
 var run := fresh()
 run.encounter.status = "awaitingEntry"
 Step.step_run(run, input(), content)
 assert_eq(run.encounter.aliveEnemyIds.size(), 3)
 for area_index in range(4):
  run.areaIndex = area_index
  run.actors[0].position = {"x": content.level.areas[area_index].minX, "depth": 0.0}
  run.encounter = {"areaId": content.level.areas[area_index].id, "waveIndex": 0, "status": "awaitingEntry", "aliveEnemyIds": [], "cameraCenter": 0.0}
  Step.step_run(run, input(), content)
  assert_eq(run.encounter.aliveEnemyIds.size(), content.level.areas[area_index].waves[0].size())
  if area_index == 1:
   assert_eq(run.tables.map(func(t: Dictionary) -> Dictionary: return t.position), [{"x": 22.0, "depth": -2.0}, {"x": 28.0, "depth": 2.0}])
 var boss: Dictionary = run.actors[-1]
 boss.hp = 0
 run.actors[0].hp = 0
 Step.step_run(run, input(), content)
 assert_eq(run.result, "defeat")
 var tick: int = run.tick
 assert_eq(Step.step_run(run, input(), content), [])
 assert_eq(run.tick, tick)
func test_full_health_pickup_consumption_player_only_and_break_once() -> void:
 var run := fresh("crow")
 run.actors[0].position = {"x": 22.0, "depth": -2.0}
 run.tables = [{"id": 3, "areaId": "vip-lounge", "position": {"x": 22.0, "depth": -2.0}, "hp": 24.0, "broken": false}]
 run.nextEntityId = 4
 run.attacks = [{"id": 1, "ownerId": 1, "moveId": "heavy", "origin": {"x": 22.0, "depth": -2.0}, "facing": 1, "range": 1.3, "depthTolerance": 0.45, "damage": 30.0, "activeUntilTick": 10, "hitTargetIds": []}]
 var objects = load("res://game/simulation/objects.gd")
 var events: Array = []
 objects.update(run, events)
 objects.update(run, events)
 assert_eq(run.pickups.size(), 1)
 assert_false(run.pickups[0].available)
 assert_eq(run.actors[0].hp, 240.0)
 assert_eq(events.size(), 2)
 assert_eq(run.actors[1].hp, 0)
func test_tick_order_terminal_break_and_four_solo_terminal_outcomes() -> void:
 for fighter in content.roster:
  var run := fresh(fighter)
  var boss := Actor.enemy(3, "liam", {"x": 1.0, "depth": 0.0}, 0, content.tuning.enemyDefinitions.liam)
  boss.hp = 1
  run.actors.append(boss)
  run.encounter.aliveEnemyIds = [3]
  run.attacks.append({"id": 1, "ownerId": 1, "moveId": "light1", "origin": {"x": 0.0, "depth": 0.0}, "facing": 1, "range": 1.3, "depthTolerance": 0.45, "damage": 12.0, "activeUntilTick": 10, "hitTargetIds": []})
  var order: Array = []
  Step.step_run(run, input(), content, {}, func(stage: String) -> void: order.append(stage))
  assert_eq(run.result, "victory")
  assert_eq(order, ["statuses", "input", "ai", "movement", "contacts", "terminal"])
  assert_eq(run.actors[1].hp, 0)
