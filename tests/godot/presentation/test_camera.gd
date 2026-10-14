extends GutTest
const Camera = preload("res://game/presentation/camera_math.gd")
const Catalogue = preload("res://game/content/catalogue.gd")
func test_source_camera_frames_all_reference_layouts() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 for width in [667, 844, 915]:
  var fixture: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/reference/fixtures/visible-target-" + str(width) + ".json"))
  var run: Dictionary = fixture.startingRun
  var expected: Dictionary = fixture.frames[0].arena.frame
  var actual := Camera.compute(run, fixture.frames[0].viewport, {"player": content.resources.bodyEnvelopes[run.duo.fighterId], "partner": content.resources.bodyEnvelopes[run.duo.partnerId]}, content)
  for field in expected:
   assert_almost_eq(float(actual.get(field, 0)), float(expected[field]), 1e-9, str(width) + ": " + field)
func test_world_retires_removed_actor_models_without_leaking_owned_rigs() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var store = load("res://game/content/resource_store.gd").new()
 for id in ["cow", "crow"]: assert_true(store.prepare(id, "res://" + content.resources.models[id], content.clips[id]))
 var state = load("res://game/simulation/run_state.gd")
 var run: Dictionary = state.create_run(1, {"fighterId": "cow", "partnerId": "crow"}, content)
 var actor = load("res://game/simulation/actor.gd")
 run.actors.append(actor.enemy(3, "grunt", {"x": 5.0, "depth": 0.0}, 0, content.tuning.enemyDefinitions.grunt))
 var world = load("res://game/presentation/world_view.gd").new()
 add_child_autofree(world)
 world.initialize(store, content)
 world.render(run, [], {"width": 844.0, "height": 390.0}, 0, 0, false, false)
 assert_eq(world.models.size(), 3)
 run.actors.resize(2)
 world.render(run, [], {"width": 844.0, "height": 390.0}, 0, 0, false, false)
 assert_eq(world.models.size(), 2)
 world.dispose()
 assert_eq(store.live_count(), 0)
func test_combat_control_sizes_and_diamond_positions_match_retained_touch_layout() -> void:
 var hud = load("res://game/ui/combat_hud.gd")
 var bounds: Dictionary = hud.bounds(667, 375, {"left": 0.0, "right": 0.0, "top": 0.0, "bottom": 0.0})
 assert_eq(bounds.light, Rect2(479, 241, 72, 72))
 assert_eq(bounds.heavy, Rect2(599, 249, 56, 56))
 assert_eq(bounds.special, Rect2(539, 187, 56, 56))
 assert_eq(bounds.dodge, Rect2(539, 307, 56, 56))
