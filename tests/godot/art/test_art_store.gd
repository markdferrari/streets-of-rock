extends GutTest
const Catalogue = preload("res://game/content/catalogue.gd")
const Store = preload("res://game/content/resource_store.gd")
func test_preparation_rejects_missing_roles_and_rechecks_a_changed_scene_on_retry() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var store := Store.new()
 assert_true(store.prepare_enemies(content))
 content.enemy_presentations = content.enemy_presentations.duplicate(true)
 content.enemy_presentations.erase("liam")
 assert_false(store.prepare_enemies(content),"all four roles required before countdown")
 assert_true(str(store.errors).contains("liam"))
 assert_true(content.load_catalogue())
 content.resources = content.resources.duplicate(true)
 content.resources.art[content.enemy_presentations.grunt.sceneResourceId].path="assets/missing-enemy.glb"
 assert_false(store.prepare_enemies(content),"cached template cannot hide changed or missing required art")
 assert_true(str(store.errors).contains("missing"))
 assert_eq(store.live_count(),0,"probes never become owned live instances")
func test_all_room_preparation_is_atomic_and_dependency_errors_block_readiness() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var store := Store.new()
 content.resources = content.resources.duplicate(true)
 content.resources.art[content.room_presentations["vip-lounge"].sceneResourceId].path="assets/missing-room.tscn"
 assert_false(store.prepare_rooms(content))
 assert_eq(store.room_scenes.size(),0)
 assert_eq(store.live_count(),0)

func test_non_scene_import_reports_a_required_visual_failure_without_a_script_error() -> void:
 var store := Store.new()
 assert_false(store.prepare("wrong-kind","res://assets/enemies/shared/outfit.tres",[]))
 assert_true(str(store.errors).contains("scene"))
 assert_eq(store.live_count(),0)
