extends RefCounted
const EditorPlatform = preload("res://game/platform/editor_platform.gd")
signal message(value: Dictionary)
var adapter: Variant
var editor_adapter: RefCounted
var callback: JavaScriptObject
var environment: Dictionary = {}
var mode: String = "editor"

func initialize() -> bool:
 if not OS.has_feature("web"):
  editor_adapter = EditorPlatform.new()
  environment = editor_adapter.environment()
  mode = "editor"
  return true
 adapter = JavaScriptBridge.get_interface("SorBrowser")
 if adapter == null:
  return false
 callback = JavaScriptBridge.create_callback(_on_message)
 var snapshot: Variant = JSON.parse_string(str(adapter.initializeJson(callback, 1)))
 if not snapshot is Dictionary or snapshot.get("apiVersion") != 1:
  return false
 environment = snapshot.environment
 mode = str(snapshot.get("mode", "editor"))
 return true

func _on_message(arguments: Array) -> void:
 var value: Variant = JSON.parse_string(str(arguments[0]))
 if not value is Dictionary:
  return
 if value.get("type") == "environment":
  environment = value.environment
 message.emit(value)

func publish_ui(generation: int, controls: Array) -> void:
 if adapter != null:
  adapter.publishUi(JSON.stringify({"generation":generation, "controls":controls}))

func read_stored(key: String) -> Variant:
 if editor_adapter != null: return editor_adapter.read_stored(key)
 if adapter == null: return null
 var result: Variant = JSON.parse_string(str(adapter.readStoredJson(key)))
 if result is Dictionary and result.get("ok", false): return result.get("value")
 return null

func write_stored(key: String, value: String) -> bool:
 if editor_adapter != null: return editor_adapter.write_stored(key, value)
 if adapter == null: return false
 var result: Variant = JSON.parse_string(str(adapter.writeStoredJson(key, value)))
 return result is Dictionary and result.get("ok", false)

func repair_cache() -> void:
 if adapter != null: adapter.repairCache()

func check_cache() -> void:
 if adapter != null: adapter.cacheStatus()

func download_diagnostics(payload: Dictionary) -> void:
 if adapter != null and mode == "diagnostics": adapter.downloadDiagnostics(JSON.stringify(payload))

func dispose() -> void:
 if adapter is JavaScriptObject:
  adapter.dispose()
 editor_adapter = null
 callback = null
 adapter = null
