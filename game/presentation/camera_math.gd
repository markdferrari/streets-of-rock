extends RefCounted
const Arena = preload("res://game/simulation/arena.gd")
static func center(run: Dictionary, content: RefCounted) -> float:
 var area: Dictionary = content.level.areas[run.areaIndex]
 var x: float = (float(area.minX) + area.maxX) / 2.0
 if run.encounter.status != "cleared" or run.areaIndex + 1 >= content.level.areas.size(): return x
 var next: Dictionary = content.level.areas[run.areaIndex + 1]
 var progress: float = clampf((run.actors[0].position.x - area.maxX) / (next.minX - area.maxX), 0.0, 1.0)
 return x + ((float(next.minX) + next.maxX) / 2.0 - x) * progress
static func points(x: float, depth: float, body: Dictionary) -> Array:
 var result: Array = []
 for offset_x in [body.minX - 0.1, body.maxX + 0.1]:
  for offset_depth in [body.minDepth - 0.1, body.maxDepth + 0.1]:
   for y in [body.minY - 0.1, body.maxY + 0.1]: result.append({"x": x + offset_x, "up": y * Arena.UP_Y - (depth + offset_depth) * Arena.UP_DEPTH})
 return result
static func compute(run: Dictionary, viewport: Dictionary, envelopes: Dictionary, content: RefCounted, previous: Dictionary = {}, delta: float = 0.0) -> Dictionary:
 if viewport.width <= 0 or viewport.height <= 0 or delta < 0: return {}
 var aspect: float = float(viewport.width) / viewport.height
 var area: Dictionary = content.level.areas[run.areaIndex]
 var body: Dictionary = {"minX": -0.1, "maxX": 0.1, "minY": 0.0, "maxY": maxf(envelopes.player.maxY, envelopes.partner.maxY), "minDepth": -0.1, "maxDepth": 0.1}
 var all_points: Array = []
 for x in [area.minX, area.maxX]:
  for depth in [area.minDepth, area.maxDepth]: all_points.append_array(points(x, depth, body))
 var player: Dictionary = run.actors[0]
 var partner: Dictionary = run.actors[1]
 all_points.append_array(points(player.position.x, player.position.depth, envelopes.player))
 if partner.active and partner.hp > 0: all_points.append_array(points(partner.position.x, partner.position.depth, envelopes.partner))
 if run.areaIndex + 1 < content.level.areas.size() and run.encounter.status == "cleared":
  var next: Dictionary = content.level.areas[run.areaIndex + 1]
  all_points.append_array(points(next.minX, clampf(player.position.depth, next.minDepth, next.maxDepth), body))
 var min_x: float = INF
 var max_x: float = -INF
 var min_up: float = INF
 var max_up: float = -INF
 for point in all_points:
  min_x = minf(min_x, point.x)
  max_x = maxf(max_x, point.x)
  min_up = minf(min_up, point.up)
  max_up = maxf(max_up, point.up)
 var desired_x: float = center(run, content) if run.encounter.status == "cleared" else (float(area.minX) + area.maxX) / 2.0
 var desired_height: float = (min_up + max_up) / (2.0 * Arena.UP_Y)
 var blend: float = 1.0 if previous.is_empty() else 1.0 - pow(0.5, delta / 0.15)
 var anchor_x: float = desired_x if previous.is_empty() else previous.anchorX + (desired_x - previous.anchorX) * blend
 var anchor_height: float = desired_height if previous.is_empty() else previous.anchorHeight + (desired_height - previous.anchorHeight) * blend
 var horizontal: float = maxf(absf(min_x - anchor_x), absf(max_x - anchor_x))
 var vertical: float = maxf(absf(min_up - anchor_height * Arena.UP_Y), absf(max_up - anchor_height * Arena.UP_Y))
 var required: float = maxf(horizontal / (aspect * 0.9), vertical / 0.9)
 var half_height: float = maxf(required, previous.halfHeight + (required - previous.halfHeight) * blend) if not previous.is_empty() and previous.halfHeight > required else required
 return {"anchorX": anchor_x, "anchorDepth": 0.0, "anchorHeight": anchor_height, "halfHeight": half_height, "aspect": aspect}
