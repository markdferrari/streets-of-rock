extends GutTest
const Motion = preload("res://game/presentation/character_motion_state.gd")
func actor() -> Dictionary:
 return {"id":1,"characterId":"cow","team":"ally","role":"player","hp":100,"position":{"x":0.0,"depth":0.0},"facing":1,"action":{"kind":"idle","startedTick":0,"endTick":0}}
func test_each_step_accumulates_depth_and_duplicate_observations_do_not_change_state() -> void:
 var a := actor()
 var m := Motion.new()
 m.observe(a, 0, [])
 for tick in range(1, 6):
  a.position.depth += 0.1
  m.observe(a, tick, [])
 assert_almost_eq(m.distance, 0.5, 0.00001)
 assert_true(m.moving)
 var snapshot := a.duplicate(true)
 m.observe(a, 5, [])
 assert_almost_eq(m.distance, 0.5, 0.00001)
 assert_true(m.moving, "duplicate render retains movement decision")
 assert_eq(a, snapshot, "observer never changes simulation input")
func test_requested_motion_dodge_attack_knockback_and_recovery_do_not_walk() -> void:
 var a := actor()
 var m := Motion.new()
 m.observe(a, 0, [])
 m.observe(a, 1, [])
 assert_false(m.moving)
 for kind in ["dodge", "windup", "active", "recovery"]:
  a.action.kind = kind
  a.position.x += 1
  m.observe(a, m.last_tick + 1, [])
  assert_false(m.moving)
  assert_eq(m.distance, 0.0)
 a.action.kind = "idle"
 for event in [{"type":"hit","targetId":1},{"type":"partner-recovered","actorId":1}]:
  a.position.x += 5
  var events := [event]
  var before := events.duplicate(true)
  m.observe(a, m.last_tick + 1, events)
  assert_false(m.moving)
  assert_eq(m.distance, 0.0)
  assert_eq(events, before)
 a.position.x += 0.1
 m.observe(a, m.last_tick + 1, [])
 assert_almost_eq(m.distance, 0.1, 0.00001)
func test_hp_and_hit_event_deduplicate_and_zero_hp_latches_once() -> void:
 var a := actor()
 var m := Motion.new()
 m.observe(a, 0, [])
 a.hp = 80
 var events := [{"type":"hit","targetId":1}]
 m.observe(a, 1, events)
 assert_eq(m.reaction_tick, 1)
 m.observe(a, 1, events)
 assert_eq(m.reaction_tick, 1)
 m.observe(a, 2, [])
 assert_eq(m.reaction_tick, 1)
 a.hp = 0
 m.observe(a, 3, [])
 assert_true(m.knocked_out)
 assert_eq(m.knockout_elapsed, 0.0)
 m.observe(a, 4, [])
 assert_almost_eq(m.knockout_elapsed, 1.0 / 60, 0.00001)
 m.observe(a, 4, [])
 assert_almost_eq(m.knockout_elapsed, 1.0 / 60, 0.00001)
func test_new_snapshot_seeds_position_and_hp_without_origin_travel() -> void:
 var a := actor()
 a.position.x = 90
 a.hp = 0
 var m := Motion.new()
 m.observe(a, 100, [])
 assert_eq(m.distance, 0.0)
 assert_true(m.knocked_out)

func test_companion_support_event_is_latched_once_and_catchup_uses_actual_distance() -> void:
 var a := actor()
 a.role = "partner"
 var m := Motion.new()
 m.observe(a,0,[])
 a.position.x = 0.1
 m.observe(a,1,[])
 a.position.x = 0.25
 m.observe(a,2,[])
 assert_almost_eq(m.distance,0.25,0.00001)
 a.action = {"kind":"active","moveId":"support","startedTick":3,"endTick":9}
 var events := [{"type":"partner-hit","actorId":1,"targetId":900}]
 m.observe(a,3,events)
 assert_eq(m.support_tick,3)
 m.observe(a,3,events)
 assert_eq(m.support_tick,3)
 assert_false(m.moving)
