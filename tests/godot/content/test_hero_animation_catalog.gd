extends GutTest
const Hero = preload("res://game/content/hero_animation_catalog.gd")
const Catalogue = preload("res://game/content/catalogue.gd")

func fixture() -> Dictionary:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var records: Array = []
 for id in content.roster:
  var bindings: Dictionary = {}
  for key in content.clips[id]:
   var binding := {"clipName": key, "startSeconds": 0.0, "endSeconds": 0.6, "mode": "phase"}
   if key in ["Idle", "Move"]: binding.mode = "loop"
   elif key == "Hurt": binding.mode = "reaction"
   elif "." in key:
    var parts: PackedStringArray = key.split(".")
    var index: int = ["windup", "active", "recovery"].find(parts[1])
    binding.clipName = parts[0]
    binding.actionGroup = parts[0]
    binding.startSeconds = float(index) * 0.2
    binding.endSeconds = float(index + 1) * 0.2
    if index == 1: binding.contactSeconds = binding.startSeconds
   bindings[key] = binding
  var loops: Dictionary = {}
  for direction in ["forward", "backward", "left", "right"]:
   loops[direction] = {"clipName": "Move" if direction == "forward" else "Move_" + direction, "startSeconds": 0.0, "endSeconds": 0.6, "mode": "loop", "strideDistance": 1.2}
  records.append({"characterId": id, "modelKey": content.definitions[id].presentation.modelKey, "sourceRecordIds": ["original"], "bindings": bindings, "locomotion": loops, "idleCycleSeconds": 0.6, "hurtSeconds": 0.15, "knockoutSeconds": 0.6, "transitionSeconds": {"action": 0.05}, "reactionBoneNames": ["Torso"], "secondaryMotionBoneNames": [], "rigidGroups": {"body": ["Plate"]} if id == "plates" else {"feathers": ["Wing.L", "Wing.R"]} if id == "crow" else {}})
 return {"catalogue": {"schemaVersion": 1, "sources": [{"id": "original", "status": "accepted"}], "characters": records}, "definitions": content.definitions, "resources": content.resources, "semantics": content.clips}

func errors(value: Dictionary) -> Array[String]:
 return Hero.validate(value.catalogue, value.definitions, value.resources, value.semantics)

func test_complete_synthetic_profiles_pass_without_loading_assets_or_mutation() -> void:
 var value := fixture()
 var original := value.duplicate(true)
 assert_eq(errors(value), [])
 assert_eq(value, original)

func test_exact_semantics_and_model_authority() -> void:
 for mutation in ["missing", "extra", "model", "identity", "duplicate"]:
  var value := fixture()
  var profile: Dictionary = value.catalogue.characters[0]
  match mutation:
   "missing": profile.bindings.erase("Dodge")
   "extra": profile.bindings["NewAbility"] = profile.bindings.Idle.duplicate()
   "model": profile.modelKey = "crow"
   "identity": profile.characterId = "unknown"
   "duplicate": value.catalogue.characters[1] = profile.duplicate(true)
  assert_gt(errors(value).size(), 0, mutation)

func test_source_summaries_must_be_unique_accepted_and_referenced() -> void:
 for mutation in ["missing", "rejected", "duplicate", "empty", "unknown"]:
  var value := fixture()
  match mutation:
   "missing": value.catalogue.erase("sources")
   "rejected": value.catalogue.sources[0].status = "pending"
   "duplicate": value.catalogue.sources.append(value.catalogue.sources[0].duplicate())
   "empty": value.catalogue.characters[0].sourceRecordIds = []
   "unknown": value.catalogue.characters[0].sourceRecordIds = ["missing"]
  assert_gt(errors(value).size(), 0, mutation)

func test_four_directional_loops_and_move_alias_are_required() -> void:
 for mutation in ["missing", "extra", "stride", "mode", "alias"]:
  var value := fixture()
  var profile: Dictionary = value.catalogue.characters[0]
  match mutation:
   "missing": profile.locomotion.erase("backward")
   "extra": profile.locomotion.up = profile.locomotion.forward.duplicate()
   "stride": profile.locomotion.left.strideDistance = 0
   "mode": profile.locomotion.right.mode = "phase"
   "alias": profile.locomotion.forward.clipName = "Other"
  assert_gt(errors(value).size(), 0, mutation)

func test_contiguous_phases_share_clip_group_and_immediate_contact() -> void:
 for mutation in ["gap", "clip", "group", "contact", "missingContact", "missingGroup"]:
  var value := fixture()
  var binding: Dictionary = value.catalogue.characters[0].bindings["cow1.active"]
  match mutation:
   "gap": binding.startSeconds += 0.01
   "clip": binding.clipName = "Other"
   "group": binding.actionGroup = "Other"
   "contact": binding.contactSeconds = 0.3
   "missingContact": binding.erase("contactSeconds")
   "missingGroup": binding.erase("actionGroup")
  assert_gt(errors(value).size(), 0, mutation)

func test_finite_timing_and_presentation_bounds() -> void:
 for field in ["idleCycleSeconds", "hurtSeconds", "knockoutSeconds"]:
  for invalid in [0, -1, INF, NAN, "bad", null]:
   var value := fixture()
   value.catalogue.characters[0][field] = invalid
   assert_gt(errors(value).size(), 0, field + "=" + str(invalid))
 for pair in [["hurtSeconds", 0.31], ["knockoutSeconds", 1.01]]:
  var value := fixture()
  value.catalogue.characters[0][pair[0]] = pair[1]
  assert_gt(errors(value).size(), 0)
 for invalid in [-0.1, 0.11, INF, NAN, "bad"]:
  var value := fixture()
  value.catalogue.characters[0].transitionSeconds.action = invalid
  assert_gt(errors(value).size(), 0)

func test_bindings_reject_rest_clips_invalid_intervals_and_hold_samples() -> void:
 for pair in [["clipName", "RESET"], ["clipName", ""], ["startSeconds", -1], ["endSeconds", 0], ["endSeconds", INF], ["startSeconds", NAN], ["mode", "unknown"], ["contactSeconds", 2]]:
  var value := fixture()
  value.catalogue.characters[0].bindings.Dodge[pair[0]] = pair[1]
  assert_gt(errors(value).size(), 0, str(pair))
 var value := fixture()
 value.catalogue.characters[0].bindings.KnockedOut.mode = "hold"
 assert_gt(errors(value).size(), 0, "hold requires explicit endpoint")
 value.catalogue.characters[0].bindings.KnockedOut.fixedSampleSeconds = 0.6
 assert_eq(errors(value), [])
 value.catalogue.characters[0].bindings.KnockedOut.fixedSampleSeconds = 2
 assert_gt(errors(value).size(), 0)

func test_required_fields_and_malformed_types_fail_actionably_without_crashing() -> void:
 for field in fixture().catalogue.characters[0].keys():
  var value := fixture()
  value.catalogue.characters[0].erase(field)
  assert_gt(errors(value).size(), 0, field)
 for invalid in [null, [], "bad", 1]:
  var value := fixture()
  value.catalogue.characters[0] = invalid
  assert_gt(errors(value).size(), 0)
  for field in ["bindings", "locomotion", "transitionSeconds", "rigidGroups", "reactionBoneNames", "sourceRecordIds"]:
   value = fixture()
   value.catalogue.characters[0][field] = invalid
   assert_gt(errors(value).size(), 0, field)

func test_masks_and_anatomy_groups_do_not_allow_root_or_duplicate_names() -> void:
 for field in ["reactionBoneNames", "secondaryMotionBoneNames"]:
  for invalid in [["Root"], [""], ["Torso", "Torso"], [3]]:
   var value := fixture()
   value.catalogue.characters[0][field] = invalid
   assert_gt(errors(value).size(), 0)
 for id in ["crow", "plates"]:
  var value := fixture()
  for profile in value.catalogue.characters:
   if profile.characterId == id: profile.rigidGroups = {}
  assert_gt(errors(value).size(), 0, id + " anatomy groups required")
