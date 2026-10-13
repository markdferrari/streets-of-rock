extends RefCounted
const KEYS := ["sor.settings.v1", "streets-of-rock.best.v1", "streets-of-rock.tutorial.v1"]
var values: Dictionary = {}

func environment() -> Dictionary:
 var size := DisplayServer.window_get_size()
 return {"width":maxf(1.0,size.x),"height":maxf(1.0,size.y),"dpr":1.0,"safeInsets":{"top":0.0,"right":0.0,"bottom":0.0,"left":0.0},"visible":true,"focused":true,"portrait":size.y>size.x,"reducedMotion":false}

func read_stored(key: String) -> Variant:
 return values.get(key) if key in KEYS else null

func write_stored(key: String, value: String) -> bool:
 if not key in KEYS: return false
 values[key] = value
 return true
