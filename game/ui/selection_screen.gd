extends RefCounted
static func title(selection: Dictionary) -> String:
 return "Choose Your Chieftain" if selection.step == "fighter" else "Choose Your Partner"
static func stats(definition: Dictionary) -> Dictionary:
 var total: float = 0.0
 for move in definition.player.light: total += move.damage
 return {"Health": definition.player.maxHp, "Power": total / 3.0, "Speed": definition.player.moveSpeed}
static func tile_bounds(index: int, width: float, height: float) -> Rect2:
 var tile_width: float = minf(118.0, (width * 0.55 - 38.0) / 4.0)
 return Rect2(18 + index * (tile_width + 6), height * 0.38, tile_width, minf(112, height * 0.34))
