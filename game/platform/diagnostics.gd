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
 var art := art_counters()
 var pixels := 1.0
 if get_viewport()!=null:
  var viewport_size := get_viewport().get_visible_rect().size
  pixels = maxf(1.0,viewport_size.x*viewport_size.y)
 return {"textureBytes":art.textureBytes,"sceneryTextureBytes":art.sceneryTextureBytes,"characterTextureBytes":art.characterTextureBytes,"textureCount":art.textureCount,"meshes":art.meshes,"renderDensity":float(Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME))/pixels,"rendererTextureBytes":int(Performance.get_monitor(Performance.RENDER_TEXTURE_MEM_USED)),"schemaVersion":1,"sampleCount":frame_intervals.size(),"frameIntervalsMs":frame_intervals.duplicate(),"rollingFps":1000.0 / average if average > 0 else 0.0,"drawCalls":int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)),"triangles":int(Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME)),"ownedResources":owned_resources,"ownedNodes":owned_nodes,"collectedAtMs":Time.get_ticks_msec()}

func art_counters() -> Dictionary:
 var result := {"textureBytes":0,"sceneryTextureBytes":0,"characterTextureBytes":0,"textureCount":0,"meshes":0}
 var seen: Dictionary = {}
 if not is_inside_tree(): return result
 for node in get_tree().root.find_children("*","MeshInstance3D",true,false):
  if not node.visible or node.mesh==null: continue
  result.meshes += 1
  for surface in node.mesh.get_surface_count():
   var material: Material = node.get_active_material(surface)
   if not material is StandardMaterial3D: continue
   for slot in [BaseMaterial3D.TEXTURE_ALBEDO,BaseMaterial3D.TEXTURE_NORMAL,BaseMaterial3D.TEXTURE_ROUGHNESS,BaseMaterial3D.TEXTURE_METALLIC,BaseMaterial3D.TEXTURE_EMISSION]:
    var texture: Texture2D = material.get_texture(slot)
    if texture==null or seen.has(texture.get_instance_id()): continue
    seen[texture.get_instance_id()]=true
    var image := texture.get_image()
    if image==null: continue
    # Image data is the actual imported format, including its mip levels.
    var bytes: int = image.get_data_size()
    result.textureBytes += bytes
    result.textureCount += 1
    if "/rooms/" in texture.resource_path: result.sceneryTextureBytes += bytes
    else: result.characterTextureBytes += bytes
 return result
