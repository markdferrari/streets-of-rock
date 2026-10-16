extends SceneTree
const Hero = preload("res://game/content/hero_animation_catalog.gd")
const Store = preload("res://game/content/resource_store.gd")
const Art = preload("res://game/content/art_catalog.gd")
var errors: Array[String] = []
var resources: Dictionary = {}
var records: Dictionary = {}
var definitions_only := false
var checked_sources: Dictionary = {}
var checked_files: Dictionary = {}
var file_hashes: Dictionary = {}
var source_clips: Dictionary = {}
var import_freshness: Dictionary = {}

func read_object(path: String) -> Dictionary:
 if not FileAccess.file_exists(path):
  errors.append(path + ": file missing; author the complete catalogue before validation")
  return {}
 var parser := JSON.new()
 if parser.parse(FileAccess.get_file_as_string(path)) != OK or not parser.data is Dictionary:
  errors.append(path + ": expected JSON object; " + parser.get_error_message())
  return {}
 return parser.data

func check_hash(path: Variant, digest: Variant, label: String) -> void:
 if not Art.safe_path(path):
  errors.append(label + ".path: safe project-relative file required")
  return
 var regex := RegEx.create_from_string("^[0-9a-f]{64}$")
 if not digest is String or regex.search(digest) == null:
  errors.append(label + ".sha256: exact SHA-256 required")
 elif not FileAccess.file_exists("res://" + path): errors.append(label + ".path: missing " + path)
 else:
  if not file_hashes.has(path): file_hashes[path] = FileAccess.get_sha256("res://"+path)
  if file_hashes[path] != digest: errors.append(label + ".sha256: hash mismatch for " + path + "; re-export/review changed content")

func check_source(id: String) -> void:
 if checked_sources.has(id): return
 checked_sources[id] = true
 if not records.get(id) is Dictionary or records[id].get("status") != "accepted":
  errors.append("provenance." + id + ": missing/unaccepted source; complete source review")
  return
 var source: Dictionary = records[id]
 var label := "provenance." + id
 for field in ["creator", "name", "licenseId", "reviewer", "reviewDate"]:
  if not source.get(field) is String or source[field].strip_edges().is_empty(): errors.append(label + "." + field + ": reviewed value required")
 var original: bool = source.get("originalAuthorDeclaration") is String and not source.originalAuthorDeclaration.is_empty()
 if original:
  check_hash(source.get("sourcePath"), source.get("sourceSha256"), label + ".original")
 else:
  if not source.get("sourceUrl") is String or not source.sourceUrl.begins_with("https://"): errors.append(label + ".sourceUrl: retained supplier identity required")
  if not source.get("acquisitionDate") is String: errors.append(label + ".acquisitionDate: required")
  check_hash(source.get("acquiredPath"), source.get("sha256"), label + ".acquired")
  var permissions: Variant = source.get("permissions")
  for field in ["commercial", "modification", "gameDistribution"]:
   if not permissions is Dictionary or permissions.get(field) != true: errors.append(label + ".permissions." + field + ": completed permission assessment required")
  for field in ["purchaseCost", "recurringFee"]:
   if not permissions is Dictionary or permissions.get(field) != 0: errors.append(label + ".permissions." + field + ": zero cost required")
  var evidence: Variant = source.get("licenseEvidencePaths")
  if not evidence is Array or evidence.is_empty(): errors.append(label + ".licenseEvidencePaths: retained license required")
  else:
   for path in evidence:
    var hashes: Variant = source.get("evidenceSha256", {})
    check_hash(path, hashes.get(path) if hashes is Dictionary else null, label + ".licenseEvidence")
  if not source.get("attributionText") is String or not source.get("requiredNotices") is Array: errors.append(label + ": reviewed attributionText/requiredNotices required")
 for field in ["files", "supportingFiles"]:
  var files: Variant = source.get(field, [])
  if not files is Array: errors.append(label + "." + field + ": expected array")
  else:
   for file in files:
    if file is Dictionary: check_hash(file.get("path"), file.get("sha256"), label + "." + field)
    else: errors.append(label + "." + field + ": expected file record")

func closure(id: String, found: Dictionary) -> void:
 if found.has(id): return
 var entry: Variant = resources.get(id)
 if not entry is Dictionary: return # Structural validation supplies the diagnostic.
 found[id] = entry
 var deps: Variant = entry.get("dependencyIds", [])
 if deps is Array:
  for dep in deps:
   if dep is String: closure(dep, found)

func check_import_freshness(path: String, subject: String) -> bool:
 if import_freshness.has(path): return import_freshness[path]
 var descriptor := "res://" + path + ".import"
 if not FileAccess.file_exists(descriptor):
  if path.get_extension().to_lower() not in ["glb", "gltf"]: return true
  errors.append(subject + ".imports: missing import for " + path + "; reimport with the pinned editor")
  import_freshness[path] = false
  return false
 var config := ConfigFile.new()
 if config.load(descriptor) != OK:
  errors.append(subject + ".imports: corrupt import descriptor for " + path + "; reimport with the pinned editor")
  import_freshness[path] = false
  return false
 var cached: Variant = config.get_value("remap", "path", null)
 var current := false
 if cached is String and cached.begins_with("res://"):
  var checksum_file: String = cached.get_basename() + ".md5"
  if FileAccess.file_exists(checksum_file):
   var pattern := RegEx.create_from_string('source_md5="([0-9a-f]{32})"')
   var checksum := pattern.search(FileAccess.get_file_as_string(checksum_file))
   current = checksum != null and checksum.get_string(1) == FileAccess.get_md5("res://" + path)
 if not current: errors.append(subject + ".imports: stale/missing imported copy of " + path + "; reimport with the pinned editor before validation")
 import_freshness[path] = current
 return current

func inspect_dependencies(path: String, declared: Dictionary, seen: Dictionary, subject: String) -> void:
 if seen.has(path): return
 seen[path] = true
 for encoded in ResourceLoader.get_dependencies("res://" + path):
  var dependency: String = str(encoded).split("::")[-1]
  if not dependency.begins_with("res://"):
   errors.append(subject + ".dependencies: unresolved imported dependency " + dependency)
   continue
  var relative := dependency.trim_prefix("res://")
  if not declared.has(relative): errors.append(subject + ".dependencies: undeclared " + relative + "; register its single resource identity and dependency ID")
  if not FileAccess.file_exists(dependency): errors.append(subject + ".dependencies: missing " + relative)
  else: inspect_dependencies(relative, declared, seen, subject)

func check_subject(definition: Dictionary, enemy: bool) -> void:
 var subject: String = str(definition.get("role" if enemy else "visualId", "unknown"))
 var ids: Dictionary = {}
 var resource_id: Variant = definition.get("sceneResourceId")
 if resource_id is String: closure(resource_id, ids)
 var dependencies: Variant = definition.get("dependencyIds", [])
 if dependencies is Array:
  for id in dependencies:
   if id is String: closure(id, ids)
 var source_ids: Variant = definition.get("sourceRecordIds", [])
 if source_ids is Array:
  for id in source_ids:
   if id is String: check_source(id)
 var declared: Dictionary = {}
 for id in ids:
  var entry: Dictionary = ids[id]
  var path: Variant = entry.get("path")
  if not Art.safe_path(path): continue
  declared[path] = true
  if not FileAccess.file_exists("res://" + path): errors.append(subject + ".resources." + id + ": missing " + path)
  if entry.has("sha256"): check_hash(path, entry.sha256, subject + ".resources." + id)
  var sources: Variant = entry.get("sourceRecordIds", [])
  if sources is Array:
   for source_id in sources:
    if source_id is String: check_source(source_id)
 for fields in [["sourcePath", "sourceSha256"], ["runtimePath", "runtimeSha256"]]:
  if definition.has(fields[0]) or definition.has(fields[1]): check_hash(definition.get(fields[0]), definition.get(fields[1]), subject + "." + fields[0])
 if definitions_only: return
 for path in declared:
  if FileAccess.file_exists("res://" + path):
   if not check_import_freshness(path, subject): continue
   inspect_dependencies(path, declared, {}, subject)
   if not checked_files.has(path):
    checked_files[path] = true
    if ResourceLoader.load("res://" + path) == null: errors.append(subject + ".resources: cannot import/load " + path + "; import using the pinned editor, then retry")
 if not resources.get(resource_id) is Dictionary: return
 var scene_path: Variant = resources[resource_id].get("path")
 if not Art.safe_path(scene_path) or not FileAccess.file_exists("res://" + scene_path): return
 if not check_import_freshness(scene_path, subject): return
 var scene := ResourceLoader.load("res://" + scene_path)
 if not scene is PackedScene:
  errors.append(subject + ".sceneResourceId: imported PackedScene required for " + str(scene_path))
  return
 var instance: Node = scene.instantiate()
 if instance == null:
  errors.append(subject + ": cannot instantiate " + str(scene_path))
  return
 errors.append_array(Art.inspect_enemy(instance, definition) if enemy else Art.inspect_room(instance, definition))
 instance.free()

func check_heroes(res: Dictionary, provenance: Dictionary, selected: String) -> void:
 var document := read_object("res://content/hero-animations.json")
 var semantics := read_object("res://content/animation-clips.json")
 var definitions: Dictionary = {}
 for hero in ["cow", "crow", "lion", "plates"]: definitions[hero] = read_object("res://content/characters/" + hero + ".json")
 # Avoid malformed definitions reaching the pure profile validator's model authority.
 for hero in definitions:
  if not definitions[hero].get("presentation") is Dictionary:
   errors.append(hero + ": character definition/presentation required")
   return
 errors.append_array(Hero.validate(document,definitions,res,semantics))
 for summary in document.get("sources",[]):
  if not summary is Dictionary: continue
  if not records.has(summary.get("id")) or records[summary.id].get("status") != summary.get("status"):
   errors.append("hero.sources: stale source summary " + str(summary.get("id")))
 for profile in document.get("characters",[]):
  if not profile is Dictionary or not profile.get("characterId") is String: continue
  var hero: String = profile.characterId
  if not selected.is_empty() and hero != selected: continue
  if not profile.get("modelKey") is String or not res.get("models",{}).has(profile.modelKey): continue
  var path: String = res.models[profile.modelKey]
  var assets: Array = provenance.get("runtimeAssets",[]).filter(func(a: Variant) -> bool: return a is Dictionary and a.get("id") == "hero." + hero)
  if assets.size() != 1:
   errors.append(hero + ": exactly one runtime hero provenance record required")
   continue
  var asset: Dictionary = assets[0]
  if asset.get("runtimePath") != path or asset.get("modelKey") != profile.modelKey: errors.append(hero + ": model path must agree with resources.models authority")
  check_hash(path,asset.get("runtimeSha256"),hero + ".runtime")
  check_hash(asset.get("sourcePath"),asset.get("sourceSha256"),hero + ".editable")
  if not Art.same_ids(asset.get("sourceRecordIds",[]),profile.get("sourceRecordIds",[])): errors.append(hero + ": stale provenance source IDs")
  for source in profile.get("sourceRecordIds",[]): check_source(str(source))
  var motion: Variant = asset.get("selectedMotion")
  if not motion is Array or motion.is_empty(): errors.append(hero + ": selected source clip/file records required")
  else:
   for entry in motion:
    if not entry is Dictionary:
     errors.append(hero + ": invalid selected motion record")
     continue
    check_hash(entry.get("path"),entry.get("sha256"),hero + ".selectedMotion")
    var source: Dictionary = records.get(entry.get("sourceRecordId"),{})
    var allowed: Array = [source.get("acquiredPath")]
    for file in source.get("files",[]):
     if file is Dictionary: allowed.append(file.get("path"))
    if not entry.get("path") in allowed: errors.append(hero + ": selected motion file is not retained by its source record")
    if Art.safe_path(entry.get("path")) and FileAccess.file_exists("res://"+entry.path):
     if not source_clips.has(entry.path):
      source_clips[entry.path] = []
      var bytes := FileAccess.get_file_as_bytes("res://"+entry.path)
      if bytes.size() < 20 or bytes.slice(0,4).get_string_from_ascii() != "glTF": errors.append(hero + ": selected motion must be retained GLB")
      else:
       var gltf: Variant = JSON.parse_string(bytes.slice(20,20+bytes.decode_u32(12)).get_string_from_utf8())
       if gltf is Dictionary:
        for clip in gltf.get("animations",[]): source_clips[entry.path].append(clip.get("name"))
     if not entry.get("clipName") in source_clips[entry.path]: errors.append(hero + ": exact source clip missing " + str(entry.get("clipName")))
  if not definitions_only and check_import_freshness(path,hero):
   var store := Store.new()
   if not store.prepare_profile(hero,"res://"+path,profile): errors.append_array(store.errors)

func _initialize() -> void:
 var args := OS.get_cmdline_user_args()
 var focus := ""
 var id := ""
 for i in args.size():
  if args[i] == "--definitions-only": definitions_only = true
  elif args[i] in ["--room", "--enemy", "--character"] and i + 1 < args.size():
   focus = args[i]
   id = args[i + 1]
 var res := read_object("res://content/resources.json")
 if res.get("art") is Dictionary: resources = res.art
 else: errors.append("resources.art: expected registered art resource object")
 var provenance := read_object("res://content/art-provenance.json")
 var sources := Art.schema(provenance, "provenance", "sources", errors)
 for source in sources:
  if not source is Dictionary or not source.get("id") is String: errors.append("provenance.sources: source object/ID required")
  elif records.has(source.id): errors.append("provenance.sources." + source.id + ": duplicate ID")
  else: records[source.id] = source
 var rooms: Dictionary = {}
 var enemies: Dictionary = {}
 if focus in ["", "--room"]: rooms = read_object("res://content/rooms.json")
 if focus in ["", "--enemy"]: enemies = read_object("res://content/enemy-presentations.json")
 var subjects: Array = []
 if focus.is_empty():
  errors.append_array(Art.validate(rooms, enemies, res, provenance))
  for room in Art.schema(rooms, "rooms", "rooms", errors):
   if room is Dictionary: subjects.append([room, false])
  for enemy in Art.schema(enemies, "enemies", "enemies", errors):
   if enemy is Dictionary: subjects.append([enemy, true])
 elif focus != "--character":
  var collection := "rooms" if focus == "--room" else "enemies"
  var entries := Art.schema(rooms if focus == "--room" else enemies, collection, collection, errors)
  for entry in entries:
   if entry is Dictionary and entry.get("visualId" if focus == "--room" else "role") == id:
    subjects.append([entry, focus == "--enemy"])
    errors.append_array(Art.validate_room_definition(entry, resources, records) if focus == "--room" else Art.validate_enemy_definition(entry, resources, records))
  if subjects.size() != 1: errors.append(collection + "." + id + ": exactly one requested subject required")
 for pair in subjects: check_subject(pair[0], pair[1])
 if focus.is_empty() or focus == "--character": check_heroes(res, provenance, id if focus == "--character" else "")
 # The inherited props registry also ships supplier art (the bartender bottle).
 # Keep unrelated prop checks out of focused room/other-enemy validation.
 if focus.is_empty() or (focus=="--enemy" and id=="zoner"):
  var prop_paths: Array = res.get("props",{}).values() if res.get("props") is Dictionary else []
  for prop in provenance.get("runtimeProps",[]):
   if not prop is Dictionary or not prop.get("runtimePath") in prop_paths: continue
   if not focus.is_empty() and prop.get("id")!="prop.bottle": continue
   var label: String = "provenance.runtimeProps."+str(prop.get("id","unknown"))
   check_hash(prop.get("runtimePath"),prop.get("runtimeSha256"),label)
   var prop_sources: Variant = prop.get("sourceRecordIds")
   if not prop_sources is Array or prop_sources.is_empty(): errors.append(label+": source records required")
   else:
    for source in prop_sources: check_source(str(source))
   if not definitions_only and prop.get("runtimePath") is String and check_import_freshness(prop.runtimePath,label):
    if ResourceLoader.load("res://"+prop.runtimePath)==null: errors.append(label+": required imported prop could not load")
 if errors.is_empty(): print("Valid: " + ("full artwork catalogue" if focus.is_empty() else focus.trim_prefix("--") + " " + id) + (" definitions only; incomplete for release readiness" if definitions_only else " definitions and imported resource closure"))
 else:
  for error in errors: printerr(error)
 quit(0 if errors.is_empty() else 1)
