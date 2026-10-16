extends Node3D
## Web Test only. Partial trial clips never enter the production profile validator.
const Store = preload("res://game/content/resource_store.gd")
const Catalogue = preload("res://game/content/catalogue.gd")
const Run = preload("res://game/simulation/run_state.gd")
const CameraMath = preload("res://game/presentation/camera_math.gd")
var auto_load := true
var views: Dictionary = {}
var errors: Array[String] = []
var fixture_ready := false
var paused := false
var elapsed := 0.0
var facing := 1
var action := "Idle"
var character := "cow"
var camera: Camera3D
var callback: JavaScriptObject
var status: Label
var buttons: Dictionary = {}

static func find_skeleton(root: Node) -> Skeleton3D:
 if root is Skeleton3D: return root
 for child in root.get_children():
  var skeleton := find_skeleton(child)
  if skeleton != null: return skeleton
 return null

func _ready() -> void:
 camera = Camera3D.new()
 camera.projection = Camera3D.PROJECTION_ORTHOGONAL
 camera.size = 10.0
 camera.position = Vector3(0, 9.1, 12.0)
 add_child(camera)
 camera.look_at(Vector3(0, 1.1, 0))
 camera.current = true
 var light := DirectionalLight3D.new()
 light.rotation_degrees = Vector3(-45, -25, 0)
 light.light_energy = 1.4
 add_child(light)
 var environment := WorldEnvironment.new()
 var settings := Environment.new()
 settings.background_mode = Environment.BG_COLOR
 settings.background_color = Color("25232d")
 settings.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
 settings.ambient_light_color = Color("ddd6ec")
 settings.ambient_light_energy = 0.7
 environment.environment = settings
 add_child(environment)
 var floor := MeshInstance3D.new()
 var plane := PlaneMesh.new()
 plane.size = Vector2(40, 8)
 floor.mesh = plane
 floor.position.y = -0.02
 var material := StandardMaterial3D.new()
 material.albedo_color = Color("393640")
 floor.material_override = material
 add_child(floor)
 make_ui()
 if not auto_load: return
 if OS.has_feature("web"):
  var requested: String = str(JavaScriptBridge.eval("new URLSearchParams(location.search).get('character') || 'cow'", true))
  if requested in ["cow", "crow", "lion", "plates"]: character = requested
 load_character(character)
 if OS.has_feature("web"):
  callback = JavaScriptBridge.create_callback(browser_command)
  JavaScriptBridge.get_interface("window").__sorHeroReviewCommand = callback
  JavaScriptBridge.eval("window.__sorHeroReview={snapshot:()=>JSON.parse(window.__sorHeroReviewJson||'null'),command:(name,value)=>window.__sorHeroReviewCommand(JSON.stringify({name,value}))};window.addEventListener('blur',()=>window.__sorHeroReview.command('pause',true));document.addEventListener('visibilitychange',()=>{if(document.hidden)window.__sorHeroReview.command('pause',true)});window.addEventListener('resize',()=>window.__sorHeroReview.command('layout',{width:innerWidth,height:innerHeight}));window.__sorHeroReview.command('layout',{width:innerWidth,height:innerHeight});")
 publish()

func make_ui() -> void:
 var layer := CanvasLayer.new()
 add_child(layer)
 status = Label.new()
 status.position = Vector2(12, 8)
 status.add_theme_font_size_override("font_size", 15)
 layer.add_child(status)
 for index in range(3):
  var label := Label.new()
  label.text = ["CURRENT", "KAYKIT", "UNIVERSAL"][index]
  label.position = Vector2(44 + index * 277, 54)
  label.add_theme_font_size_override("font_size", 14)
  layer.add_child(label)
 var index := 0
 for name in ["Pause", "Face", "Idle", "Move", "Attack", "Cow", "Crow", "Lion", "Plates"]:
  var button := Button.new()
  button.text = name
  button.position = Vector2(8 + index * 92, 344)
  button.size = Vector2(88, 38)
  button.pressed.connect(func() -> void: command(name.to_lower(), null))
  layer.add_child(button)
  buttons[name.to_lower()] = button
  index += 1

func clear_views() -> void:
 for entry in views.values(): entry.root.free()
 views.clear()
 fixture_ready = false

func configure_sources(scenes: Dictionary, bindings: Dictionary) -> bool:
 clear_views()
 errors.clear()
 elapsed = 0.0
 var index := 0
 for source in scenes:
  if not scenes[source] is PackedScene:
   errors.append(str(source) + ": missing imported candidate; regenerate and import the trial")
   continue
  var root: Node3D = scenes[source].instantiate()
  add_child(root)
  root.position = Vector3((index - 1) * camera.size * (844.0 / 390.0) / 3.0, 0, 0)
  root.scale = Vector3.ONE * 1.25
  root.rotation.y = facing * PI / 2.0
  var player := Store.find_animation(root)
  var skeleton := find_skeleton(root)
  if player == null or skeleton == null:
   errors.append(str(source) + ": imported skeleton/animation missing")
   root.free()
   continue
  player.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
  var source_bindings: Dictionary = bindings.get(source, {}).duplicate()
  for semantic in ["Idle", "Move", "Attack"]:
   # Existing GLB import normalization is local to this review binding map.
   if source_bindings.get(semantic) is String:
    var original: String = source_bindings[semantic]
    var imported := original.replace(".", "_")
    if not player.has_animation(original) and player.has_animation(imported): source_bindings[semantic] = imported
   if not source_bindings.get(semantic) is String or not player.has_animation(str(source_bindings.get(semantic))): errors.append(str(source) + "." + semantic + ": missing required review clip " + str(source_bindings.get(semantic)))
  var sequence: Array = source_bindings.get("attackSequence", []).duplicate(true)
  for segment in sequence:
   segment.clipName = str(segment.clipName).replace(".", "_") if not player.has_animation(segment.clipName) else segment.clipName
   if not player.has_animation(segment.clipName) or not segment.seconds is float and not segment.seconds is int or float(segment.seconds) <= 0.0: errors.append(str(source) + ": invalid baseline attack sequence")
  views[source] = {"root": root, "player": player, "skeleton": skeleton, "bindings": source_bindings, "sequence": sequence, "clip": "", "time": 0.0}
  index += 1
 fixture_ready = errors.is_empty() and not views.is_empty()
 if fixture_ready: sample_at(0.0)
 publish()
 return fixture_ready

func load_character(id: String) -> void:
 var content := Catalogue.new()
 if not content.load_catalogue():
  errors.assign(content.errors)
  publish()
  return
 character = id
 var partner: String = "crow" if id == "cow" else "cow"
 var run := Run.create_run(1, {"fighterId": id, "partnerId": partner}, content)
 var frame := CameraMath.compute(run, {"width": 844, "height": 390}, {"player": content.resources.bodyEnvelopes[id], "partner": content.resources.bodyEnvelopes[partner]}, content)
 camera.size = frame.halfHeight * 2.0
 var scenes: Dictionary = {"current": load("res://" + content.resources.models[id])}
 var bindings: Dictionary = {"current": {"Idle": "Idle", "Move": "Move", "Attack": id + "1.active"}}
 var light: Dictionary = content.definitions[id].player.light[0]
 bindings.current.attackSequence = []
 for phase in ["windup", "active", "recovery"]:
  bindings.current.attackSequence.append({"clipName": id + "1." + phase, "seconds": float(light[phase + "Ticks"]) / 60.0})
 for source in ["kaykit", "universal"]:
  var path: String = "res://tests/godot/fixtures/hero-animation/candidates/" + id + "/" + source + "/character.glb"
  scenes[source] = load(path) if ResourceLoader.exists(path) else null
  bindings[source] = {"Idle": "Idle", "Move": "Move", "Attack": "Attack"}
 configure_sources(scenes, bindings)

func sample_source(source: String, normalized: float) -> void:
 if not views.has(source): return
 var entry: Dictionary = views[source]
 var clip: String = entry.bindings.get(action, "")
 var progress := clampf(normalized, 0.0, 1.0)
 if action == "Attack" and not entry.sequence.is_empty():
  var remaining: float = progress * duration_for(entry)
  for index in entry.sequence.size():
   var segment: Dictionary = entry.sequence[index]
   if remaining <= segment.seconds or index == entry.sequence.size() - 1:
    clip = segment.clipName
    progress = clampf(remaining / float(segment.seconds), 0.0, 1.0)
    break
   remaining -= segment.seconds
 if not entry.player.has_animation(clip): return
 entry.clip = clip
 entry.time = entry.player.get_animation(clip).length * progress
 entry.player.play(clip)
 entry.player.seek(entry.time, true)
 entry.player.advance(0.0)
 entry.player.pause()

func duration_for(entry: Dictionary) -> float:
 if action == "Attack" and not entry.sequence.is_empty():
  var duration := 0.0
  for segment in entry.sequence: duration += float(segment.seconds)
  return duration
 return entry.player.get_animation(entry.bindings[action]).length

func sample_at(normalized: float) -> void:
 for source in views: sample_source(source, normalized)
 publish()

func set_action(value: String) -> void:
 if not value in ["Idle", "Move", "Attack"]: return
 action = value
 elapsed = 0.0
 sample_at(0.0)

func set_facing(value: int) -> void:
 facing = -1 if value < 0 else 1
 for entry in views.values(): entry.root.rotation.y = facing * PI / 2.0
 publish()

func set_paused(value: bool) -> void:
 paused = value
 publish()

func advance(delta: float) -> void:
 if paused or not fixture_ready: return
 elapsed += clampf(delta, 0.0, 0.25)
 # Native 1x playback; explicit sample_at compares equal normalized landmarks.
 for source in views:
  var entry: Dictionary = views[source]
  var duration: float = duration_for(entry)
  sample_source(source, fmod(elapsed, duration) / duration)
 publish()

func command(name: String, value: Variant) -> void:
 match name:
  "pause": set_paused(not paused if value == null else bool(value))
  "face": set_facing(-facing)
  "facing": set_facing(int(value))
  "action": set_action(str(value))
  "idle", "move", "attack": set_action(name.capitalize())
  "sample":
   paused = true
   elapsed = clampf(float(value), 0.0, 1.0)
   sample_at(elapsed)
  "cow", "crow", "lion", "plates": load_character(name)
  "layout":
   get_tree().root.content_scale_size = Vector2i(int(value.width), int(value.height))
   if int(value.height) > int(value.width): set_paused(true)
 publish()

func browser_command(arguments: Array) -> Variant:
 var message: Dictionary = JSON.parse_string(str(arguments[0]))
 command(message.name, message.get("value"))
 return null

func snapshot() -> Dictionary:
 var result: Dictionary = {}
 for source in views:
  var entry: Dictionary = views[source]
  var skeleton: Skeleton3D = entry.skeleton
  var bones: Array = []
  for index in skeleton.get_bone_count():
   var q := skeleton.get_bone_pose_rotation(index)
   var p := skeleton.get_bone_pose_position(index)
   bones.append({"name": skeleton.get_bone_name(index), "rotation": [q.x, q.y, q.z, q.w], "position": [p.x, p.y, p.z]})
  result[source] = {"semantic": action, "clip": entry.clip, "duration": duration_for(entry), "time": entry.time, "facing": facing, "skeletonId": skeleton.get_instance_id(), "boneCount": skeleton.get_bone_count(), "bones": bones, "playing": entry.player.is_playing()}
 return {"ready": fixture_ready, "character": character, "action": action, "facing": facing, "paused": paused, "elapsed": elapsed, "views": result, "errors": errors, "camera": {"projection": "orthographic", "size": camera.size, "displayScale": 1.25, "playbackSpeed": 1.0, "scaleReference": "first-room gameplay camera"}, "ownerReview": "pending", "productionSelection": "pending"}

func publish() -> void:
 if status != null:
  status.text = "%s · %s · %s · REVIEW ONLY — source selection pending" % [character.capitalize(), action, "PAUSED" if paused else "PLAYING"]
  if not errors.is_empty(): status.text = str(errors)
 if buttons.has("pause"): buttons.pause.text = "Resume" if paused else "Pause"
 if OS.has_feature("web"): JavaScriptBridge.get_interface("window").__sorHeroReviewJson = JSON.stringify(snapshot())

func _process(delta: float) -> void:
 advance(delta)

func _exit_tree() -> void:
 if OS.has_feature("web"): JavaScriptBridge.eval("delete window.__sorHeroReview; delete window.__sorHeroReviewCommand; delete window.__sorHeroReviewJson;")
