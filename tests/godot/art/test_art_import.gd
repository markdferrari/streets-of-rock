extends GutTest
const Art = preload("res://game/content/art_catalog.gd")
func rig() -> Node3D:
 var root := Node3D.new()
 var skeleton := Skeleton3D.new()
 skeleton.name = "Skeleton3D"
 skeleton.add_bone("root")
 skeleton.add_bone("head")
 skeleton.set_bone_parent(1, 0)
 root.add_child(skeleton)
 var mesh := MeshInstance3D.new()
 mesh.mesh = BoxMesh.new()
 mesh.material_override = StandardMaterial3D.new()
 root.add_child(mesh)
 var player := AnimationPlayer.new()
 root.add_child(player)
 var library := AnimationLibrary.new()
 var clip := Animation.new()
 clip.length = 1.0
 var track := clip.add_track(Animation.TYPE_ROTATION_3D)
 clip.track_set_path(track, NodePath("Skeleton3D:head"))
 clip.rotation_track_insert_key(track, 0.0, Quaternion.IDENTITY)
 clip.rotation_track_insert_key(track, 1.0, Quaternion(Vector3.UP, 0.3))
 library.add_animation("Idle_A", clip)
 player.add_animation_library("", library)
 add_child_autofree(root)
 return root
func definition() -> Dictionary:
 return {"role": "fixture", "clipBindings": {"Idle": {"clipName": "Idle_A", "startSeconds": 0.0, "endSeconds": 1.0, "loop": true}}}
func test_valid_minimal_import_and_missing_skeleton_material_or_clip() -> void:
 var root := rig()
 assert_eq(Art.inspect_enemy(root, definition()), [] as Array[String])
 root.get_node("Skeleton3D").free()
 assert_true(str(Art.inspect_enemy(root, definition())).contains("skeleton"))
 root = rig()
 var mesh: MeshInstance3D = root.find_children("*", "MeshInstance3D", true, false)[0]
 mesh.material_override = null
 assert_true(str(Art.inspect_enemy(root, definition())).contains("material"))
 var d := definition()
 d.clipBindings.Idle.clipName = "Missing"
 assert_true(str(Art.inspect_enemy(root, d)).contains("Missing"))
func test_imported_clip_segments_must_fit_actual_animation_length() -> void:
 var d := definition()
 d.clipBindings.Idle.endSeconds = 1.2
 assert_true(str(Art.inspect_enemy(rig(), d)).contains("endSeconds"))
func test_imported_gameplay_nodes_and_scripts_are_forbidden() -> void:
 var root := rig()
 root.add_child(StaticBody3D.new())
 assert_true(str(Art.inspect_enemy(root, definition())).contains("StaticBody3D"))
 root = rig()
 root.set_script(load("res://tests/godot/fixtures/art/forbidden_script.gd"))
 assert_true(str(Art.inspect_enemy(root, definition())).contains("script"))
func test_method_audio_and_actor_root_translation_tracks_are_rejected() -> void:
 for kind in [Animation.TYPE_METHOD, Animation.TYPE_AUDIO, Animation.TYPE_POSITION_3D]:
  var root := rig()
  var player: AnimationPlayer = root.find_children("*", "AnimationPlayer", true, false)[0]
  var animation := player.get_animation("Idle_A")
  var track := animation.add_track(kind)
  animation.track_set_path(track, NodePath("."))
  if kind == Animation.TYPE_POSITION_3D:
   animation.position_track_insert_key(track, 0.0, Vector3.ZERO)
   animation.position_track_insert_key(track, 1.0, Vector3.RIGHT)
  assert_false(Art.inspect_enemy(root, definition()).is_empty(), str(kind))
func test_skeletal_root_locomotion_is_rejected_but_local_hand_motion_is_allowed() -> void:
 var root := rig()
 var player: AnimationPlayer = root.find_children("*", "AnimationPlayer", true, false)[0]
 var animation := player.get_animation("Idle_A")
 var track := animation.add_track(Animation.TYPE_POSITION_3D)
 animation.track_set_path(track, NodePath("Skeleton3D:root"))
 animation.position_track_insert_key(track, 0.0, Vector3.ZERO)
 animation.position_track_insert_key(track, 1.0, Vector3.FORWARD)
 assert_true(str(Art.inspect_enemy(root, definition())).contains("root"))
 animation.track_set_path(track, NodePath("Skeleton3D:head"))
 assert_eq(Art.inspect_enemy(root, definition()), [] as Array[String])
func test_unbound_extra_clip_is_also_inspected() -> void:
 var root := rig()
 var player: AnimationPlayer = root.find_children("*", "AnimationPlayer", true, false)[0]
 var bad := Animation.new()
 var track := bad.add_track(Animation.TYPE_METHOD)
 bad.track_set_path(track, NodePath("."))
 player.get_animation_library("").add_animation("UnboundUnsafe", bad)
 assert_true(str(Art.inspect_enemy(root, definition())).contains("UnboundUnsafe"))
