extends RefCounted

const FIELDS := {
 "root": ["schemaVersion", "id", "displayName", "description", "fightingStyle", "player", "partner", "presentation"],
 "player": ["maxHp", "moveSpeed", "light", "heavy", "dodge", "special"],
 "move": ["windupTicks", "activeTicks", "recoveryTicks", "damage", "range", "depthTolerance", "knockback"],
 "dodge": ["durationTicks", "speed", "invulnerabilityTicks", "cooldownTicks"],
 "partner": ["maxHp", "moveSpeed", "catchUpSpeed", "supportDamage", "supportCooldownTicks", "animationKey"],
 "presentation": ["modelKey", "portraitKey", "animationSetKey", "soundSetKey", "specialLabel"],
 "areaStrike": ["kind", "windupTicks", "activeTicks", "recoveryTicks", "damage", "range", "depthTolerance", "knockback"],
 "roar": ["kind", "windupTicks", "activeTicks", "recoveryTicks", "radius", "stunTicks", "bossDamage"],
 "straightProjectile": ["kind", "windupTicks", "activeTicks", "recoveryTicks", "projectileKey", "speed", "maxDistance", "damage", "collisionRadius"]
}

static func exact(value: Variant, fields: Array, path: String, errors: Array[String]) -> bool:
 if not value is Dictionary:
  errors.append(path + ": object required")
  return false
 for key in value:
  if not key in fields:
   errors.append(path + "." + str(key) + ": unknown field")
 for key in fields:
  if not value.has(key):
   errors.append(path + "." + key + ": required field missing")
 return true

static func numbers(value: Dictionary, path: String, errors: Array[String]) -> void:
 for key in value:
  if key in ["kind", "animationKey", "projectileKey"]:
   continue
  var number: Variant = value[key]
  if not (number is int or number is float) or not is_finite(float(number)):
   errors.append(path + "." + str(key) + ": finite number required")
   continue
  if key == "knockback":
   if float(number) < 0.0:
    errors.append(path + ".knockback: nonnegative number required")
  elif float(number) <= 0.0:
   errors.append(path + "." + str(key) + ": positive number required")
  if str(key).ends_with("Ticks") and float(number) != floor(float(number)):
   errors.append(path + "." + str(key) + ": integer tick count required")

static func section(value: Variant, kind: String, path: String, errors: Array[String]) -> void:
 if exact(value, FIELDS[kind], path, errors):
  numbers(value, path, errors)

static func validate(definition: Variant, resources: Dictionary, clips: Dictionary) -> Array[String]:
 var errors: Array[String] = []
 if not exact(definition, FIELDS.root, "character", errors):
  return errors
 var id := str(definition.get("id", ""))
 var regex := RegEx.new()
 regex.compile("^[a-z0-9]+(-[a-z0-9]+)*$")
 if not definition.get("id") is String or regex.search(id) == null:
  errors.append("character.id: lowercase kebab-case required")
 if definition.get("schemaVersion") != 1:
  errors.append(id + ".schemaVersion: expected 1")
 for key in ["displayName", "description", "fightingStyle"]:
  var text: Variant = definition.get(key)
  if not text is String or str(text).strip_edges().is_empty() or str(text) == "TODO":
   errors.append(id + "." + key + ": nonempty completed text required")
 var player: Variant = definition.get("player")
 if exact(player, FIELDS.player, id + ".player", errors):
  numbers({"maxHp":player.get("maxHp"), "moveSpeed":player.get("moveSpeed")}, id + ".player", errors)
  var light: Variant = player.get("light")
  if not light is Array or light.size() != 3:
   errors.append(id + ".player.light: exactly three moves required")
  else:
   for i in range(3):
    section(light[i], "move", id + ".player.light[" + str(i) + "]", errors)
  section(player.get("heavy"), "move", id + ".player.heavy", errors)
  section(player.get("dodge"), "dodge", id + ".player.dodge", errors)
  var special: Variant = player.get("special")
  if not special is Dictionary or not str(special.get("kind")) in ["areaStrike", "roar", "straightProjectile"]:
   errors.append(id + ".player.special.kind: unsupported Special")
  else:
   section(special, special.kind, id + ".player.special", errors)
   if special.kind == "straightProjectile" and not resources.get("props", {}).has(special.get("projectileKey")):
    errors.append(id + ".player.special.projectileKey: unknown bundled prop")
 var partner: Variant = definition.get("partner")
 section(partner, "partner", id + ".partner", errors)
 if partner is Dictionary and not partner.get("animationKey") in resources.get("supportAnimations", []):
  errors.append(id + ".partner.animationKey: unknown semantic support animation")
 var presentation: Variant = definition.get("presentation")
 if exact(presentation, FIELDS.presentation, id + ".presentation", errors):
  for key in FIELDS.presentation:
   if not presentation.get(key) is String or str(presentation.get(key)).strip_edges().is_empty():
    errors.append(id + ".presentation." + key + ": nonempty key/label required")
  var categories := {"modelKey":"models", "portraitKey":"portraits", "animationSetKey":"animationSets", "soundSetKey":"sounds"}
  for key in categories:
   if not resources.get(categories[key], {}).has(presentation.get(key)):
    errors.append(id + ".presentation." + key + ": unknown bundled resource")
  var names: Variant = clips.get(presentation.get("animationSetKey"))
  if not names is Array or names.is_empty():
   errors.append(id + ".presentation.animationSetKey: missing semantic clip requirements")
  else:
   var seen: Dictionary = {}
   for name in names:
    if not name is String or name.is_empty() or seen.has(name):
     errors.append(id + ".presentation.animationSetKey: invalid/duplicate clip")
    seen[name] = true
 return errors
