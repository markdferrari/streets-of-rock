extends RefCounted
const State = preload("res://game/simulation/run_state.gd")
const Events = preload("res://game/simulation/events.gd")
static func entry(start: Dictionary, end: Dictionary, target: Dictionary, radius: float) -> Variant:
 for v in [start.x, start.depth, end.x, end.depth, target.x, target.depth, radius]:
  if not is_finite(v): return null
 if radius < 0: return null
 var dx: float = end.x - start.x
 var dd: float = end.depth - start.depth
 var fx: float = start.x - target.x
 var fd: float = start.depth - target.depth
 var c: float = fx * fx + fd * fd - radius * radius
 if c <= 0: return 0.0
 var a: float = dx * dx + dd * dd
 if a <= 1e-18: return null
 var b: float = 2.0 * (fx * dx + fd * dd)
 var discriminant: float = b * b - 4.0 * a * c
 if discriminant < 0: return null
 var fraction: float = (-b - sqrt(discriminant)) / (2.0 * a)
 return fraction if fraction >= 0 and fraction <= 1 else null
static func swept(start: Dictionary, end: Dictionary, target: Dictionary, radius: float) -> bool:
 var dx: float = end.x - start.x
 var dd: float = end.depth - start.depth
 var length_squared: float = dx * dx + dd * dd
 var fraction: float = 0.0 if length_squared == 0 else clampf(((target.x - start.x) * dx + (target.depth - start.depth) * dd) / length_squared, 0, 1)
 return sqrt(pow(target.x - (start.x + dx * fraction), 2) + pow(target.depth - (start.depth + dd * fraction), 2)) <= radius
static func update(run: Dictionary, events: Array) -> void:
 var remaining: Array = []
 for projectile in run.projectiles:
  var owner := State.find_actor(run, int(projectile.ownerId))
  if owner.is_empty() or owner.hp <= 0: continue
  var targets: Array = State.ordered(run.actors).filter(func(a: Dictionary) -> bool: return a.team != owner.team and a.hp > 0)
  if projectile.get("kind") == "headrest":
   var distance: float = minf(projectile.speedPerSecond / 60.0, projectile.remainingDistance)
   var start: Dictionary = projectile.position.duplicate()
   var end: Dictionary = {"x": start.x + projectile.direction.x * distance, "depth": start.depth + projectile.direction.depth * distance}
   var contacts: Array = []
   for target in targets:
    var fraction: Variant = entry(start, end, target.position, projectile.radius + 0.45)
    if fraction != null: contacts.append({"target": target, "fraction": fraction})
   contacts.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a.target.id < b.target.id if a.fraction == b.fraction else a.fraction < b.fraction)
   if not contacts.is_empty():
    var target: Dictionary = contacts[0].target
    var fraction: float = contacts[0].fraction
    projectile.position = {"x": start.x + (end.x - start.x) * fraction, "depth": start.depth + (end.depth - start.depth) * fraction}
    if run.tick >= target.protectionUntilTick:
     target.hp = maxf(0.0, target.hp - projectile.damage)
     if target.role == "partner" and target.hp == 0: target.active = false
     Events.emit(events, run, "headrest-hit", owner.id, target.id)
    else: Events.emit(events, run, "headrest-blocked", owner.id, target.id)
    continue
   projectile.position = end
   projectile.remainingDistance = maxf(0.0, projectile.remainingDistance - distance)
   if projectile.remainingDistance > 1e-9: remaining.append(projectile)
   else: Events.emit(events, run, "headrest-miss", owner.id)
   continue
  projectile.previousPosition = projectile.position.duplicate()
  projectile.position.x += projectile.velocity.x
  projectile.position.depth += projectile.velocity.depth
  projectile.remainingTicks -= 1
  var consumed: bool = false
  for target in targets:
   if not swept(projectile.previousPosition, projectile.position, target.position, 0.45): continue
   consumed = true
   if run.tick >= target.protectionUntilTick:
    target.hp = maxf(0.0, target.hp - 24)
    if target.role == "player": target.protectionUntilTick = run.tick + 36
    if target.role == "partner" and target.hp == 0: target.active = false
    Events.emit(events, run, "hit", owner.id, target.id)
   break
  if not consumed and projectile.remainingTicks > 0 and projectile.position.x >= -2 and projectile.position.x <= 72 and absf(projectile.position.depth) <= 4: remaining.append(projectile)
 run.projectiles = remaining
