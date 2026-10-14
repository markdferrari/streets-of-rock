extends Node3D
const Art = preload("res://game/content/art_catalog.gd")
const Pose = preload("res://game/presentation/enemy_pose.gd")
const Store = preload("res://game/content/resource_store.gd")
var errors: Array[String] = []
var animation: AnimationPlayer
var definition: Dictionary = {}
var last_pose: Dictionary = {}
var model: Node3D
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
 last_pose = resolved
 errors.clear()
 return true
