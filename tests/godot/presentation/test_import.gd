extends GutTest
const Store = preload("res://game/content/resource_store.gd")
const View = preload("res://game/presentation/character_view.gd")
const Catalogue = preload("res://game/content/catalogue.gd")

func test_imported_rig_has_all_semantic_clips_and_manual_pose() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var store := Store.new()
 assert_true(store.prepare_hero(content,"cow"), str(store.errors))
 var instance := store.create("cow")
 var view := View.new()
 add_child_autofree(view)
 view.attach(instance)
 view.pose(3.25, -1.75, -1, "cow1", 0.5)
 assert_eq(view.position, Vector3(3.25, 0.0, -1.75))
 assert_eq(view.scale, Vector3(1.25, 1.25, 1.25))
 assert_almost_eq(view.rotation.y, -PI / 2.0, 0.00001)
 assert_not_null(view.animation)
 if view.animation != null:
  assert_false(view.animation.is_playing(), "simulation manually samples animation")
  assert_almost_eq(view.sample_time, view.animation.get_animation("cow1").length * 0.5, 0.00001)
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
 assert_true(store.prepare("cow", "res://assets/characters/cow-crow/runtime/cow.glb", ["Idle", "cow1"]))
 var instance := store.create("cow")
 var view := View.new()
 add_child_autofree(view)
 view.attach(instance)
 var skeletons := instance.find_children("*", "Skeleton3D", true, false)
 assert_gt(skeletons.size(), 0)
 if not skeletons.is_empty():
  var skeleton: Skeleton3D = skeletons[0]
  view.pose(0.0, 0.0, 1, "cow1", 0.0)
  var before: Array = []
  for index in range(skeleton.get_bone_count()):
   before.append(skeleton.get_bone_pose_rotation(index))
  view.pose(0.0, 0.0, 1, "cow1", 0.5)
  var changed := false
  for index in range(skeleton.get_bone_count()):
   changed = changed or not before[index].is_equal_approx(skeleton.get_bone_pose_rotation(index))
  assert_true(changed, "manual sampling changes actual bone rotations")
  assert_false(view.animation.is_playing())
 store.release(instance)

func test_weighted_profile_sampling_changes_owned_bones_and_preserves_other_view() -> void:
 var store := Store.new()
 assert_true(store.prepare("cow", "res://assets/characters/cow-crow/runtime/cow.glb", ["Idle","cow1"]))
 var a := View.new()
 var b := View.new()
 add_child_autofree(a)
 add_child_autofree(b)
 var ai := store.create("cow")
 var bi := store.create("cow")
 a.attach(ai)
 b.attach(bi)
 var sa: Skeleton3D = ai.find_children("*","Skeleton3D",true,false)[0]
 var sb: Skeleton3D = bi.find_children("*","Skeleton3D",true,false)[0]
 var original := sb.get_bone_pose_rotation(1)
 a.apply_pose(Vector2(2, 1), -1, {"semanticKey":"active","actionIdentity":"a","samples":[{"clipName":"cow1","timeSeconds":0.05,"weight":1.0}],"reaction":{},"blendSeconds":0.0})
 assert_eq(a.position, Vector3(2,0,1))
 assert_eq(sb.get_bone_pose_rotation(1), original)
 assert_ne(sa.get_instance_id(), sb.get_instance_id())
 assert_false(a.animation.is_playing())
 store.release(ai)
 store.release(bi)

func test_reaction_is_relative_to_imported_rest_and_does_not_move_unmasked_bones() -> void:
 var store := Store.new()
 assert_true(store.prepare("cow","res://assets/characters/cow-crow/runtime/cow.glb",["Idle","Hurt"]))
 var instance := store.create("cow")
 var view := View.new()
 add_child(view)
 view.attach(instance)
 var skeleton: Skeleton3D = instance.find_children("*","Skeleton3D",true,false)[0]
 var torso: int = skeleton.find_bone("Torso")
 var arm: int = skeleton.find_bone("LowerArm.L")
 var sample := {"semanticKey":"Idle","actionIdentity":"idle","samples":[{"clipName":"Idle","timeSeconds":0.0,"weight":1.0}],"reaction":{},"blendSeconds":0.0}
 view.apply_pose(Vector2.ZERO,1,sample)
 var base := skeleton.get_bone_pose(torso)
 var unmasked := skeleton.get_bone_pose(arm)
 sample.reaction = {"clipName":"Hurt","timeSeconds":0.5,"boneNames":["Torso"],"restRelative":true}
 view.apply_pose(Vector2.ZERO,1,sample)
 assert_true(skeleton.get_bone_pose(torso).origin.is_equal_approx(base.origin),"reaction must not duplicate imported rest translation")
 assert_true(skeleton.get_bone_pose(arm).is_equal_approx(unmasked),"unmasked bones retain the action pose")
 assert_false(skeleton.get_bone_pose(torso).basis.is_equal_approx(base.basis),"masked reaction still changes rotation")
 store.release(instance)
 view.free()
