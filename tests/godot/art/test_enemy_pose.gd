extends GutTest
const Pose = preload("res://game/presentation/enemy_pose.gd")
func actor(role: String = "grunt") -> Dictionary:
 return {"id": 3, "role": role, "combatClass": "boss" if role == "liam" else "normal", "hp": 120, "facing": -1, "phase": 1, "position": {"x": 2.0, "depth": 0.5}, "action": {"kind": "idle", "startedTick": 0, "endTick": 0}}
func definition() -> Dictionary:
 var bindings: Dictionary = {}
 for semantic in ["Idle", "Move", "Hurt", "Stunned", "Defeated", "grunt.windup", "grunt.active", "grunt.recovery", "throw.windup", "throw.active", "throw.recovery", "charge.windup", "charge.active", "charge.recovery", "close.windup", "rope.active", "shockwave.recovery"]:
  bindings[semantic] = {"clipName": "KayKit_" + semantic.replace(".", "_"), "startSeconds": 0.2, "endSeconds": 0.8, "loop": semantic in ["Idle", "Move", "Stunned"]}
 return {"clipBindings": bindings}
func test_action_boundaries_use_new_simulation_phase_and_bound_clip_segments() -> void:
 var a := actor()
 a.action = {"kind": "windup", "moveId": "grunt", "startedTick": 10, "endTick": 37}
 var pose := Pose.resolve_enemy_pose(a, a, 36, definition())
 assert_eq(pose.semantic, "grunt.windup")
 assert_almost_eq(pose.sample, 26.0 / 27.0, 0.000001)
 assert_eq(pose.clipName, "KayKit_grunt_windup")
 assert_almost_eq(pose.timeSeconds, 0.2 + 0.6 * 26.0 / 27.0, 0.000001)
 a.action = {"kind": "active", "moveId": "grunt", "startedTick": 37, "endTick": 43}
 pose = Pose.resolve_enemy_pose(a, a, 37, definition())
 assert_eq(pose.semantic, "grunt.active")
 assert_eq(pose.sample, 0.0)
 a.action = {"kind": "recovery", "moveId": "grunt", "startedTick": 43, "endTick": 88}
 assert_eq(Pose.resolve_enemy_pose(a, a, 43, definition()).semantic, "grunt.recovery")
func test_actual_displacement_chooses_move_without_camera_or_wall_clock() -> void:
 var previous := actor()
 var a := previous.duplicate(true)
 a.position.x += 0.04
 assert_eq(Pose.resolve_enemy_pose(a, previous, 14, definition()).semantic, "Move")
 a = previous.duplicate(true)
 a.cameraX = 99.0
 var idle := Pose.resolve_enemy_pose(a, previous, 14, definition())
 assert_eq(idle.semantic, "Idle")
 assert_eq(idle.sample, 0.5)
 assert_eq(idle.facing, -1)
func test_defeat_beats_stun_and_action_without_mutating_snapshots() -> void:
 var a := actor()
 a.hp = 0
 a.stunnedUntilTick = 100
 a.action = {"kind": "active", "moveId": "grunt", "startedTick": 5, "endTick": 20}
 var before := a.duplicate(true)
 var pose := Pose.resolve_enemy_pose(a, a, 12, definition())
 assert_eq(pose.semantic, "Defeated")
 assert_eq(pose.sample, 1.0)
 assert_almost_eq(pose.timeSeconds, 0.8, 0.000001)
 assert_eq(a, before)
func test_normal_stun_precedes_attack_refresh_does_not_restart_and_expires_at_boundary() -> void:
 var a := actor()
 a.stunnedUntilTick = 60
 a.action = {"kind": "windup", "moveId": "grunt", "startedTick": 10, "endTick": 70}
 var first := Pose.resolve_enemy_pose(a, a, 14, definition())
 assert_eq(first.semantic, "Stunned")
 a.stunnedUntilTick = 80
 assert_eq(Pose.resolve_enemy_pose(a, a, 14, definition()).sample, first.sample)
 assert_eq(Pose.resolve_enemy_pose(a, a, 79, definition()).semantic, "Stunned")
 assert_eq(Pose.resolve_enemy_pose(a, a, 80, definition()).semantic, "grunt.windup")
func test_liam_ignores_stun_and_phase_two_does_not_interrupt_attack() -> void:
 var a := actor("liam")
 a.stunnedUntilTick = 999
 a.phase = 2
 a.action = {"kind": "active", "moveId": "rope", "startedTick": 42, "endTick": 51}
 var pose := Pose.resolve_enemy_pose(a, a, 45, definition())
 assert_eq(pose.semantic, "rope.active")
 assert_true(pose.phase2)
 assert_almost_eq(pose.sample, 1.0 / 3.0, 0.000001)
func test_hurt_only_when_reported_and_all_existing_move_ids_are_preserved() -> void:
 var a := actor()
 a.action = {"kind": "hurt", "startedTick": 20, "endTick": 30}
 assert_eq(Pose.resolve_enemy_pose(a, a, 25, definition()).semantic, "Hurt")
 for pair in [["zoner", "throw", "windup"], ["enforcer", "charge", "active"], ["liam", "close", "windup"], ["liam", "shockwave", "recovery"]]:
  a = actor(pair[0])
  a.action = {"kind": pair[2], "moveId": pair[1], "startedTick": 20, "endTick": 30}
  assert_eq(Pose.resolve_enemy_pose(a, a, 25, definition()).semantic, pair[1] + "." + pair[2])
func test_held_stun_pose_samples_authored_frame_and_pause_is_repeatable() -> void:
 var a := actor()
 a.stunnedUntilTick = 99
 var d := definition()
 d.clipBindings.Stunned.fixedSampleSeconds = 0.35
 var pose := Pose.resolve_enemy_pose(a, a, 14, d)
 assert_eq(pose.timeSeconds, 0.35)
 assert_eq(Pose.resolve_enemy_pose(a, a, 14, d), pose)
func test_zero_length_phase_clamps_sample_and_missing_binding_is_explicit() -> void:
 var a := actor()
 a.action = {"kind": "active", "moveId": "grunt", "startedTick": 20, "endTick": 20}
 assert_eq(Pose.resolve_enemy_pose(a, a, 20, definition()).sample, 0.0)
 assert_eq(Pose.resolve_enemy_pose(a, a, 25, definition()).sample, 1.0)
 var d := definition()
 d.clipBindings.erase("grunt.active")
 assert_true(Pose.resolve_enemy_pose(a, a, 20, d).has("error"), "missing bindings cannot silently become idle")
func test_running_pose_faces_actual_movement_even_when_attack_facing_is_stale() -> void:
 var previous := actor()
 var current := previous.duplicate(true)
 current.position.x += .04
 var pose := Pose.resolve_enemy_pose(current, previous, 14, definition())
 assert_eq(pose.semantic, "Move")
 assert_eq(pose.facing, 1)
 assert_eq(current.facing, -1, "presentation cannot mutate combat facing")
 previous = current.duplicate(true)
 current.position.x -= .08
 assert_eq(Pose.resolve_enemy_pose(current, previous, 15, definition()).facing, -1)
 current.action = {"kind":"active","moveId":"grunt","startedTick":14,"endTick":20}
 current.facing = 1
 assert_eq(Pose.resolve_enemy_pose(current, previous, 15, definition()).facing, 1, "attacks retain simulation-owned direction")
