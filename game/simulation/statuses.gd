extends RefCounted
const State = preload("res://game/simulation/run_state.gd")
const Actor = preload("res://game/simulation/actor.gd")
const Events = preload("res://game/simulation/events.gd")
static func stunned(enemy: Dictionary, tick: int) -> bool:
 return enemy.hp > 0 and enemy.get("combatClass") == "normal" and enemy.has("stunnedUntilTick") and tick < enemy.stunnedUntilTick
static func apply(run: Dictionary, id: int, duration: int) -> bool:
 var enemy := State.find_actor(run, id)
 if enemy.is_empty() or enemy.team != "enemy" or enemy.hp <= 0 or enemy.combatClass != "normal" or duration <= 0: return false
 enemy.stunnedUntilTick = run.tick + duration
 enemy.action = Actor.action("idle", run.tick, run.tick)
 enemy.attackSlot = false
 enemy.decisionReadyTick = enemy.stunnedUntilTick
 run.attacks = run.attacks.filter(func(a: Dictionary) -> bool: return a.ownerId != id)
 return true
static func update(run: Dictionary, events: Array) -> void:
 for enemy in run.actors:
  if enemy.team != "enemy": continue
  if enemy.hp <= 0:
   enemy.erase("stunnedUntilTick")
   enemy.attackSlot = false
   continue
  if enemy.combatClass != "normal" or not enemy.has("stunnedUntilTick"): continue
  enemy.action = Actor.action("idle", run.tick, run.tick)
  enemy.attackSlot = false
  if run.tick >= enemy.stunnedUntilTick:
   enemy.erase("stunnedUntilTick")
   enemy.decisionReadyTick = run.tick
   Events.emit(events, run, "stun-ended", enemy.id)
