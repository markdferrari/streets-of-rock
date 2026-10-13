extends RefCounted
const ORDER: Array[String] = ["movement", "attack", "heavy", "dodge", "special"]
var done: Array = []
var saw_warning: bool = false
func _init(completed: Array = []) -> void:
 for id in ORDER:
  if id in completed: done.append(id)
func suggest(run: Dictionary) -> Variant:
 for id in ["movement", "attack", "heavy"]:
  if not id in done: return id
 if not "dodge" in done and saw_warning: return "dodge"
 if not "special" in done and run.actors[0].specialMeter == 100: return "special"
 return null
func accept(events: Array, moved: bool) -> Array:
 var gained: Array = []
 var kinds: Array = events.map(func(e: Dictionary) -> String: return e.type)
 if "enemy-warning" in kinds: saw_warning = true
 for id in ORDER:
  if not id in done and (moved if id == "movement" else id in kinds):
   done.append(id)
   gained.append(id)
 return gained
func completed() -> Array:
 return ORDER.filter(func(id: String) -> bool: return id in done)
