extends RefCounted
static func bounds(width: float, height: float, safe: Dictionary) -> Dictionary:
 var left: float = width - safe.get("right", 0.0) - 12 - 176
 var top: float = height - safe.get("bottom", 0.0) - 12 - 176
 return {"pause": Rect2(width - maxf(12, safe.get("right", 0.0)) - 64, maxf(8, safe.get("top", 0.0)), 64, 44), "light": Rect2(left, top + 54, 72, 72), "heavy": Rect2(left + 120, top + 62, 56, 56), "special": Rect2(left + 60, top, 56, 56), "dodge": Rect2(left + 60, top + 120, 56, 56)}
static func go(run: Dictionary, phase: String, area_count: int) -> bool:
 return not run.is_empty() and run.result == null and run.areaIndex + 1 < area_count and run.encounter.status == "cleared" and phase in ["running", "paused"]
static func go_bounds(width: float, height: float, safe: Dictionary, obstacles: Array) -> Rect2:
 var left: float = safe.get("left", 0.0) + 8
 var right: float = width - safe.get("right", 0.0) - 104
 var top: float = safe.get("top", 0.0) + 8
 var bottom: float = height - safe.get("bottom", 0.0) - 56
 var candidates: Array = [Vector2(right - 16, clampf(height * 0.4 - 24, top, bottom))]
 for y in range(int(top), int(bottom) + 1, 8): candidates.append(Vector2(right, y))
 var center_x: float = clampf((width - 96) / 2.0, left, right)
 for y in range(int(top), int(bottom) + 1, 8): candidates.append(Vector2(center_x, y))
 for point in candidates:
  var rect := Rect2(point, Vector2(96, 48))
  if point.x < left or point.x > right or point.y < top or point.y > bottom: continue
  var valid: bool = true
  for obstacle in obstacles:
   if rect.grow(8).intersects(obstacle): valid = false
  if valid: return rect
 return Rect2()
