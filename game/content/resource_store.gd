extends RefCounted
const Backdrops = preload("res://game/presentation/backdrops.gd")
const Art = preload("res://game/content/art_catalog.gd")
var owned: Dictionary = {}
var templates: Dictionary = {}
var template_paths: Dictionary = {}
var room_scenes: Dictionary = {}
var errors: Array[String] = []
var backdrop_textures: Dictionary = {}
var backdrop_decoded_bytes: int = 0

func prepare_rooms(content: RefCounted) -> bool:
 errors.clear()
 var prepared: Dictionary = {}
 if content.room_presentations.size() != 4:
  errors.append("rooms: all four furnished scenes required before countdown")
  return false
 for definition in content.room_presentations.values():
  var key: String = definition.sceneResourceId
  var path: String = "res://" + content.resources.art[key].path
  if not ResourceLoader.exists(path):
   errors.append(definition.visualId + ": required room missing " + path + "; restore/import it and retry")
   continue
  var scene := ResourceLoader.load(path)
  if not scene is PackedScene:
   errors.append(definition.visualId + ": required room is not an imported scene " + path)
   continue
  var probe: Node = scene.instantiate()
  var inspected := Art.inspect_room(probe, definition)
  probe.free()
  if not inspected.is_empty(): errors.append_array(inspected)
  else: prepared[key] = scene
 if not errors.is_empty(): return false
 room_scenes = prepared
 return true

func prepare_enemies(content: RefCounted) -> bool:
 var failures: Array[String] = []
 for role in Art.MOVES:
  if not content.enemy_presentations.has(role): failures.append(role + ": required production enemy missing; repair art and retry")
 for definition in content.enemy_presentations.values():
  var key: String = definition.sceneResourceId
  var path: String = "res://" + content.resources.art[key].path
  var clips: Array = []
  for binding in definition.clipBindings.values():
   if not binding.clipName in clips: clips.append(binding.clipName)
  if not prepare(key, path, clips):
   failures.append_array(errors)
   continue
  var probe: Node3D = templates[key].instantiate()
  var inspected := Art.inspect_enemy(probe, definition)
  probe.free()
  if not inspected.is_empty():
   templates.erase(key)
   failures.append_array(inspected)
 if not prepare("prop.bottle", "res://" + content.resources.props.bottle, []): failures.append_array(errors)
 errors = failures
 return errors.is_empty()

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
 if templates.has(key) and template_paths.get(key) == path:
  var cached_probe: Node = templates[key].instantiate()
  var cached_player := find_animation(cached_probe)
  for clip in clips:
   if cached_player == null or not cached_player.has_animation(str(clip)): errors.append(key + ": missing semantic clip " + str(clip))
  cached_probe.free()
  return errors.is_empty()
 if not ResourceLoader.exists(path):
  errors.append(key + ": missing required resource " + path)
  return false
 var scene := ResourceLoader.load(path)
 if not scene is PackedScene:
  errors.append(key + ": required imported scene could not load: " + path)
  return false
 var probe: Node = scene.instantiate()
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
 template_paths[key] = path
 return true

func create(key: String) -> Node3D:
 var template: PackedScene = templates.get(key, room_scenes.get(key))
 if template == null:
  errors.append(key + ": resource not prepared")
  return null
 var instance: Node3D = template.instantiate()
 owned[instance.get_instance_id()] = instance
 return instance

func release(instance: Node3D) -> void:
 if is_instance_valid(instance):
  owned.erase(instance.get_instance_id())
  instance.free()

func live_count() -> int:
 return owned.size()

func prepare_hero(content: RefCounted, id: String) -> bool:
 if not content.hero_profiles.has(id):
  templates.erase(id)
  errors.assign([id + ": required hero profile missing; restore metadata and Retry"])
  return false
 var profile: Dictionary = content.hero_profiles[id]
 return prepare_profile(id, "res://" + content.resources.models[profile.modelKey], profile)

func prepare_profile(key: String, path: String, profile: Dictionary) -> bool:
 var clips: Array = []
 if not profile.get("bindings") is Dictionary or not profile.get("locomotion") is Dictionary:
  errors.assign([key + ": complete hero profile required; repair metadata and Retry"])
  templates.erase(key)
  return false
 var schema_errors: Array[String] = []
 for item in profile.bindings.values() + profile.locomotion.values():
  var Hero = load("res://game/content/hero_animation_catalog.gd")
  Hero.binding(item, key, schema_errors)
  if item is Dictionary and not clips.has(item.get("clipName")): clips.append(item.get("clipName"))
 if not schema_errors.is_empty():
  templates.erase(key)
  errors = schema_errors
  return false
 if not prepare(key, path, clips):
  templates.erase(key)
  return false
 var probe: Node3D = templates[key].instantiate()
 errors = load("res://game/content/hero_animation_catalog.gd").inspect(probe, profile)
 probe.free()
 if not errors.is_empty(): templates.erase(key)
 return errors.is_empty()
