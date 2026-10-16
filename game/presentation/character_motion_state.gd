extends RefCounted
## Private presentation state; never stored in or written to simulation dictionaries.
var last_tick: int = -1
var last_position: Vector2
var last_hp: float = 0
var distance: float = 0
var moving: bool = false
var direction: Vector2 = Vector2.ZERO
var support_tick: int = -1000
var reaction_tick: int = -1000
var knocked_out: bool = false
var knockout_elapsed: float = 0
var actor_snapshot: Dictionary = {}
var action_identity: String = ""
var phase_anchor: int = 0
var idle_elapsed: float = 0
func observe(actor: Dictionary, tick: int, events: Array) -> void:
 if tick <= last_tick: return
 var position_now := Vector2(actor.position.x, actor.position.depth)
 var seeded: bool = last_tick >= 0
 var elapsed: float = float(tick - last_tick) / 60.0 if seeded else 0.0
 var hit: bool = seeded and actor.hp < last_hp
 var recovered := false
 for event in events:
  if event.get("type") == "partner-hit" and event.get("actorId") == actor.id: support_tick = tick
  if event.get("type") == "hit" and event.get("targetId") == actor.id: hit = true
  if event.get("type") == "partner-recovered" and event.get("actorId") == actor.id: recovered = true
 var kind: String = actor.action.kind
 var old_action: Dictionary = actor_snapshot.get("action", {})
 if kind in ["windup", "active", "recovery", "dodge"]:
  var move: String = actor.action.get("moveId", kind)
  var same_action: bool = old_action.get("moveId", old_action.get("kind")) == move
  var phases := ["windup", "active", "recovery"]
  var continuation: bool = same_action and (old_action.get("startedTick") == actor.action.startedTick or (kind in phases and old_action.get("kind") in phases and phases.find(kind) > phases.find(old_action.kind)))
  if not continuation: phase_anchor = actor.action.startedTick
  action_identity = str(actor.id) + ":" + move + ":" + str(phase_anchor)
 else: action_identity = ""
 if actor.hp <= 0:
  if knocked_out: knockout_elapsed = minf(1.0, knockout_elapsed + elapsed)
  else: knocked_out = true
 if hit and not knocked_out: reaction_tick = tick
 direction = (position_now - last_position) if seeded else Vector2.ZERO
 moving = seeded and not knocked_out and not hit and not recovered and kind == "idle" and direction.length() > 0.000001
 if moving: distance += direction.length()
 else: direction = Vector2.ZERO
 if recovered: distance = 0.0
 idle_elapsed += elapsed
 last_tick = tick
 last_position = position_now
 last_hp = actor.hp
 actor_snapshot = actor.duplicate(true)

func settle(delta: float, duration: float) -> void:
 if knocked_out: knockout_elapsed = minf(duration, knockout_elapsed + maxf(0, delta))
