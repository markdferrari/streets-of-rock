extends Node3D
const Cues = preload("res://game/presentation/enemy_cues.gd")
const Art = preload("res://game/content/art_catalog.gd")
const Pose = preload("res://game/presentation/enemy_pose.gd")
const Store = preload("res://game/content/resource_store.gd")
var errors: Array[String] = []
var animation: AnimationPlayer
var definition: Dictionary = {}
var last_pose: Dictionary = {}
var model: Node3D
var last_cue: Dictionary = {}
var rope_line: MeshInstance3D
var cue_mesh: MeshInstance3D
var phase_overlay: Node3D
var cue_key: String = ""
var held_prop: Node3D

func attach_prop(instance: Node3D) -> void:
 var skeleton: Skeleton3D = model.find_children("*", "Skeleton3D", true, false)[0]
 var attachment := BoneAttachment3D.new()
 attachment.bone_name = "handslot.r"
 skeleton.add_child(attachment)
 attachment.add_child(instance)
 instance.scale = Vector3.ONE * 0.55
 held_prop = instance

# Takes ownership of this instance, including failed imports. Shared scene resources
# remain immutable; each attached instance owns its skeleton/mixer state.
func attach(instance: Node3D, enemy_definition: Dictionary) -> bool:
 if model != null:
  model.free()
  model = null
 animation = null
 definition = {}
 last_pose = {}
 errors = Art.inspect_enemy(instance, enemy_definition)
 if not errors.is_empty():
  instance.free()
  return false
 model = instance
 add_child(model)
 definition = enemy_definition.duplicate(true)
 animation = Store.find_animation(model)
 animation.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
 return true
func apply_snapshot(snapshot: Dictionary, previous: Dictionary, tick: int) -> bool:
 if model == null or animation == null:
  if errors.is_empty(): errors.append("enemy view: required rig was not attached; prepare art before starting")
  return false
 var resolved := Pose.resolve_enemy_pose(snapshot, previous, tick, definition)
 if resolved.has("error"):
  errors.assign([resolved.error])
  return false
 if not animation.has_animation(resolved.clipName):
  errors.assign([str(snapshot.role) + ": missing imported animation " + str(resolved.clipName)])
  return false
 var transform_definition: Dictionary = definition.transform
 position = Vector3(float(snapshot.position.x), float(transform_definition.footOffset), float(snapshot.position.depth))
 scale = Vector3.ONE * float(transform_definition.scale)
 rotation.y = float(resolved.facing) * PI / 2.0 + float(transform_definition.facingCorrection)
 animation.play(resolved.clipName)
 animation.seek(resolved.timeSeconds, true)
 animation.advance(0.0)
 animation.pause()
 if held_prop != null:
  held_prop.visible = resolved.semantic != "Defeated" and resolved.semantic not in ["throw.active", "throw.recovery"]
 apply_cues(snapshot, tick, resolved)
 last_pose = resolved
 errors.clear()
 return true

func apply_cues(snapshot: Dictionary, tick: int, resolved: Dictionary) -> void:
 if cue_mesh == null:
  cue_mesh = MeshInstance3D.new()
  cue_mesh.name = "AttackRegion"
  add_child(cue_mesh)
  cue_mesh.top_level = true
  var material := StandardMaterial3D.new()
  material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
  material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
  material.cull_mode = BaseMaterial3D.CULL_DISABLED
  material.no_depth_test = false
  material.albedo_color = Color(1.0,0.58,0.12,0.16)
  cue_mesh.material_override = material
 if phase_overlay == null:
  phase_overlay = Node3D.new()
  phase_overlay.name = "PhaseTwo"
  add_child(phase_overlay)
  # Static shoulder chevrons are instance-owned and never restart the mixer.
  for side in [-1,1]:
   var mark := MeshInstance3D.new()
   var shape := BoxMesh.new()
   shape.size = Vector3(0.16,0.05,0.32)
   mark.mesh = shape
   mark.position = Vector3(side*0.48,1.45,0)
   var material := StandardMaterial3D.new()
   material.albedo_color = Color("ffca57")
   material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
   mark.material_override = material
   phase_overlay.add_child(mark)
 if rope_line == null:
  rope_line = MeshInstance3D.new()
  rope_line.name = "ReleasedRope"
  add_child(rope_line)
  rope_line.top_level = true
  var material := StandardMaterial3D.new()
  material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
  material.albedo_color = Color("edd6a2")
  rope_line.material_override = material
 rope_line.visible = resolved.semantic == "rope.active"
 if rope_line.visible:
  var skeleton: Skeleton3D = model.find_children("*","Skeleton3D",true,false)[0]
  var hand := skeleton.global_transform*skeleton.get_bone_global_pose(skeleton.find_bone("handslot.r")).origin
  var end := Vector3(float(snapshot.position.x)+int(resolved.facing)*3.0,0.6,float(snapshot.position.depth))
  var line := ImmediateMesh.new()
  line.surface_begin(Mesh.PRIMITIVE_LINES)
  line.surface_add_vertex(hand)
  line.surface_add_vertex(end)
  line.surface_end()
  rope_line.mesh = line
  rope_line.global_transform = Transform3D.IDENTITY
 phase_overlay.visible = resolved.phase2 and resolved.semantic != "Defeated"
 last_cue = Cues.resolve(snapshot,tick)
 cue_mesh.visible = last_cue.visible
 if cue_mesh.visible:
  cue_mesh.global_transform = Transform3D(Basis.IDENTITY, Vector3(float(snapshot.position.x),0.025,float(snapshot.position.depth)))
  var key := str([last_cue.move,last_cue.facing,snapshot.action.get("aimPosition"),snapshot.position if last_cue.move=="throw" else null])
  if key != cue_key:
   cue_mesh.mesh = Cues.geometry(last_cue,snapshot)
   cue_key = key
  cue_mesh.material_override.albedo_color = Color(1,0.25,0.12,0.23) if last_cue.active else Color(1,0.65,0.12,0.16)
