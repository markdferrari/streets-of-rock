extends Node
const Catalogue = preload("res://game/content/catalogue.gd")
const Store = preload("res://game/content/resource_store.gd")
const Session = preload("res://game/app/run_session.gd")
const Clocks = preload("res://game/app/clocks.gd")
const State = preload("res://game/simulation/run_state.gd")
const Step = preload("res://game/simulation/step.gd")
const InputController = preload("res://game/input/input_controller.gd")
const World = preload("res://game/presentation/world_view.gd")
const View = preload("res://game/presentation/character_view.gd")
const Screen = preload("res://game/ui/session_screen.gd")
const Bridge = preload("res://game/platform/browser_bridge.gd")
const Tutorial = preload("res://game/ui/tutorial.gd")
const Persistence = preload("res://game/platform/persistence.gd")
const AudioController = preload("res://game/platform/audio.gd")
const Lifecycle = preload("res://game/platform/lifecycle.gd")
const Readiness = preload("res://game/ui/readiness.gd")
var content: RefCounted
var store: RefCounted
var session: RefCounted
var loop: RefCounted
var active_clock: RefCounted
var tutorial: RefCounted
var persistence: RefCounted
var lifecycle: RefCounted
var readiness: RefCounted
var diagnostics: Node
var input_controller: Node
var world: Node3D
var screen: Control
var bridge: RefCounted
var preview: SubViewportContainer
var preview_instance: Node3D
var preview_id: String = ""
var last_ui_generation: int = 0
var accepted_moves: Array = []
var last_events: Array = []
var settings: Dictionary = {"schemaVersion": 1, "musicVolume": 0.7, "effectsVolume": 0.8, "screenShake": true}
var environment: Dictionary = {"width": 844.0, "height": 390.0, "safeInsets": {"top": 0.0, "right": 0.0, "bottom": 0.0, "left": 0.0}, "visible": true, "focused": true, "portrait": false, "reducedMotion": false}
var audio: Node
var readiness_error: String = ""
var backdrop_catalogue: Dictionary = {}
func now() -> float: return float(Time.get_ticks_msec())
func _ready() -> void:
 RenderingServer.set_default_clear_color(Color("171024"))
 content = Catalogue.new()
 if not content.load_catalogue():
  push_error(str(content.errors))
  return
 store = Store.new()
 var backdrop_json: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://content/backdrops.json"))
 if backdrop_json is Dictionary: backdrop_catalogue = backdrop_json
 for id in content.roster:
  var definition: Dictionary = content.definitions[id]
  if not store.prepare(id, "res://" + content.resources.models[definition.presentation.modelKey], content.clips[definition.presentation.animationSetKey]): readiness_error = str(store.errors)
 session = Session.new(content)
 loop = Clocks.new()
 active_clock = Clocks.ActiveClock.new()
 tutorial = Tutorial.new()
 input_controller = InputController.new()
 add_child(input_controller)
 screen = Screen.new()
 var layer := CanvasLayer.new()
 add_child(layer)
 layer.add_child(screen)
 screen.action.connect(act)
 bridge = Bridge.new()
 bridge.message.connect(browser_message)
 persistence = Persistence.new(Callable(bridge, "read_stored"), Callable(bridge, "write_stored"))
 lifecycle = Lifecycle.new()
 readiness = Readiness.new()
 bridge.initialize()
 bridge.check_cache()
 if readiness_error.is_empty(): readiness.set_runtime_ready()
 else: readiness.set_runtime_error(readiness_error)
 if bridge.mode == "diagnostics" and ResourceLoader.exists("res://game/platform/diagnostics.gd"):
  diagnostics = load("res://game/platform/diagnostics.gd").new()
  add_child(diagnostics)
 settings = persistence.load_settings()
 persistence.load_best_result()
 tutorial = Tutorial.new(persistence.load_tutorial())
 if not bridge.environment.is_empty(): environment = bridge.environment
 else:
  var size := get_viewport().get_visible_rect().size
  environment.width = size.x
  environment.height = size.y
 audio = AudioController.new()
 add_child(audio)
 audio.apply_settings(settings)
 resize()
 render(0.0)
func safe() -> bool:
 return lifecycle.safe(environment)
func resize() -> void:
 get_tree().root.content_scale_size = Vector2i(int(environment.width), int(environment.height))
 if input_controller != null:
  clear_inputs()
  input_controller.center = Vector2(72 + environment.safeInsets.left, environment.height - 72 - environment.safeInsets.bottom)
  input_controller.knob = input_controller.center
 if world != null: world.frame = {}
 if screen != null: screen.render_key = ""
func clear_inputs() -> void:
 input_controller.clear()
 loop.reset()
 if not session.run.is_empty(): session.run.actors[0].erase("pendingAction")
 for control in screen.controls.values(): control.cancel_all()
func effects(effects_list: Array) -> void:
 for effect in effects_list:
  match effect.type:
   "clearInputs": clear_inputs()
   "disposeViews": dispose_world()
   "prepare": prepare_view.call_deferred(effect.generation)
   "launch":
    active_clock.start(now())
    audio.set_running(true)
func prepare_view(generation: int) -> void:
 if generation != session.generation: return
 # Retry rechecks required visuals; a failed import cannot launch a partial world.
 readiness_error = ""
 for id in content.roster:
  var definition: Dictionary = content.definitions[id]
  if not store.prepare(id, "res://" + content.resources.models[definition.presentation.modelKey], content.clips[definition.presentation.animationSetKey]): readiness_error += "\n".join(store.errors) + "\n"
 if not store.prepare_backdrops(backdrop_catalogue): readiness_error += "\n".join(store.errors)
 if not readiness_error.is_empty():
  readiness.set_runtime_error(readiness_error)
  session.failed(generation, readiness_error)
  return
 readiness.set_runtime_ready()
 var prepared_run := State.create_run(generation, session.duo, content)
 var prepared_world := World.new()
 add_child(prepared_world)
 prepared_world.initialize(store, content)
 prepared_world.render(prepared_run, [], viewport(), 0, 0, false, environment.reducedMotion)
 if not session.prepared(generation, prepared_run, now()):
  prepared_world.dispose()
  return
 world = prepared_world
 active_clock.reset()
 accepted_moves.clear()
 last_events.clear()
 if not safe(): effects(session.interrupt(now()))
func dispose_world() -> void:
 dispose_preview()
 if world != null:
  world.dispose()
  world = null
func dispose_preview() -> void:
 if preview_instance != null:
  store.release(preview_instance)
  preview_instance = null
 if preview != null:
  preview.hide()
  preview.queue_free()
  preview = null
 preview_id = ""
func update_preview() -> void:
 var id: String = str(session.selection.previewedId) if session.selection.previewedId != null and session.phase == "selecting" and not screen.modal else ""
 if id == preview_id: return
 dispose_preview()
 if id.is_empty() or not store.templates.has(id): return
 preview_id = id
 preview = SubViewportContainer.new()
 preview.position = Vector2(environment.width * 0.6, environment.height * 0.18)
 preview.size = Vector2(environment.width * 0.35, environment.height * 0.44)
 preview.stretch = true
 preview.mouse_filter = Control.MOUSE_FILTER_IGNORE
 screen.add_child(preview)
 var sub := SubViewport.new()
 sub.size = Vector2i(int(preview.size.x), int(preview.size.y))
 sub.transparent_bg = true
 sub.own_world_3d = true
 preview.add_child(sub)
 var camera := Camera3D.new()
 camera.projection = Camera3D.PROJECTION_ORTHOGONAL
 camera.size = 3.2
 camera.position = Vector3(0, 1.4, 5)
 sub.add_child(camera)
 camera.look_at(Vector3(0, 1.4, 0))
 var light := DirectionalLight3D.new()
 light.rotation_degrees = Vector3(-30, -20, 0)
 light.light_energy = 3
 sub.add_child(light)
 var view := View.new()
 sub.add_child(view)
 preview_instance = store.create(id)
 view.attach(preview_instance)
 view.pose(0, 0, 0, "Idle", 0)
func viewport() -> Dictionary: return {"width": environment.width, "height": environment.height}
func render(delta: float) -> void:
 if session == null: return
 if world != null and not session.run.is_empty():
  world.render(session.run, last_events, viewport(), delta if session.phase == "running" else 0.0, active_clock.elapsed(now()), settings.screenShake, environment.reducedMotion)
 last_events = []
 # Retire previews before rebuilding the screen that owns them.
 var next_key: String = str([session.phase, session.selection, environment.width, environment.height, environment.safeInsets, screen.modal])
 if next_key != screen.render_key: dispose_preview()
 var readiness_view: Dictionary = readiness.snapshot()
 readiness_view.diagnostics = bridge.mode == "diagnostics"
 var changed: bool = screen.render(session, content, environment, settings, active_clock.elapsed(now()), tutorial.suggest(session.run) if not session.run.is_empty() else null, readiness_view)
 update_preview()
 screen.joystick_visible = session.phase in ["running", "paused"] and not screen.modal
 screen.joystick_center = input_controller.center
 screen.joystick_knob = input_controller.knob
 screen.queue_redraw()
 if session.phase == "running" and not screen.modal:
  for descriptor in screen.descriptors:
   if descriptor.id == "special" or descriptor.id == "dodge":
    var disabled: bool = session.run.actors[0].specialMeter < 100 if descriptor.id == "special" else session.run.tick < session.run.actors[0].dodgeReadyTick
    if descriptor.disabled != disabled:
     descriptor.disabled = disabled
     screen.controls[descriptor.id].disabled = disabled
     changed = true
 if changed:
  last_ui_generation += 1
  bridge.publish_ui(last_ui_generation, screen.descriptors)
 input_controller.action_bounds.clear()
 if session.phase == "running" and not screen.modal:
  for id in ["light", "heavy", "dodge", "special"]:
   if screen.controls.has(id) and not screen.controls[id].disabled: input_controller.action_bounds[id] = screen.controls[id].get_global_rect()
 input_controller.enabled = session.phase == "running" and not screen.modal
func _process(delta: float) -> void:
 if session == null: return
 if diagnostics != null: diagnostics.record(now(), store.live_count(), world.get_child_count() if world != null else 0, session.phase == "running")
 var old_phase: String = session.phase
 effects(session.frame(now()))
 if session.phase == "running":
  var steps: int = loop.frame(now(), true)
  for index in range(steps):
   var sample: Dictionary = input_controller.frame()
   var events: Array = Step.step_run(session.run, sample, content, world.arena(session.run, viewport()))
   audio.play_events(events)
   for event in events:
    if event.type in ["attack", "heavy", "dodge", "special"] and event.get("actorId") == 1: accepted_moves.append("light" if event.type == "attack" else event.type)
   var learned: Array = tutorial.accept(events, absf(sample.move.x) + absf(sample.move.depth) > 0)
   if not learned.is_empty(): persistence.save_tutorial(tutorial.completed())
   last_events.append_array(events)
   if session.run.result != null:
    session.finish()
    if session.phase == "victory": persistence.record_victory(active_clock.elapsed(now()))
    active_clock.pause(now())
    audio.set_running(false)
    clear_inputs()
    break
 else: loop.reset()
 if old_phase != session.phase and session.phase != "running": active_clock.pause(now())
 render(minf(0.1, delta))
func enable_audio() -> void:
 audio.unlock(session.phase == "running")
func act(id: String) -> void:
 if session == null: return
 enable_audio()
 if id.begins_with("character-"):
  var character_id := id.trim_prefix("character-")
  effects(session.select({"type": "activate", "id": character_id, "ready": store.templates.has(character_id)}))
 elif id in ["light", "heavy", "dodge", "special"]: input_controller.request(id, -2)
 elif id == "back": session.select({"type": "back"})
 elif id == "pause":
  effects(session.interrupt(now()))
  active_clock.pause(now())
  audio.set_running(false)
 elif id == "resume":
  var resumed: Array = session.resume(safe(), now())
  effects(resumed)
  if not resumed.is_empty() and session.phase == "running":
   active_clock.start(now())
   audio.set_running(true)
 elif id == "retry":
  audio.retry(false)
  enable_audio()
  effects(session.retry())
 elif id == "home":
  audio.set_running(false)
  effects(session.home())
 elif id == "retry-cache": bridge.repair_cache()
 elif id == "download-diagnostics" and diagnostics != null: bridge.download_diagnostics(diagnostics.snapshot())
 elif id == "settings":
  if session.phase == "running":
   effects(session.interrupt(now()))
   active_clock.pause(now())
   audio.set_running(false)
  screen.modal = true
  clear_inputs()
 elif id == "close-settings": screen.modal = false
 elif id == "shake":
  settings.screenShake = not settings.screenShake
  persistence.save_settings(settings)
  screen.render_key = ""
 elif id in ["music-up", "music-down", "effects-up", "effects-down"]:
  var field: String = "musicVolume" if id.begins_with("music") else "effectsVolume"
  settings[field] = clampf(settings[field] + (0.1 if id.ends_with("up") else -0.1), 0, 1)
  persistence.save_settings(settings)
  audio.apply_settings(settings)
 render(0)
func browser_message(value: Dictionary) -> void:
 if value.type == "cacheStatus":
  readiness.cache_status(value)
  screen.render_key = ""
 elif value.type == "updateWaiting":
  readiness.set_update_waiting(bool(value.get("waiting", false)))
  screen.render_key = ""
 elif value.type == "contextLost":
  lifecycle.lose_context()
  effects(session.interrupt(now()))
  active_clock.pause(now())
  audio.set_running(false)
 elif value.type == "contextRestored":
  lifecycle.restore_context()
 elif value.type == "contextRestoreFailed":
  lifecycle.fail_context_restore()
  screen.render_key = ""
 elif value.type == "environment":
  var resized: bool = environment.width != value.environment.width or environment.height != value.environment.height or environment.safeInsets != value.environment.safeInsets
  environment = value.environment
  if resized: resize()
  if not safe():
   effects(session.interrupt(now()))
   active_clock.pause(now())
   audio.set_running(false)
  screen.render_key = ""
 elif value.type == "touchCancel":
  for index in value.indices:
   input_controller.cancel(int(index))
   for control in screen.controls.values(): control.cancel_source(int(index))
 elif value.type == "uiIntent" and value.generation == last_ui_generation:
  if value.kind == "activate": act(value.id)
  elif value.kind == "value" and value.id in ["music-volume", "effects-volume"]:
   var field: String = "musicVolume" if value.id == "music-volume" else "effectsVolume"
   settings[field] = clampf(float(value.value), 0.0, 1.0)
   persistence.save_settings(settings)
   audio.apply_settings(settings)
   for descriptor in screen.descriptors:
    if descriptor.get("id") == value.id:
     descriptor.value = settings[field]
     break
   last_ui_generation += 1
   bridge.publish_ui(last_ui_generation, screen.descriptors)
  elif value.kind == "focus":
   screen.focus_control(value.id)
   if value.id.begins_with("character-"): session.select({"type": "focus", "id": value.id.trim_prefix("character-")})
func _exit_tree() -> void:
 if bridge != null: bridge.dispose()
 dispose_world()
