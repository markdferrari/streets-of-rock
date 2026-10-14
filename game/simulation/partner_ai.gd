extends RefCounted
const State = preload("res://game/simulation/run_state.gd")
const Actor = preload("res://game/simulation/actor.gd")
const Arena = preload("res://game/simulation/arena.gd")
const Movement = preload("res://game/simulation/movement.gd")
const Events = preload("res://game/simulation/events.gd")
static func rank(enemy: Dictionary, player_id: int) -> int:
 return 0 if enemy.get("targetId") == player_id and enemy.action.kind != "idle" else (1 if enemy.role == "zoner" else 2)
static func eligible(run: Dictionary, context: Dictionary) -> Array:
 var partner := State.partner(run)
 return run.actors.filter(func(a: Dictionary) -> bool: return a.team == "enemy" and a.hp > 0 and (context.is_empty() or Arena.path(partner.position, a.position, context)))
static func choose(run: Dictionary, context: Dictionary) -> Variant:
 var partner := State.partner(run)
 if not partner.active or partner.hp <= 0: return null
 var player := State.player(run)
 var candidates := eligible(run, context)
 candidates.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
  var ra: int = rank(a, player.id)
  var rb: int = rank(b, player.id)
  if ra != rb: return ra < rb
  var da: float = Movement.distance(a.position, partner.position)
  var db: float = Movement.distance(b.position, partner.position)
  return a.id < b.id if da == db else da < db)
 return null if candidates.is_empty() else candidates[0].id
static func reset_block(partner: Dictionary) -> void:
 partner.intentState.blockedTicks = 0
 partner.intentState.blockedDestination = null
static func face(partner: Dictionary, target: Dictionary) -> void:
 var dx: float = target.x - partner.position.x
 if absf(dx) > 0.001: partner.facing = 1 if dx > 0 else -1
 partner.intentState.lastHorizontalFacing = partner.facing
static func move(partner: Dictionary, destination: Dictionary, speed: float, context: Dictionary) -> void:
 var before: Dictionary = partner.position.duplicate()
 var remaining: float = Movement.distance(before, destination)
 if remaining < 1e-9:
  reset_block(partner)
  return
 var amount: float = minf(remaining, speed / 60.0)
 var proposed: Dictionary = {"x": before.x + (destination.x - before.x) / remaining * amount, "depth": before.depth + (destination.depth - before.depth) / remaining * amount}
 var resolved := Arena.move(before, proposed, context)
 if Movement.distance(resolved, before) < 1e-6:
  var alternatives: Array = [Arena.move(before, {"x": proposed.x, "depth": before.depth}, context), Arena.move(before, {"x": before.x, "depth": proposed.depth}, context)]
  alternatives.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return Movement.distance(a, destination) < Movement.distance(b, destination))
  resolved = alternatives[0]
 var progress: float = remaining - Movement.distance(resolved, destination)
 partner.position = resolved
 partner.intentState.lastResolvedPosition = resolved.duplicate()
 if absf(resolved.x - before.x) > 0.001:
  partner.facing = 1 if resolved.x > before.x else -1
  partner.intentState.lastHorizontalFacing = partner.facing
 if progress >= 0.02 or Movement.distance(resolved, before) > 1e-5:
  partner.lastProgressTick += 1
  reset_block(partner)
 else:
  var blocked: Variant = partner.intentState.blockedDestination
  if blocked == null or Movement.distance(blocked, destination) > 0.05: reset_block(partner)
  partner.intentState.blockedDestination = destination.duplicate()
  partner.intentState.blockedTicks += 1
static func edge_candidates(context: Dictionary) -> Array:
 var candidates: Array = []
 for region in context.visibleRegions:
  var depth: float = region.minDepth
  while depth <= region.maxDepth + 1e-9:
   candidates.append({"x": region.minX, "depth": minf(depth, region.maxDepth)})
   candidates.append({"x": region.maxX, "depth": minf(depth, region.maxDepth)})
   depth += 0.5
  var x: float = region.minX
  while x <= region.maxX + 1e-9:
   candidates.append({"x": minf(x, region.maxX), "depth": region.minDepth})
   candidates.append({"x": minf(x, region.maxX), "depth": region.maxDepth})
   x += 0.5
 return candidates
static func recover(run: Dictionary, partner: Dictionary, destination: Dictionary, context: Dictionary, events: Array) -> void:
 if context.get("obstructions", []).is_empty() or partner.intentState.blockedTicks < 120 or run.tick - partner.intentState.lastRecoveryTick < 120: return
 var edges := edge_candidates(context)
 edges.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
  var da: float = Movement.distance(a, partner.position)
  var db: float = Movement.distance(b, partner.position)
  if da != db: return da < db
  return a.depth < b.depth if a.x == b.x else a.x < b.x)
 var candidates: Array = [destination]
 candidates.append_array(edges)
 reset_block(partner)
 for candidate in candidates:
  if Movement.distance(candidate, partner.position) <= 1e-5 or not Arena.path(partner.position, candidate, context) or not Arena.path(candidate, destination, context): continue
  partner.position = candidate.duplicate()
  partner.intentState.lastResolvedPosition = candidate.duplicate()
  partner.intentState.lastRecoveryTick = run.tick
  partner.intentState.intent = "recover"
  Events.emit(events, run, "partner-recovered", partner.id)
  return
static func update(run: Dictionary, events: Array, content: RefCounted, provided: Dictionary = {}) -> void:
 var partner := State.partner(run)
 var player := State.player(run)
 if run.result != null or player.hp <= 0 or partner.hp <= 0 or not partner.active:
  reset_block(partner)
  return
 var context: Dictionary = provided
 if context.is_empty():
  var area: Dictionary = content.level.areas[run.areaIndex]
  context = Arena.build(run, {"anchorX": (float(area.minX) + area.maxX) / 2.0, "anchorDepth": 0.0, "anchorHeight": 1.25, "halfHeight": 8.0, "aspect": 2.0}, {"minX": -0.5, "maxX": 0.5, "minY": 0.0, "maxY": 2.5, "minDepth": -0.5, "maxDepth": 0.5}, "partner", content)
 var profile: Dictionary = content.definitions[partner.characterId].partner
 if partner.action.kind == "active" and run.tick >= partner.action.endTick: partner.action = Actor.action("idle", run.tick, run.tick)
 var candidates := eligible(run, context)
 var best_id: Variant = choose(run, context)
 var current: Dictionary = {}
 var best: Dictionary = {}
 for candidate in candidates:
  if candidate.id == partner.intentState.targetId: current = candidate
  if candidate.id == best_id: best = candidate
 var target: Dictionary = current if not current.is_empty() and not best.is_empty() and rank(current, player.id) <= rank(best, player.id) else best
 if partner.action.kind == "active" and not target.is_empty() and partner.action.get("moveId") == "support":
  partner.intentState.intent = "engage"
  partner.intentState.targetId = target.id
  face(partner, target.position)
  reset_block(partner)
  return
 if not target.is_empty():
  partner.targetId = target.id
  partner.intentState.intent = "engage"
  partner.intentState.targetId = target.id
  partner.intentState.destination = target.position.duplicate()
  if Movement.distance(partner.position, target.position) > 1.1 or absf(partner.position.depth - target.position.depth) > 0.45:
   move(partner, target.position, profile.moveSpeed, context)
   recover(run, partner, target.position, context, events)
   return
  reset_block(partner)
  face(partner, target.position)
  if run.tick >= partner.decisionReadyTick:
   target.hp = maxf(0.0, target.hp - profile.supportDamage)
   partner.decisionReadyTick = run.tick + profile.supportCooldownTicks
   partner.action = Actor.action("active", run.tick, run.tick + 6, "support")
   Events.emit(events, run, "partner-hit", partner.id, target.id)
  return
 partner.erase("targetId")
 partner.intentState.targetId = null
 var separation: float = Movement.distance(partner.position, player.position)
 var following: bool = separation > (1.0 if partner.intentState.intent == "regroup" else 2.0)
 if not following:
  partner.intentState.intent = "idle"
  partner.intentState.destination = null
  reset_block(partner)
  return
 var behind: Dictionary = {"x": player.position.x - player.facing * 0.8, "depth": player.position.depth}
 var destination: Dictionary = {}
 if Arena.contains(context.visibleRegions, behind): destination = behind
 else:
  var options: Array = []
  for region in context.visibleRegions: options.append({"x": clampf(behind.x, region.minX, region.maxX), "depth": clampf(behind.depth, region.minDepth, region.maxDepth)})
  options.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return Movement.distance(a, behind) < Movement.distance(b, behind))
  if not options.is_empty(): destination = options[0]
 if destination.is_empty():
  partner.intentState.intent = "idle"
  reset_block(partner)
  return
 partner.intentState.intent = "regroup"
 partner.intentState.destination = destination
 var travelling: bool = run.encounter.status == "cleared" or partner.position.x < content.level.areas[run.areaIndex].minX
 move(partner, destination, profile.catchUpSpeed if travelling else profile.moveSpeed, context)
 recover(run, partner, destination, context, events)
