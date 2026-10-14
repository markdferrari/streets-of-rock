extends GutTest
const Catalogue = preload("res://game/content/catalogue.gd")
const Store = preload("res://game/content/resource_store.gd")
const World = preload("res://game/presentation/world_view.gd")
const EnemyView = preload("res://game/presentation/enemy_view.gd")
const State = preload("res://game/simulation/run_state.gd")
const Actor = preload("res://game/simulation/actor.gd")
func setup_world() -> Dictionary:
 var content := Catalogue.new()
 assert_true(content.load_catalogue(), str(content.errors))
 assert_true(store_contract_exists(), "production store must prepare approved enemy rigs before launch")
 if not store_contract_exists(): return {}
 var store := Store.new()
 assert_true(store.prepare_enemies(content), str(store.errors))
 for id in ["cow", "crow"]: assert_true(store.prepare(id, "res://" + content.resources.models[id], content.clips[id]))
 var world := World.new()
 add_child_autofree(world)
 world.initialize(store, content)
 var run := State.create_run(1, {"fighterId":"cow", "partnerId":"crow"}, content)
 for pair in [[3,"grunt"],[4,"zoner"]]:
  run.actors.append(Actor.enemy(pair[0], pair[1], {"x":5.0+pair[0],"depth":0.0}, 0, content.tuning.enemyDefinitions[pair[1]]))
 return {"world":world,"store":store,"run":run}
func store_contract_exists() -> bool:
 return Store.new().has_method("prepare_enemies")
func render(f: Dictionary) -> void:
 f.world.render(f.run, [], {"width":844.0,"height":390.0}, 0, 0, false, false)
func test_normal_world_uses_imported_rigs_and_simulation_owned_poses() -> void:
 var f := setup_world()
 if f.is_empty(): return
 f.run.tick = 28
 f.run.actors[2].action = {"kind":"active","moveId":"grunt","startedTick":28,"endTick":34}
 render(f)
 assert_true(f.world.models[3] is EnemyView)
 assert_true(f.world.models[4] is EnemyView)
 assert_eq(f.world.models[3].last_pose.semantic, "grunt.active")
 assert_almost_eq(f.world.models[3].last_pose.timeSeconds, .47, .000001)
 assert_eq(f.world.models[3].position.x, 8.0)
 var pose: Dictionary = f.world.models[3].last_pose.duplicate(true)
 render(f)
 assert_eq(f.world.models[3].last_pose, pose, "pause/repeated renders cannot advance samples")
 f.world.dispose()
 assert_eq(f.store.live_count(), 0)
func test_removed_enemy_holds_defeat_for_21_simulation_ticks_then_releases_rig() -> void:
 var f := setup_world()
 if f.is_empty(): return
 render(f)
 f.run.tick = 10
 f.run.actors.remove_at(2)
 render(f)
 assert_true(f.world.models.has(3), "decorative defeated rig survives simulation removal")
 assert_eq(f.world.models[3].last_pose.semantic, "Defeated")
 var count: int = f.store.live_count()
 for i in 3: render(f)
 assert_eq(f.store.live_count(), count, "paused render cannot consume defeat lifetime")
 f.run.tick = 30
 render(f)
 assert_true(f.world.models.has(3))
 f.run.tick = 31
 render(f)
 assert_false(f.world.models.has(3))
 assert_eq(f.store.live_count(), count - 1)
 f.world.dispose()
 assert_eq(f.store.live_count(), 0)
func test_bartender_grip_hides_on_active_and_returns_on_next_windup() -> void:
 var f := setup_world()
 if f.is_empty(): return
 var zoner: Dictionary = f.run.actors[3]
 zoner.action = {"kind":"windup","moveId":"throw","startedTick":1,"endTick":40}
 f.run.tick = 39
 render(f)
 assert_true(f.world.models[4].held_prop.visible)
 zoner.action = {"kind":"active","moveId":"throw","startedTick":40,"endTick":46}
 f.run.tick = 40
 render(f)
 assert_false(f.world.models[4].held_prop.visible)
 zoner.action = {"kind":"windup","moveId":"throw","startedTick":100,"endTick":139}
 f.run.tick = 100
 render(f)
 assert_true(f.world.models[4].held_prop.visible)
 f.world.dispose()
 assert_eq(f.store.live_count(), 0)
func test_missing_or_invalid_enemy_asset_blocks_preparation_with_role_diagnostic() -> void:
 assert_true(store_contract_exists())
 if not store_contract_exists(): return
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 content.resources = content.resources.duplicate(true)
 content.resources.art["enemy.grunt"].path = "assets/enemies/grunt/runtime/missing.glb"
 var store := Store.new()
 assert_false(store.prepare_enemies(content))
 assert_true(str(store.errors).contains("grunt"))

func test_defeat_of_actor_still_in_run_does_not_recreate_expired_rig() -> void:
 var f := setup_world()
 if f.is_empty(): return
 render(f)
 f.run.actors[2].hp = 0
 f.run.tick = 10
 render(f)
 f.run.tick = 31
 render(f)
 assert_false(f.world.models.has(3))
 var count: int = f.store.live_count()
 f.run.tick = 32
 render(f)
 assert_false(f.world.models.has(3), "expired model cannot reappear while dead actor remains in snapshot")
 assert_eq(f.store.live_count(), count)
 f.world.dispose()
 assert_eq(f.store.live_count(), 0)
