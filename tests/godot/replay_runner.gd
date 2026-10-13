extends SceneTree
const Catalogue = preload("res://game/content/catalogue.gd")
const Clocks = preload("res://game/app/clocks.gd")
const Step = preload("res://game/simulation/step.gd")
const Camera = preload("res://game/presentation/camera_math.gd")
const Arena = preload("res://game/simulation/arena.gd")
func _initialize() -> void:
 var content := Catalogue.new()
 if not content.load_catalogue():
  push_error(str(content.errors))
  quit(1)
  return
 var manifest: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/reference/manifest.json"))
 var outputs: Dictionary = {}
 for entry in manifest.fixtures:
  var fixture: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/reference/" + entry.path))
  var run: Dictionary = fixture.startingRun.duplicate(true)
  var clock := Clocks.new()
  var previous: Dictionary = {}
  var frames: Array = []
  for expected in fixture.frames:
   var camera := Camera.compute(run, expected.viewport, {"player": content.resources.bodyEnvelopes[run.duo.fighterId], "partner": content.resources.bodyEnvelopes[run.duo.partnerId]}, content, previous, 0.1)
   previous = camera
   var arena := Arena.build(run, camera, content.resources.bodyEnvelopes[run.duo.partnerId], "partner", content)
   arena.playerVisibleRegions = Arena.build(run, camera, content.resources.bodyEnvelopes[run.duo.fighterId], "player", content).visibleRegions
   var events: Array = []
   var steps: int = clock.frame(expected.timestampMs, expected.running)
   for index in range(steps): events.append_array(Step.step_run(run, expected.input, content, arena))
   frames.append({"timestampMs": expected.timestampMs, "running": expected.running, "viewport": expected.viewport, "input": expected.input, "arena": arena, "events": events, "steps": steps, "discardedMs": clock.discarded_ms, "state": run.duplicate(true)})
  outputs[entry.id] = frames
 var output := FileAccess.open("res://.tmp/parity.json", FileAccess.WRITE)
 output.store_string(JSON.stringify(outputs))
 print("Replayed ", manifest.fixtures.size(), " fixtures in Godot")
 quit(0)
