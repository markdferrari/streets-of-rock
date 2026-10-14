extends "res://tests/godot/support/rules.gd"
const AI = preload("res://game/simulation/enemy_ai.gd")
const Projectiles = preload("res://game/simulation/projectiles.gd")
func test_grunt_pursues_both_axes_and_faces_its_travel_direction() -> void:
 var run := fresh()
 run.actors[0].position = {"x":5.0,"depth":2.0}
 var grunt := Actor.enemy(3, "grunt", {"x":0.0,"depth":-2.0}, 0, content.tuning.enemyDefinitions.grunt)
 grunt.facing = -1
 run.actors.append(grunt)
 AI.role(run, [], "grunt")
 assert_gt(grunt.position.x, 0.0)
 assert_gt(grunt.position.depth, -2.0)
 assert_eq(grunt.facing, 1)
 var distance := Vector2(grunt.position.x, grunt.position.depth+2).length()
 assert_almost_eq(distance, .04, .000001, "diagonal approach retains total movement speed")
 run.actors[0].position = {"x":-5.0,"depth":-3.0}
 var before: Dictionary = grunt.position.duplicate()
 AI.role(run, [], "grunt")
 assert_lt(grunt.position.x, before.x)
 assert_lt(grunt.position.depth, before.depth)
 assert_eq(grunt.facing, -1)
func test_grunt_can_close_depth_gap_without_wandering_sideways() -> void:
 var run := fresh()
 run.actors[0].position = {"x":3.0,"depth":2.0}
 var grunt := Actor.enemy(3, "grunt", {"x":3.0,"depth":-2.0}, 0, content.tuning.enemyDefinitions.grunt)
 run.actors.append(grunt)
 for i in 100:
  run.tick = i
  AI.role(run, [], "grunt")
 assert_almost_eq(grunt.position.x, 3.0, .000001)
 assert_gt(grunt.position.depth, 1.5)
 assert_eq(grunt.action.kind, "windup", "aligned Grunt reaches melee range and attacks")
func test_bottle_aim_is_locked_at_warning_and_trajectory_does_not_track_dodges() -> void:
 var run := fresh()
 run.actors[0].position = {"x":5.0,"depth":0.0}
 var zoner := Actor.enemy(3, "zoner", {"x":0.0,"depth":0.0}, 0, content.tuning.enemyDefinitions.zoner)
 run.actors.append(zoner)
 run.tick = 1
 AI.role(run, [], "zoner")
 assert_eq(zoner.action.kind, "windup")
 run.actors[0].position.depth = 2.0
 run.tick = 40
 AI.role(run, [], "zoner")
 assert_eq(run.projectiles.size(), 1)
 assert_almost_eq(run.projectiles[0].velocity.depth, 0.0, .000001, "moving during windup dodges the warned aim line")
 var velocity: Dictionary = run.projectiles[0].velocity.duplicate()
 run.actors[0].position.depth = -2.0
 Projectiles.update(run, [])
 assert_eq(run.projectiles[0].velocity, velocity)
 assert_almost_eq(run.projectiles[0].position.depth, 0.0, .000001)
