extends RefCounted
const State = preload("res://game/simulation/run_state.gd")
const Statuses = preload("res://game/simulation/statuses.gd")
const Actions = preload("res://game/simulation/actions.gd")
const Enemies = preload("res://game/simulation/enemy_ai.gd")
const Partner = preload("res://game/simulation/partner_ai.gd")
const Movement = preload("res://game/simulation/movement.gd")
const Projectiles = preload("res://game/simulation/projectiles.gd")
const Combat = preload("res://game/simulation/combat.gd")
const Objects = preload("res://game/simulation/objects.gd")
const Encounters = preload("res://game/simulation/encounters.gd")
const STAGES: Array[String] = ["statuses", "input", "ai", "movement", "contacts", "terminal", "progression"]
static func terminal(run: Dictionary) -> void:
 if State.player(run).hp <= 0: run.result = "defeat"
 else:
  for actor in run.actors:
   if actor.role == "liam" and actor.hp <= 0:
    run.result = "victory"
    break
static func step_run(run: Dictionary, input: Dictionary, content: RefCounted, arena: Dictionary = {}, observer: Callable = Callable()) -> Array:
 if run.result != null: return []
 var events: Array = []
 for stage in STAGES:
  if observer.is_valid(): observer.call(stage)
  match stage:
   "statuses": Statuses.update(run, events)
   "input": Actions.update(run, input, events, content, arena)
   "ai":
    for role in ["grunt", "zoner", "enforcer", "liam"]: Enemies.role(run, events, role)
    Partner.update(run, events, content, arena)
   "movement":
    Movement.move_player(run, input, content)
    Movement.overlaps(run, content)
    Projectiles.update(run, events)
   "contacts":
    var active: Array = run.attacks.filter(func(a: Dictionary) -> bool: return run.tick < a.activeUntilTick)
    Combat.apply(run, active, events, content)
    run.attacks = active
   "terminal": terminal(run)
   "progression":
    Objects.update(run, events)
    Encounters.update(run, events, content)
  if run.result != null: break
 terminal(run)
 run.tick += 1
 return events
