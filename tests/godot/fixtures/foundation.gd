extends Node3D
const Catalogue = preload("res://game/content/catalogue.gd")
const Store = preload("res://game/content/resource_store.gd")
const View = preload("res://game/presentation/character_view.gd")
const GestureButton = preload("res://game/platform/gesture_button.gd")
const Bridge = preload("res://game/platform/browser_bridge.gd")
var activations: int = 0
var semantic_activations: int = 0
var audio_starts: int = 0
var paused: bool = false
var touches: Dictionary = {}
var movement: Vector2 = Vector2.ZERO
var movement_owner: int = -1
var view: Node3D
var store := Store.new()
var bridge := Bridge.new()
var audio := AudioStreamPlayer.new()
var activate_button := GestureButton.new()
var resume_button := GestureButton.new()
var phase: float = 0.0
var fixture_ready: bool = false

func _ready() -> void:
 var content := Catalogue.new()
 if not content.load_catalogue() or not store.prepare_hero(content,"cow"):
  push_error("Foundation visual resource failed: " + str(content.errors) + str(store.errors))
  return
 view = View.new()
 add_child(view)
 view.attach(store.create("cow"))
 view.pose(0.0, 0.0, 1, "Idle", 0.0)
 var camera := Camera3D.new()
 camera.projection = Camera3D.PROJECTION_ORTHOGONAL
 camera.size = 7.0
 camera.position = Vector3(0.0, 8.0, 12.0)
 add_child(camera)
 camera.look_at(Vector3(0.0, 1.3, 0.0))
 var light := DirectionalLight3D.new()
 light.rotation_degrees = Vector3(-45.0, -30.0, 0.0)
 add_child(light)
 var layer := CanvasLayer.new()
 add_child(layer)
 activate_button.text = "Activate"
 activate_button.position = Vector2(610.0, 280.0)
 activate_button.size = Vector2(180.0, 60.0)
 layer.add_child(activate_button)
 resume_button.text = "Resume"
 resume_button.position = Vector2(610.0, 200.0)
 resume_button.size = Vector2(180.0, 60.0)
 layer.add_child(resume_button)
 audio.stream = load("res://public/assets/audio/music-placeholder.wav")
 add_child(audio)
 activate_button.focus_mode = Control.FOCUS_NONE
 resume_button.focus_mode = Control.FOCUS_NONE
 activate_button.pressed.connect(_activate.bind(false))
 resume_button.pressed.connect(_resume)
 bridge.message.connect(_on_browser_message)
 bridge.initialize()
 _layout()
 _publish_ui()
 fixture_ready = true
 _snapshot()

func _process(delta: float) -> void:
 if not paused and view != null:
  phase = fmod(phase + delta * 0.5, 1.0)
  view.pose(0.0, 0.0, 1, "Idle", phase)
 _publish_ui()
 _snapshot()

func _snapshot() -> void:
 if OS.has_feature("web"):
  JavaScriptBridge.eval("window.__sorTest = " + JSON.stringify({"ready":fixture_ready,"activations":activations,"semanticActivations":semantic_activations,"paused":paused,"touches":touches.size(),"movement":{"x":movement.x,"depth":movement.y},"audioStarts":audio_starts,"audioPlaying":audio.playing,"pose":phase,"ownedInstances":store.live_count()}))

func _exit_tree() -> void:
 bridge.dispose()
 for instance in store.owned.values().duplicate():
  store.release(instance)

func _layout() -> void:
 var env := bridge.environment
 var width: float = float(env.get("width", 844.0))
 var height: float = float(env.get("height", 390.0))
 get_viewport().content_scale_size = Vector2i(int(width), int(height))
 get_viewport().content_scale_mode = Window.CONTENT_SCALE_MODE_CANVAS_ITEMS
 activate_button.position = Vector2(maxf(150.0, width - 234.0), height - 110.0)
 resume_button.position = Vector2(maxf(150.0, width - 234.0), height - 190.0)

func _publish_ui() -> void:
 resume_button.disabled = not paused
 var controls: Array = []
 for item in [["activate", activate_button], ["resume", resume_button]]:
  var button: Button = item[1]
  controls.append({"id":item[0], "role":"button", "name":button.text, "disabled":button.disabled, "bounds":{"x":button.position.x,"y":button.position.y,"width":button.size.x,"height":button.size.y}})
 bridge.publish_ui(1, controls)

func _activate(semantic: bool) -> void:
 if paused:
  return
 activations += 1
 if semantic:
  semantic_activations += 1
 audio.play()
 audio_starts += 1
 _snapshot()

func _safe() -> bool:
 var env := bridge.environment
 return bool(env.get("visible", true)) and bool(env.get("focused", true)) and not bool(env.get("portrait", false))

func _clear_input() -> void:
 activate_button.cancel_all()
 resume_button.cancel_all()
 touches.clear()
 movement_owner = -1
 movement = Vector2.ZERO

func _resume() -> void:
 if paused and _safe():
  _clear_input()
  paused = false
  audio.stream_paused = false
 _publish_ui()
 _snapshot()

func _on_browser_message(value: Dictionary) -> void:
 if value.get("type") == "environment":
  _clear_input()
  _layout()
  if not _safe():
   paused = true
   audio.stream_paused = true
 elif value.get("type") == "touchCancel":
  for index in value.get("indices", []):
   activate_button.cancel_source(int(index))
   resume_button.cancel_source(int(index))
   touches.erase(int(index))
   if movement_owner == int(index):
    movement_owner = -1
    movement = Vector2.ZERO
 elif value.get("type") == "uiIntent" and value.get("generation") == 1:
  if value.get("kind") == "activate":
   if value.get("id") == "activate":
    _activate(true)
   elif value.get("id") == "resume":
    _resume()
  elif value.get("kind") == "focus":
   activate_button.modulate = Color.YELLOW if value.get("id") == "activate" else Color.WHITE
   resume_button.modulate = Color.YELLOW if value.get("id") == "resume" else Color.WHITE
 _publish_ui()
 _snapshot()

func _input(event: InputEvent) -> void:
 if paused:
  return
 if event is InputEventScreenTouch:
  if event.pressed and not event.canceled:
   touches[event.index] = event.position
   if movement_owner < 0 and event.position.x < 150.0:
    movement_owner = event.index
  else:
   touches.erase(event.index)
   if movement_owner == event.index:
    movement_owner = -1
    movement = Vector2.ZERO
 elif event is InputEventScreenDrag and event.index == movement_owner:
  var offset: Vector2 = (event.position - Vector2(70.0, float(bridge.environment.get("height", 390)) - 90.0)).limit_length(60.0) / 60.0
  movement = offset if offset.length() > 0.15 else Vector2.ZERO
 _snapshot()
