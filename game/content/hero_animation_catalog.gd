extends RefCounted
## Pure authoring/runtime profile schema. Activation belongs to T027.
const Checks = preload("res://game/content/art_catalog.gd")
const DIRECTIONS = ["forward", "backward", "left", "right"]
const PHASES = ["windup", "active", "recovery"]
const EPSILON = 0.00001

static func number(value: Variant, minimum: float, maximum: float = INF, inclusive: bool = false) -> bool:
 return Checks.finite(value) and (value >= minimum if inclusive else value > minimum) and value <= maximum

static func names(value: Variant, label: String, errors: Array[String], mask: bool = false) -> void:
 if not value is Array:
  errors.append(label + ": expected names array")
  return
 var seen: Array = []
 for entry in value:
  if not entry is String or entry.is_empty() or entry in seen or (mask and entry.to_lower() in ["root", "hips", "pelvis"]):
   errors.append(label + ": unique nonempty visual bone names required; actor root cannot be masked")
  seen.append(entry)

static func binding(value: Variant, label: String, errors: Array[String]) -> void:
 if not value is Dictionary:
  errors.append(label + ": expected binding object")
  return
 if not value.get("clipName") is String or value.get("clipName", "").strip_edges() in ["", "RESET", "T-Pose", "A_TPose"]:
  errors.append(label + ".clipName: intentional physical clip required")
 var valid_interval: bool = number(value.get("startSeconds"), 0.0, INF, true) and Checks.finite(value.get("endSeconds")) and value.endSeconds > value.startSeconds
 if not valid_interval: errors.append(label + ": finite ordered nonnegative segment required")
 if not value.get("mode") in ["loop", "phase", "reaction", "hold"]: errors.append(label + ".mode: invalid sampling mode")
 for field in ["contactSeconds", "fixedSampleSeconds"]:
  if (field == "fixedSampleSeconds" and value.get("mode") == "hold") or value.has(field):
   if not valid_interval or not Checks.finite(value.get(field)) or value[field] < value.startSeconds or value[field] > value.endSeconds:
    errors.append(label + "." + field + ": sample must be inside the segment")

static func profile(value: Variant, definitions: Dictionary, resources: Dictionary, semantics: Dictionary, sources: Dictionary, errors: Array[String]) -> void:
 if not value is Dictionary:
  errors.append("hero: expected profile object")
  return
 var id: Variant = value.get("characterId")
 if not id is String or not definitions.has(id) or not semantics.get(id) is Array:
  errors.append("hero.characterId: unknown roster/semantic identity " + str(id))
  return
 var label: String = "hero." + id
 var model: Variant = value.get("modelKey")
 if model != definitions[id].presentation.modelKey or not resources.get("models", {}).has(model): errors.append(label + ".modelKey: must match the character definition and resources.models authority")
 var source_ids: Variant = value.get("sourceRecordIds")
 if not source_ids is Array or source_ids.is_empty(): errors.append(label + ".sourceRecordIds: accepted source IDs required")
 else:
  names(source_ids, label + ".sourceRecordIds", errors)
  for source_id in source_ids:
   if not sources.has(source_id) or sources[source_id] != "accepted": errors.append(label + ".sourceRecordIds: missing/unaccepted source " + str(source_id))
 for field in ["idleCycleSeconds", "hurtSeconds", "knockoutSeconds"]:
  var limit: float = 0.3 if field == "hurtSeconds" else 1.0 if field == "knockoutSeconds" else INF
  if not number(value.get(field), 0.0, limit): errors.append(label + "." + field + ": finite positive duration within presentation bounds required")
 var transitions: Variant = value.get("transitionSeconds")
 if not transitions is Dictionary: errors.append(label + ".transitionSeconds: expected transition map")
 else:
  for key in transitions:
   if not key is String or key.is_empty() or not number(transitions[key], 0.0, 0.1, true): errors.append(label + ".transitionSeconds." + str(key) + ": finite 0..0.1 seconds required")
 for field in ["reactionBoneNames", "secondaryMotionBoneNames"]: names(value.get(field), label + "." + field, errors, true)
 if value.get("reactionBoneNames") is Array and value.reactionBoneNames.is_empty(): errors.append(label + ".reactionBoneNames: reaction mask cannot be empty")
 var groups: Variant = value.get("rigidGroups")
 if not groups is Dictionary: errors.append(label + ".rigidGroups: expected attachment group map")
 else:
  if id in ["plates", "crow"] and groups.is_empty(): errors.append(label + ".rigidGroups: rigid body/face or feather attachments required")
  for key in groups:
   if not key is String or key.is_empty() or not groups[key] is Array or groups[key].is_empty(): errors.append(label + ".rigidGroups: named nonempty attachment group required")
   else: names(groups[key], label + ".rigidGroups." + key, errors)
 var bindings: Variant = value.get("bindings")
 if not bindings is Dictionary:
  errors.append(label + ".bindings: expected semantic binding map")
  return
 if not Checks.same_ids(bindings.keys(), semantics[id]): errors.append(label + ".bindings: exact semantic coverage required")
 for key in bindings:
  var item: Variant = bindings[key]
  binding(item, label + ".bindings." + str(key), errors)
  if not item is Dictionary: continue
  if key in ["Idle", "Move"] and item.get("mode") != "loop": errors.append(label + "." + key + ": loop binding required")
  if key == "Hurt" and item.get("mode") != "reaction": errors.append(label + ".Hurt: reaction binding required")
  if not "." in str(key): continue
  var parts := str(key).split(".")
  if parts.size() != 2 or not parts[1] in PHASES: continue
  var group: String = parts[0]
  if item.get("actionGroup") != group or item.get("mode") != "phase": errors.append(label + "." + str(key) + ": phase binding with matching actionGroup required")
  if parts[1] == "active":
   if not Checks.finite(item.get("contactSeconds")) or not Checks.finite(item.get("startSeconds")) or absf(float(item.contactSeconds) - float(item.startSeconds)) > EPSILON: errors.append(label + "." + str(key) + ": contact/release must equal active start")
  var index: int = PHASES.find(parts[1])
  if index == 0: continue
  var previous: Variant = bindings.get(group + "." + PHASES[index - 1])
  if not previous is Dictionary or previous.get("clipName") != item.get("clipName") or not Checks.finite(previous.get("endSeconds")) or not Checks.finite(item.get("startSeconds")) or absf(float(previous.endSeconds) - float(item.startSeconds)) > EPSILON: errors.append(label + "." + str(key) + ": adjacent phases must share one clip and boundary")
 var loops: Variant = value.get("locomotion")
 if not loops is Dictionary:
  errors.append(label + ".locomotion: four directional bindings required")
  return
 if not Checks.same_ids(loops.keys(), DIRECTIONS): errors.append(label + ".locomotion: exactly forward/backward/left/right required")
 for direction in loops:
  var loop: Variant = loops[direction]
  binding(loop, label + ".locomotion." + str(direction), errors)
  if not loop is Dictionary: continue
  if loop.get("mode") != "loop" or not number(loop.get("strideDistance"), 0.0): errors.append(label + ".locomotion." + str(direction) + ": positive finite strideDistance and loop required")
 var forward: Variant = loops.get("forward")
 var move: Variant = bindings.get("Move")
 if forward is Dictionary and move is Dictionary:
  for field in ["clipName", "startSeconds", "endSeconds", "mode"]:
   if forward.get(field) != move.get(field): errors.append(label + ".Move: must alias forward locomotion")
 var idle: Variant = bindings.get("Idle")
 if idle is Dictionary and number(value.get("idleCycleSeconds"), 0.0) and Checks.finite(idle.get("startSeconds")) and Checks.finite(idle.get("endSeconds")):
  if absf(float(idle.endSeconds) - float(idle.startSeconds) - float(value.idleCycleSeconds)) > EPSILON: errors.append(label + ".idleCycleSeconds: must equal Idle binding span")

static func validate(value: Variant, definitions: Dictionary, resources: Dictionary, semantics: Dictionary) -> Array[String]:
 var errors: Array[String] = []
 var characters: Array = Checks.schema(value, "hero-animations", "characters", errors)
 if not value is Dictionary: return errors
 var sources: Dictionary = {}
 var summaries: Variant = value.get("sources")
 if not summaries is Array: errors.append("hero-animations.sources: expected minimal source summaries")
 else:
  for source in summaries:
   if not source is Dictionary or not source.get("id") is String or source.get("id", "").is_empty() or sources.has(source.get("id")) or source.get("status") != "accepted":
    errors.append("hero-animations.sources: unique accepted source summaries required")
    continue
   sources[source.id] = source.status
 var ids: Array = []
 for item in characters:
  if item is Dictionary: ids.append(item.get("characterId"))
  profile(item, definitions, resources, semantics, sources, errors)
 if not Checks.same_ids(ids, definitions.keys()): errors.append("hero-animations.characters: exactly one profile per roster definition required")
 return errors
