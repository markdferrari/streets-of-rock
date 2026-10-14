extends GutTest
const View = preload("res://game/presentation/enemy_view.gd")
const Art = preload("res://game/content/art_catalog.gd")
const Store = preload("res://game/content/resource_store.gd")
func definition(role: String) -> Dictionary:
 return JSON.parse_string(FileAccess.get_file_as_string("res://tests/godot/fixtures/art/enemy-pilot/" + role + "/definition.json"))
func instance(role: String) -> Node3D:
 var scene: PackedScene = load("res://tests/godot/fixtures/art/enemy-pilot/" + role + "/runtime/character.glb")
 return scene.instantiate()
func actor(role: String, kind: String, start: int, end: int, facing: int = 1) -> Dictionary:
 return {"id": 7, "role": role, "combatClass": "normal", "hp": 120, "phase": 1, "facing": facing, "position": {"x": 3.25, "depth": -1.75}, "action": {"kind": kind, "startedTick": start, "endTick": end, "moveId": "grunt" if role == "grunt" else "throw"}}
func test_actual_pilot_imports_have_complete_clips_and_safe_skeleton_tracks() -> void:
 for role in ["grunt", "zoner"]:
  var rig := instance(role)
  add_child_autofree(rig)
  assert_eq(Art.inspect_enemy(rig, definition(role)), [] as Array[String])
func test_imported_outfit_palette_uses_vertex_colours_in_godot() -> void:
 for role in ["grunt", "zoner"]:
  var rig := instance(role)
  add_child_autofree(rig)
  for mesh in rig.find_children("*", "MeshInstance3D", true, false):
   var material: StandardMaterial3D = mesh.mesh.surface_get_material(0)
   assert_true(material.vertex_color_use_as_albedo, role + ": outfit palette must survive Godot import")
   var colours: PackedColorArray = mesh.mesh.surface_get_arrays(0)[Mesh.ARRAY_COLOR]
   assert_gt(colours.size(), 0)
func test_manual_sampling_uses_real_segment_times_positions_and_both_facings() -> void:
 var view := View.new()
 add_child_autofree(view)
 var attached := view.attach(instance("grunt"), definition("grunt"))
 assert_true(attached, str(view.errors))
 if not attached: return
 for facing in [1, -1]:
  var a := actor("grunt", "active", 27, 33, facing)
  assert_true(view.apply_snapshot(a, a, 30), str(view.errors))
  assert_eq(view.position, Vector3(3.25, 0.0, -1.75))
  assert_almost_eq(view.rotation.y, facing * PI / 2.0, 0.000001)
  assert_eq(view.last_pose.semantic, "grunt.active")
  assert_almost_eq(view.last_pose.timeSeconds, 0.565, 0.000001)
  assert_false(view.animation.is_playing())
func test_two_instances_share_resources_but_have_independent_actual_bone_poses() -> void:
 var first := View.new()
 var second := View.new()
 add_child_autofree(first)
 add_child_autofree(second)
 var one := instance("zoner")
 var two := instance("zoner")
 var attached := first.attach(one, definition("zoner")) and second.attach(two, definition("zoner"))
 assert_true(attached)
 if not attached: return
 var a := actor("zoner", "windup", 0, 39)
 first.apply_snapshot(a, a, 1)
 second.apply_snapshot(a, a, 38)
 var sk1: Skeleton3D = one.find_children("*", "Skeleton3D", true, false)[0]
 var sk2: Skeleton3D = two.find_children("*", "Skeleton3D", true, false)[0]
 assert_ne(sk1, sk2)
 var before: Array = []
 for bone in sk1.get_bone_count(): before.append(sk1.get_bone_pose_rotation(bone))
 var changed := false
 for bone in sk2.get_bone_count(): changed = changed or not sk2.get_bone_pose_rotation(bone).is_equal_approx(before[bone])
 assert_true(changed, "different source times produce different real skeleton poses")
 second.apply_snapshot(a, a, 20)
 for bone in sk1.get_bone_count(): assert_eq(sk1.get_bone_pose_rotation(bone), before[bone], "second pose cannot mutate first skeleton")
 assert_eq(first.last_pose.sample, 1.0 / 39.0)
func test_missing_binding_is_actionable_and_does_not_fall_back_to_idle() -> void:
 var view := View.new()
 add_child_autofree(view)
 var d := definition("zoner")
 d.clipBindings["throw.active"].clipName = "Missing_Throw"
 assert_false(view.attach(instance("zoner"), d))
 assert_true(str(view.errors).contains("Missing_Throw"))
func test_repeat_tick_stun_and_defeat_do_not_advance_or_modify_input_state() -> void:
 var view := View.new()
 add_child_autofree(view)
 var attached := view.attach(instance("grunt"), definition("grunt"))
 assert_true(attached)
 if not attached: return
 var a := actor("grunt", "windup", 0, 27)
 a.stunnedUntilTick = 50
 var before := a.duplicate(true)
 view.apply_snapshot(a, a, 10)
 var pose := view.last_pose.duplicate(true)
 view.apply_snapshot(a, a, 10)
 assert_eq(view.last_pose, pose)
 assert_eq(view.last_pose.semantic, "Stunned")
 assert_eq(a, before)
 a.hp = 0
 view.apply_snapshot(a, a, 10)
 assert_eq(view.last_pose.semantic, "Defeated")
 assert_false(view.animation.is_playing())

func test_attack_active_starts_with_hand_forward_in_both_facings() -> void:
 for role in ["grunt", "zoner"]:
  for facing in [1, -1]:
   var view := View.new()
   add_child_autofree(view)
   assert_true(view.attach(instance(role), definition(role)))
   var a := actor(role, "active", 40, 46, facing)
   assert_true(view.apply_snapshot(a, a, 40))
   var skeleton: Skeleton3D = view.model.find_children("*", "Skeleton3D", true, false)[0]
   var hand := skeleton.global_transform * skeleton.get_bone_global_pose(skeleton.find_bone("handslot.r")).origin
   var forward: float = (hand.x - view.global_position.x) * facing
   assert_gt(forward, 0.5, role + ": active phase must sample a forward contact/release pose, not the backswing")
