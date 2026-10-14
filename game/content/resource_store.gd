extends RefCounted
const Backdrops = preload("res://game/presentation/backdrops.gd")
var owned: Dictionary = {}
var templates: Dictionary = {}
var errors: Array[String] = []
var backdrop_textures: Dictionary = {}
var backdrop_decoded_bytes: int = 0

func prepare_backdrops(catalogue: Dictionary, resolve_texture: Callable = Callable()) -> bool:
 errors = Backdrops.validate(catalogue)
 if not errors.is_empty(): return false
 var prepared: Dictionary = {}
 var sizes: Array = []
 for room in catalogue.rooms:
  for kind in ["wall", "floor"]:
   var path: String = room[kind]
   var imported: Texture2D = null
   if resolve_texture.is_valid(): imported = resolve_texture.call("res://" + path)
   elif ResourceLoader.exists("res://" + path): imported = load("res://" + path)
   if imported == null:
    errors.append(path + ": missing required backdrop; restore the SVG and retry")
    continue
   var width: int = 2048 if kind == "wall" else 1024
   var height: int = 1024 if kind == "wall" else 512
   if imported.get_width() != width or imported.get_height() != height:
    errors.append(path + ": expected " + str(width) + "x" + str(height) + "; correct the SVG import and retry")
    continue
   var image := imported.get_image()
   if image == null or not image.has_mipmaps():
    errors.append(path + ": mipmaps required; enable mipmap generation and reimport")
    continue
   prepared[path] = imported
   sizes.append({"width": width, "height": height})
 if not errors.is_empty(): return false
 var decoded: int = Backdrops.decoded_bytes(sizes)
 if decoded < 0 or decoded > 64 * 1024 * 1024:
  errors.append("Required backdrop textures exceed the 64 MiB decoded budget")
  return false
 backdrop_textures = prepared
 backdrop_decoded_bytes = decoded
 return true

static func find_animation(node: Node) -> AnimationPlayer:
 if node is AnimationPlayer:
  return node
 for child in node.get_children():
  var player := find_animation(child)
  if player != null:
   return player
 return null

func prepare(key: String, path: String, clips: Array) -> bool:
 errors.clear()
 if templates.has(key):
  return true
 if not ResourceLoader.exists(path):
  errors.append(key + ": missing required resource " + path)
  return false
 var scene: PackedScene = load(path)
 if scene == null:
  errors.append(key + ": could not import " + path)
  return false
 var probe := scene.instantiate()
 var player := find_animation(probe)
 # Godot sanitizes glTF dots; publish the original semantic clip keys.
 if player != null:
  var library := player.get_animation_library("")
  for clip in clips:
   var imported: String = str(clip).replace(".", "_")
   if not player.has_animation(str(clip)) and player.has_animation(imported):
    library.add_animation(str(clip), player.get_animation(imported))
 for clip in clips:
  if player == null or not player.has_animation(str(clip)):
   errors.append(key + ": missing semantic clip " + str(clip))
 probe.free()
 if not errors.is_empty():
  return false
 templates[key] = scene
 return true

func create(key: String) -> Node3D:
 if not templates.has(key):
  errors.append(key + ": resource not prepared")
  return null
 var instance: Node3D = templates[key].instantiate()
 owned[instance.get_instance_id()] = instance
 return instance

func release(instance: Node3D) -> void:
 if is_instance_valid(instance):
  owned.erase(instance.get_instance_id())
  instance.free()

func live_count() -> int:
 return owned.size()
