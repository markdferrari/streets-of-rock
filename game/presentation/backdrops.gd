extends Node3D
const ROOM_IDS: Array[String] = ["dance-floor", "vip-lounge", "backstage-corridor", "alley-exit"]
const SETTINGS: Array[String] = ["outside-entrance", "bar", "dance-floor", "stage-vip"]
var room_groups: Dictionary = {}
var texture_count: int = 0
static func validate(catalogue: Dictionary) -> Array[String]:
 var errors: Array[String] = []
 if catalogue.get("schemaVersion") != 1 or not catalogue.get("rooms") is Array or catalogue.rooms.size() != 4: return ["Exactly four version 1 backdrop mappings required"]
 for index in range(4):
  var room: Dictionary = catalogue.rooms[index]
  if room.get("roomId") != ROOM_IDS[index] or room.get("setting") != SETTINGS[index]: errors.append("rooms[" + str(index) + "]: stable room/setting identity required")
  for kind in ["wall", "floor"]:
   if room.get(kind) != "assets/backdrops/" + SETTINGS[index] + "/" + kind + ".svg": errors.append("rooms[" + str(index) + "]." + kind + ": exact SVG path required")
 return errors
static func decoded_bytes(sizes: Array) -> int:
 var total: int = 0
 for size in sizes:
  var width: int = int(size.width)
  var height: int = int(size.height)
  if width <= 0 or height <= 0: return -1
  while true:
   total += width * height * 4
   if width == 1 and height == 1: break
   width = maxi(1, width >> 1)
   height = maxi(1, height >> 1)
 return total
func panel(parent: Node3D, size: Vector2, at: Vector3, floor: bool, texture: Texture2D = null, color: Color = Color("322638")) -> void:
 var instance := MeshInstance3D.new()
 var quad := QuadMesh.new()
 quad.size = size
 instance.mesh = quad
 instance.position = at
 if floor: instance.rotation.x = -PI / 2.0
 var material := StandardMaterial3D.new()
 material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
 material.transparency = BaseMaterial3D.TRANSPARENCY_DISABLED
 material.albedo_color = color if texture == null else Color.WHITE
 material.albedo_texture = texture
 material.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
 instance.material_override = material
 parent.add_child(instance)
func build(textures: Dictionary, catalogue: Dictionary, level: Dictionary) -> bool:
 if not validate(catalogue).is_empty(): return false
 for room in catalogue.rooms:
  for kind in ["wall", "floor"]:
   if not textures.get(room[kind]) is Texture2D: return false
 texture_count = 8
 # Backing extends beyond fitted body/camera margins; it is purely visual.
 var backing := Node3D.new()
 backing.name = "QuietBacking"
 add_child(backing)
 panel(backing, Vector2(140, 64), Vector3(35, -0.055, 0), true)
 panel(backing, Vector2(140, 12), Vector3(35, 6, -4.02), false)
 for index in range(4):
  var entry: Dictionary = catalogue.rooms[index]
  var area: Dictionary = level.areas[index]
  var group := Node3D.new()
  group.name = entry.setting
  add_child(group)
  room_groups[entry.roomId] = group
  var x: float = (float(area.minX) + area.maxX) / 2.0
  var width: float = area.maxX - area.minX
  panel(group, Vector2(width, 4.3), Vector3(x, 2.15, -4), false, textures[entry.wall])
  panel(group, Vector2(width, 14), Vector3(x, -0.02, 0), true, textures[entry.floor])
  if index < 3:
   var next: Dictionary = level.areas[index + 1]
   var connector := Node3D.new()
   connector.name = "Connector" + str(index + 1)
   add_child(connector)
   var connector_width: float = next.minX - area.maxX
   var connector_x: float = (float(area.maxX) + next.minX) / 2.0
   panel(connector, Vector2(connector_width, 14), Vector3(connector_x, -0.02, 0), true)
   panel(connector, Vector2(connector_width, 4.3), Vector3(connector_x, 2.15, -4), false)
 return true
