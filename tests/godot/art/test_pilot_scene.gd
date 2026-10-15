extends GutTest
func test_review_scene_drives_real_ai_projectile_creation_and_releases_all_owned_heroes() -> void:
 var packed: PackedScene = load("res://tests/godot/fixtures/art/representative.tscn")
 var pilot := packed.instantiate()
 add_child(pilot)
 pilot.command("pause", true)
 pilot.command("reset", null)
 assert_true(pilot.fixture_ready, str(pilot.errors))
 if pilot.fixture_ready:
  pilot.command("step", 39)
  assert_eq(pilot.views.zoner.last_pose.semantic, "throw.windup")
  assert_true(pilot.grip.visible)
  assert_eq(pilot.projectiles.size(), 0)
  pilot.command("step", 1)
  assert_eq(pilot.views.zoner.last_pose.semantic, "throw.active")
  assert_false(pilot.grip.visible)
  assert_eq(pilot.projectiles.size(), 1)
  assert_eq(pilot.projectile_releases[0].tick, 40)
  assert_eq(pilot.errors, [] as Array[String])
 var store: RefCounted = pilot.store
 assert_eq(store.live_count(), 2)
 pilot.free()
 assert_eq(store.live_count(), 0)
 await get_tree().process_frame
 assert_no_new_orphans("representative teardown must release imported physics helpers as well as owned heroes")
func test_representative_includes_explicit_imported_room_prop_and_source_record() -> void:
 var packed: PackedScene = load("res://tests/godot/fixtures/art/representative.tscn")
 var pilot := packed.instantiate()
 add_child_autofree(pilot)
 var room: Node = pilot.get_node_or_null("RepresentativeRoom")
 assert_not_null(room, "round-trip proof needs an imported room/prop, not only procedural boxes")
 if room == null: return
 assert_eq(pilot.representative_views.size(), 2, "busy proof adds two independent enemy instances beside the first pair and duo")
 assert_gt(room.find_children("*", "MeshInstance3D", true, false).size(), 0)
 assert_eq(room.find_children("*", "CollisionObject3D", true, false).size(), 0)
 assert_true(FileAccess.file_exists("res://tests/godot/fixtures/art/representative-room/source/room.blend"))
 var record: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://tests/godot/fixtures/art/representative-room/record.json"))
 assert_eq(FileAccess.get_sha256("res://" + record.runtimePath), record.runtimeSha256)
 assert_eq(FileAccess.get_sha256("res://" + record.sourcePath), record.sourceSha256)
func test_representative_room_palette_survives_the_pinned_importer() -> void:
 var packed: PackedScene = load("res://tests/godot/fixtures/art/representative-room/runtime/room.glb")
 var room := packed.instantiate()
 add_child_autofree(room)
 for mesh in room.find_children("*", "MeshInstance3D", true, false):
  for surface in mesh.mesh.get_surface_count():
   var material: StandardMaterial3D = mesh.mesh.surface_get_material(surface)
   assert_true(material.vertex_color_use_as_albedo, "imported room must show the authored palette instead of white geometry")
