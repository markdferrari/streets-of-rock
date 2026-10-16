extends Node
const Actor = preload("res://game/simulation/actor.gd")
const Venue = preload("res://game/presentation/venue_view.gd")
var game: Node
var callback: JavaScriptObject
var review_neutral: bool = false
var review_concepts: bool = false
var review_rooms: bool = false
var review_room: int = 0
var review_generation: int = -1
static func fixture_scene(query: String) -> String:
 for part in query.trim_prefix("?").split("&"):
  if part == "fixture=hero-animation": return "res://tests/godot/fixtures/hero-animation/review.tscn"
 return ""

func initialize(app: Node) -> void:
 game = app
 review_concepts = bool(JavaScriptBridge.eval("new URLSearchParams(location.search).get('review') === 'backdrops'", true))
 review_rooms = review_concepts or bool(JavaScriptBridge.eval("new URLSearchParams(location.search).get('review') === 'rooms'", true))
 if review_rooms: review_room = clampi(int(JavaScriptBridge.eval("Number(new URLSearchParams(location.search).get('room') || 0)", true)), 0, 3)
 callback = JavaScriptBridge.create_callback(_command)
 var host := JavaScriptBridge.get_interface("window")
 host.__sorCommand = callback
 JavaScriptBridge.eval("window.__sorTest={snapshot:()=>JSON.parse(window.__sorSnapshotJson||'null'),command:(name,value)=>window.__sorCommand(JSON.stringify({name,value}))};")
func _command(arguments: Array) -> Variant:
 var raw: String = str(arguments[0])
 var command: Dictionary = JSON.parse_string(raw)
 if game.session.run.is_empty(): return null
 var run: Dictionary = game.session.run
 match command.name:
  "defeat": run.actors[0].hp = 0
  "victory": run.result = "victory"
  "solo":
   run.actors[1].hp = 0
   run.actors[1].active = false
  "clear-wave":
   for actor in run.actors:
    if actor.team == "enemy": actor.hp = 0
  "room":
   for actor in run.actors:
    if actor.team == "enemy": actor.hp = 0
   run.actors = run.actors.slice(0, 2)
   run.areaIndex = int(command.value)
   run.actors[0].position = {"x": game.content.level.areas[run.areaIndex].minX + 1.0, "depth": 0.0}
   run.actors[1].position = {"x": run.actors[0].position.x + 1.0, "depth": 0.0}
   run.encounter = {"areaId": game.content.level.areas[run.areaIndex].id, "waveIndex": 0, "status": "awaitingEntry", "aliveEnemyIds": [], "cameraCenter": 0.0}
   game.world.frame = {}
  "meter": run.actors[0].specialMeter = command.value
  "position":
   run.actors[0].position = command.value.duplicate()
   run.actors[1].position = {"x": command.value.x - 1.0, "depth": command.value.depth}
   game.world.frame = {}
  "concepts":
   if game.world.has_node("ConceptBackdrops"): return null
   var backdrop = load("res://game/presentation/backdrops.gd").new()
   backdrop.name = "ConceptBackdrops"
   var catalogue: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://content/backdrops.json"))
   var textures: Dictionary = {}
   for room in catalogue.rooms:
    for kind in ["wall", "floor"]:
     textures[room[kind]] = load("res://assets/backdrops/concepts/" + room.setting + "/" + kind + ".svg")
   game.world.add_child(backdrop)
   backdrop.build(textures, catalogue, game.content.level)
   if game.world.backdrops != null: game.world.backdrops.hide()
  "enemy-neutral":
   if game.session.phase != "paused" or review_neutral: return null
   review_neutral = true
   if game.world.backdrops!=null: game.world.backdrops.hide()
   game.screen.hide()
   var floor := MeshInstance3D.new()
   floor.name="NeutralReviewFloor"
   var shape := BoxMesh.new()
   shape.size=Vector3(84,0.1,16)
   floor.mesh=shape
   floor.position=Vector3(35,-0.055,0)
   var material := StandardMaterial3D.new()
   material.albedo_color=Color("37333b")
   floor.material_override=material
   game.world.add_child(floor)
  "enemy-art":
   # Test export only: sample supported actions without changing simulation rules.
   if game.session.phase != "paused": return null
   var value: Dictionary = command.value
   var role: String = value.role
   if not game.content.enemy_presentations.has(role): return null
   game.world.clear_run_views()
   run.tick += 1
   run.actors = run.actors.slice(0,2)
   var actor := Actor.enemy(900,role,{"x":7.0,"depth":0.0},run.tick,game.content.tuning.enemyDefinitions[role])
   actor.facing = int(value.get("facing",1))
   actor.phase = int(value.get("phase",1))
   var semantic: String = value.semantic
   actor.action = {"kind":"idle","startedTick":run.tick-10,"endTick":run.tick+10}
   if "." in semantic:
    var parts := semantic.split(".")
    actor.action.kind = parts[1]
    actor.action.moveId = parts[0]
   elif semantic=="Hurt": actor.action.kind="hurt"
   elif semantic=="Stunned": actor.stunnedUntilTick=run.tick+30
   elif semantic=="Defeated": actor.hp=0
   if role=="zoner": actor.action.aimPosition={"x":7.0+actor.facing*3,"depth":1.0}
   run.actors.append(actor)
   game.world.frame={}
  "stage-hit":
   run.actors[0].position = {"x": 6.0, "depth": 0.0}
   run.actors[0].facing = 1
   var index: int = 0
   for actor in run.actors:
    if actor.team == "enemy" and actor.hp > 0:
     actor.position = {"x": 6.9 if index == 0 else 10.0 + index, "depth": 0.0}
     actor.decisionReadyTick = run.tick + 120
     index += 1
 return null

func _process(_delta: float) -> void:
 if game == null or game.session == null: return
 if review_rooms and game.world != null and game.session.phase == "running" and game.session.generation != review_generation:
  review_generation = game.session.generation
  if review_concepts: _command([JSON.stringify({"name": "concepts"})])
  _command([JSON.stringify({"name": "room", "value": review_room})])
 var host := JavaScriptBridge.get_interface("window")
 var scenery: Dictionary = {}
 host.__sorCountdownNumber = 0 if game.session.countdown == null else game.session.countdown.number
 if game.world != null:
  var panels: Node3D = game.world.get_node_or_null("Backdrops")
  if panels != null:
   scenery = {"textures": panels.texture_count, "rooms": panels.room_groups.keys(), "visibleRooms": panels.room_groups.values().filter(func(group: Node3D) -> bool: return group.visible).size(), "colliders": panels.find_children("*", "CollisionObject3D", true, false).size(), "animations": panels.find_children("*", "AnimationPlayer", true, false).size(), "connectors": [panels.has_node("Connector1"), panels.has_node("Connector2"), panels.has_node("Connector3")], "cameraX": game.world.camera.position.x}
   scenery.kind = "neutral-review" if review_neutral else ("furnished" if panels is Venue else "illustrated")
   scenery.render = {"draws": RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_DRAW_CALLS_IN_FRAME), "primitives": RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_PRIMITIVES_IN_FRAME)}
   scenery.meshes = panels.find_children("*", "MeshInstance3D", true, false).size()
   scenery.ownedInstances = panels.room_groups.size() if panels is Venue else 0
   scenery.visuals = []
   scenery.landmarks = {}
   if panels is Venue:
    for area in game.content.level.areas:
     var definition: Dictionary = game.content.room_presentations[area.id]
     scenery.visuals.append(definition.visualId)
     var found: Array = []
     for landmark in definition.requiredLandmarks:
      if panels.room_groups[area.id].find_child(landmark, true, false) != null: found.append(landmark)
     scenery.landmarks[area.id] = found
 var go: Dictionary = {"text": "", "bounds": {}}
 if game.screen.labels.has("go"):
  var node: Label = game.screen.labels.go
  go = {"text": node.text if node.visible else "", "bounds": {"x": node.position.x, "y": node.position.y, "width": node.size.x, "height": node.size.y}}
 host.__sorSnapshotJson = JSON.stringify({"ready": game.session != null, "phase": game.session.phase, "generation": game.session.generation, "run": game.session.run, "selection": game.session.selection, "bounds": game.screen.control_bounds, "acceptedMoves": game.accepted_moves, "ownedInstances": game.store.live_count(), "ownedInstanceIds": game.store.owned.keys(), "preparedResourceCount": game.store.templates.size() + game.store.room_scenes.size(), "enemyArt": {} if game.world == null else game.world.enemy_art_snapshot(), "camera": {} if game.world == null else game.world.frame, "elapsedMs": game.active_clock.elapsed(game.now()), "settings": game.settings, "environment": game.environment, "readiness": game.readiness.snapshot(), "scenery": scenery, "go": go, "movement": {"x": game.input_controller.move_x, "depth": game.input_controller.move_depth}})
