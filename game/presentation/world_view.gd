extends Node3D
const EnemyView = preload("res://game/presentation/enemy_view.gd")
const View = preload("res://game/presentation/character_view.gd")
const CameraMath = preload("res://game/presentation/camera_math.gd")
const Arena = preload("res://game/simulation/arena.gd")
const Backdrops = preload("res://game/presentation/backdrops.gd")
var store: RefCounted
var content: RefCounted
var models: Dictionary = {}
var actor_instances: Dictionary = {}
var enemy_snapshots: Dictionary = {}
var enemy_previous: Dictionary = {}
var enemy_ticks: Dictionary = {}
var defeat_retire_ticks: Dictionary = {}
var retired_enemy_ids: Dictionary = {}
var owned_projectiles: Dictionary = {}
var errors: Array[String] = []
var instances: Array = []
var objects: Dictionary = {}
var projectile_models: Dictionary = {}
var previous_positions: Dictionary = {}
var effects: Array = []
var camera: Camera3D
var frame: Dictionary = {}
var last_impact: float = -1000.0
var backdrops: Node3D
func initialize(resource_store: RefCounted, catalogue: RefCounted) -> void:
 store = resource_store
 content = catalogue
 camera = Camera3D.new()
 camera.projection = Camera3D.PROJECTION_ORTHOGONAL
 camera.near = 0.1
 camera.far = 100
 add_child(camera)
 camera.current = true
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
 # Gameplay starts only after Main has prepared every required imported texture.
 if store.backdrop_textures.size() == 8:
  backdrops = Backdrops.new()
  backdrops.name = "Backdrops"
  add_child(backdrops)
  backdrops.build(store.backdrop_textures, JSON.parse_string(FileAccess.get_file_as_string("res://content/backdrops.json")), content.level)
func mesh(parent: Node3D, geometry: Mesh, color: Color, position_at: Vector3 = Vector3.ZERO, unlit: bool = false) -> MeshInstance3D:
 var instance := MeshInstance3D.new()
 instance.mesh = geometry
 var material := StandardMaterial3D.new()
 material.albedo_color = color
 if color.a < 1:
  material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
 if unlit: material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
 instance.material_override = material
 instance.position = position_at
 parent.add_child(instance)
 return instance
func box(parent: Node3D, size: Vector3, color: Color, at: Vector3) -> void:
 var shape := BoxMesh.new()
 shape.size = size
 mesh(parent, shape, color, at)
func enemy_model(actor: Dictionary) -> Node3D:
 var root := Node3D.new()
 add_child(root)
 var jacket := Color("282532")
 box(root, Vector3(0.52, 0.78, 0.35), jacket, Vector3(0, 0.95, 0))
 box(root, Vector3(0.41, 0.37, 0.37), Color("bd325e") if actor.role == "grunt" else Color("514470"), Vector3(0, 1.52, 0))
 for x in [-0.38, 0.38]: box(root, Vector3(0.18, 0.55, 0.2), jacket, Vector3(x, 0.92, 0))
 for x in [-0.17, 0.17]: box(root, Vector3(0.2, 0.56, 0.2), Color("24202b"), Vector3(x, 0.3, 0))
 return root
static func sample(actor: Dictionary, tick: int, moving: bool) -> Dictionary:
 if actor.hp <= 0 or actor.action.kind == "knockedOut": return {"clip": "KnockedOut", "progress": 1.0}
 var action: Dictionary = actor.action
 var progress: float = clampf(float(tick - action.startedTick) / maxf(1, action.endTick - action.startedTick), 0, 1)
 if action.kind in ["windup", "active", "recovery"] and action.has("moveId"):
  var move: String = action.moveId
  if move == "support": move = {"cow": "cow1", "crow": "crow", "lion": "lionSupport", "plates": "platesSupport"}[actor.characterId]
  elif move == "heavy": move = actor.characterId + "Heavy"
  elif move == "special": move = {"cow": "spin", "crow": "wingSpin", "lion": "roar", "plates": "headrest"}[actor.characterId]
  elif move.begins_with("light"): move = actor.characterId + move.right(1)
  return {"clip": move + "." + action.kind, "progress": progress}
 return {"clip": "Dodge" if action.kind == "dodge" else ("Hurt" if action.kind == "hurt" else ("Move" if moving else "Idle")), "progress": progress if action.kind in ["dodge", "hurt"] else float(tick % 28) / 28.0}
static func body_pose(kind: String, move: String) -> Vector2:
 if move == "heavy" and kind == "windup": return Vector2(-0.35, 1.16)
 if move == "heavy" and kind == "active": return Vector2(0.55, 0.88)
 if move == "special" and kind == "active": return Vector2(0.45, 1.05)
 return {"windup": Vector2(-0.17, 1.08), "active": Vector2(0.32, 0.95), "recovery": Vector2(0.1, 0.98), "hurt": Vector2(-0.4, 0.88), "dodge": Vector2(0.5, 0.68), "knockedOut": Vector2(1.2, 0.35)}.get(kind, Vector2(0, 1))
func arena(run: Dictionary, viewport: Dictionary) -> Dictionary:
 if frame.is_empty(): frame = CameraMath.compute(run, viewport, {"player": content.resources.bodyEnvelopes[run.duo.fighterId], "partner": content.resources.bodyEnvelopes[run.duo.partnerId]}, content)
 var context := Arena.build(run, frame, content.resources.bodyEnvelopes[run.duo.partnerId], "partner", content)
 context.playerVisibleRegions = Arena.build(run, frame, content.resources.bodyEnvelopes[run.duo.fighterId], "player", content).visibleRegions
 return context
func render(run: Dictionary, events: Array, viewport: Dictionary, delta: float, active_ms: float, shake: bool, reduced_motion: bool) -> void:
 frame = CameraMath.compute(run, viewport, {"player": content.resources.bodyEnvelopes[run.duo.fighterId], "partner": content.resources.bodyEnvelopes[run.duo.partnerId]}, content, frame, delta)
 var age: float = active_ms - last_impact
 var offset: float = sin(age * 0.11) * 0.12 * (1 - age / 180.0) if shake and not reduced_motion and age > 0 and age < 180 else 0.0
 camera.size = frame.halfHeight * 2.0
 camera.position = Vector3(frame.anchorX + offset, frame.anchorHeight + 8, 12)
 camera.look_at(Vector3(frame.anchorX + offset, frame.anchorHeight, 0))
 var current_ids: Array = run.actors.map(func(actor: Dictionary) -> Variant: return actor.id)
 for id in models.keys():
  if models[id] is EnemyView and (not id in current_ids or enemy_snapshots.get(id, {}).get("hp", 1) <= 0):
   if not defeat_retire_ticks.has(id):
    defeat_retire_ticks[id] = run.tick + content.enemy_presentations[enemy_snapshots[id].role].defeatHoldTicks
   if run.tick >= defeat_retire_ticks[id]:
    retired_enemy_ids[id] = true
    retire_actor(id)
    continue
   if not id in current_ids:
    var defeated: Dictionary = enemy_snapshots[id].duplicate(true)
    defeated.hp = 0
    models[id].apply_snapshot(defeated, defeated, run.tick)
    models[id].visible = true
  elif not id in current_ids: retire_actor(id)
 for actor in run.actors:
  if actor.hp <= 0 and retired_enemy_ids.has(actor.id): continue
  if actor.hp > 0: retired_enemy_ids.erase(actor.id)
  if not models.has(actor.id):
   var model: Node3D
   if actor.team == "ally":
    model = View.new()
    add_child(model)
    var instance: Node3D = store.create(actor.characterId)
    instances.append(instance)
    model.attach(instance)
    actor_instances[actor.id] = [instance]
   elif content.enemy_presentations.has(actor.role):
    var definition: Dictionary = content.enemy_presentations[actor.role]
    var rig: Node3D = store.create(definition.sceneResourceId)
    if rig == null:
     errors.assign([actor.role + ": enemy rig not prepared; retry loading artwork"])
     return
    model = EnemyView.new()
    add_child(model)
    var rig_id := rig.get_instance_id()
    if not model.attach(rig, definition):
     errors.assign(model.errors)
     store.owned.erase(rig_id)
     model.queue_free()
     return
    instances.append(rig)
    actor_instances[actor.id] = [rig]
    if actor.role == "zoner":
     var prop: Node3D = store.create("prop.bottle")
     if prop == null:
      errors.assign(["zoner: bottle not prepared; retry loading artwork"])
      retire_actor(actor.id)
      model.queue_free()
      return
     instances.append(prop)
     actor_instances[actor.id].append(prop)
     model.attach_prop(prop)
   else: model = enemy_model(actor)
   var shadow := CylinderMesh.new()
   shadow.top_radius = 0.48
   shadow.bottom_radius = 0.48
   shadow.height = 0.005
   shadow.radial_segments = 16
   mesh(model, shadow, Color(0, 0, 0, 0.28), Vector3(0, 0.012, 0), true)
   models[actor.id] = model
  var model: Node3D = models[actor.id]
  var previous: Dictionary = previous_positions.get(actor.id, actor.position)
  var moving: bool = sqrt(pow(actor.position.x - previous.x, 2) + pow(actor.position.depth - previous.depth, 2)) > 0.001
  previous_positions[actor.id] = actor.position.duplicate()
  if model is EnemyView:
   if actor.hp <= 0:
    if not defeat_retire_ticks.has(actor.id): defeat_retire_ticks[actor.id] = run.tick + content.enemy_presentations[actor.role].defeatHoldTicks
    if run.tick >= defeat_retire_ticks[actor.id]:
     retired_enemy_ids[actor.id] = true
     retire_actor(actor.id)
     continue
   if enemy_ticks.get(actor.id, -1) != run.tick:
    enemy_previous[actor.id] = enemy_snapshots.get(actor.id, actor).duplicate(true)
    enemy_ticks[actor.id] = run.tick
   enemy_snapshots[actor.id] = actor.duplicate(true)
   if not model.apply_snapshot(actor, enemy_previous[actor.id], run.tick): errors.assign(model.errors)
   model.visible = true
   continue
  model.visible = actor.hp > 0 or actor.team == "ally"
  var pose := body_pose("knockedOut" if actor.hp <= 0 else actor.action.kind, actor.action.get("moveId", ""))
  if actor.team == "ally":
   var animation := sample(actor, run.tick, moving)
   model.pose(actor.position.x, actor.position.depth, int(actor.facing), animation.clip, animation.progress)
   if animation.clip in ["spin.active", "wingSpin.active"]: model.rotation.y += animation.progress * TAU
   model.scale.y = 1.25 * pose.y
  else:
   model.position = Vector3(actor.position.x, 0, actor.position.depth)
   model.rotation.y = actor.facing * PI / 2.0
   var size: float = 1.6 if actor.role == "liam" else (1.2 if actor.role == "enforcer" else 1.0)
   model.scale = Vector3(size, size * pose.y, size)
  model.rotation.z = pose.x
 for collection in [run.tables, run.pickups]:
  for item in collection:
   if not objects.has(item.id):
    var cylinder := CylinderMesh.new()
    cylinder.top_radius = 0.7 if item.has("broken") else 0.15
    cylinder.bottom_radius = 0.55 if item.has("broken") else 0.15
    cylinder.height = 0.55 if item.has("broken") else 0.45
    cylinder.radial_segments = 8
    objects[item.id] = mesh(self, cylinder, Color("7b344e") if item.has("broken") else Color("ffc347"))
   objects[item.id].position = Vector3(item.position.x, 0.35, item.position.depth)
   objects[item.id].visible = not item.broken if item.has("broken") else item.available
 var projectile_ids: Array = []
 for projectile in run.projectiles:
  projectile_ids.append(projectile.id)
  if not projectile_models.has(projectile.id):
   if projectile.get("kind") == "headrest":
    var prop: PackedScene = load("res://" + content.resources.props.headrest)
    var instance := prop.instantiate()
    instance.scale = Vector3.ONE * 0.55
    instance.rotation.y = atan2(projectile.direction.x, projectile.direction.depth)
    add_child(instance)
    projectile_models[projectile.id] = instance
   elif store.templates.has("prop.bottle"):
    var bottle: Node3D = store.create("prop.bottle")
    bottle.scale = Vector3.ONE * 0.6
    add_child(bottle)
    instances.append(bottle)
    owned_projectiles[projectile.id] = bottle
    projectile_models[projectile.id] = bottle
   else:
    var sphere := SphereMesh.new()
    sphere.radius = 0.16
    sphere.height = 0.32
    projectile_models[projectile.id] = mesh(self, sphere, Color("ff8c43"), Vector3.ZERO, true)
  projectile_models[projectile.id].position = Vector3(projectile.position.x, 0.7, projectile.position.depth)
 for id in projectile_models.keys():
  if not id in projectile_ids:
   if owned_projectiles.has(id):
    instances.erase(owned_projectiles[id])
    store.release(owned_projectiles[id])
    owned_projectiles.erase(id)
   else: projectile_models[id].queue_free()
   projectile_models.erase(id)
 for event in events:
  if event.type in ["hit", "partner-hit"]: last_impact = active_ms
  if not event.type in ["hit", "partner-hit", "enemy-warning", "roar-wave", "roar-stun", "roar-boss-impact", "headrest-hit", "headrest-release", "headrest-miss"]: continue
  var id: Variant = event.get("actorId") if event.type in ["enemy-warning", "roar-wave", "headrest-release", "headrest-miss"] else event.get("targetId")
  if not models.has(id): continue
  var ring := TorusMesh.new()
  ring.inner_radius = 0.25
  ring.outer_radius = 3.0 if event.type == "roar-wave" else (1.05 if event.type == "roar-stun" else 0.7)
  ring.rings = 16
  ring.ring_segments = 8
  var mark := mesh(self, ring, Color("7ee7ff") if event.type.begins_with("roar") else (Color("ffeb8a") if event.type in ["hit", "partner-hit"] else Color("ff4444")), models[id].position + Vector3(0, 0.04, 0), true)
  mark.scale.y = 0.025
  effects.append({"node": mark, "expires": active_ms + (1000 if event.type in ["roar-wave", "roar-stun"] else 450)})
 for effect in effects.duplicate():
  if active_ms >= effect.expires:
   effect.node.queue_free()
   effects.erase(effect)
func retire_actor(id: int) -> void:
 if actor_instances.has(id):
  var owned: Array = actor_instances[id].duplicate()
  owned.reverse()
  for instance in owned:
   instances.erase(instance)
   store.release(instance)
  actor_instances.erase(id)
 if models.has(id):
  models[id].queue_free()
  models.erase(id)
 previous_positions.erase(id)
 enemy_snapshots.erase(id)
 enemy_previous.erase(id)
 enemy_ticks.erase(id)
 defeat_retire_ticks.erase(id)
func enemy_art_snapshot() -> Dictionary:
 var poses: Dictionary = {}
 var owned := owned_projectiles.size()
 for id in models:
  if models[id] is EnemyView:
   owned += actor_instances.get(id, []).size()
   poses[str(id)] = {"role":models[id].definition.role,"pose":models[id].last_pose,"retiring":defeat_retire_ticks.has(id)}
 return {"views":poses,"ownedInstances":owned,"errors":errors}
func dispose() -> void:
 for id in models.keys(): retire_actor(id)
 for instance in instances: store.release(instance)
 instances.clear()
 owned_projectiles.clear()
 queue_free()
