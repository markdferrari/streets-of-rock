extends GutTest
const Catalogue = preload("res://game/content/catalogue.gd")
const Store = preload("res://game/content/resource_store.gd")
const World = preload("res://game/presentation/world_view.gd")
const State = preload("res://game/simulation/run_state.gd")
const Actor = preload("res://game/simulation/actor.gd")
func test_ten_complete_world_cycles_release_all_furnished_rooms_rigs_and_projectiles() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var store := Store.new()
 assert_true(store.prepare_rooms(content))
 assert_true(store.prepare_enemies(content))
 for id in ["cow","crow"]: assert_true(store.prepare_hero(content,id))
 var initial_orphans: int = Performance.get_monitor(Performance.OBJECT_ORPHAN_NODE_COUNT)
 for generation in range(1,11):
  var world := World.new()
  add_child(world)
  world.initialize(store,content)
  var run := State.create_run(generation,{"fighterId":"cow","partnerId":"crow"},content)
  for pair in [[3,"grunt"],[4,"zoner"],[5,"enforcer"],[6,"liam"]]:
   run.actors.append(Actor.enemy(pair[0],pair[1],{"x":7.0+pair[0],"depth":0.0},0,content.tuning.enemyDefinitions[pair[1]]))
  run.projectiles.append({"id":50,"ownerId":4,"position":{"x":4.0,"depth":0.0}})
  world.render(run,[],{"width":844.0,"height":390.0},0,0,false,true)
  assert_eq(world.errors,[] as Array[String])
  assert_gt(store.live_count(),6)
  world.dispose()
  await get_tree().process_frame
  assert_eq(store.live_count(),0,"generation "+str(generation)+": every imported instance released")
 assert_lte(int(Performance.get_monitor(Performance.OBJECT_ORPHAN_NODE_COUNT)),initial_orphans,"cycles cannot add orphans; prior deferred frees may reduce baseline")
