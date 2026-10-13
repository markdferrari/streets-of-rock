extends SceneTree
const Validator = preload("res://game/content/validator.gd")
const Store = preload("res://game/content/resource_store.gd")
var root_path: String
var selected: String = ""
func _initialize() -> void:
 var args := OS.get_cmdline_user_args()
 root_path = ProjectSettings.globalize_path("res://").trim_suffix("/")
 for index in range(args.size()):
  if args[index] == "--root" and index + 1 < args.size(): root_path = args[index + 1].replace("\\", "/").trim_suffix("/")
  elif args[index] == "--character" and index + 1 < args.size(): selected = args[index + 1]
 if root_path != ProjectSettings.globalize_path("res://").trim_suffix("/"):
  _fail("--root must be the active Godot project; launch with --path pointing to that project so imported assets can be validated")
  return
 var directory := root_path.path_join("content/characters")
 var resource_path := root_path.path_join("content/resources.json")
 var clips_path := root_path.path_join("content/animation-clips.json")
 var resources: Variant = _read_json(resource_path)
 var clips: Variant = _read_json(clips_path)
 if not resources is Dictionary or not clips is Dictionary: _fail("content/resources.json and animation-clips.json are required"); return
 var files: Array[String] = []
 for filename in DirAccess.get_files_at(directory):
  if filename.ends_with(".json"): files.append(filename)
 files.sort()
 if files.is_empty(): _fail("content/characters: no character definitions found"); return
 var seen: Dictionary = {}
 var definitions: Array = []
 var errors: Array[String] = []
 for filename in files:
  var path := directory.path_join(filename)
  var definition: Variant = _read_json(path)
  if not definition is Dictionary: errors.append(filename + ": definition object required"); continue
  var id := str(definition.get("id", filename.trim_suffix(".json")))
  if seen.has(id): errors.append(id + ".id: duplicate character identity")
  seen[id] = true
  if selected.is_empty() or selected == id: definitions.append({"data": definition, "filename": filename})
 if not selected.is_empty() and not seen.has(selected): errors.append(selected + ": definition file is missing")
 for item in definitions:
  var definition: Dictionary = item.data
  var filename: String = item.filename
  errors.append_array(Validator.validate(definition, resources, clips))
  if definition.get("id") != filename.trim_suffix(".json"): errors.append(str(definition.get("id")) + ".id: definition filename does not match identity")
  if not errors.is_empty(): continue
  for category in ["models", "portraits"]:
   var key: String = str(definition.presentation.get("modelKey" if category == "models" else "portraitKey", ""))
   var path: String = str(resources.get(category, {}).get(key, ""))
   if path.is_empty() or not FileAccess.file_exists(root_path.path_join(path)): errors.append(str(definition.id) + ".presentation." + category + ": required bundled file is missing: " + path)
  var model_key: String = str(definition.presentation.get("modelKey", ""))
  var model_path: String = str(resources.get("models", {}).get(model_key, ""))
  if not model_path.is_empty():
   var bytes := FileAccess.get_file_as_bytes(root_path.path_join(model_path))
   if bytes.size() < 20 or bytes.slice(0, 4).get_string_from_ascii() != "glTF": errors.append(str(definition.id) + ".presentation.modelKey: binary GLB required")
   else:
    var json_size := bytes.decode_u32(12)
    var gltf: Variant = JSON.parse_string(bytes.slice(20, 20 + json_size).get_string_from_utf8())
    var names: Array = []
    if gltf is Dictionary:
     for animation in gltf.get("animations", []): names.append(animation.get("name", ""))
    for clip in clips.get(definition.presentation.animationSetKey, []):
     if not clip in names: errors.append(str(definition.id) + ".presentation.animationSetKey: model lacks semantic clip '" + str(clip) + "'")
 for key in resources.get("props", {}):
  var path: String = str(resources.props[key])
  if not FileAccess.file_exists(root_path.path_join(path)):
   errors.append("resources.props." + str(key) + ": required prop file is missing: " + path)
  elif root_path == ProjectSettings.globalize_path("res://").trim_suffix("/"):
   if ResourceLoader.load("res://" + path) == null: errors.append("resources.props." + str(key) + ": imported prop failed to load: " + path)
 if errors.is_empty() and root_path == ProjectSettings.globalize_path("res://").trim_suffix("/"):
  var catalogue: RefCounted = load("res://game/content/catalogue.gd").new()
  if not catalogue.load_catalogue(): errors.append_array(catalogue.errors)
  else:
   var store := Store.new()
   for item in definitions:
    var definition: Dictionary = item.data
    var key: String = definition.presentation.modelKey
    if not store.prepare(definition.id, "res://" + resources.models[key], clips[definition.presentation.animationSetKey]): errors.append_array(store.errors)
    var portrait_path: String = "res://" + str(resources.portraits[definition.presentation.portraitKey])
    if not ResourceLoader.exists(portrait_path) or not ResourceLoader.load(portrait_path) is Texture2D:
     errors.append(str(definition.id) + ".presentation.portraitKey: imported portrait must load as a texture: " + portrait_path)
 var labels: Array[String] = []
 if selected.is_empty(): labels.append(str(definitions.size()) + " character definition" + ("s" if definitions.size() != 1 else ""))
 else: labels.append(selected + " definition")
 if errors.is_empty():
  print("Valid: " + ", ".join(labels) + " with bundled source and imported resources")
  quit(0)
 else:
  for error in errors: push_error(error)
  quit(1)

func _read_json(path: String) -> Variant:
 if not FileAccess.file_exists(path): return null
 var parser := JSON.new()
 if parser.parse(FileAccess.get_file_as_string(path)) != OK: return null
 return parser.data

func _fail(message: String) -> void:
 push_error(message)
 quit(1)
