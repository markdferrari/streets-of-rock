extends "res://tests/godot/support/rules.gd"
func test_roles_begin_telegraphs_and_boss_changes_phase() -> void:
 for role in ["grunt", "zoner", "enforcer", "liam"]:
  var run := fresh()
  var enemy := Actor.enemy(3, role, {"x": 1.0, "depth": 0.0}, 0, content.tuning.enemyDefinitions[role])
  run.actors.append(enemy)
  run.encounter.aliveEnemyIds = [3]
  if role == "liam": enemy.hp = 700
  var events := Step.step_run(run, input(), content)
  assert_eq(enemy.action.kind, "windup")
  assert_true(events.any(func(e: Dictionary) -> bool: return e.type == "enemy-warning"))
  if role == "liam":
   assert_eq(enemy.phase, 2)
   assert_eq(enemy.action.get("moveId"), "shockwave")
func test_partner_fights_without_meter_and_knockout_stays_inactive() -> void:
 var run := fresh()
 var ally: Dictionary = run.actors[1]
 ally.hp = ally.maxHp
 ally.active = true
 ally.position = {"x": 2.0, "depth": 0.0}
 var enemy := Actor.enemy(3, "zoner", {"x": 2.8, "depth": 0.0}, 0, content.tuning.enemyDefinitions.zoner)
 run.actors.append(enemy)
 run.encounter.aliveEnemyIds = [3]
 Step.step_run(run, input(), content)
 assert_eq(ally.action.get("moveId"), "support")
 assert_eq(enemy.hp, 180.0 - content.definitions.crow.partner.supportDamage)
 assert_eq(run.actors[0].specialMeter, 0)
 ally.hp = 0
 ally.active = false
 var before: Dictionary = ally.position.duplicate()
 Step.step_run(run, input(), content)
 assert_eq(ally.position, before)
func test_partner_visibility_stable_target_and_blocked_recovery_only() -> void:
 var run := fresh()
 var ally: Dictionary = run.actors[1]
 ally.hp = ally.maxHp
 ally.active = true
 ally.position = {"x": 2.0, "depth": 0.0}
 var visible := Actor.enemy(3, "grunt", {"x": 4.0, "depth": 0.0}, 0, content.tuning.enemyDefinitions.grunt)
 var invisible := Actor.enemy(4, "zoner", {"x": 15.0, "depth": 0.0}, 0, content.tuning.enemyDefinitions.zoner)
 run.actors.append_array([visible, invisible])
 var partner = load("res://game/simulation/partner_ai.gd")
 var arena: Dictionary = {"visibleRegions": [{"minX": 0.0, "maxX": 6.0, "minDepth": -3.0, "maxDepth": 3.0}]}
 assert_eq(partner.choose(run, arena), 3)
 var events: Array = []
 partner.update(run, events, content, arena)
 assert_eq(ally.targetId, 3)
 assert_gt(ally.position.x, 2.0)
 assert_lt(ally.position.x, 2.1)
 # Recovery requires actual obstruction, 120 blocked ticks and two safe path legs.
 run.actors = run.actors.slice(0, 2)
 ally.position = {"x": 1.0, "depth": 0.0}
 run.actors[0].position = {"x": 6.0, "depth": 0.0}
 arena.obstructions = [{"minX": 1.0, "maxX": 1.5, "minDepth": -0.5, "maxDepth": 0.5}]
 for tick in range(119):
  run.tick = tick
  partner.update(run, events, content, arena)
 assert_false(events.any(func(e: Dictionary) -> bool: return e.type == "partner-recovered"))
 run.tick = 119
 partner.update(run, events, content, arena)
 assert_eq(events.filter(func(e: Dictionary) -> bool: return e.type == "partner-recovered").size(), 1)
 assert_eq(ally.hp, ally.maxHp)
