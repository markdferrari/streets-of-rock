extends RefCounted
const State = preload("res://game/simulation/run_state.gd")
const Actions = preload("res://game/simulation/actions.gd")
const Events = preload("res://game/simulation/events.gd")
static func hits(attack: Dictionary, target: Dictionary) -> bool:
 if target.hp <= 0 or target.id in attack.hitTargetIds: return false
 var dx: float = target.position.x - attack.origin.x
 var dd: float = target.position.depth - attack.origin.depth
 if attack.moveId in ["special", "shockwave"]: return sqrt(dx * dx + dd * dd) <= attack.range
 return dx * attack.facing >= 0 and dx * attack.facing <= attack.range and absf(dd) <= attack.depthTolerance
static func apply(run: Dictionary, attacks: Array, events: Array, content: RefCounted) -> void:
 var intents: Array = []
 var protected: Array = []
 for attack in State.ordered(attacks):
  var owner := State.find_actor(run, int(attack.ownerId))
  if owner.is_empty() or owner.hp <= 0: continue
  for target in State.ordered(run.actors):
   if target.team == owner.team or run.tick < target.protectionUntilTick or (target.role == "player" and target.id in protected) or not hits(attack, target): continue
   intents.append({"attack": attack, "owner": owner, "target": target})
   attack.hitTargetIds.append(target.id)
   if target.role == "player": protected.append(target.id)
 for intent in intents:
  var attack: Dictionary = intent.attack
  var owner: Dictionary = intent.owner
  var target: Dictionary = intent.target
  target.hp = maxf(0, target.hp - attack.damage)
  var move := Actions.tuning(run, attack.moveId, content)
  if not move.is_empty() and move.knockback > 0:
   var dx: float = target.position.x - attack.origin.x
   var dd: float = target.position.depth - attack.origin.depth
   var distance: float = sqrt(dx * dx + dd * dd)
   target.position.x += (dx / distance if distance > 0 else attack.facing) * move.knockback
   target.position.depth += (dd / distance if distance > 0 else 0.0) * move.knockback
   var area: Dictionary = content.level.areas[run.areaIndex]
   target.position.x = clampf(target.position.x, area.minX, area.maxX)
   target.position.depth = clampf(target.position.depth, area.minDepth, area.maxDepth)
  if owner.role == "player" and attack.moveId in ["heavy", "light1", "light2", "light3"] and target.team == "enemy": owner.specialMeter = minf(100.0, owner.specialMeter + content.tuning.meterPerHit)
  if target.role == "player": target.protectionUntilTick = run.tick + 36
  if target.role == "partner" and target.hp == 0: target.active = false
  Events.emit(events, run, "hit", owner.id, target.id)
 run.pendingSpecialDamage.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a.targetId < b.targetId if a.activationId == b.activationId else a.activationId < b.activationId)
 for pending in run.pendingSpecialDamage:
  var target := State.find_actor(run, int(pending.targetId))
  if target.is_empty() or target.hp <= 0 or target.team != "enemy": continue
  target.hp = maxf(0.0, target.hp - pending.damage)
  Events.emit(events, run, "special-damage", pending.ownerId, target.id)
 run.pendingSpecialDamage = []
