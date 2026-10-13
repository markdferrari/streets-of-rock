extends RefCounted
const Validator = preload("res://game/content/validator.gd")

var definitions: Dictionary = {}
var errors: Array[String] = []
var roster: Array = []
var resources: Dictionary = {}
var clips: Dictionary = {}
var tuning: Dictionary = {}
var level: Dictionary = {}

func read_json(path: String) -> Variant:
 var parser := JSON.new()
 if not FileAccess.file_exists(path):
  errors.append(path + ": required content missing")
  return null
 if parser.parse(FileAccess.get_file_as_string(path)) != OK:
  errors.append(path + ": invalid JSON at line " + str(parser.get_error_line()) + ": " + parser.get_error_message())
  return null
 return parser.data

static func freeze(value: Variant) -> void:
 if value is Dictionary:
  for item in value.values():
   freeze(item)
  value.make_read_only()
 elif value is Array:
  for item in value:
   freeze(item)
  value.make_read_only()

func load_catalogue(base: String = "res://content") -> bool:
 errors.clear()
 definitions = {}
 var ids: Variant = read_json(base + "/roster.json")
 var assets: Variant = read_json(base + "/resources.json")
 var animations: Variant = read_json(base + "/animation-clips.json")
 var values: Variant = read_json(base + "/tuning.json")
 var rooms: Variant = read_json(base + "/levels/neon-velvet.json")
 if not ids is Array or not assets is Dictionary or not animations is Dictionary or not values is Dictionary or not rooms is Dictionary:
  errors.append(base + ": malformed catalogue records")
  return false
 roster = ids
 resources = assets
 clips = animations
 tuning = values
 level = rooms
 for id in roster:
  if not id is String or definitions.has(id):
   errors.append(base + "/roster.json: duplicate/invalid identity " + str(id))
   continue
  var definition: Variant = read_json(base + "/characters/" + id + ".json")
  var diagnostic := Validator.validate(definition, resources, clips)
  errors.append_array(diagnostic)
  if definition is Dictionary and definition.get("id") != id:
   errors.append(id + ".id: does not match roster/file identity")
  if diagnostic.is_empty():
   definitions[id] = definition
 if roster.size() < 2:
  errors.append("roster: two distinct characters required")
 for category in ["models", "portraits", "props"]:
  for key in resources.get(category, {}):
   var path: Variant = resources[category][key]
   if not path is String or str(path).is_absolute_path() or ".." in str(path).split("/") or ":" in str(path):
    errors.append("resources." + category + "." + str(key) + ": relative project path required")
 if not errors.is_empty():
  definitions.clear()
  return false
 for value in [definitions, roster, resources, clips, tuning, level]:
  freeze(value)
 return true
