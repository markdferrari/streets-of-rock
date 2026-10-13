extends RefCounted
const State = preload("res://game/simulation/run_state.gd")
const Actor = preload("res://game/simulation/actor.gd")
const Events = preload("res://game/simulation/events.gd")
const Statuses = preload("res://game/simulation/statuses.gd")
static func slots(run: Dictionary) -> void:
 var enemies: Array = State.ordered(run.actors).filter(func(a: Dictionary) -> bool: return a.team == "enemy")
 var occupied: int = 0
 for enemy in enemies:
  if enemy.hp <= 0 or Statuses.stunned(enemy, run.tick): enemy.attackSlot = false
  if enemy.hp > 0 and not Statuses.stunned(enemy, run.tick) and enemy.attackSlot: occupied += 1
 for enemy in enemies:
  if enemy.hp > 0 and not Statuses.stunned(enemy, run.tick) and not enemy.attackSlot and occupied < 2:
   enemy.attackSlot = true
   occupied += 1
static func strike(run: Dictionary, enemy: Dictionary, move: String, range_x: float, depth: float, damage: float) -> void:
 run.attacks.append({"id": State.attack_id(run), "ownerId": enemy.id, "moveId": move, "origin": enemy.position.duplicate(), "facing": enemy.facing, "activeUntilTick": enemy.action.endTick, "range": range_x, "depthTolerance": depth, "damage": damage, "hitTargetIds": []})
static func role(run: Dictionary, events: Array, name: String) -> void:
 slots(run)
 var player := State.player(run)
 if player.hp <= 0: return
 for enemy in State.ordered(run.actors):
  if enemy.role != name or enemy.team != "enemy": continue
  if enemy.hp <= 0 or Statuses.stunned(enemy, run.tick):
   if name != "grunt": enemy.attackSlot = false
   continue
  var dx: float = player.position.x - enemy.position.x
  var dd: float = player.position.depth - enemy.position.depth
  var kind: String = enemy.action.kind
  if name == "liam" and enemy.phase == 1 and enemy.hp < enemy.maxHp / 2.0:
   enemy.phase = 2
   enemy.shockwaveReadyTick = run.tick
   Events.emit(events, run, "boss-phase", enemy.id)
  if name == "grunt" and not enemy.attackSlot:
   enemy.position.depth = clampf(enemy.position.depth + (0.02 if int(enemy.id) % 2 else -0.02), -3, 3)
   continue
  if kind == "idle":
   var move: String = {"grunt": "grunt", "zoner": "throw", "enforcer": "charge", "liam": "close"}[name]
   var windup: int = {"grunt": 27, "zoner": 39, "enforcer": 51, "liam": 27}[name]
   if name == "grunt":
    if run.tick < enemy.decisionReadyTick: continue
    if absf(dx) > 1.5 or absf(dd) > 0.45:
     enemy.position.x += signf(dx) * 0.04
     continue
   elif name == "zoner":
    if absf(dx) < 3 and enemy.position.x < 16: enemy.position.x += signf(-dx if dx != 0 else 1.0) * 2.0 / 60.0
    if not enemy.attackSlot or run.tick < enemy.decisionReadyTick: continue
   elif name == "enforcer":
    if absf(dx) > 4:
     enemy.position.x += signf(dx) * 1.5 / 60.0
     continue
    if not enemy.attackSlot or run.tick < enemy.decisionReadyTick: continue
   else:
    if not enemy.attackSlot: continue
    var due: bool = enemy.phase == 2 and run.tick >= enemy.get("shockwaveReadyTick", 0)
    if not due and absf(dx) > 3:
     enemy.position.x += signf(dx) * 1.8 / 60.0
     continue
    move = "shockwave" if due else ("close" if absf(dx) <= 1.1 else "rope")
    windup = {"shockwave": 60, "rope": 42, "close": 27}[move]
   enemy.facing = 1 if dx >= 0 else -1
   enemy.action = Actor.action("windup", run.tick, run.tick + windup, move)
   Events.emit(events, run, "enemy-warning", enemy.id)
  elif kind == "windup" and run.tick >= enemy.action.endTick:
   var move: String = enemy.action.moveId
   var duration: int = 30 if name == "enforcer" else (9 if move == "rope" else 6)
   enemy.action = Actor.action("active", run.tick, run.tick + duration, move)
   if name == "zoner":
    var distance: float = sqrt(dx * dx + dd * dd)
    if distance == 0: distance = 1
    run.projectiles.append({"id": State.entity_id(run), "ownerId": enemy.id, "attackId": State.attack_id(run), "position": enemy.position.duplicate(), "previousPosition": enemy.position.duplicate(), "velocity": {"x": dx / distance * 5.0 / 60.0, "depth": dd / distance * 5.0 / 60.0}, "remainingTicks": 180})
    Events.emit(events, run, "projectile", enemy.id)
   elif name == "grunt": strike(run, enemy, move, 1.5, 0.45, 18)
   elif name == "enforcer": strike(run, enemy, move, 1, 0.6, 40)
   else:
    strike(run, enemy, move, 20 if move == "shockwave" else (3.0 if move == "rope" else 1.1), 6 if move == "shockwave" else 0.45, 45 if move == "shockwave" else (30 if move == "rope" else 24))
    if move == "shockwave": enemy.shockwaveReadyTick = run.tick + 360
  elif kind == "active" and run.tick >= enemy.action.endTick:
   var duration: int = {"grunt": 45, "zoner": 66, "enforcer": 60, "liam": 45}[name]
   if name == "liam": duration = {"shockwave": 72, "rope": 54, "close": 45}[enemy.action.moveId]
   enemy.action = Actor.action("recovery", run.tick, run.tick + duration, enemy.action.moveId)
  elif kind == "active" and name == "enforcer":
   enemy.position.x = clampf(enemy.position.x + enemy.facing * 7.0 / 60.0, 0, 70)
   for attack in run.attacks:
    if attack.ownerId == enemy.id and attack.moveId == "charge":
     attack.origin = enemy.position.duplicate()
     break
  elif kind == "recovery" and run.tick >= enemy.action.endTick:
   enemy.action = Actor.action("idle", run.tick, run.tick)
   if name != "liam": enemy.decisionReadyTick = run.tick + 6
   enemy.attackSlot = false
