extends Control
signal action(id: String)
const Gesture = preload("res://game/platform/gesture_button.gd")
const Selection = preload("res://game/ui/selection_screen.gd")
const Hud = preload("res://game/ui/combat_hud.gd")
const GO_ARROW: Array[Vector2] = [Vector2(0, 0), Vector2(28, 0), Vector2(18, -10), Vector2(28, 0), Vector2(18, 10)]
var controls: Dictionary = {}
var labels: Dictionary = {}
var descriptors: Array = []
var control_bounds: Dictionary = {}
var render_key: String = ""
var state_key: String = ""
var modal: bool = false
var focused_id: String = ""
func _ready() -> void: mouse_filter = Control.MOUSE_FILTER_IGNORE
func clear_ui() -> void:
 for child in get_children():
  child.hide()
  child.queue_free()
 controls.clear()
 labels.clear()
 descriptors.clear()
 control_bounds.clear()
func label(id: String, text: String, rect: Rect2, font_size: int = 18, color: Color = Color("f5e5c6")) -> void:
 var node := Label.new()
 node.text = text
 node.position = rect.position
 node.size = rect.size
 node.add_theme_font_size_override("font_size", font_size)
 node.add_theme_color_override("font_color", color)
 node.mouse_filter = Control.MOUSE_FILTER_IGNORE
 add_child(node)
 labels[id] = node
func button(id: String, text: String, rect: Rect2, disabled: bool = false, pressed: bool = false, image: Texture2D = null, physical: bool = true) -> void:
 var node := Gesture.new()
 node.text = text
 node.position = rect.position
 node.size = rect.size
 node.disabled = disabled
 node.add_theme_font_size_override("font_size", 12 if id in ["heavy", "dodge", "special"] else (13 if id == "light" else 17))
 node.add_theme_color_override("font_color", Color("f5e5c6"))
 var style := StyleBoxFlat.new()
 style.bg_color = Color("55394f") if pressed else Color("25212f")
 style.border_color = Color("f8bb54") if pressed or focused_id == id else Color("7c526c")
 style.set_border_width_all(2)
 style.set_corner_radius_all(10)
 if id in ["light", "heavy", "dodge", "special", "pause"]:
  style.bg_color = Color("f4c85b")
  style.border_color = Color("fff7e9")
  style.set_border_width_all(3)
  style.set_corner_radius_all(int(minf(rect.size.x, rect.size.y) / 2))
  node.add_theme_color_override("font_color", Color("24162d"))
 node.add_theme_stylebox_override("normal", style)
 var disabled_style: StyleBoxFlat = style.duplicate()
 disabled_style.bg_color = Color("534454")
 disabled_style.border_color = Color("88747f")
 node.add_theme_stylebox_override("disabled", disabled_style)
 if image != null:
  node.icon = image
  node.expand_icon = true
  node.add_theme_constant_override("icon_max_width", int(rect.size.x * 0.55))
 add_child(node)
 if physical: node.pressed.connect(func() -> void: action.emit(id))
 controls[id] = node
 control_bounds[id] = {"x": rect.position.x, "y": rect.position.y, "width": rect.size.x, "height": rect.size.y}
 descriptors.append({"id": id, "role": "button", "name": text, "disabled": disabled, "pressed": pressed, "focused": focused_id == id, "focusOrder": descriptors.size(), "bounds": control_bounds[id]})
func focus_control(id: String) -> void:
 focused_id = id
 for key in controls:
  var style: StyleBoxFlat = controls[key].get_theme_stylebox("normal").duplicate()
  style.border_color = Color("f8bb54") if key == id else Color("7c526c")
  controls[key].add_theme_stylebox_override("normal", style)
func render(session: RefCounted, content: RefCounted, environment: Dictionary, settings: Dictionary, active_ms: float, prompt: Variant, readiness: Dictionary = {}) -> bool:
 var width: float = environment.width
 var height: float = environment.height
 if session.phase == "selecting" and not modal: focused_id = "character-" + str(session.selection.focusedId)
 var key: String = str([session.phase, session.selection, width, height, environment.safeInsets, modal])
 var changed: bool = key != render_key
 var pending_gestures: Dictionary = {}
 if changed:
  # Cache/readiness updates can redraw an identical screen between pointer down
  # and pointer up. Keep that gesture only when its logical UI and bounds match.
  if key == state_key:
   for id in controls:
    var control: Button = controls[id]
    if not control.disabled and control.is_visible_in_tree() and not control.sources.is_empty():
     pending_gestures[id] = {"bounds":control.get_global_rect(),"sources":control.sources.duplicate(true)}
  clear_ui()
  render_key = key
  state_key = key
  if session.phase == "selecting":
   label("brand", "STREETS OF ROCK", Rect2(20, 12, width - 40, 32), 22, Color("f8bb54"))
   label("title", Selection.title(session.selection), Rect2(20, 48, width - 40, 42), 26)
   if session.selection.step == "partner": label("role", "AI-controlled companion · Your Chieftain: " + content.definitions[session.selection.fighterId].displayName, Rect2(20, 92, width - 40, 32), 15)
   for index in range(content.roster.size()):
    var id: String = content.roster[index]
    var portrait: Texture2D = load("res://" + content.resources.portraits[id])
    button("character-" + id, content.definitions[id].displayName, Selection.tile_bounds(index, width, height), session.selection.step == "partner" and id == session.selection.fighterId, id == session.selection.previewedId, portrait)
   var preview: Variant = session.selection.previewedId
   if preview != null:
    var stats := Selection.stats(content.definitions[preview])
    var text: String = content.definitions[preview].displayName + " · " + content.definitions[preview].fightingStyle + "\n"
    for stat in stats: text += stat + " " + str(snappedf(stats[stat], 0.1)) + "   "
    label("stats", text + "\nTap again or press Enter again to choose", Rect2(width * 0.55, height * 0.64, width * 0.44, 100), 14)
   else: label("stats", "Tap to Preview", Rect2(width * 0.61, height * 0.64, width * 0.35, 50), 18)
   button("settings", "Settings", Rect2(width - 110, height - 54, 100, 44))
   if readiness.get("waitingUpdate", false): label("update-ready", "Update ready · Close all game windows and reopen", Rect2(18, height - 46, width - 220, 34), 13, Color("f8bb54"))
   if session.selection.step == "partner": button("back", "Back", Rect2(20, height - 54, 90, 44))
  else:
   var bounds := Hud.bounds(width, height, environment.safeInsets)
   label("health", "", Rect2(12 + environment.safeInsets.left, 8 + environment.safeInsets.top, width - 140, 64), 15)
   label("time", "", Rect2(width - 120, 58, 100, 30), 16)
   label("prompt", "", Rect2(width * 0.3, height * 0.18, width * 0.65, 32), 16)
   label("go", "", Hud.go_bounds(width, height, environment.safeInsets, bounds.values()), 23, Color("f8bb54"))
   if session.phase == "running":
    button("pause", "Pause", bounds.pause)
    for id in ["light", "heavy", "dodge", "special"]: button(id, id.capitalize(), bounds[id], false, false, null, false)
   elif session.phase == "countdown": label("countdown", "", Rect2(width * 0.46, height * 0.32, 100, 100), 60)
   elif session.phase == "preparing": label("loading", "Preparing your duo…", Rect2(width * 0.3, height * 0.4, width * 0.6, 60), 24)
   elif session.phase in ["victory", "defeat", "error", "paused"]:
    label("result", session.error if session.phase == "error" else ("Paused · Resume when ready" if session.phase == "paused" else session.phase.capitalize()), Rect2(width * 0.3, height * 0.28, width * 0.6, 64), 28)
    if session.phase == "paused":
     button("resume", "Resume", Rect2(width * 0.35, height * 0.53, 130, 50), environment.portrait or not environment.visible or not environment.focused)
     button("settings", "Settings", Rect2(width * 0.56, height * 0.53, 130, 50))
    else:
     button("retry", "Retry", Rect2(width * 0.35, height * 0.53, 130, 50))
     button("home", "Home", Rect2(width * 0.56, height * 0.53, 130, 50))
 if labels.has("health") and not session.run.is_empty():
  var player: Dictionary = session.run.actors[0]
  var partner: Dictionary = session.run.actors[1]
  labels.health.text = content.definitions[player.characterId].displayName + "  HP " + str(ceil(player.hp)) + "/" + str(player.maxHp) + "  ·  Special " + str(player.specialMeter) + "%\n" + content.definitions[partner.characterId].displayName + "  AI Partner  " + ("KO · Continue solo" if partner.hp <= 0 else "HP " + str(ceil(partner.hp)))
  labels.time.text = "%d:%02d" % [int(active_ms / 60000), int(active_ms / 1000) % 60]
  labels.prompt.text = "" if prompt == null else {"movement": "Move with the joystick or WASD", "attack": "Light: tap to attack", "heavy": "Heavy: slower, powerful strike", "dodge": "Dodge the warning", "special": "Special ready — use your signature move"}[prompt]
  var obstacles: Array = []
  for control in controls.values():
   if control.visible: obstacles.append(control.get_rect())
  for id in labels:
   if id != "go" and labels[id].visible and not labels[id].text.is_empty(): obstacles.append(labels[id].get_rect())
  var go_rect := Hud.go_bounds(width, height, environment.safeInsets, obstacles)
  labels.go.position = go_rect.position
  labels.go.size = go_rect.size
  labels.go.text = "GO" if go_rect.has_area() and Hud.go(session.run, session.phase, content.level.areas.size()) else ""
  labels.go.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
 if labels.has("countdown"): labels.countdown.text = str(session.countdown.number)
 if modal and changed:
  # Settings remain active while the run and its clocks are paused.
  for child in get_children():
   child.hide()
   if child is Button: child.disabled = true
  controls.clear()
  descriptors.clear()
  control_bounds.clear()
  descriptors.append({"id":"settings-dialog", "role":"dialog", "name":"Settings", "bounds":{"x":0.0,"y":0.0,"width":width,"height":height}})
  label("settingsTitle", "Settings", Rect2(width * 0.35, 18, width * 0.5, 42), 28)
  descriptors.append({"id":"settings-heading", "role":"heading", "name":"Settings", "focusOrder":-1, "bounds":{"x":width * 0.35,"y":18.0,"width":width * 0.5,"height":42.0}})
  for index in range(2):
   var id: String = ["music", "effects"][index]
   label(id, id.capitalize() + " volume", Rect2(width * 0.27, 76 + index * 74, 200, 40), 19)
   descriptors.append({"id":id + "-volume", "role":"slider", "name":id.capitalize() + " volume", "value":settings["musicVolume" if id == "music" else "effectsVolume"], "min":0.0,"max":1.0,"focusOrder":descriptors.size(),"bounds":{"x":width * 0.26,"y":76.0 + index * 74.0,"width":width * 0.25,"height":36.0}})
   button(id + "-down", "Lower " + id, Rect2(width * 0.55, 70 + index * 74, 110, 48))
   button(id + "-up", "Raise " + id, Rect2(width * 0.72, 70 + index * 74, 110, 48))
  button("shake", "Screen shake", Rect2(width * 0.3, 224, width * 0.4, 48), false, settings.screenShake)
  if readiness.get("diagnostics", false): button("download-diagnostics", "Download diagnostics", Rect2(width * 0.27, 276, width * 0.46, 42))
  var offline: String = str(readiness.get("offline", "checking")).capitalize()
  if not str(readiness.get("offlineError", "")).is_empty(): offline += ": " + str(readiness.offlineError)
  label("offline-status", offline, Rect2(width * 0.25, height - 112, width * 0.5, 30), 15)
  if readiness.get("offline", "checking") != "ready": button("retry-cache", "Retry offline check", Rect2(width * 0.29, height - 78, width * 0.42, 42))
  button("close-settings", "Close settings", Rect2(width * 0.39, height - 58, 180, 48))
 if modal:
  if labels.has("music"): labels.music.text = "Music " + str(round(settings.musicVolume * 100)) + "%"
  if labels.has("effects"): labels.effects.text = "Effects " + str(round(settings.effectsVolume * 100)) + "%"
 for id in pending_gestures:
  if controls.has(id) and not controls[id].disabled and controls[id].get_global_rect() == pending_gestures[id].bounds:
   controls[id].sources = pending_gestures[id].sources
 return changed
var joystick_visible: bool = false
var joystick_center: Vector2 = Vector2.ZERO
var joystick_knob: Vector2 = Vector2.ZERO
func _draw() -> void:
 if labels.has("go") and labels.go.visible and labels.go.text == "GO":
  var origin: Vector2 = labels.go.position + Vector2(56, 24)
  for index in range(1, GO_ARROW.size()): draw_line(origin + GO_ARROW[index - 1], origin + GO_ARROW[index], Color("f8bb54"), 3, true)
 if not joystick_visible: return
 draw_circle(joystick_center, 60, Color(0.1, 0.08, 0.15, 0.65))
 draw_arc(joystick_center, 60, 0, TAU, 48, Color("f4c85b"), 4, true)
 draw_circle(joystick_knob, 26, Color("f4c85b"))
 draw_arc(joystick_knob, 26, 0, TAU, 32, Color("fff7e9"), 3, true)
