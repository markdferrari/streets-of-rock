extends GutTest
const Motion = preload("res://game/presentation/character_motion_state.gd")
const Pose = preload("res://game/presentation/character_pose.gd")
const Fixtures = preload("res://tests/godot/content/test_hero_animation_catalog.gd")
func fixture() -> Dictionary:
 var f := Fixtures.new()
 var p: Dictionary = f.fixture().catalogue.characters[0]
 f.free()
 return p
func actor() -> Dictionary:
 return {"id":1,"characterId":"cow","role":"player","hp":100,"position":{"x":0.0,"depth":0.0},"facing":1,"action":{"kind":"idle","startedTick":0,"endTick":0}}
func test_contiguous_phases_do_not_restart_action_or_blend_and_contact_is_first_active_sample() -> void:
 var a := actor()
 var p := fixture()
 var m := Motion.new()
 m.observe(a, 0, [])
 var identity := ""
 for phase in ["windup", "active", "recovery"]:
  var start: int = {"windup":1,"active":9,"recovery":15}[phase]
  a.action = {"kind":phase,"moveId":"light1","startedTick":start,"endTick":start+8}
  m.observe(a, start, [])
  var sample := Pose.resolve(a, p, m)
  if phase == "windup": identity = sample.actionIdentity
  else: assert_eq(sample.actionIdentity, identity)
  assert_eq(sample.samples[0].clipName, "cow1")
  assert_almost_eq(sample.samples[0].timeSeconds, p.bindings["cow1."+phase].startSeconds, 0.00001)
  assert_lte(sample.blendSeconds, 0.1)
  if phase == "active": assert_eq(sample.blendSeconds, 0.0)
func test_directional_distance_samples_are_bounded_pure_and_keep_facing() -> void:
 var a := actor()
 var p := fixture()
 var m := Motion.new()
 m.observe(a, 0, [])
 a.position = {"x":-0.1,"depth":0.1}
 m.observe(a, 1, [])
 var before := a.duplicate(true)
 var result := Pose.resolve(a, p, m)
 assert_eq(result.semanticKey, "Move")
 assert_eq(result.samples.size(), 2)
 assert_eq(result.samples[0].clipName, "Move_backward")
 assert_eq(result.samples[1].clipName, "Move_right")
 assert_almost_eq(result.samples[0].weight + result.samples[1].weight, 1.0, 0.00001)
 assert_eq(result, Pose.resolve(a, p, m))
 assert_eq(a, before)
func test_reaction_mask_and_knockout_endpoint_priority() -> void:
 var a := actor()
 var p := fixture()
 var m := Motion.new()
 m.observe(a, 0, [])
 a.action = {"kind":"windup","moveId":"heavy","startedTick":1,"endTick":7}
 a.hp = 80
 m.observe(a, 1, [{"type":"hit","targetId":1}])
 var result := Pose.resolve(a, p, m)
 assert_eq(result.semanticKey, "cowHeavy.windup")
 assert_eq(result.reaction.boneNames, p.reactionBoneNames)
 assert_true(result.reaction.restRelative)
 a.hp = 0
 m.observe(a, 2, [])
 result = Pose.resolve(a, p, m)
 assert_eq(result.semanticKey, "KnockedOut")
 assert_true(result.reaction.is_empty())
 m.settle(10, p.knockoutSeconds)
 result = Pose.resolve(a, p, m)
 assert_true(result.terminalHold)
 assert_almost_eq(result.samples[0].timeSeconds, p.bindings.KnockedOut.endSeconds, 0.00001)

func test_partner_ready_immediate_six_tick_contact_and_interruptible_followthrough() -> void:
 var a := actor()
 a.role = "partner"
 a.intentState = {"intent":"engage"}
 a.decisionReadyTick = 6
 var p := fixture()
 var m := Motion.new()
 m.observe(a,0,[])
 assert_eq(Pose.resolve(a,p,m).semanticKey,"cow1.windup")
 a.action = {"kind":"active","moveId":"support","startedTick":6,"endTick":12}
 m.observe(a,6,[{"type":"partner-hit","actorId":1,"targetId":900}])
 var contact := Pose.resolve(a,p,m)
 assert_eq(contact.semanticKey,"cow1.active")
 assert_almost_eq(contact.samples[0].timeSeconds,p.bindings["cow1.active"].contactSeconds,0.00001)
 assert_eq(contact.blendSeconds,0.0)
 m.observe(a,11,[])
 assert_eq(Pose.resolve(a,p,m).semanticKey,"cow1.active")
 a.action = {"kind":"idle","startedTick":12,"endTick":12}
 m.observe(a,12,[])
 assert_eq(Pose.resolve(a,p,m).semanticKey,"cow1.recovery")
 a.position.x += 0.1
 m.observe(a,13,[])
 assert_eq(Pose.resolve(a,p,m).semanticKey,"Move","followthrough never blocks normal pursuit")
 a.action = {"kind":"active","moveId":"special","startedTick":14,"endTick":20}
 m.observe(a,14,[])
 assert_false(Pose.resolve(a,p,m).semanticKey.begins_with("spin"),"partner has no player Special")

func test_hit_during_contact_preserves_the_entire_authoritative_release_pose() -> void:
 var a := actor()
 var p := fixture()
 var m := Motion.new()
 m.observe(a,0,[])
 a.action = {"kind":"active","moveId":"heavy","startedTick":1,"endTick":7}
 a.hp = 80
 m.observe(a,1,[{"type":"hit","targetId":1}])
 var result := Pose.resolve(a,p,m)
 assert_eq(result.semanticKey,"cowHeavy.active")
 assert_true(result.reaction.is_empty(),"Torso reaction would move descendant contact limbs; active contact must remain exact")
