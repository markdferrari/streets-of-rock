extends GutTest
const Backdrops = preload("res://game/presentation/backdrops.gd")
const Store = preload("res://game/content/resource_store.gd")
const Catalogue = preload("res://game/content/catalogue.gd")
const CameraMath = preload("res://game/presentation/camera_math.gd")
const RunState = preload("res://game/simulation/run_state.gd")
func catalogue() -> Dictionary:
 return JSON.parse_string(FileAccess.get_file_as_string("res://content/backdrops.json"))
func texture(width: int, height: int) -> ImageTexture:
 var image := Image.create(width, height, false, Image.FORMAT_RGBA8)
 image.fill(Color("322638"))
 image.generate_mipmaps()
 return ImageTexture.create_from_image(image)
func test_required_preload_is_atomic_and_reports_missing_or_wrong_import() -> void:
 var store := Store.new()
 assert_false(store.prepare_backdrops(catalogue(), func(_path: String) -> Texture2D: return null))
 assert_eq(store.backdrop_textures.size(), 0)
 assert_eq(store.errors.size(), 8)
 assert_string_contains(store.errors[0], "missing required backdrop")
 assert_false(store.prepare_backdrops(catalogue(), func(_path: String) -> Texture2D: return texture(8, 8)))
 assert_string_contains(store.errors[0], "expected 2048x1024")
 var wall := texture(2048, 1024)
 var floor_texture := texture(1024, 512)
 assert_true(store.prepare_backdrops(catalogue(), func(path: String) -> Texture2D: return wall if path.ends_with("wall.svg") else floor_texture))
 assert_eq(store.backdrop_textures.size(), 8)
 assert_eq(store.backdrop_decoded_bytes, 55924064)
 assert_true(store.errors.is_empty())
func test_static_room_panels_cover_all_rooms_connectors_and_backing_without_colliders() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var panels := Backdrops.new()
 add_child_autofree(panels)
 var textures: Dictionary = {}
 var blank := texture(8, 8)
 for room in catalogue().rooms:
  for kind in ["wall", "floor"]: textures[room[kind]] = blank
 var original: Dictionary = content.level.duplicate(true)
 assert_true(panels.build(textures, catalogue(), content.level))
 assert_eq(content.level, original)
 assert_eq(panels.texture_count, 8)
 assert_eq(panels.room_groups.size(), 4)
 assert_eq(panels.find_children("*", "CollisionObject3D", true, false).size(), 0)
 assert_eq(panels.find_children("*", "AnimationPlayer", true, false).size(), 0)
 for node in panels.find_children("*", "MeshInstance3D", true, false):
  assert_eq(node.material_override.shading_mode, BaseMaterial3D.SHADING_MODE_UNSHADED)
  assert_eq(node.material_override.transparency, BaseMaterial3D.TRANSPARENCY_DISABLED)
 for i in range(1, 4): assert_not_null(panels.get_node_or_null("Connector" + str(i)))
 for group in panels.room_groups.values(): assert_true(group.visible)
 assert_not_null(panels.get_node_or_null("QuietBacking"))
func test_stable_room_mappings_and_exact_eight_resources() -> void:
 var catalogue: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://content/backdrops.json"))
 assert_eq(Backdrops.validate(catalogue), [])
 assert_eq(catalogue.rooms.map(func(room: Dictionary) -> String: return room.roomId), Backdrops.ROOM_IDS)
 catalogue.rooms[1].roomId = "dance-floor"
 assert_false(Backdrops.validate(catalogue).is_empty())
func test_decoded_budget_includes_mipmaps() -> void:
 var sizes: Array = []
 for i in range(4): sizes.append_array([{"width": 2048, "height": 1024}, {"width": 1024, "height": 512}])
 assert_eq(Backdrops.decoded_bytes(sizes), 55924064)
 assert_lte(Backdrops.decoded_bytes(sizes), 64 * 1024 * 1024)
func test_actual_final_and_concept_imports_keep_exact_sizes_opacity_and_mipmaps() -> void:
 for setting in Backdrops.SETTINGS + Backdrops.SETTINGS.map(func(value: String) -> String: return "concepts/" + value):
  for kind in ["wall", "floor"]:
   var imported: Texture2D = load("res://assets/backdrops/" + setting + "/" + kind + ".svg")
   assert_not_null(imported)
   assert_eq(imported.get_width(), 2048 if kind == "wall" else 1024)
   assert_eq(imported.get_height(), 1024 if kind == "wall" else 512)
   var image := imported.get_image()
   assert_true(image.has_mipmaps(), setting + "/" + kind + ": mipmaps")
   assert_false(image.is_invisible())
   assert_eq(image.detect_alpha(), Image.ALPHA_NONE, setting + "/" + kind + ": opaque")
func test_actual_final_required_preload_builds_world_and_survives_retry_reuse() -> void:
 var store := Store.new()
 assert_true(store.prepare_backdrops(catalogue()), str(store.errors))
 assert_eq(store.backdrop_textures.size(), 8)
 var first: Texture2D = store.backdrop_textures[catalogue().rooms[0].wall]
 assert_true(store.prepare_backdrops(catalogue()))
 assert_same(store.backdrop_textures[catalogue().rooms[0].wall], first)
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var world = load("res://game/presentation/world_view.gd").new()
 add_child_autofree(world)
 world.initialize(store, content)
 assert_eq(world.backdrops.texture_count, 8)
 assert_eq(world.backdrops.room_groups.size(), 4)
 assert_null(world.get_node_or_null("DevelopmentScenery"))
func test_actual_panel_extents_cover_fitted_camera_edges_and_all_three_connectors() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var run: Dictionary = RunState.create_run(1, {"fighterId": "lion", "partnerId": "plates"}, content)
 var camera := Camera3D.new()
 add_child_autofree(camera)
 camera.projection = Camera3D.PROJECTION_ORTHOGONAL
 var panels := Backdrops.new()
 add_child_autofree(panels)
 var textures: Dictionary = {}
 var blank := texture(8, 8)
 for room in catalogue().rooms:
  for kind in ["wall", "floor"]: textures[room[kind]] = blank
 assert_true(panels.build(textures, catalogue(), content.level))
 var wall: MeshInstance3D = panels.get_node("QuietBacking").get_child(1)
 var floor_panel: MeshInstance3D = panels.get_node("QuietBacking").get_child(0)
 for width in [667, 844, 915]:
  for index in range(4):
   run.areaIndex = index
   run.encounter.status = "cleared" if index < 3 else "active"
   var area: Dictionary = content.level.areas[index]
   run.actors[0].position = {"x": area.maxX + (1.0 if index < 3 else 0.0), "depth": 0.0}
   run.actors[1].position = {"x": area.maxX - 1.0, "depth": 0.0}
   var frame := CameraMath.compute(run, {"width": width, "height": 390}, {"player": content.resources.bodyEnvelopes.lion, "partner": content.resources.bodyEnvelopes.plates}, content)
   # Same projection basis as the actual production camera, evaluated in scalar space.
   var direction := Vector3(0, -8, -12).normalized()
   var up := Vector3(0, -direction.z, direction.y)
   var origin := Vector3(frame.anchorX, frame.anchorHeight + 8, 12)
   for horizontal in [-1.0, 0.0, 1.0]:
    for vertical in [-1.0, 0.0, 1.0]:
     var ray: Vector3 = origin + Vector3.RIGHT * horizontal * frame.halfHeight * frame.aspect + up * vertical * frame.halfHeight
     var wall_point := ray + direction * ((wall.position.z - ray.z) / direction.z)
     var floor_point := ray + direction * ((floor_panel.position.y - ray.y) / direction.y)
     var on_wall: bool = absf(wall_point.x - wall.position.x) <= wall.mesh.size.x / 2 and absf(wall_point.y - wall.position.y) <= wall.mesh.size.y / 2
     var on_floor: bool = absf(floor_point.x - floor_panel.position.x) <= floor_panel.mesh.size.x / 2 and absf(floor_point.z) <= floor_panel.mesh.size.y / 2
     assert_true(on_wall or on_floor, str([width, index, horizontal, vertical]) + ": no exposed camera edge")
func test_go_avoids_pause_overlay_controls_and_safe_insets_and_is_suppressed_on_result() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var session = load("res://game/app/run_session.gd").new(content)
 session.run = RunState.create_run(1, {"fighterId": "cow", "partnerId": "crow"}, content)
 session.run.encounter.status = "cleared"
 session.phase = "paused"
 var screen = load("res://game/ui/session_screen.gd").new()
 add_child_autofree(screen)
 var environment: Dictionary = {"width": 667.0, "height": 375.0, "safeInsets": {"top": 8.0, "right": 44.0, "bottom": 12.0, "left": 44.0}, "portrait": false, "focused": true, "visible": true}
 var settings: Dictionary = {"musicVolume": 0.7, "effectsVolume": 0.8, "screenShake": true}
 screen.render(session, content, environment, settings, 0, null)
 assert_eq(screen.labels.go.text, "GO", "GO uses a native vector arrow rather than an unsupported font glyph")
 assert_false(screen.labels.go.get_rect().grow(8).intersects(screen.labels.result.get_rect()), "GO must avoid the pause message")
 for control in screen.controls.values(): assert_false(screen.labels.go.get_rect().grow(8).intersects(control.get_rect()), "GO must avoid actionable controls")
 assert_gte(screen.labels.go.position.x, 44.0)
 assert_lte(screen.labels.go.get_rect().end.x, 623.0)
 session.phase = "victory"
 session.run.result = "victory"
 screen.render(session, content, environment, settings, 0, null)
 assert_eq(screen.labels.go.text, "")
