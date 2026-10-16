extends GutTest
const Catalogue = preload("res://game/content/catalogue.gd")
const Store = preload("res://game/content/resource_store.gd")
const World = preload("res://game/presentation/world_view.gd")
const State = preload("res://game/simulation/run_state.gd")
func test_all_twelve_duos_own_independent_step_observers_and_skeletons() -> void:
 var c := Catalogue.new()
 assert_true(c.load_catalogue())
 var store := Store.new()
 for id in c.roster: assert_true(store.prepare_hero(c,id),str(store.errors))
 for fighter in c.roster:
  for partner in c.roster:
   if fighter == partner: continue
   var world := World.new()
   add_child(world)
   world.initialize(store,c)
   var run := State.create_run(1,{"fighterId":fighter,"partnerId":partner},c)
   world.observe_step(run,[])
   run.tick = 1
   run.actors[0].action = {"kind":"windup","moveId":"heavy","startedTick":1,"endTick":15}
   run.actors[1].action = {"kind":"active","moveId":"support","startedTick":1,"endTick":7}
   world.observe_step(run,[{"type":"partner-hit","actorId":2,"targetId":900}])
   world.render(run,[],{"width":844,"height":390},0,0,false,false)
   var snapshot: Dictionary = world.hero_art_snapshot()
   assert_eq(snapshot.views.size(),2)
   assert_ne(snapshot.views["1"].skeletonId,snapshot.views["2"].skeletonId)
   assert_string_contains(snapshot.views["1"].semantic,"Heavy.windup")
   assert_string_contains(snapshot.views["2"].semantic,".active")
   run.actors[1].hp = 0
   run.tick += 1
   world.observe_step(run,[])
   world.render(run,[],{"width":844,"height":390},0,0,false,false)
   world.settle_heroes(1,true)
   world.render(run,[],{"width":844,"height":390},0,0,false,false)
   assert_true(world.hero_art_snapshot().views["2"].terminalHold)
   assert_eq(run.actors[0].hp,c.definitions[fighter].player.maxHp)
   world.dispose()
   await get_tree().process_frame
   assert_eq(store.live_count(),0)
func test_retry_during_fall_clears_private_motion_and_retained_instances_ten_times() -> void:
 var c := Catalogue.new()
 assert_true(c.load_catalogue())
 var store := Store.new()
 for id in c.roster: assert_true(store.prepare_hero(c,id))
 var world := World.new()
 add_child(world)
 world.initialize(store,c)
 for cycle in range(10):
  var run := State.create_run(cycle+1,{"fighterId":"cow","partnerId":"crow"},c)
  world.observe_step(run,[])
  assert_false(world.motion_states[1].knocked_out)
  run.tick = 1
  run.actors[0].hp = 0
  world.observe_step(run,[])
  world.render(run,[],{"width":844,"height":390},0,0,false,false)
  assert_true(world.motion_states[1].knocked_out)
  world.clear_run_views()
  assert_eq(world.motion_states.size(),0)
  assert_eq(store.live_count(),0)
 world.dispose()
