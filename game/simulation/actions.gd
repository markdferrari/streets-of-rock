extends RefCounted
const State = preload("res://game/simulation/run_state.gd")
const Actor = preload("res://game/simulation/actor.gd")
const Events = preload("res://game/simulation/events.gd")
const Specials = preload("res://game/simulation/specials.gd")
const PRIORITY: Dictionary = {"light": 0, "heavy": 1, "dodge": 2, "special": 3}
static func tuning(run: Dictionary, move: String, content: RefCounted) -> Dictionary:
 if not move in ["light1", "light2", "light3", "heavy", "special"]: return {}
 var definition: Dictionary = content.definitions[State.player(run).characterId].player
 var data: Dictionary
 if move == "special":
  data = definition.special
  return {"windup": data.windupTicks, "active": data.activeTicks, "recovery": data.recoveryTicks, "damage": data.get("damage", 0), "range": data.get("range", data.get("radius", data.get("maxDistance", 0))), "depthTolerance": data.get("depthTolerance", data.get("radius", data.get("collisionRadius", 0))), "knockback": data.get("knockback", 0)}
 data = definition.heavy if move == "heavy" else definition.light[int(move.right(1)) - 1]
 return {"windup": data.windupTicks, "active": data.activeTicks, "recovery": data.recoveryTicks, "damage": data.damage, "range": data.range, "depthTolerance": data.depthTolerance, "knockback": data.knockback}
static func eligible(run: Dictionary, player: Dictionary, kind: String) -> bool:
 if player.hp <= 0: return false
 if kind == "dodge": return run.tick >= player.dodgeReadyTick
 if kind == "special": return player.specialMeter >= 100
 return kind in PRIORITY
static func advance(run: Dictionary, player: Dictionary, events: Array, content: RefCounted) -> void:
 var action: Dictionary = player.action
 if run.tick < action.endTick or action.kind == "idle": return
 var move: String = action.get("moveId", "")
 var data := tuning(run, move, content)
 if action.kind == "windup" and not data.is_empty():
  player.action = Actor.action("active", run.tick, run.tick + data.active, move)
  if move == "special" and player.has("preparedSpecial"): Specials.release(run, player, events, content)
  else: run.attacks.append({"id": State.attack_id(run), "ownerId": player.id, "moveId": move, "origin": player.position.duplicate(), "facing": player.facing, "activeUntilTick": player.action.endTick, "range": data.range, "depthTolerance": data.depthTolerance, "damage": data.damage, "hitTargetIds": []})
  Events.emit(events, run, "attack-active", player.id)
 elif action.kind == "active" and not data.is_empty(): player.action = Actor.action("recovery", run.tick, run.tick + data.recovery, move)
 else:
  if action.kind == "recovery" and move in ["light1", "light2", "light3"]: player.comboDeadlineTick = run.tick + 18
  player.action = Actor.action("idle", run.tick, run.tick)
static func start(run: Dictionary, player: Dictionary, kind: String, input: Dictionary, events: Array, content: RefCounted, arena: Dictionary) -> bool:
 if player.action.kind != "idle" or not eligible(run, player, kind): return false
 if kind == "dodge":
  player.action = Actor.action("dodge", run.tick, run.tick + 18)
  player.dodgeReadyTick = run.tick + 54
  var magnitude: float = sqrt(input.move.x * input.move.x + input.move.depth * input.move.depth)
  player.dodgeDirection = {"x": input.move.x / magnitude, "depth": input.move.depth / magnitude} if is_finite(magnitude) and magnitude > 0 else {"x": player.facing, "depth": 0.0}
  player.protectionUntilTick = maxi(player.protectionUntilTick, run.tick + 12)
  Events.emit(events, run, "dodge", player.id)
  return true
 var move: String
 if kind == "special":
  if not Specials.prepare(run, player, arena, events, content): return false
  player.specialMeter = 0
  move = "special"
 elif kind == "heavy":
  player.comboStep = 0
  player.comboDeadlineTick = 0
  move = "heavy"
 else:
  if run.tick > player.comboDeadlineTick: player.comboStep = 0
  move = "light" + str(int(player.comboStep) + 1)
  player.comboStep = (int(player.comboStep) + 1) % 3
 player.action = Actor.action("windup", run.tick, run.tick + tuning(run, move, content).windup, move)
 Events.emit(events, run, "attack" if kind == "light" else kind, player.id)
 return true
static func update(run: Dictionary, input: Dictionary, events: Array, content: RefCounted, arena: Dictionary = {}) -> void:
 var player := State.player(run)
 if player.hp <= 0: return
 var canceled: Array = input.get("canceledPointerIds", [])
 if player.has("pendingAction") and (player.pendingAction.sourcePointerId in canceled or run.tick >= player.pendingAction.expiresTick): player.erase("pendingAction")
 advance(run, player, events, content)
 var winner: Dictionary = {}
 for request in input.get("requests", []):
  if request.sourcePointerId in canceled: continue
  if not eligible(run, player, request.kind):
   Events.emit(events, run, "unavailable", player.id)
   continue
  if winner.is_empty() or PRIORITY[request.kind] > PRIORITY[winner.kind] or (PRIORITY[request.kind] == PRIORITY[winner.kind] and request.order > winner.order): winner = request
 if not winner.is_empty():
  player.pendingAction = winner.duplicate()
  player.pendingAction.expiresTick = run.tick + 9
 if player.action.kind == "idle" and player.has("pendingAction"):
  var pending: Dictionary = player.pendingAction
  player.erase("pendingAction")
  if not start(run, player, pending.kind, input, events, content, arena): Events.emit(events, run, "unavailable", player.id)
