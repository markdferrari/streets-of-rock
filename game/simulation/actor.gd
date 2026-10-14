extends RefCounted
static func action(kind: String, tick: int, end_tick: int, move: String = "") -> Dictionary:
 var value: Dictionary = {"kind": kind, "startedTick": tick, "endTick": end_tick}
 if not move.is_empty(): value.moveId = move
 return value
static func ally(id: int, role: String, hp: float) -> Dictionary:
 return {"id": id, "role": role, "team": "ally", "position": {"x": 0.0 if role == "player" else -0.8, "depth": 0.0}, "facing": 1, "hp": hp, "maxHp": hp, "action": action("idle", 0, 0), "protectionUntilTick": 0, "decisionReadyTick": 0, "attackSlot": false, "phase": 1}
static func enemy(id: int, role: String, position: Dictionary, tick: int, definition: Dictionary) -> Dictionary:
 var value := ally(id, role, definition.hp)
 value.team = "enemy"
 value.position = position.duplicate(true)
 value.facing = -1
 value.action = action("idle", tick, tick)
 value.decisionReadyTick = tick
 value.combatClass = definition.combatClass
 return value
