extends RefCounted
const State = preload("res://game/simulation/run_state.gd")
static func distance(a: Dictionary, b: Dictionary) -> float:
 return sqrt(pow(float(a.x) - b.x, 2) + pow(float(a.depth) - b.depth, 2))
static func move_player(run: Dictionary, input: Dictionary, content: RefCounted) -> void:
 var player := State.player(run)
 if player.hp <= 0 or not player.action.kind in ["idle", "dodge"]: return
 var move: Dictionary = player.get("dodgeDirection", {"x": player.facing, "depth": 0.0}) if player.action.kind == "dodge" else input.move
 var x: float = move.x
 var depth: float = move.depth
 if not is_finite(x) or not is_finite(depth): return
 var magnitude: float = sqrt(x * x + depth * depth)
 if magnitude > 1:
  x /= magnitude
  depth /= magnitude
 if x != 0 and player.action.kind == "idle": player.facing = 1 if x > 0 else -1
 var speed: float = 6.0 if player.action.kind == "dodge" else content.definitions[player.characterId].player.moveSpeed
 var area: Dictionary = content.level.areas[run.areaIndex]
 var maximum: float = area.maxX
 if run.encounter.status == "cleared" and run.areaIndex + 1 < content.level.areas.size(): maximum = content.level.areas[run.areaIndex + 1].minX
 player.position.x = clampf(player.position.x + x * speed / 60.0, area.minX, maximum)
 player.position.depth = clampf(player.position.depth + depth * speed / 60.0, area.minDepth, area.maxDepth)
static func overlaps(run: Dictionary, content: RefCounted) -> void:
 var area: Dictionary = content.level.areas[run.areaIndex]
 for enemy in State.ordered(run.actors):
  if enemy.team != "enemy" or enemy.hp <= 0: continue
  for ally in run.actors:
   if ally.team != "ally" or ally.hp <= 0: continue
   var separation := distance(enemy.position, ally.position)
   if separation >= 0.6: continue
   var dx: float = (enemy.position.x - ally.position.x) / separation if separation > 0 else 1.0
   var dd: float = (enemy.position.depth - ally.position.depth) / separation if separation > 0 else 0.0
   enemy.position.x = clampf(enemy.position.x + dx * (0.6 - separation), area.minX, area.maxX)
   enemy.position.depth = clampf(enemy.position.depth + dd * (0.6 - separation), area.minDepth, area.maxDepth)
