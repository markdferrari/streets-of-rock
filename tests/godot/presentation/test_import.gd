extends GutTest
const Store = preload("res://game/content/resource_store.gd")
const View = preload("res://game/presentation/character_view.gd")
const Catalogue = preload("res://game/content/catalogue.gd")

func test_imported_rig_has_all_semantic_clips_and_manual_pose() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var store := Store.new()
 assert_true(store.prepare("cow", "res://" + content.resources.models.cow, content.clips.cow), str(store.errors))
 var instance := store.create("cow")
 var view := View.new()
 add_child_autofree(view)
 view.attach(instance)
 view.pose(3.25, -1.75, -1, "cow1.active", 0.5)
 assert_eq(view.position, Vector3(3.25, 0.0, -1.75))
 assert_eq(view.scale, Vector3(1.25, 1.25, 1.25))
 assert_almost_eq(view.rotation.y, -PI / 2.0, 0.00001)
 assert_not_null(view.animation)
 if view.animation != null:
  assert_false(view.animation.is_playing(), "simulation manually samples animation")
  assert_almost_eq(view.sample_time, view.animation.get_animation("cow1.active").length * 0.5, 0.00001)
 store.release(instance)
 assert_false(is_instance_valid(instance))
 assert_eq(store.live_count(), 0)

func test_missing_clip_blocks_readiness_and_released_instances_settle() -> void:
 var store := Store.new()
 assert_false(store.prepare("bad", "res://assets/characters/cow-crow/runtime/cow.glb", ["NotAClip"]))
 assert_true(str(store.errors).contains("NotAClip"))
 for i in range(10):
  assert_true(store.prepare("cow", "res://assets/characters/cow-crow/runtime/cow.glb", ["Idle"]))
  var instance := store.create("cow")
  assert_eq(store.live_count(), 1)
  store.release(instance)
  assert_eq(store.live_count(), 0)

func test_manual_sample_changes_real_imported_bones_without_playback() -> void:
 var store := Store.new()
 assert_true(store.prepare("cow", "res://assets/characters/cow-crow/runtime/cow.glb", ["Idle", "cow1.windup", "cow1.active"]))
 var instance := store.create("cow")
 var view := View.new()
 add_child_autofree(view)
 view.attach(instance)
 var skeletons := instance.find_children("*", "Skeleton3D", true, false)
 assert_gt(skeletons.size(), 0)
 if not skeletons.is_empty():
  var skeleton: Skeleton3D = skeletons[0]
  view.pose(0.0, 0.0, 1, "cow1.windup", 0.0)
  var before: Array = []
  for index in range(skeleton.get_bone_count()):
   before.append(skeleton.get_bone_pose_rotation(index))
  view.pose(0.0, 0.0, 1, "cow1.active", 0.5)
  var changed := false
  for index in range(skeleton.get_bone_count()):
   changed = changed or not before[index].is_equal_approx(skeleton.get_bone_pose_rotation(index))
  assert_true(changed, "manual sampling changes actual bone rotations")
  assert_false(view.animation.is_playing())
 store.release(instance)
