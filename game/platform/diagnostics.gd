extends Node
const MAX_SAMPLES := 120
var frame_intervals: Array[float] = []
var owned_resources: int = 0
var owned_nodes: int = 0
var last_ms: float = -1.0

func record(now_ms: float, resource_count: int, node_count: int, active: bool = true) -> void:
 owned_resources = resource_count
 owned_nodes = node_count
 if not active:
  last_ms = -1.0
  return
 if last_ms >= 0.0:
  frame_intervals.append(maxf(0.0, now_ms - last_ms))
  if frame_intervals.size() > MAX_SAMPLES: frame_intervals.pop_front()
 last_ms = now_ms

func snapshot() -> Dictionary:
 var total := 0.0
 var count := 0
 for index in range(frame_intervals.size() - 1, -1, -1):
  total += frame_intervals[index]
  count += 1
  if total >= 1000.0: break
 var average := total / count if count > 0 else 0.0
 return {"schemaVersion":1,"sampleCount":frame_intervals.size(),"frameIntervalsMs":frame_intervals.duplicate(),"rollingFps":1000.0 / average if average > 0 else 0.0,"drawCalls":int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)),"triangles":int(Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME)),"ownedResources":owned_resources,"ownedNodes":owned_nodes,"collectedAtMs":Time.get_ticks_msec()}
