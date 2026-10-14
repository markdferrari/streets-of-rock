extends RefCounted

# Pure presentation sampling. Positions, phases and timing remain simulation-owned.
static func resolve_enemy_pose(snapshot: Dictionary, previous_snapshot: Dictionary, tick: int, definition: Dictionary) -> Dictionary:
 var action: Dictionary = snapshot.get("action", {})
 var kind: String = action.get("kind", "idle")
 var semantic := "Idle"
 var facing: int = snapshot.get("facing", 1)
 var sample := float(posmod(tick, 28)) / 28.0
 var boss: bool = snapshot.get("combatClass", "normal") == "boss" or snapshot.get("role") == "liam"
 if snapshot.get("hp", 0) <= 0 or kind == "knockedOut":
  semantic = "Defeated"
  sample = 1.0
 elif not boss and tick < snapshot.get("stunnedUntilTick", 0):
  semantic = "Stunned"
 elif kind in ["windup", "active", "recovery", "hurt"]:
  semantic = "Hurt" if kind == "hurt" else str(action.get("moveId", "")) + "." + kind
  var start: int = action.get("startedTick", tick)
  var end: int = action.get("endTick", tick)
  sample = clampf(float(tick - start) / maxf(1.0, float(end - start)), 0.0, 1.0)
 else:
  var position: Dictionary = snapshot.get("position", {})
  var previous: Dictionary = previous_snapshot.get("position", position)
  var delta := Vector2(float(position.get("x", 0)) - float(previous.get("x", 0)), float(position.get("depth", 0)) - float(previous.get("depth", 0)))
  if delta.length() > 0.001:
   semantic = "Move"
   if absf(delta.x) > 0.001: facing = 1 if delta.x > 0 else -1
 var result := {"semantic": semantic, "sample": sample, "facing": facing, "phase2": snapshot.get("role") == "liam" and snapshot.get("phase", 1) == 2}
 var bindings: Dictionary = definition.get("clipBindings", {})
 if not bindings.has(semantic):
  result.error = str(snapshot.get("role", "enemy")) + ".clipBindings." + semantic + ": required binding missing; repair art and retry"
  return result
 var binding: Dictionary = bindings[semantic]
 result.clipName = binding.clipName
 result.timeSeconds = float(binding.get("fixedSampleSeconds", lerpf(float(binding.startSeconds), float(binding.endSeconds), sample)))
 return result
