extends GutTest
const Review = preload("res://tests/godot/fixtures/hero-animation/review.gd")
const TestBridge = preload("res://game/platform/test_bridge.gd")

func synthetic_scene() -> PackedScene:
 var root := Node3D.new()
 var skeleton := Skeleton3D.new()
 skeleton.name = "Skeleton"
 root.add_child(skeleton)
 skeleton.owner = root
 skeleton.add_bone("Root")
 skeleton.add_bone("Arm")
 skeleton.set_bone_parent(1, 0)
 var player := AnimationPlayer.new()
 player.name = "AnimationPlayer"
 root.add_child(player)
 player.owner = root
 var library := AnimationLibrary.new()
 for clip in ["Idle", "Move", "Attack"]:
  var animation := Animation.new()
  animation.length = 1.0
  var track := animation.add_track(Animation.TYPE_ROTATION_3D)
  animation.track_set_path(track, NodePath("Skeleton:Arm"))
  animation.track_insert_key(track, 0.0, Quaternion.IDENTITY)
  animation.track_insert_key(track, 1.0, Quaternion(Vector3.RIGHT, 0.8))
  library.add_animation(clip, animation)
 player.add_animation_library("", library)
 var packed := PackedScene.new()
 assert_eq(packed.pack(root), OK)
 root.free()
 return packed

func review() -> Node3D:
 var node := Review.new()
 node.auto_load = false
 add_child_autofree(node)
 return node

func test_three_actual_views_sample_independently_with_matched_display_settings() -> void:
 var node := review()
 var scene := synthetic_scene()
 assert_true(node.configure_sources({"current": scene, "kaykit": scene, "universal": scene}, {"current": {"Idle": "Idle", "Move": "Move", "Attack": "Attack"}, "kaykit": {"Idle": "Idle", "Move": "Move", "Attack": "Attack"}, "universal": {"Idle": "Idle", "Move": "Move", "Attack": "Attack"}}))
 node.set_action("Attack")
 node.sample_at(0.5)
 var current: Skeleton3D = node.views.current.skeleton
 var candidate: Skeleton3D = node.views.kaykit.skeleton
 assert_ne(current.get_instance_id(), candidate.get_instance_id())
 assert_ne(node.views.current.player.get_instance_id(), node.views.kaykit.player.get_instance_id())
 assert_almost_eq(current.get_bone_pose_rotation(1).get_angle(), 0.4, 0.001)
 assert_eq(current.get_bone_pose_rotation(1), candidate.get_bone_pose_rotation(1))
 node.sample_source("kaykit", 0.75)
 assert_almost_eq(current.get_bone_pose_rotation(1).get_angle(), 0.4, 0.001)
 assert_almost_eq(candidate.get_bone_pose_rotation(1).get_angle(), 0.6, 0.001)
 for entry in node.views.values():
  assert_eq(entry.root.scale, Vector3.ONE * 1.25)
  assert_false(entry.player.is_playing())
 assert_eq(node.camera.projection, Camera3D.PROJECTION_ORTHOGONAL)

func test_pause_facing_sample_and_reset_are_explicit_without_simulation() -> void:
 var node := review()
 var scene := synthetic_scene()
 assert_true(node.configure_sources({"current": scene}, {"current": {"Idle": "Idle", "Move": "Move", "Attack": "Attack"}}))
 node.advance(0.2)
 assert_almost_eq(node.elapsed, 0.2, 0.00001)
 node.set_paused(true)
 node.advance(10.0)
 assert_almost_eq(node.elapsed, 0.2, 0.00001)
 node.set_facing(-1)
 assert_almost_eq(node.views.current.root.rotation.y, -PI / 2, 0.00001)
 node.sample_at(0.75)
 assert_almost_eq(node.views.current.time, 0.75, 0.00001)
 node.set_action("Move")
 assert_eq(node.elapsed, 0.0)
 node.set_paused(false)
 node.advance(0.1)
 assert_almost_eq(node.elapsed, 0.1, 0.00001)

func test_replacement_disposes_old_views_and_missing_clip_is_actionable() -> void:
 var node := review()
 var scene := synthetic_scene()
 assert_true(node.configure_sources({"current": scene}, {"current": {"Idle": "Idle", "Move": "Move", "Attack": "Attack"}}))
 var old: Node3D = node.views.current.root
 assert_false(node.configure_sources({"current": scene}, {"current": {"Idle": "Missing"}}))
 assert_false(is_instance_valid(old))
 assert_false(node.fixture_ready)
 assert_true(str(node.errors).contains("Missing"))

func test_review_route_is_exact_and_test_only() -> void:
 assert_eq(TestBridge.fixture_scene("?fixture=hero-animation&character=cow"), "res://tests/godot/fixtures/hero-animation/review.tscn")
 assert_eq(TestBridge.fixture_scene("?fixture=hero-animation-extra"), "")
 assert_eq(TestBridge.fixture_scene("?other=fixture=hero-animation"), "")

func test_baseline_attack_samples_all_phases_on_its_original_timeline() -> void:
 var node := review()
 var scene := synthetic_scene()
 var bindings := {"Idle": "Idle", "Move": "Move", "Attack": "Attack", "attackSequence": [{"clipName": "Idle", "seconds": 0.2}, {"clipName": "Attack", "seconds": 0.2}, {"clipName": "Move", "seconds": 0.6}]}
 assert_true(node.configure_sources({"current": scene}, {"current": bindings}))
 node.set_action("Attack")
 node.sample_at(0.1)
 assert_eq(node.snapshot().views.current.clip, "Idle")
 assert_almost_eq(node.views.current.time, 0.5, 0.00001)
 node.sample_at(0.3)
 assert_eq(node.snapshot().views.current.clip, "Attack")
 node.sample_at(0.7)
 assert_eq(node.snapshot().views.current.clip, "Move")
 node.set_paused(false)
 node.elapsed = 0.0
 node.advance(0.1)
 assert_eq(node.snapshot().views.current.clip, "Idle")

func test_current_comparison_retains_original_runtime_bytes_after_production_replacement() -> void:
 var register: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://specs/010-upgrade-game-artwork/validation/evidence/hero-fingerprints.json"))
 var resources: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://content/resources.json"))
 for id in ["cow","crow","lion","plates"]:
  var path: String = Review.baseline_path(id)
  assert_true(FileAccess.file_exists(path))
  assert_eq(FileAccess.get_sha256(path),register.files[resources.models[id]],id+": comparison baseline must retain preproduction bytes")
