extends Node3D
const Batches = preload("res://game/presentation/character_batches.gd")
const Store = preload("res://game/content/resource_store.gd")
var animation: AnimationPlayer
var sample_time: float = 0.0

func attach(instance: Node3D) -> void:
 add_child(instance)
 Batches.build(instance)
 animation = Store.find_animation(instance)
 if animation != null:
  animation.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL

func pose(x: float, depth: float, facing: int, clip: String, phase: float) -> void:
 position = Vector3(x, 0.0, depth)
 scale = Vector3(1.25, 1.25, 1.25)
 rotation.y = float(facing) * PI / 2.0
 if animation == null or not animation.has_animation(clip):
  return
 sample_time = animation.get_animation(clip).length * clampf(phase, 0.0, 1.0)
 animation.play(clip)
 animation.seek(sample_time, true)
 animation.advance(0.0)
 animation.pause()

var skeletons: Array = []
var outgoing: Array = []
var pose_identity: String = ""
func bone_pose() -> Array:
 var result: Array = []
 for skeleton in skeletons:
  var bones: Array = []
  for index in skeleton.get_bone_count(): bones.append(skeleton.get_bone_pose(index))
  result.append(bones)
 return result
func sample_clip(clip: String, seconds: float) -> void:
 for skeleton in skeletons: skeleton.reset_bone_poses()
 if animation == null or not animation.has_animation(clip): return
 sample_time = clampf(seconds, 0, animation.get_animation(clip).length)
 animation.play(clip)
 animation.seek(sample_time, true)
 animation.advance(0.0)
 animation.pause()
func apply_pose(at: Vector2, facing: int, sample: Dictionary) -> void:
 position = Vector3(at.x, 0, at.y)
 scale = Vector3.ONE * 1.25
 rotation = Vector3(0, facing * PI / 2.0, 0)
 if animation == null: return
 if skeletons.is_empty(): skeletons = find_children("*", "Skeleton3D", true, false)
 var identity: String = sample.get("actionIdentity", "") + ":" + (sample.semanticKey if sample.get("actionIdentity", "").is_empty() else "")
 if identity != pose_identity:
  outgoing = bone_pose()
  pose_identity = identity
 var base: Array = []
 var weight: float = 0.0
 for item in sample.samples:
  sample_clip(item.clipName, item.timeSeconds)
  var current := bone_pose()
  if base.is_empty(): base = current
  else:
   for s in base.size():
    for b in base[s].size(): base[s][b] = base[s][b].interpolate_with(current[s][b], item.weight / (weight + item.weight))
  weight += item.weight
 var reaction: Dictionary = sample.get("reaction", {})
 if not reaction.is_empty():
  sample_clip(reaction.clipName, reaction.timeSeconds)
  var delta := bone_pose()
  for s in skeletons.size():
   for name in reaction.boneNames:
    var b: int = skeletons[s].find_bone(name)
    if b >= 0:
     # Hurt is authored as a local rest-relative delta, only on its declared mask.
     base[s][b] = base[s][b] * (skeletons[s].get_bone_rest(b).affine_inverse() * delta[s][b])
 var blend: float = sample.get("transitionWeight", 1.0)
 for s in skeletons.size():
  for b in skeletons[s].get_bone_count():
   var value: Transform3D = base[s][b]
   if blend < 1 and s < outgoing.size() and b < outgoing[s].size(): value = outgoing[s][b].interpolate_with(value, blend)
   skeletons[s].set_bone_pose(b, value)
