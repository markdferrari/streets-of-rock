extends Button
var sources: Dictionary = {}

func _ready() -> void:
 mouse_filter = Control.MOUSE_FILTER_IGNORE
 focus_mode = Control.FOCUS_NONE

func cancel_source(index: int) -> void:
 sources.erase(index)

func cancel_all() -> void:
 sources.clear()

func _input(event: InputEvent) -> void:
 handle_event(event)

func handle_event(event: InputEvent) -> void:
 if disabled:
  cancel_all()
  return
 var source: int = -1
 var point: Vector2
 var down: bool = false
 var release: bool = false
 var canceled: bool = false
 if event is InputEventScreenTouch:
  source = event.index
  point = event.position
  down = event.pressed
  release = not event.pressed
  canceled = event.canceled
 elif event is InputEventScreenDrag:
  source = event.index
  point = event.position
 elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
  point = event.position
  down = event.pressed
  release = not event.pressed
 elif event is InputEventMouseMotion:
  point = event.position
 else:
  return
 if down and get_global_rect().has_point(point) and not canceled:
  sources[source] = {"start":point,"dragged":false}
 elif sources.has(source):
  if point.distance_to(sources[source].start) > 8.0:
   sources[source].dragged = true
  if release:
   var valid: bool = not canceled and not sources[source].dragged and get_global_rect().has_point(point)
   sources.erase(source)
   if valid:
    pressed.emit()
