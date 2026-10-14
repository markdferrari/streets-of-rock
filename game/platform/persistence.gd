extends RefCounted
const SETTINGS_KEY := "sor.settings.v1"
const BEST_KEY := "streets-of-rock.best.v1"
const TUTORIAL_KEY := "streets-of-rock.tutorial.v1"
const TUTORIAL_IDS: Array[String] = ["movement", "attack", "heavy", "dodge", "special"]
const DEFAULT_SETTINGS := {"schemaVersion": 1, "musicVolume": 0.7, "effectsVolume": 0.8, "screenShake": true}
var reader: Callable
var writer: Callable
var settings: Dictionary = DEFAULT_SETTINGS.duplicate(true)
var best_ms: float = 0.0
var tutorial_completed: Array[String] = []

func _init(read_value: Callable = Callable(), write_value: Callable = Callable()) -> void:
 reader = read_value
 writer = write_value

func _read(key: String) -> Variant:
 if not reader.is_valid(): return null
 var result: Variant = reader.call(key)
 if result is Dictionary:
  if not result.get("ok", false): return null
  return result.get("value")
 return result

func _write(key: String, value: Dictionary) -> bool:
 if not writer.is_valid(): return false
 return bool(writer.call(key, JSON.stringify(value)))

func _parsed(key: String) -> Variant:
 var raw: Variant = _read(key)
 if not raw is String or raw.is_empty(): return null
 return JSON.parse_string(raw)

func load_settings() -> Dictionary:
 var value: Variant = _parsed(SETTINGS_KEY)
 if not value is Dictionary or value.get("schemaVersion") != 1:
  settings = DEFAULT_SETTINGS.duplicate(true)
  return settings.duplicate(true)
 settings = {
  "schemaVersion": 1,
  "musicVolume": _volume(value.get("musicVolume"), DEFAULT_SETTINGS.musicVolume),
  "effectsVolume": _volume(value.get("effectsVolume"), DEFAULT_SETTINGS.effectsVolume),
  "screenShake": value.get("screenShake") if value.get("screenShake") is bool else DEFAULT_SETTINGS.screenShake
 }
 return settings.duplicate(true)

func _volume(value: Variant, fallback: float) -> float:
 if not (value is int or value is float): return fallback
 var number := float(value)
 return number if is_finite(number) and number >= 0.0 and number <= 1.0 else fallback

func save_settings(change: Dictionary) -> Dictionary:
 settings = {
  "schemaVersion": 1,
  "musicVolume": _volume(change.get("musicVolume", settings.musicVolume), settings.musicVolume),
  "effectsVolume": _volume(change.get("effectsVolume", settings.effectsVolume), settings.effectsVolume),
  "screenShake": change.get("screenShake", settings.screenShake) if change.get("screenShake", settings.screenShake) is bool else settings.screenShake
 }
 _write(SETTINGS_KEY, settings)
 return settings.duplicate(true)

func load_best_result() -> float:
 var value: Variant = _parsed(BEST_KEY)
 best_ms = 0.0
 if value is Dictionary and value.get("schemaVersion") == 1:
  var candidate: Variant = value.get("bestSuccessfulMs")
  if (candidate is int or candidate is float) and is_finite(float(candidate)) and candidate > 0: best_ms = float(candidate)
 return best_ms

func record_victory(elapsed_ms: float) -> bool:
 if not is_finite(elapsed_ms) or elapsed_ms <= 0 or (best_ms > 0 and elapsed_ms >= best_ms): return false
 best_ms = elapsed_ms
 _write(BEST_KEY, {"schemaVersion": 1, "bestSuccessfulMs": elapsed_ms})
 return true

func load_tutorial() -> Array[String]:
 tutorial_completed.clear()
 var value: Variant = _parsed(TUTORIAL_KEY)
 if value is Dictionary and value.get("schemaVersion") == 1 and value.get("completed") is Array:
  for id in value.completed:
   if id is String and id in TUTORIAL_IDS and not id in tutorial_completed: tutorial_completed.append(id)
 return tutorial_completed.duplicate()

func save_tutorial(completed: Array) -> void:
 tutorial_completed.clear()
 for id in TUTORIAL_IDS:
  if id in completed: tutorial_completed.append(id)
 _write(TUTORIAL_KEY, {"schemaVersion": 1, "completed": tutorial_completed})
