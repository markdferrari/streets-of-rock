extends Node3D
const EnemyView = preload("res://game/presentation/enemy_view.gd")
const CharacterView = preload("res://game/presentation/character_view.gd")
const World = preload("res://game/presentation/world_view.gd")
const Catalogue = preload("res://game/content/catalogue.gd")
const Store = preload("res://game/content/resource_store.gd")
const State = preload("res://game/simulation/run_state.gd")
const Actor = preload("res://game/simulation/actor.gd")
const AI = preload("res://game/simulation/enemy_ai.gd")
const Projectiles = preload("res://game/simulation/projectiles.gd")
const Statuses = preload("res://game/simulation/statuses.gd")
const BrowserBridge = preload("res://game/platform/browser_bridge.gd")
const Clocks = preload("res://game/app/clocks.gd")
@export var bottle_scene: PackedScene
var store := Store.new()
var clock := Clocks.new()
var bridge := BrowserBridge.new()
var runs: Dictionary = {}
var views: Dictionary = {}
var representative_views: Dictionary = {}
var previous: Dictionary = {}
var definitions: Dictionary = {}
var projectiles: Dictionary = {}
var paused := false
var facing := 1
var mode := "attacks"
var fixture_ready := false
var errors: Array[String] = []
var tick := 0
var callback: JavaScriptObject
var status_label: Label
var footer: Label
var geometry: Node3D
var controls: Dictionary = {}
var grip: Node3D
var bottle_released := false
var projectile_releases: Array = []
var camera: Camera3D
func _ready() -> void:
 if bottle_scene == null:
  errors.append("pilot.bottle: required imported scene missing; import the pilot assets and retry")
  return
 var content := Catalogue.new()
 if not content.load_catalogue():
  errors.assign(content.errors)
  return
 var data: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://tests/godot/fixtures/art/enemy-pilot/definitions.json"))
 for definition in data.enemies:
  var role: String = definition.role
  var model: Node3D = get_node("GruntRig" if role == "grunt" else "ZonerRig")
  remove_child(model)
  var view := EnemyView.new()
  add_child(view)
  if not view.attach(model, definition): errors.append_array(view.errors)
  views[role] = view
  definitions[role] = definition
 if not errors.is_empty(): return
 for role in ["grunt", "zoner"]:
  var scene: PackedScene = load("res://tests/godot/fixtures/art/enemy-pilot/" + role + "/runtime/character.glb")
  var duplicate_view := EnemyView.new()
  add_child(duplicate_view)
  if not duplicate_view.attach(scene.instantiate(), definitions[role]): errors.append_array(duplicate_view.errors)
  representative_views[role] = duplicate_view
 camera = Camera3D.new()
 camera.projection = Camera3D.PROJECTION_ORTHOGONAL
 camera.size = 8.420221169
 camera.position = Vector3(6, 9.55, 12)
 add_child(camera)
 camera.look_at(Vector3(6, 1.55, 0))
 camera.current = true
 geometry = World.new()
 add_child(geometry)
 var light := DirectionalLight3D.new()
 light.rotation_degrees = Vector3(-40, -25, 0)
 light.light_energy = 2.0
 add_child(light)
 var environment := WorldEnvironment.new()
 environment.environment = Environment.new()
 environment.environment.background_mode = Environment.BG_COLOR
 environment.environment.background_color = Color("171024")
 environment.environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
 environment.environment.ambient_light_color = Color.WHITE
 environment.environment.ambient_light_energy = 0.9
 add_child(environment)
 var i := 0
 for id in ["cow", "crow"]:
  if not store.prepare_hero(content, id): errors.append_array(store.errors)
  else:
   var ally := CharacterView.new()
   add_child(ally)
   ally.attach(store.create(id))
   ally.pose(0.0 if i == 0 else 12.0, 0, 1 if i == 0 else -1, "Idle", 0.0)
  i += 1
 var skeleton: Skeleton3D = views.zoner.model.find_children("*", "Skeleton3D", true, false)[0]
 var attachment := BoneAttachment3D.new()
 attachment.bone_name = "handslot.r"
 skeleton.add_child(attachment)
 grip = bottle_scene.instantiate()
 attachment.add_child(grip)
 grip.scale = Vector3.ONE * 0.55
 make_ui()
 reset()
 fixture_ready = errors.is_empty()
 if OS.has_feature("web"):
  callback = JavaScriptBridge.create_callback(_command)
  JavaScriptBridge.get_interface("window").__sorArtPilotCommand = callback
  bridge.message.connect(browser_message)
  bridge.initialize()
  JavaScriptBridge.eval("window.__sorArtPilot={snapshot:()=>JSON.parse(window.__sorArtPilotJson||'null'),command:(name,value)=>window.__sorArtPilotCommand(JSON.stringify({name,value}))};window.addEventListener('blur',()=>window.__sorArtPilot.command('pause',true));document.addEventListener('visibilitychange',()=>{if(document.hidden)window.__sorArtPilot.command('pause',true)});window.__sorArtPilot.command('layout',{width:innerWidth,height:innerHeight});")
 render()
func box(size: Vector3) -> BoxMesh:
 var mesh := BoxMesh.new()
 mesh.size = size
 return mesh
func make_ui() -> void:
 var layer := CanvasLayer.new()
 add_child(layer)
 var title := Label.new()
 title.text = "ENEMY MOTION PILOT · KayKit Medium · review only"
 title.position = Vector2(14, 8)
 title.add_theme_color_override("font_color", Color("eac169"))
 layer.add_child(title)
 status_label = Label.new()
 status_label.position = Vector2(14, 38)
 layer.add_child(status_label)
 footer = Label.new()
 footer.text = "Motion / bottle: Kay Lousberg · CC0   |   Original skins · Final contact/feet review pending"
 footer.position = Vector2(14, 330)
 footer.add_theme_font_size_override("font_size", 12)
 layer.add_child(footer)
 var i := 0
 for name in ["Pause", "Face", "Attack", "Idle", "Move", "Stun", "Hurt", "Defeat", "Reset"]:
  var button := Button.new()
  button.text = name
  button.position = Vector2(12 + i * 88, 350)
  button.size = Vector2(82, 34)
  button.pressed.connect(func() -> void: command(name.to_lower(), null))
  layer.add_child(button)
  controls[name.to_lower()] = button
  i += 1
 layout_ui()
 get_viewport().size_changed.connect(layout_ui)
func layout_ui() -> void:
 var size := get_viewport().get_visible_rect().size
 var width := (size.x - 24.0) / float(maxi(1, controls.size()))
 var index := 0
 for button in controls.values():
  button.position = Vector2(12 + index * width, size.y - 50)
  button.size = Vector2(width - 6, 44)
  index += 1
 footer.position = Vector2(14, size.y - 76)
func reset() -> void:
 tick = 0
 projectile_releases.clear()
 bottle_released = false
 for node in projectiles.values(): node.free()
 projectiles.clear()
 for role in ["grunt", "zoner"]:
  var ally := Actor.ally(1, "player", 100000)
  var x := 3.0 if role == "grunt" else 8.0
  ally.position = {"x": x + facing * (1.0 if role == "grunt" else 3.0), "depth": 0.0}
  var enemy := Actor.enemy(3, role, {"x": x, "depth": 0.0}, 0, {"hp": 180, "combatClass": "normal"})
  enemy.facing = facing
  runs[role] = {"runId": 1, "tick": 0, "nextEntityId": 4, "nextAttackId": 1, "actors": [ally, enemy], "attacks": [], "projectiles": []}
  previous[role] = enemy.duplicate(true)
 clock.reset()
func command(name: String, value: Variant) -> void:
 match name:
  "layout":
   get_tree().root.content_scale_size = Vector2i(int(value.width), int(value.height))
   layout_ui.call_deferred()
  "pause":
   paused = not paused if value == null else bool(value)
   clock.reset()
  "face":
   facing *= -1
   reset()
  "step":
   paused = true
   for i in clampi(int(value), 0, 600): advance_tick()
  "reset":
   mode = "attacks"
   reset()
  "attack", "idle", "move", "stun", "hurt", "defeat":
   mode = "attacks" if name == "attack" else name
   reset()
 render()
func browser_message(value: Dictionary) -> void:
 if value.get("type") == "environment":
  command("layout", value.environment)
  if not value.environment.visible or not value.environment.focused or value.environment.portrait: command("pause", true)
 elif value.get("type") == "contextLost": command("pause", true)
func _command(arguments: Array) -> Variant:
 var message: Dictionary = JSON.parse_string(str(arguments[0]))
 command(message.name, message.get("value"))
 return null
func advance_tick() -> void:
 tick += 1
 for role in runs:
  var run: Dictionary = runs[role]
  var enemy: Dictionary = run.actors[1]
  previous[role] = enemy.duplicate(true)
  run.tick = tick
  var events: Array = []
  match mode:
   "attacks": AI.role(run, events, role)
   "move": enemy.position.x += facing * 0.015
   "stun":
    if tick == 1: Statuses.apply(run, enemy.id, 90)
    Statuses.update(run, events)
   "hurt": enemy.action = Actor.action("hurt", 0, 45)
   "defeat": enemy.hp = 0
  if role == "zoner":
   for event in events:
    if event.type == "projectile":
     bottle_released = true
     projectile_releases.append({"tick": tick, "phase": enemy.action.kind, "sampleSeconds": definitions.zoner.clipBindings["throw.active"].startSeconds})
   if enemy.action.kind == "windup" or (enemy.action.kind == "idle" and not Statuses.stunned(enemy, tick)): bottle_released = false
  Projectiles.update(run, events)
  run.attacks = run.attacks.filter(func(attack: Dictionary) -> bool: return attack.activeUntilTick > tick)
func render() -> void:
 if runs.is_empty(): return
 var poses: Dictionary = {}
 for role in views:
  var enemy: Dictionary = runs[role].actors[1]
  if not views[role].apply_snapshot(enemy, previous[role], tick):
   errors.append_array(views[role].errors)
  poses[role] = views[role].last_pose
 for role in representative_views:
  var snapshot: Dictionary = runs[role].actors[1].duplicate(true)
  snapshot.position = {"x": 5.0 if role == "grunt" else 10.0, "depth": -1.8}
  snapshot.action = Actor.action("idle", 0, 1)
  snapshot.hp = 180
  snapshot.erase("stunnedUntilTick")
  if not representative_views[role].apply_snapshot(snapshot, snapshot, tick): errors.append_array(representative_views[role].errors)
 grip.visible = not bottle_released and runs.zoner.actors[1].hp > 0
 var ids: Array = []
 for projectile in runs.zoner.projectiles:
  ids.append(projectile.id)
  if not projectiles.has(projectile.id):
   projectiles[projectile.id] = bottle_scene.instantiate()
   add_child(projectiles[projectile.id])
   projectiles[projectile.id].scale = Vector3.ONE * 0.6
  projectiles[projectile.id].position = Vector3(projectile.position.x, 1.3, projectile.position.depth)
  projectiles[projectile.id].rotation.z = float(projectile.remainingTicks) * 0.12
 for id in projectiles.keys():
  if not id in ids:
   projectiles[id].free()
   projectiles.erase(id)
 status_label.text = "Tick %d  |  Grunt: %s  |  Zoner: %s%s" % [tick, poses.grunt.get("semantic", "error"), poses.zoner.get("semantic", "error"), "  · PAUSED" if paused else ""]
 controls.pause.text = "Resume" if paused else "Pause"
 if OS.has_feature("web"):
  var buttons: Dictionary = {}
  for key in controls:
   var rect: Rect2 = controls[key].get_global_rect()
   buttons[key] = {"x": rect.position.x, "y": rect.position.y, "width": rect.size.x, "height": rect.size.y}
  JavaScriptBridge.get_interface("window").__sorArtPilotJson = JSON.stringify({"ready": fixture_ready, "tick": tick, "paused": paused, "mode": mode, "facing": facing, "poses": poses, "bottleVisible": grip.visible, "projectileCount": projectiles.size(), "releases": projectile_releases, "errors": errors, "buttons": buttons, "rigCount": views.size() + representative_views.size(), "render": {"draws": RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_DRAW_CALLS_IN_FRAME), "primitives": RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_PRIMITIVES_IN_FRAME)}})
func _process(_delta: float) -> void:
 if not fixture_ready: return
 for i in clock.frame(float(Time.get_ticks_msec()), not paused): advance_tick()
 render()
func _exit_tree() -> void:
 bridge.dispose()
 for instance in store.owned.values().duplicate(): store.release(instance)
