extends GutTest
const Catalogue = preload("res://game/content/catalogue.gd")
const Store = preload("res://game/content/resource_store.gd")
const Art = preload("res://game/content/art_catalog.gd")
const View = preload("res://game/presentation/enemy_view.gd")
func test_all_four_roles_have_complete_safe_imported_action_bindings() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue(), str(content.errors))
 assert_eq(content.enemy_presentations.size(), 4, "every role needs its production rig and semantic bindings")
 if content.enemy_presentations.size() != 4: return
 var store := Store.new()
 assert_true(store.prepare_enemies(content), str(store.errors))
 for role in ["grunt","zoner","enforcer","liam"]:
  var definition: Dictionary = content.enemy_presentations[role]
  assert_eq(definition.allowedMoveIds, Art.MOVES[role])
  for semantic in Art.semantics(role): assert_true(definition.clipBindings.has(semantic), role + "." + semantic)
  assert_eq(definition.clipBindings.has("Stunned"), role != "liam")
  var model: Node3D = store.create(definition.sceneResourceId)
  var view := View.new()
  add_child(view)
  assert_true(view.attach(model, definition))
  for facing in [-1,1]:
   for semantic in Art.semantics(role):
    var action := {"kind":"idle","startedTick":10,"endTick":20}
    var actor := {"id":3,"role":role,"combatClass":"boss" if role=="liam" else "normal","phase":2 if role=="liam" else 1,"hp":100,"facing":facing,"position":{"x":5.0,"depth":0.0},"action":action}
    if "." in semantic:
     var parts: PackedStringArray = semantic.split(".")
     action.kind=parts[1];action.moveId=parts[0]
    elif semantic=="Hurt":action.kind="hurt"
    elif semantic=="Defeated":actor.hp=0
    elif semantic=="Stunned":actor.stunnedUntilTick=30
    var previous: Dictionary = actor.duplicate(true)
    if semantic=="Move":previous.position.x=actor.position.x-facing
    assert_true(view.apply_snapshot(actor,previous,15), str(view.errors))
    assert_eq(view.last_pose.semantic,semantic)
    assert_eq(view.position, Vector3(5,0,0))
    assert_eq(view.last_pose.facing,facing)
  store.release(model)
  view.free()
 assert_eq(store.live_count(),0)

func test_cues_match_simulation_reach_and_phase_two_never_replaces_an_action() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var store := Store.new()
 assert_true(store.prepare_enemies(content))
 for role in Art.MOVES:
  var view := View.new()
  add_child(view)
  var model := store.create(content.enemy_presentations[role].sceneResourceId)
  assert_true(view.attach(model, content.enemy_presentations[role]))
  for move in Art.MOVES[role]:
   for facing in [-1, 1]:
    var a := {"id":3,"role":role,"hp":100,"phase":2,"facing":facing,"position":{"x":5.0,"depth":0.0},"action":{"kind":"windup","moveId":move,"startedTick":0,"endTick":60}}
    assert_true(view.apply_snapshot(a,a,30))
    assert_true(view.get("last_cue") is Dictionary, "attack warning must expose its actual region")
    if not view.get("last_cue") is Dictionary: continue
    var cue: Dictionary = view.get("last_cue")
    assert_true(cue.visible)
    assert_eq(cue.facing, facing)
    assert_eq(cue.radial, move == "shockwave")
    assert_eq(cue.range, {"grunt":1.5,"throw":15.0,"charge":1.0,"close":1.1,"rope":3.0,"shockwave":20.0}[move])
    assert_eq(view.last_pose.semantic, move + ".windup")
    assert_eq(view.get_node("PhaseTwo").visible, role == "liam")
    a.action.kind = "recovery"
    view.apply_snapshot(a,a,30)
    assert_false(view.get("last_cue").visible)
  store.release(model)
  view.free()
