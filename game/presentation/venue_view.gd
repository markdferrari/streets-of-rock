extends Node3D
var room_groups: Dictionary = {}
var texture_count := 0
var errors: Array[String] = []
func box(parent: Node3D, size: Vector3, at: Vector3, material: StandardMaterial3D, color: Color = Color.WHITE) -> MeshInstance3D:
 var node := MeshInstance3D.new()
 var shape := BoxMesh.new()
 shape.size = size
 var arrays := shape.surface_get_arrays(0)
 var colors := PackedColorArray()
 colors.resize(arrays[Mesh.ARRAY_VERTEX].size())
 colors.fill(color)
 arrays[Mesh.ARRAY_COLOR] = colors
 var baked := ArrayMesh.new()
 baked.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
 node.mesh = baked
 node.material_override = material
 node.position = at
 parent.add_child(node)
 return node
func build(store: RefCounted, content: RefCounted) -> Array:
 var owned: Array = []
 # Sample the imported vertex palette to avoid a second colour-space conversion
 # on native connector/backing geometry. Materials remain shared and immutable.
 var probe: Node3D = store.room_scenes[content.room_presentations["dance-floor"].sceneResourceId].instantiate()
 var floor_group: Node = probe.find_child("pavement", true, false)
 var wall_group: Node = probe.find_child("frontage", true, false)
 var authored_floor: MeshInstance3D = floor_group.find_children("*", "MeshInstance3D", true, false)[0]
 var authored_wall: MeshInstance3D = wall_group.find_children("*", "MeshInstance3D", true, false)[0]
 var floor_color: Color = authored_floor.mesh.surface_get_arrays(0)[Mesh.ARRAY_COLOR][0]
 var wall_color: Color = authored_wall.mesh.surface_get_arrays(0)[Mesh.ARRAY_COLOR][0]
 var floor_material: StandardMaterial3D = authored_floor.get_active_material(0)
 var wall_material: StandardMaterial3D = authored_wall.get_active_material(0)
 probe.free()
 var margins: Dictionary = content.venue_coverage.backing
 var center_x: float = (margins.minX + margins.maxX) / 2.0
 var center_depth: float = (margins.minDepth + margins.maxDepth) / 2.0
 var span_x: float = margins.maxX - margins.minX
 var span_depth: float = margins.maxDepth - margins.minDepth
 var backing := Node3D.new()
 backing.name = "QuietBacking"
 add_child(backing)
 box(backing, Vector3(span_x, 0.1, span_depth), Vector3(center_x, -0.055, center_depth), floor_material, floor_color)
 box(backing, Vector3(span_x, margins.wallHeight, 0.2), Vector3(center_x, margins.wallHeight / 2.0, margins.wallDepth - 0.4), wall_material, wall_color)
 for index in range(content.level.areas.size()):
  var area: Dictionary = content.level.areas[index]
  var definition: Dictionary = content.room_presentations[area.id]
  var room: Node3D = store.create(definition.sceneResourceId)
  if room == null:
   errors.append_array(store.errors)
   continue
  owned.append(room)
  room.name = definition.visualId
  add_child(room)
  room.position.x = float(area.minX)
  room_groups[area.id] = room
  batch_room(room)
  # Each room batch keeps its ordinary frustum bounds and visible neighbors.
  if index < content.level.areas.size() - 1:
   var next: Dictionary = content.level.areas[index + 1]
   var connector := Node3D.new()
   connector.name = "Connector" + str(index + 1)
   add_child(connector)
   var width: float = next.minX - area.maxX
   var center: float = (float(area.maxX) + next.minX) / 2.0
   box(connector, Vector3(width, 0.1, 16), Vector3(center, -0.055, 0), floor_material, floor_color)
   box(connector, Vector3(width, 6, 0.2), Vector3(center, 3, margins.wallDepth), wall_material, wall_color)
 return owned

func batch_room(room: Node3D) -> void:
 var batches: Dictionary = {}
 var materials: Dictionary = {}
 for node in room.find_children("*","MeshInstance3D",true,false):
  if node.mesh==null: continue
  for surface in node.mesh.get_surface_count():
   var material: Material = node.get_active_material(surface)
   var key: int = material.get_instance_id() if material!=null else 0
   if not batches.has(key):
    var builder := SurfaceTool.new()
    builder.begin(Mesh.PRIMITIVE_TRIANGLES)
    batches[key]=builder
    materials[key]=material
   var local: Transform3D = room.global_transform.affine_inverse()*node.global_transform
   batches[key].append_from(node.mesh,surface,local)
  node.hide()
 for key in batches:
  var combined := MeshInstance3D.new()
  combined.name="PaletteBatch"+str(key)
  combined.mesh=batches[key].commit()
  combined.material_override=materials[key]
  room.add_child(combined)
