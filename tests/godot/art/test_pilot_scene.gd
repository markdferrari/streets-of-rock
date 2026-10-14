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
