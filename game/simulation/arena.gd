extends RefCounted
static func contains(regions: Array, position: Dictionary) -> bool:
 if not is_finite(position.x) or not is_finite(position.depth): return false
 for region in regions:
  if position.x >= region.minX - 1e-9 and position.x <= region.maxX + 1e-9 and position.depth >= region.minDepth - 1e-9 and position.depth <= region.maxDepth + 1e-9: return true
 return false
const UP_Y: float = 12.0 / sqrt(208.0)
const UP_DEPTH: float = 8.0 / sqrt(208.0)
static func room(index: int, content: RefCounted) -> Dictionary:
 var area: Dictionary = content.level.areas[index]
 return {"minX": area.minX, "maxX": area.maxX, "minDepth": area.minDepth, "maxDepth": area.maxDepth}
static func corridor(left: int, right: int, content: RefCounted) -> Dictionary:
 var a := room(left, content)
 var b := room(right, content)
 return {"minX": a.maxX, "maxX": b.minX, "minDepth": maxf(a.minDepth, b.minDepth), "maxDepth": minf(a.maxDepth, b.maxDepth)}
static func legal(run: Dictionary, role: String, content: RefCounted) -> Array:
 var regions: Array = [room(run.areaIndex, content)]
 var partner: Dictionary = run.actors[1]
 if role == "partner" and run.areaIndex == 0 and partner.position.x < regions[0].minX: regions.push_front({"minX": -0.8, "maxX": 0.0, "minDepth": -3.0, "maxDepth": 3.0})
 if role == "partner" and run.areaIndex > 0 and partner.hp > 0 and partner.position.x < regions[0].minX:
  regions.push_front(corridor(run.areaIndex - 1, run.areaIndex, content))
  regions.push_front(room(run.areaIndex - 1, content))
 if run.encounter.status == "cleared" and run.areaIndex + 1 < content.level.areas.size(): regions.append(corridor(run.areaIndex, run.areaIndex + 1, content))
 return regions
static func visible(regions: Array, frame: Dictionary, body: Dictionary) -> Array:
 var width: float = frame.halfHeight * frame.aspect * 0.9
 var height: float = frame.halfHeight * 0.9
 var min_x: float = frame.anchorX - width - body.minX + 0.1
 var max_x: float = frame.anchorX + width - body.maxX - 0.1
 var min_depth: float = frame.anchorDepth + (body.maxY - frame.anchorHeight) * UP_Y / UP_DEPTH - height / UP_DEPTH - body.minDepth + 0.1 / UP_DEPTH
 var max_depth: float = frame.anchorDepth + (body.minY - frame.anchorHeight) * UP_Y / UP_DEPTH + height / UP_DEPTH - body.maxDepth - 0.1 / UP_DEPTH
 var result: Array = []
 for region in regions:
  var clipped: Dictionary = {"minX": maxf(region.minX, min_x), "maxX": minf(region.maxX, max_x), "minDepth": maxf(region.minDepth, min_depth), "maxDepth": minf(region.maxDepth, max_depth)}
  if clipped.minX <= clipped.maxX and clipped.minDepth <= clipped.maxDepth: result.append(clipped)
 return result
static func build(run: Dictionary, frame: Dictionary, body: Dictionary, role: String, content: RefCounted) -> Dictionary:
 var regions := legal(run, role, content)
 return {"legalRegions": regions, "visibleRegions": visible(regions, frame, body), "frame": frame, "body": body}
static func safe(context: Dictionary, position: Dictionary) -> bool:
 if not contains(context.visibleRegions, position): return false
 for obstruction in context.get("obstructions", []):
  if position.x > obstruction.minX and position.x < obstruction.maxX and position.depth > obstruction.minDepth and position.depth < obstruction.maxDepth: return false
 return true
static func interval(from: Dictionary, to: Dictionary, region: Dictionary) -> Array:
 var start: float = 0.0
 var end: float = 1.0
 for axis in [[from.x, to.x - from.x, region.minX, region.maxX], [from.depth, to.depth - from.depth, region.minDepth, region.maxDepth]]:
  if absf(axis[1]) < 1e-12:
   if axis[0] < axis[2] or axis[0] > axis[3]: return []
   continue
  var a: float = (axis[2] - axis[0]) / axis[1]
  var b: float = (axis[3] - axis[0]) / axis[1]
  start = maxf(start, minf(a, b))
  end = minf(end, maxf(a, b))
  if start > end: return []
 return [start, end]
static func move(from: Dictionary, proposed: Dictionary, context: Dictionary) -> Dictionary:
 for v in [from.x, from.depth, proposed.x, proposed.depth]:
  if not is_finite(v): return from.duplicate()
 if not contains(context.visibleRegions, from): return from.duplicate()
 var intervals: Array = []
 for region in context.visibleRegions:
  var value := interval(from, proposed, region)
  if not value.is_empty(): intervals.append(value)
 intervals.sort_custom(func(a: Array, b: Array) -> bool: return a[0] < b[0])
 var reached: float = 0.0
 for value in intervals:
  if value[0] > reached + 1e-9: break
  reached = maxf(reached, value[1])
 for obstacle in context.get("obstructions", []):
  var blocked := interval(from, proposed, obstacle)
  if not blocked.is_empty() and blocked[1] > 1e-9 and blocked[0] <= reached: reached = minf(reached, maxf(0.0, blocked[0] - 1e-6))
 return {"x": from.x + (proposed.x - from.x) * reached, "depth": from.depth + (proposed.depth - from.depth) * reached}
static func path(from: Dictionary, to: Dictionary, context: Dictionary) -> bool:
 if not safe(context, from) or not safe(context, to): return false
 var reached := move(from, to, context)
 return sqrt(pow(reached.x - to.x, 2) + pow(reached.depth - to.depth, 2)) < 1e-5
