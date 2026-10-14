extends RefCounted
const ROOM_IDS = {"dance-floor": "exterior", "vip-lounge": "bar", "backstage-corridor": "dance-floor", "alley-exit": "stage-vip"}
const LANDMARKS = {"exterior": ["frontage", "club-sign", "neon-doorway", "light-spill", "pavement", "queue-barriers", "event-posters"], "bar": ["long-counter", "bottle-shelves", "stools", "booths", "warm-light", "neon-accents"], "dance-floor": ["dance-floor", "dj-booth", "large-speakers", "overhead-fixtures", "coloured-light-pools"], "stage-vip": ["curtains", "stage-backdrop", "vip-seating", "club-branding", "dramatic-light"]}
const MOVES = {"grunt": ["grunt"], "zoner": ["throw"], "enforcer": ["charge"], "liam": ["close", "rope", "shockwave"]}
static func finite(value: Variant) -> bool:
 return (value is float or value is int) and is_finite(float(value))
static func safe_path(value: Variant) -> bool:
 if not value is String or value.is_empty() or value.is_absolute_path() or ":" in value or "\\" in value: return false
 for part in value.split("/"):
  if part in ["", ".", ".."]: return false
 return true
static func same_ids(value: Variant, expected: Array) -> bool:
 if not value is Array or value.size() != expected.size(): return false
 var seen: Array = []
 for id in value:
  if not id is String or not id in expected or id in seen: return false
  seen.append(id)
 return true
static func semantics(role: String) -> Array:
 var keys: Array = ["Idle", "Move", "Hurt", "Defeated"]
 if role != "liam": keys.append("Stunned")
 for move in MOVES.get(role, []):
  for phase in ["windup", "active", "recovery"]: keys.append(move + "." + phase)
 return keys
static func schema(value: Variant, label: String, collection: String, errors: Array[String]) -> Array:
 if not value is Dictionary or value.get("schemaVersion") != 1:
  errors.append(label + ".schemaVersion: expected 1; update the authoring record")
  return []
 if not value.get(collection) is Array:
  errors.append(label + "." + collection + ": expected array")
  return []
 return value[collection]
static func sources(ids: Variant, records: Dictionary, label: String, errors: Array[String]) -> void:
 if not ids is Array or ids.is_empty():
  errors.append(label + ".sourceRecordIds: at least one accepted source required")
  return
 for id in ids:
  if not id is String or not records.has(id) or records[id].get("status") != "accepted": errors.append(label + ".sourceRecordIds: " + str(id) + " is missing/unaccepted; inspect source evidence before use")
static func resource(id: Variant, assets: Dictionary, records: Dictionary, visiting: Array, errors: Array[String]) -> void:
 if not id is String or not assets.get(id) is Dictionary:
  errors.append("resources.art." + str(id) + ": missing resource record")
  return
 if id in visiting:
  errors.append("resources.art." + id + ": dependency cycle " + str(visiting))
  return
 var entry: Dictionary = assets[id]
 if not safe_path(entry.get("path")): errors.append("resources.art." + id + ".path: safe relative project path required")
 sources(entry.get("sourceRecordIds"), records, "resources.art." + id, errors)
 var dependencies: Variant = entry.get("dependencyIds")
 if not dependencies is Array:
  errors.append("resources.art." + id + ".dependencyIds: expected array")
  return
 for dep in dependencies: resource(dep, assets, records, visiting + [id], errors)
static func validate_enemy_definition(definition: Variant, assets: Dictionary, records: Dictionary) -> Array[String]:
 var errors: Array[String] = []
 if not definition is Dictionary:
  errors.append("enemy: expected definition object")
  return errors
 var role: Variant = definition.get("role")
 if not role is String or not MOVES.has(role):
  errors.append("enemy.role: unknown role " + str(role))
  return errors
 resource(definition.get("sceneResourceId"), assets, records, [], errors)
 sources(definition.get("sourceRecordIds"), records, role, errors)
 var transform: Variant = definition.get("transform")
 if not transform is Dictionary or not finite(transform.get("scale")) or transform.get("scale", 0) <= 0 or not finite(transform.get("footOffset")) or not finite(transform.get("facingCorrection")):
  errors.append(role + ".transform: finite positive uniform scale, footOffset and facingCorrection required")
 var envelope: Variant = definition.get("visualEnvelope")
 for field in ["width", "height", "depth"]:
  if not envelope is Dictionary or not finite(envelope.get(field)) or envelope.get(field, 0) <= 0: errors.append(role + ".visualEnvelope." + field + ": finite positive dimension required")
 if not same_ids(definition.get("allowedMoveIds"), MOVES[role]): errors.append(role + ".allowedMoveIds: expected " + str(MOVES[role]))
 var hold: Variant = definition.get("defeatHoldTicks")
 if not finite(hold) or hold != floorf(float(hold)) or hold < 1 or hold > 600: errors.append(role + ".defeatHoldTicks: integer within 1..600 required")
 var bindings: Variant = definition.get("clipBindings")
 if not bindings is Dictionary:
  errors.append(role + ".clipBindings: expected object")
  return errors
 var required := semantics(role)
 for key in required:
  if not bindings.has(key): errors.append(role + ".clipBindings." + key + ": required binding missing")
 for key in bindings:
  var label: String = str(role) + ".clipBindings." + str(key)
  if not key in required: errors.append(label + ": unsupported semantic")
  var binding: Variant = bindings[key]
  if not binding is Dictionary:
   errors.append(label + ": expected binding object")
   continue
  if not binding.get("clipName") is String or binding.get("clipName", "") in ["", "T-Pose", "RESET"]: errors.append(label + ".clipName: intentional authored/imported clip required")
  var start: Variant = binding.get("startSeconds")
  var end: Variant = binding.get("endSeconds")
  if not finite(start) or not finite(end) or start < 0 or end < start: errors.append(label + ".startSeconds/endSeconds: finite ordered nonnegative segment required")
  elif binding.has("fixedSampleSeconds"):
   var fixed: Variant = binding.fixedSampleSeconds
   if not finite(fixed) or fixed < start or fixed > end: errors.append(label + ".fixedSampleSeconds: authored pose must lie within segment")
  if not binding.get("loop") is bool: errors.append(label + ".loop: boolean required")
 return errors
static func validate(rooms: Variant, enemies: Variant, resources: Dictionary, provenance: Dictionary) -> Array[String]:
 var errors: Array[String] = []
 var room_entries := schema(rooms, "rooms", "rooms", errors)
 var enemy_entries := schema(enemies, "enemies", "enemies", errors)
 var source_entries := schema(provenance, "provenance", "sources", errors)
 var records: Dictionary = {}
 for entry in source_entries:
  if not entry is Dictionary or not entry.get("id") is String:
   errors.append("provenance.sources: source ID required")
  elif records.has(entry.id): errors.append("provenance.sources." + entry.id + ": duplicate source ID")
  else: records[entry.id] = entry
 var assets: Variant = resources.get("art", {})
 if not assets is Dictionary:
  errors.append("resources.art: expected object")
  return errors
 var seen_rooms: Array = []
 for room in room_entries:
  if not room is Dictionary:
   errors.append("rooms: room object required")
   continue
  var area: Variant = room.get("areaId")
  var visual: Variant = room.get("visualId")
  if not area is String or not ROOM_IDS.has(area) or ROOM_IDS.get(area) != visual or area in seen_rooms:
   errors.append("rooms." + str(area) + ".visualId: unique stable mapping required")
  else: seen_rooms.append(area)
  if LANDMARKS.has(visual):
   for landmark in LANDMARKS[visual]:
    if not room.get("requiredLandmarks") is Array or not landmark in room.requiredLandmarks: errors.append("rooms." + str(visual) + ".requiredLandmarks: missing " + landmark)
  resource(room.get("sceneResourceId"), assets, records, [], errors)
  var deps: Variant = room.get("dependencyIds")
  if not deps is Array: errors.append("rooms." + str(visual) + ".dependencyIds: expected array")
  else:
   for dep in deps: resource(dep, assets, records, [], errors)
  var bounds: Variant = room.get("coverageBounds")
  var good: bool = bounds is Dictionary
  for field in ["minX", "maxX", "minDepth", "maxDepth"]:
   good = good and bounds is Dictionary and finite(bounds.get(field))
  if not good or bounds.minX >= bounds.maxX or bounds.minDepth >= bounds.maxDepth: errors.append("rooms." + str(visual) + ".coverageBounds: finite ordered bounds required")
 if not same_ids(seen_rooms, ROOM_IDS.keys()): errors.append("rooms: exactly four stable area IDs required; found " + str(seen_rooms))
 var seen_roles: Array = []
 for enemy in enemy_entries:
  errors.append_array(validate_enemy_definition(enemy, assets, records))
  if enemy is Dictionary:
   var role: Variant = enemy.get("role")
   if role in seen_roles: errors.append("enemies." + str(role) + ": duplicate role")
   seen_roles.append(role)
 if not same_ids(seen_roles, MOVES.keys()): errors.append("enemies: exactly grunt, zoner, enforcer and liam required; found " + str(seen_roles))
 return errors
static func descendants(node: Node) -> Array[Node]:
 var result: Array[Node] = [node]
 for child in node.get_children(): result.append_array(descendants(child))
 return result
static func inspect_enemy(instance: Node, definition: Dictionary) -> Array[String]:
 var errors: Array[String] = []
 var role: String = definition.get("role", "enemy")
 var skeletons: Array[Skeleton3D] = []
 var players: Array[AnimationPlayer] = []
 var meshes := 0
 for node in descendants(instance):
  if node.get_script() != null: errors.append(role + ": imported script forbidden on " + str(node.name))
  if not (node is Node3D or node is AnimationPlayer) or node is CollisionObject3D or node is CollisionShape3D or node is NavigationRegion3D or node is Camera3D or node is Light3D:
   errors.append(role + ": forbidden imported node " + node.get_class())
  if node is Skeleton3D: skeletons.append(node)
  if node is AnimationPlayer: players.append(node)
  if node is MeshInstance3D:
   meshes += 1
   if node.mesh == null: errors.append(role + ": missing geometry on " + str(node.name))
   elif node.material_override == null:
    for surface in node.mesh.get_surface_count():
     if node.get_surface_override_material(surface) == null and node.mesh.surface_get_material(surface) == null: errors.append(role + ": material missing on " + str(node.name))
 if skeletons.is_empty() or skeletons.any(func(s: Skeleton3D) -> bool: return s.get_bone_count() == 0): errors.append(role + ": nonempty skeleton required")
 if meshes == 0: errors.append(role + ": visible mesh required")
 if players.size() != 1:
  errors.append(role + ": exactly one animation player required")
  return errors
 var player: AnimationPlayer = players[0]
 var animation_root := player.get_node_or_null(player.root_node)
 for clip_name in player.get_animation_list():
  var animation := player.get_animation(clip_name)
  for track in animation.get_track_count():
   var path := animation.track_get_path(track)
   var label: String = str(role) + ".clips." + str(clip_name) + "." + str(path)
   var kind := animation.track_get_type(track)
   if kind not in [Animation.TYPE_POSITION_3D, Animation.TYPE_ROTATION_3D, Animation.TYPE_SCALE_3D]:
    errors.append(label + ": unsupported callback/property/audio/animation track")
    continue
   var target: Node = animation_root.get_node_or_null(NodePath(path.get_concatenated_names())) if animation_root != null else null
   if not target is Skeleton3D or path.get_subname_count() != 1 or target.find_bone(str(path.get_subname(0))) < 0:
    errors.append(label + ": transform must target an existing skeletal bone, not actor root")
    continue
   if kind == Animation.TYPE_POSITION_3D and path.get_subname(0) == "root" and animation.track_get_key_count(track) > 1:
    var initial: Vector3 = animation.track_get_key_value(track, 0)
    for key in animation.track_get_key_count(track):
     if not initial.is_equal_approx(animation.track_get_key_value(track, key)): errors.append(label + ": root locomotion forbidden; keep actor transform simulation-owned")
 var bindings: Variant = definition.get("clipBindings", {})
 if not bindings is Dictionary:
  errors.append(role + ".clipBindings: expected object")
  return errors
 for semantic in bindings:
  var binding: Variant = bindings[semantic]
  var label: String = str(role) + ".clipBindings." + str(semantic)
  if not binding is Dictionary or not binding.get("clipName") is String:
   errors.append(label + ": clip name required")
   continue
  if not player.has_animation(binding.clipName):
   errors.append(label + ": missing imported clip " + binding.clipName)
   continue
  var length: float = player.get_animation(binding.clipName).length
  for field in ["startSeconds", "endSeconds", "fixedSampleSeconds"]:
   if field == "fixedSampleSeconds" and not binding.has(field): continue
   var value: Variant = binding.get(field)
   if not finite(value) or value < 0 or value > length + 0.00001: errors.append(label + "." + field + ": outside imported clip [0," + str(length) + "]")
 return errors
