extends GutTest
const Store = preload("res://game/content/resource_store.gd")
const Catalogue = preload("res://game/content/catalogue.gd")
const State = preload("res://game/simulation/run_state.gd")
const World = preload("res://game/presentation/world_view.gd")

func test_required_model_clip_and_backdrop_failures_block_readiness_actionably() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var store := Store.new()
 assert_false(store.prepare("missing", "res://missing.glb", []))
 assert_string_contains(store.errors[0], "missing required resource")
 assert_false(store.prepare("lion", "res://assets/characters/lion/runtime/character.glb", ["missing-semantic-clip"]))
 assert_string_contains(str(store.errors), "missing-semantic-clip")
 assert_false(store.prepare_backdrops(JSON.parse_string(FileAccess.get_file_as_string("res://content/backdrops.json")), func(_path: String) -> Texture2D: return null))
 assert_eq(store.backdrop_textures.size(), 0)

func test_ten_prepare_render_retry_teardown_cycles_leave_no_owned_rig_instances() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var store := Store.new()
 for id in content.roster:
  var definition: Dictionary = content.definitions[id]
  assert_true(store.prepare_hero(content,id), str(store.errors))
 assert_true(store.prepare_backdrops(JSON.parse_string(FileAccess.get_file_as_string("res://content/backdrops.json"))), str(store.errors))
 for cycle in range(10):
  var world: Node3D = World.new()
  add_child(world)
  world.initialize(store, content)
  var run: Dictionary = State.create_run(cycle + 1, {"fighterId":"lion","partnerId":"plates"}, content)
  world.render(run, [], {"width":844,"height":390}, 0.0, 0.0, false, false)
  assert_eq(store.live_count(), 2)
  world.dispose()
  await get_tree().process_frame
  assert_eq(store.live_count(), 0)
