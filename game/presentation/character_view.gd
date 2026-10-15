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
