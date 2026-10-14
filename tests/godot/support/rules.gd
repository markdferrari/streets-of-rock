extends GutTest
const State = preload("res://game/simulation/run_state.gd")
const Step = preload("res://game/simulation/step.gd")
const Actor = preload("res://game/simulation/actor.gd")
const Catalogue = preload("res://game/content/catalogue.gd")
var content: RefCounted
func before_each() -> void:
 content = Catalogue.new()
 assert_true(content.load_catalogue())
func fresh(fighter: String = "cow") -> Dictionary:
 var run := State.create_run(1, {"fighterId": fighter, "partnerId": "crow" if fighter != "crow" else "cow"}, content)
 run.encounter.status = "active"
 run.actors[1].hp = 0
 run.actors[1].active = false
 return run
func input(kind: String = "", move: Dictionary = {"x": 0.0, "depth": 0.0}) -> Dictionary:
 return {"move": move, "requests": [] if kind.is_empty() else [{"kind": kind, "sourcePointerId": 9, "order": 1}]}
