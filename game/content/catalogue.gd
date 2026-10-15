extends RefCounted
const Validator = preload("res://game/content/validator.gd")
const Art = preload("res://game/content/art_catalog.gd")

var definitions: Dictionary = {}
var errors: Array[String] = []
var roster: Array = []
var resources: Dictionary = {}
var clips: Dictionary = {}
var tuning: Dictionary = {}
var level: Dictionary = {}
var enemy_presentations: Dictionary = {}
var room_presentations: Dictionary = {}
var venue_coverage: Dictionary = {}

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
 enemy_presentations = {}
 room_presentations = {}
 venue_coverage = {}
 var ids: Variant = read_json(base + "/roster.json")
 var assets: Variant = read_json(base + "/resources.json")
 var animations: Variant = read_json(base + "/animation-clips.json")
 var values: Variant = read_json(base + "/tuning.json")
 var rooms: Variant = read_json(base + "/levels/bondi-beach.json")
 if not ids is Array or not assets is Dictionary or not animations is Dictionary or not values is Dictionary or not rooms is Dictionary:
  errors.append(base + ": malformed catalogue records")
  return false
 roster = ids
 resources = assets
 clips = animations
 tuning = values
 level = rooms
 var enemy_document: Variant = read_json(base + "/enemy-presentations.json")
 if not enemy_document is Dictionary or enemy_document.get("schemaVersion") != 1 or not enemy_document.get("enemies") is Array or not enemy_document.get("sources") is Array:
  errors.append(base + "/enemy-presentations.json: versioned enemy/source arrays required")
 else:
  var sources: Dictionary = {}
  for source in enemy_document.sources:
   if source is Dictionary and source.get("id") is String: sources[source.id] = source
  for enemy in enemy_document.enemies:
   errors.append_array(Art.validate_enemy_definition(enemy, resources.get("art", {}), sources))
   if enemy is Dictionary and enemy.get("role") is String:
    if enemy_presentations.has(enemy.role): errors.append("enemy-presentations: duplicate role " + enemy.role)
    else: enemy_presentations[enemy.role] = enemy
  for role in Art.MOVES:
   if not enemy_presentations.has(role): errors.append("enemy-presentations: required production rig " + role + " missing")
 var room_document: Variant = read_json(base + "/rooms.json")
 if not room_document is Dictionary or room_document.get("schemaVersion") != 1 or not room_document.get("rooms") is Array or not room_document.get("sources") is Array:
  errors.append(base + "/rooms.json: versioned room/source arrays required")
 else:
  var sources: Dictionary = {}
  for source in room_document.sources:
   if source is Dictionary and source.get("id") is String: sources[source.id] = source
  for room in room_document.rooms:
   if not room is Dictionary:
    errors.append("rooms: expected room object")
    continue
   errors.append_array(Art.validate_room_definition(room, resources.get("art", {}), sources))
   var area_id: Variant = room.get("areaId")
   if area_id is String:
    if room_presentations.has(area_id): errors.append("rooms: duplicate area " + area_id)
    else: room_presentations[area_id] = room
  if not Art.same_ids(room_presentations.keys(), Art.ROOM_IDS.keys()): errors.append("rooms: exactly four stable area mappings required")
  var coverage: Variant = room_document.get("coverage")
  if not coverage is Dictionary or not coverage.get("backing") is Dictionary:
   errors.append("rooms.coverage.backing: camera-margin bounds required")
  else:
   venue_coverage = coverage
   for field in ["minX", "maxX", "minDepth", "maxDepth", "wallHeight", "wallDepth"]:
    if not Art.finite(coverage.backing.get(field)): errors.append("rooms.coverage.backing." + field + ": finite value required")
   if errors.is_empty() and (coverage.backing.minX >= coverage.backing.maxX or coverage.backing.minDepth >= coverage.backing.maxDepth or coverage.backing.wallHeight <= 0): errors.append("rooms.coverage.backing: positive ordered coverage required")
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
 for value in [definitions, roster, resources, clips, tuning, level, enemy_presentations, room_presentations, venue_coverage]:
  freeze(value)
 return true
