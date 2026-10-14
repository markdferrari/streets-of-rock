extends RefCounted
const State = preload("res://game/simulation/run_state.gd")
const Events = preload("res://game/simulation/events.gd")
const Statuses = preload("res://game/simulation/statuses.gd")
const Arena = preload("res://game/simulation/arena.gd")
static func prepare(run: Dictionary, player: Dictionary, arena: Dictionary, events: Array, content: RefCounted) -> bool:
 var special: Dictionary = content.definitions[player.characterId].player.special
 if special.kind == "areaStrike": return true
 var prepared: Dictionary = {"activationId": run.nextSpecialActivationId, "kind": "roar" if special.kind == "roar" else "headrest", "released": false}
 if special.kind == "straightProjectile":
  var regions: Array = arena.get("playerVisibleRegions", arena.get("visibleRegions", []))
  var targets: Array = run.actors.filter(func(a: Dictionary) -> bool: return a.team == "enemy" and a.hp > 0 and Arena.contains(regions, a.position))
  targets.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
   var da: float = pow(a.position.x - player.position.x, 2) + pow(a.position.depth - player.position.depth, 2)
   var db: float = pow(b.position.x - player.position.x, 2) + pow(b.position.depth - player.position.depth, 2)
   return a.id < b.id if da == db else da < db)
  if targets.is_empty(): return false
  prepared.aimPosition = targets[0].position.duplicate()
  prepared.targetIdForDiagnostics = targets[0].id
 run.nextSpecialActivationId += 1
 player.preparedSpecial = prepared
 Events.emit(events, run, "special-prepared", player.id)
 return true
static func release(run: Dictionary, player: Dictionary, events: Array, content: RefCounted) -> void:
 var prepared: Dictionary = player.get("preparedSpecial", {})
 if prepared.is_empty() or prepared.released: return
 prepared.released = true
 var special: Dictionary = content.definitions[player.characterId].player.special
 if prepared.kind == "roar":
  Events.emit(events, run, "roar-wave", player.id)
  for target in run.actors:
   if target.team != "enemy" or target.hp <= 0: continue
   if sqrt(pow(target.position.x - player.position.x, 2) + pow(target.position.depth - player.position.depth, 2)) > special.radius: continue
   if target.combatClass == "normal":
    if Statuses.apply(run, target.id, int(special.stunTicks)): Events.emit(events, run, "roar-stun", player.id, target.id)
   else:
    run.pendingSpecialDamage.append({"activationId": prepared.activationId, "ownerId": player.id, "targetId": target.id, "damage": special.bossDamage})
    Events.emit(events, run, "roar-boss-impact", player.id, target.id)
 else:
  var dx: float = prepared.aimPosition.x - player.position.x
  var dd: float = prepared.aimPosition.depth - player.position.depth
  var magnitude: float = sqrt(dx * dx + dd * dd)
  var direction: Dictionary = {"x": dx / magnitude, "depth": dd / magnitude} if magnitude > 1e-9 else {"x": player.facing, "depth": 0.0}
  run.projectiles.append({"kind": "headrest", "id": State.entity_id(run), "ownerId": player.id, "activationId": prepared.activationId, "position": player.position.duplicate(), "previousPosition": player.position.duplicate(), "direction": direction, "speedPerSecond": special.speed, "remainingDistance": special.maxDistance, "damage": special.damage, "radius": special.collisionRadius})
  Events.emit(events, run, "headrest-release", player.id, prepared.targetIdForDiagnostics)
 Events.emit(events, run, "special-release", player.id)
