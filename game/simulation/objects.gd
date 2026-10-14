extends RefCounted
const State = preload("res://game/simulation/run_state.gd")
const Events = preload("res://game/simulation/events.gd")
const Movement = preload("res://game/simulation/movement.gd")
static func update(run: Dictionary, events: Array) -> void:
 var player := State.player(run)
 if player.hp <= 0: return
 for table in run.tables:
  if table.broken: continue
  for attack in run.attacks:
   if attack.ownerId != player.id or run.tick >= attack.activeUntilTick or table.id in attack.hitTargetIds: continue
   var dx: float = table.position.x - attack.origin.x
   var dd: float = table.position.depth - attack.origin.depth
   var hit: bool = sqrt(dx * dx + dd * dd) <= attack.range if attack.moveId == "special" else dx * attack.facing >= 0 and dx * attack.facing <= attack.range and absf(dd) <= attack.depthTolerance
   if not hit: continue
   attack.hitTargetIds.append(table.id)
   table.hp = maxf(0.0, table.hp - attack.damage)
   if table.hp == 0:
    table.broken = true
    table.pickupId = State.entity_id(run)
    run.pickups.append({"id": table.pickupId, "sourceTableId": table.id, "position": table.position.duplicate(), "available": true})
    Events.emit(events, run, "table-broken", player.id, table.id)
 for pickup in run.pickups:
  if not pickup.available or Movement.distance(player.position, pickup.position) > 0.5: continue
  pickup.available = false
  player.hp = minf(player.maxHp, player.hp + player.maxHp * 0.25)
  Events.emit(events, run, "pickup", player.id, pickup.id)
