extends RefCounted
static func emit(events: Array, run: Dictionary, kind: String, actor_id: Variant = null, target_id: Variant = null) -> void:
 var event: Dictionary = {"type": kind, "tick": run.tick}
 if actor_id != null: event.actorId = actor_id
 if target_id != null: event.targetId = target_id
 events.append(event)
