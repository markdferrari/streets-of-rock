extends "res://tests/godot/support/rules.gd"
func test_four_specials_spend_once_and_release_correct_family() -> void:
 for fighter in content.roster:
  var run := fresh(fighter)
  var enemy := Actor.enemy(3, "grunt", {"x": 1.5, "depth": 0.0}, 0, content.tuning.enemyDefinitions.grunt)
  enemy.decisionReadyTick = 1000
  run.actors.append(enemy)
  run.encounter.aliveEnemyIds = [3]
  run.actors[0].specialMeter = 100
  var events: Array = []
  var arena: Dictionary = {"visibleRegions": [{"minX": 0.0, "maxX": 16.0, "minDepth": -3.0, "maxDepth": 3.0}]}
  for tick in range(30): events.append_array(Step.step_run(run, input("special" if tick == 0 else ""), content, arena))
  assert_eq(run.actors[0].specialMeter, 0)
  assert_eq(events.filter(func(e: Dictionary) -> bool: return e.type == "special").size(), 1)
  if fighter == "lion": assert_true(enemy.has("stunnedUntilTick"))
  elif fighter == "plates": assert_true(events.any(func(e: Dictionary) -> bool: return e.type == "headrest-hit"))
  else: assert_lt(enemy.hp, enemy.maxHp)
func test_headrest_no_visible_target_retains_meter() -> void:
 var run := fresh("plates")
 run.actors[0].specialMeter = 100
 Step.step_run(run, input("special"), content)
 assert_eq(run.actors[0].specialMeter, 100)
 assert_eq(run.actors[0].action.kind, "idle")
func test_roar_cancels_normal_attacks_leaves_bottles_and_damages_only_boss() -> void:
 var run := fresh("lion")
 var normal := Actor.enemy(3, "zoner", {"x": 1.0, "depth": 0.0}, 0, content.tuning.enemyDefinitions.zoner)
 var boss := Actor.enemy(4, "liam", {"x": 2.0, "depth": 0.0}, 0, content.tuning.enemyDefinitions.liam)
 run.actors.append_array([normal, boss])
 run.encounter.aliveEnemyIds = [3, 4]
 normal.action = Actor.action("windup", 0, 100, "throw")
 run.attacks = [{"id": 1, "ownerId": 3}]
 run.projectiles = [{"id": 5, "ownerId": 3, "attackId": 1, "position": {"x": 8.0, "depth": 2.0}, "previousPosition": {"x": 8.0, "depth": 2.0}, "velocity": {"x": 0.0, "depth": 0.0}, "remainingTicks": 180}]
 var specials = load("res://game/simulation/specials.gd")
 assert_true(specials.prepare(run, run.actors[0], {}, [], content))
 var events: Array = []
 specials.release(run, run.actors[0], events, content)
 assert_eq(normal.hp, 180.0)
 assert_eq(normal.action.kind, "idle")
 assert_false(normal.attackSlot)
 assert_true(run.attacks.is_empty())
 assert_eq(run.projectiles.size(), 1)
 assert_false(boss.has("stunnedUntilTick"))
 var combat = load("res://game/simulation/combat.gd")
 combat.apply(run, [], events, content)
 assert_eq(boss.hp, 1600.0 - content.definitions.lion.player.special.bossDamage)
 specials.release(run, run.actors[0], events, content)
 assert_true(run.pendingSpecialDamage.is_empty())
func test_headrest_fixed_aim_ties_interception_protection_and_expiry() -> void:
 var run := fresh("plates")
 var first := Actor.enemy(3, "grunt", {"x": 3.0, "depth": 0.0}, 0, content.tuning.enemyDefinitions.grunt)
 var second := Actor.enemy(4, "grunt", {"x": -3.0, "depth": 0.0}, 0, content.tuning.enemyDefinitions.grunt)
 run.actors.append_array([second, first])
 var specials = load("res://game/simulation/specials.gd")
 var arena: Dictionary = {"visibleRegions": [{"minX": -4.0, "maxX": 4.0, "minDepth": -3.0, "maxDepth": 3.0}]}
 assert_true(specials.prepare(run, run.actors[0], arena, [], content))
 assert_eq(run.actors[0].preparedSpecial.targetIdForDiagnostics, 3)
 first.position.depth = 2.0
 specials.release(run, run.actors[0], [], content)
 assert_eq(run.projectiles[0].direction, {"x": 1.0, "depth": 0.0})
 var intercept := Actor.enemy(5, "grunt", {"x": 1.5, "depth": 0.0}, 0, content.tuning.enemyDefinitions.grunt)
 run.actors.append(intercept)
 var projectiles = load("res://game/simulation/projectiles.gd")
 run.projectiles[0].speedPerSecond = 600.0
 var events: Array = []
 projectiles.update(run, events)
 assert_true(run.projectiles.is_empty())
 assert_eq(events[-1].type, "headrest-hit")
 assert_eq(events[-1].targetId, 5)
 assert_lt(intercept.hp, intercept.maxHp)
 assert_eq(first.hp, first.maxHp)
 # A miss expires at maximum distance and never retargets moving enemies.
 specials.prepare(run, run.actors[0], arena, [], content)
 specials.release(run, run.actors[0], [], content)
 for actor in run.actors:
  if actor.team == "enemy": actor.position.depth = 3.0
 for index in range(200): projectiles.update(run, events)
 assert_true(run.projectiles.is_empty())
 assert_eq(events[-1].type, "headrest-miss")
