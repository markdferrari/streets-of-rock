extends RefCounted
const State = preload("res://game/simulation/run_state.gd")
const Actor = preload("res://game/simulation/actor.gd")
const Events = preload("res://game/simulation/events.gd")
static func spawn(run: Dictionary, events: Array, content: RefCounted) -> void:
 var area: Dictionary = content.level.areas[run.areaIndex]
 if run.encounter.waveIndex >= area.waves.size(): return
 run.encounter.areaId = area.id
 run.encounter.status = "active"
 run.encounter.cameraCenter = (float(area.minX) + area.maxX) / 2.0
 run.encounter.aliveEnemyIds = []
 for item in area.waves[run.encounter.waveIndex]:
  var enemy := Actor.enemy(State.entity_id(run), item.role, {"x": item.x, "depth": item.depth}, run.tick, content.tuning.enemyDefinitions[item.role])
  run.actors.append(enemy)
  run.encounter.aliveEnemyIds.append(enemy.id)
 if area.id == "vip-lounge" and run.tables.is_empty():
  for position in content.level.tables: run.tables.append({"id": State.entity_id(run), "areaId": area.id, "position": position.duplicate(), "hp": 24, "broken": false})
 Events.emit(events, run, "wave")
static func update(run: Dictionary, events: Array, content: RefCounted) -> void:
 if run.result != null: return
 var area: Dictionary = content.level.areas[run.areaIndex]
 var player := State.player(run)
 if player.hp <= 0: return
 if run.encounter.status == "awaitingEntry":
  if player.position.x >= area.minX: spawn(run, events, content)
  return
 if run.encounter.status == "active":
  run.encounter.aliveEnemyIds = run.encounter.aliveEnemyIds.filter(func(id: Variant) -> bool: return State.find_actor(run, int(id)).get("hp", 0) > 0)
  if not run.encounter.aliveEnemyIds.is_empty(): return
  if run.encounter.waveIndex + 1 < area.waves.size():
   run.encounter.waveIndex += 1
   run.waveIndex = run.encounter.waveIndex
   spawn(run, events, content)
  else:
   run.encounter.status = "cleared"
   Events.emit(events, run, "go")
  return
 if run.areaIndex + 1 < content.level.areas.size():
  var next: Dictionary = content.level.areas[run.areaIndex + 1]
  if player.position.x >= next.minX:
   run.areaIndex += 1
   run.waveIndex = 0
   run.encounter = {"areaId": next.id, "waveIndex": 0, "status": "awaitingEntry", "aliveEnemyIds": [], "cameraCenter": (float(next.minX) + next.maxX) / 2.0}
   spawn(run, events, content)
