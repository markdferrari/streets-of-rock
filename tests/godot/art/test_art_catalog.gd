extends GutTest
const Art = preload("res://game/content/art_catalog.gd")
const ROOM_IDS = {"dance-floor": "exterior", "vip-lounge": "bar", "backstage-corridor": "dance-floor", "alley-exit": "stage-vip"}
const CUES = {"exterior": ["frontage", "club-sign", "neon-doorway", "light-spill", "pavement", "queue-barriers", "event-posters"], "bar": ["long-counter", "bottle-shelves", "stools", "booths", "warm-light", "neon-accents"], "dance-floor": ["dance-floor", "dj-booth", "large-speakers", "overhead-fixtures", "coloured-light-pools"], "stage-vip": ["curtains", "stage-backdrop", "vip-seating", "club-branding", "dramatic-light"]}
func fixture() -> Dictionary:
 var rooms := {"schemaVersion": 1, "rooms": []}
 var enemies := {"schemaVersion": 1, "enemies": []}
 var resources := {"art": {}}
 for area in ROOM_IDS:
  var id: String = ROOM_IDS[area]
  rooms.rooms.append({"areaId": area, "visualId": id, "sceneResourceId": id, "requiredLandmarks": CUES[id].duplicate(), "dependencyIds": [], "coverageBounds": {"minX": -2.0, "maxX": 18.0, "minDepth": -8.0, "maxDepth": 8.0}, "reviewSubjectId": id})
  resources.art[id] = {"path": "scenes/art/rooms/" + id + ".tscn", "sourceRecordIds": ["fixture-original"], "dependencyIds": []}
 for role in ["grunt", "zoner", "enforcer", "liam"]:
  var moves: Array = {"grunt": ["grunt"], "zoner": ["throw"], "enforcer": ["charge"], "liam": ["close", "rope", "shockwave"]}[role]
  var keys := ["Idle", "Move", "Hurt", "Defeated"]
  if role != "liam": keys.append("Stunned")
  for move in moves:
   for phase in ["windup", "active", "recovery"]: keys.append(move + "." + phase)
  var bindings: Dictionary = {}
  for key in keys: bindings[key] = {"clipName": key.replace(".", "_"), "startSeconds": 0.0, "endSeconds": 1.0, "loop": key in ["Idle", "Move", "Stunned"]}
  enemies.enemies.append({"role": role, "sceneResourceId": role, "sourceRecordIds": ["fixture-original"], "transform": {"scale": 1.0, "footOffset": 0.0, "facingCorrection": 0.0}, "visualEnvelope": {"width": 1.0, "height": 2.0, "depth": 1.0}, "allowedMoveIds": moves, "clipBindings": bindings, "defeatHoldTicks": 21, "reviewSubjectId": role})
  resources.art[role] = {"path": "assets/enemies/" + role + "/runtime/character.glb", "sourceRecordIds": ["fixture-original"], "dependencyIds": []}
 return {"rooms": rooms, "enemies": enemies, "resources": resources, "provenance": {"schemaVersion": 1, "sources": [{"id": "fixture-original", "status": "accepted"}]}}
func errors(f: Dictionary) -> Array[String]:
 return Art.validate(f.rooms, f.enemies, f.resources, f.provenance)
func test_minimal_isolated_catalogues_have_exact_four_room_and_role_coverage() -> void:
 assert_eq(errors(fixture()), [] as Array[String])
 var f := fixture()
 f.rooms.rooms.remove_at(2)
 assert_false(errors(f).is_empty(), "all four rooms are required")
 f = fixture()
 f.enemies.enemies.append(f.enemies.enemies[0].duplicate(true))
 assert_true(str(errors(f)).contains("grunt"), "duplicate role must identify subject")
func test_unknown_schema_and_wrong_stable_mapping_are_rejected() -> void:
 var f := fixture()
 f.rooms.schemaVersion = 2
 assert_true(str(errors(f)).contains("schemaVersion"))
 f = fixture()
 f.rooms.rooms[0].visualId = "bar"
 assert_true(str(errors(f)).contains("dance-floor"))
func test_required_landmarks_and_finite_ordered_coverage_are_checked() -> void:
 var f := fixture()
 f.rooms.rooms[0].requiredLandmarks.erase("event-posters")
 assert_true(str(errors(f)).contains("event-posters"))
 f = fixture()
 f.rooms.rooms[1].coverageBounds.maxX = NAN
 assert_true(str(errors(f)).contains("coverageBounds"))
func test_safe_paths_accepted_source_refs_and_dependency_closure_are_required() -> void:
 for path in ["../escape.glb", "/tmp/escape.glb", "https://supplier/rig.glb", "C:\\rig.glb", "assets//rig.glb"]:
  var f := fixture()
  f.resources.art.grunt.path = path
  assert_true(str(errors(f)).contains("grunt"), path)
 var f := fixture()
 f.provenance.sources[0].status = "candidate"
 assert_true(str(errors(f)).contains("fixture-original"))
 f = fixture()
 f.resources.art.grunt.dependencyIds = ["missing-texture"]
 assert_true(str(errors(f)).contains("missing-texture"))
 f = fixture()
 f.resources.art.grunt.dependencyIds = ["zoner"]
 f.resources.art.zoner.dependencyIds = ["grunt"]
 assert_true(str(errors(f)).contains("cycle"))
func test_semantics_match_role_moves_and_normal_stun_is_required() -> void:
 var f := fixture()
 f.enemies.enemies[0].clipBindings.erase("Stunned")
 assert_true(str(errors(f)).contains("Stunned"))
 f = fixture()
 f.enemies.enemies[3].allowedMoveIds = ["close"]
 assert_true(str(errors(f)).contains("liam"))
 f = fixture()
 f.enemies.enemies[2].clipBindings["throw.active"] = f.enemies.enemies[2].clipBindings["charge.active"].duplicate()
 assert_true(str(errors(f)).contains("throw.active"))
func test_nonfinite_transforms_envelopes_segments_and_held_samples_fail() -> void:
 var f := fixture()
 f.enemies.enemies[0].transform.scale = INF
 assert_true(str(errors(f)).contains("transform"))
 f = fixture()
 f.enemies.enemies[0].visualEnvelope.height = -1
 assert_true(str(errors(f)).contains("visualEnvelope"))
 f = fixture()
 f.enemies.enemies[0].clipBindings.Idle.startSeconds = 2.0
 assert_true(str(errors(f)).contains("Idle"))
 f = fixture()
 f.enemies.enemies[1].clipBindings.Stunned.fixedSampleSeconds = NAN
 assert_true(str(errors(f)).contains("fixedSampleSeconds"))
func test_malformed_field_types_produce_diagnostics_instead_of_script_errors() -> void:
 for mutation in ["enemies", "rooms", "binding", "transform", "resource", "dependency"]:
  var f := fixture()
  match mutation:
   "enemies": f.enemies.enemies = "invalid"
   "rooms": f.rooms.rooms = [null]
   "binding": f.enemies.enemies[0].clipBindings.Idle = 5
   "transform": f.enemies.enemies[0].transform = []
   "resource": f.resources.art.grunt = "invalid"
   "dependency": f.resources.art.grunt.dependencyIds = "invalid"
  assert_false(errors(f).is_empty(), mutation)
func test_valid_catalogue_survives_real_json_number_decoding() -> void:
 var parsed: Dictionary = JSON.parse_string(JSON.stringify(fixture()))
 assert_eq(errors(parsed), [] as Array[String], "whole JSON numbers decode as floats but remain valid integer counts")
