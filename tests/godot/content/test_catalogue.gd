extends GutTest
const Catalogue = preload("res://game/content/catalogue.gd")
const Validator = preload("res://game/content/validator.gd")

func source(id: String) -> Dictionary:
 var path := "res://content/characters/" + id + ".json"
 if not FileAccess.file_exists(path):
  path = "res://src/content/characters/" + id + ".json"
 return JSON.parse_string(FileAccess.get_file_as_string(path))

func resources() -> Dictionary:
 return {"models":{"cow":"assets/cow.glb","crow":"assets/crow.glb","lion":"assets/lion.glb","plates":"assets/plates.glb"},"portraits":{"cow":"cow.png","crow":"crow.png","lion":"lion.png","plates":"plates.png"},"sounds":{"cow":[],"crow":[],"lion":[],"plates":[]},"animationSets":{"cow":"cow","crow":"crow","lion":"lion","plates":"plates"},"props":{"headrest":"headrest.glb"},"supportAnimations":["cow-support","crow-support","lion-support","plates-support"]}

func test_shipped_catalogue_loads_unchanged_values_and_order() -> void:
 var catalogue := Catalogue.new()
 assert_true(catalogue.load_catalogue(), str(catalogue.errors))
 assert_eq(catalogue.roster, ["cow", "crow", "lion", "plates"])
 for id in ["cow", "crow", "lion", "plates"]:
  assert_eq(catalogue.definitions.get(id), source(id))
 if catalogue.definitions.has("cow"):
  assert_true(catalogue.definitions.is_read_only())
  assert_true(catalogue.definitions.cow.player.light.is_read_only())

func test_rejects_malformed_fields_with_actionable_paths() -> void:
 for field in ["maxHp", "moveSpeed"]:
  for value in [0, -1, "bad", INF, NAN]:
   var definition := source("cow")
   definition.player[field] = value
   var errors := Validator.validate(definition, resources(), {"cow":["Idle"]})
   assert_true(errors.any(func(e: String) -> bool: return e.contains("player." + field)), str(errors))
 for value in [-1, "bad", INF]:
  var definition := source("cow")
  definition.player.heavy.knockback = value
  assert_true(Validator.validate(definition, resources(), {"cow":["Idle"]}).any(func(e: String) -> bool: return e.contains("heavy.knockback")))

func test_rejects_schema_identity_move_timing_and_resource_constraints() -> void:
 var cases: Array = [["schemaVersion",2],["id","Bad ID"],["unknown",true]]
 for item in cases:
  var definition := source("cow")
  definition[item[0]] = item[1]
  assert_gt(Validator.validate(definition, resources(), {"cow":["Idle"]}).size(), 0)
 var definition := source("cow")
 definition.player.light.pop_back()
 assert_gt(Validator.validate(definition, resources(), {"cow":["Idle"]}).size(), 0)
 definition = source("cow")
 definition.player.heavy.windupTicks = 1.5
 assert_gt(Validator.validate(definition, resources(), {"cow":["Idle"]}).size(), 0)
 definition = source("cow")
 definition.player.special.kind = "unsupported"
 assert_gt(Validator.validate(definition, resources(), {"cow":["Idle"]}).size(), 0)
 definition = source("cow")
 definition.presentation.modelKey = "missing"
 assert_gt(Validator.validate(definition, resources(), {"cow":["Idle"]}).size(), 0)
 definition = source("plates")
 definition.player.special.projectileKey = "missing"
 assert_gt(Validator.validate(definition, resources(), {"plates":["Idle"]}).size(), 0)
 assert_eq(Validator.validate(source("cow"), resources(), {"cow":["Idle"]}), [])

func test_distinct_duos_and_clip_keys() -> void:
 var catalogue := Catalogue.new()
 catalogue.load_catalogue()
 assert_false(catalogue.roster.size() != 4 or catalogue.roster.has("missing"))
 assert_gt(Validator.validate(source("cow"), resources(), {}).size(), 0)
