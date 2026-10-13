extends RefCounted
const Actor = preload("res://game/simulation/actor.gd")
static func create_run(run_id: int, duo: Dictionary, content: RefCounted) -> Dictionary:
 var fighter: String = duo.get("fighterId", "")
 var partner: String = duo.get("partnerId", "")
 if fighter == partner or not content.definitions.has(fighter) or not content.definitions.has(partner): return {}
 var player := Actor.ally(1, "player", content.definitions[fighter].player.maxHp)
 player.merge({"characterId": fighter, "comboStep": 0, "comboDeadlineTick": 0, "dodgeReadyTick": 0, "specialMeter": 0.0})
 var support := Actor.ally(2, "partner", content.definitions[partner].partner.maxHp)
 support.merge({"characterId": partner, "active": true, "lastProgressTick": 0, "intentState": {"intent": "idle", "targetId": null, "destination": null, "lastHorizontalFacing": 1, "blockedTicks": 0, "blockedDestination": null, "lastResolvedPosition": {"x": -0.8, "depth": 0.0}, "lastRecoveryTick": -120}})
 return {"runId": run_id, "duo": duo.duplicate(true), "tick": 0, "nextEntityId": 3, "nextAttackId": 1, "nextSpecialActivationId": 1, "areaIndex": 0, "waveIndex": 0, "actors": [player, support], "attacks": [], "projectiles": [], "pendingSpecialDamage": [], "tables": [], "pickups": [], "encounter": {"areaId": "dance-floor", "waveIndex": 0, "status": "awaitingEntry", "aliveEnemyIds": [], "cameraCenter": 0.0}, "result": null}
static func player(run: Dictionary) -> Dictionary:
 for actor in run.actors:
  if actor.role == "player": return actor
 return {}
static func partner(run: Dictionary) -> Dictionary:
 for actor in run.actors:
  if actor.role == "partner": return actor
 return {}
static func find_actor(run: Dictionary, id: int) -> Dictionary:
 for actor in run.actors:
  if actor.id == id: return actor
 return {}
static func entity_id(run: Dictionary) -> int:
 var id: int = run.nextEntityId
 run.nextEntityId += 1
 return id
static func attack_id(run: Dictionary) -> int:
 var id: int = run.nextAttackId
 run.nextAttackId += 1
 return id
static func ordered(actors: Array) -> Array:
 var result := actors.duplicate()
 result.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a.id < b.id)
 return result
