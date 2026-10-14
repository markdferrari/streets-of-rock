extends Node
const ACTION_KEYS: Dictionary = {KEY_J: "light", KEY_K: "heavy", KEY_SPACE: "dodge", KEY_L: "special"}
var center: Vector2 = Vector2(72, 318)
var knob: Vector2 = center
var movement_owner: Variant = null
var move_x: float = 0.0
var move_depth: float = 0.0
var action_bounds: Dictionary = {}
var action_owners: Dictionary = {}
var released: Dictionary = {}
var requests: Array = []
var canceled: Array = []
var keys: Dictionary = {}
var next_order: int = 1
var enabled: bool = false
func down(id: int, point: Vector2) -> void:
 if not enabled: return
 released.erase(id)
 if movement_owner == null and point.distance_to(center) <= 60.0:
  movement_owner = id
  drag(id, point)
  return
 if action_owners.has(id): return
 for kind in action_bounds:
  if action_bounds[kind].has_point(point):
   action_owners[id] = kind
   request(kind, id)
   return
func drag(id: int, point: Vector2) -> void:
 if id == movement_owner:
  var dx: float = float(point.x) - center.x
  var dd: float = float(point.y) - center.y
  var length: float = sqrt(dx * dx + dd * dd)
  var factor: float = 1.0 / maxf(60.0, length)
  move_x = dx * factor
  move_depth = dd * factor
  knob = center + Vector2(move_x, move_depth) * 60.0
func up(id: int) -> void:
 if id == movement_owner:
  movement_owner = null
  knob = center
  move_x = 0.0
  move_depth = 0.0
 released[id] = true
 action_owners.erase(id)
func cancel(id: int) -> void:
 if released.erase(id): return
 if id == movement_owner:
  movement_owner = null
  knob = center
  move_x = 0.0
  move_depth = 0.0
 requests = requests.filter(func(value: Dictionary) -> bool: return value.sourcePointerId != id)
 if action_owners.erase(id): canceled.append(id)
func clear() -> void:
 movement_owner = null
 knob = center
 move_x = 0.0
 move_depth = 0.0
 requests.clear()
 canceled.clear()
 action_owners.clear()
 released.clear()
 keys.clear()
func request(kind: String, id: int = -1) -> void:
 if not enabled or not kind in ["light", "heavy", "dodge", "special"]: return
 requests.append({"kind": kind, "sourcePointerId": id, "order": next_order})
 next_order += 1
func key(code: int, pressed: bool, echo: bool = false) -> void:
 if not enabled: return
 if not pressed:
  keys.erase(code)
  return
 if echo or keys.has(code): return
 keys[code] = true
 if ACTION_KEYS.has(code): request(ACTION_KEYS[code], -code)
func frame() -> Dictionary:
 var x: float = move_x if movement_owner != null else 0.0
 var depth: float = move_depth if movement_owner != null else 0.0
 if sqrt(x * x + depth * depth) <= 0.15:
  x = 0.0
  depth = 0.0
 var kx: float = float(keys.has(KEY_D) or keys.has(KEY_RIGHT)) - float(keys.has(KEY_A) or keys.has(KEY_LEFT))
 var kd: float = float(keys.has(KEY_S) or keys.has(KEY_DOWN)) - float(keys.has(KEY_W) or keys.has(KEY_UP))
 var magnitude: float = sqrt(kx * kx + kd * kd)
 if magnitude > 0:
  x = kx / maxf(1.0, magnitude)
  depth = kd / maxf(1.0, magnitude)
 var value: Dictionary = {"move": {"x": x, "depth": depth}, "requests": requests.duplicate(true), "canceledPointerIds": canceled.duplicate()}
 requests.clear()
 canceled.clear()
 return value
func _input(event: InputEvent) -> void:
 if not enabled: return
 if event is InputEventScreenTouch:
  if event.canceled: cancel(event.index)
  elif event.pressed: down(event.index, event.position)
  else: up(event.index)
 elif event is InputEventScreenDrag: drag(event.index, event.position)
 elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
  if event.pressed: down(-1, event.position)
  else: up(-1)
 elif event is InputEventMouseMotion and movement_owner == -1: drag(-1, event.position)
 elif event is InputEventKey: key(event.physical_keycode, event.pressed, event.echo)
