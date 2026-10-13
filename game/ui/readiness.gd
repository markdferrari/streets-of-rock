extends RefCounted
var runtime: String = "loading"
var runtime_error: String = ""
var offline: String = "checking"
var offline_error: String = ""
var missing: Array = []
var waiting_update: bool = false

func set_runtime_ready() -> void:
 runtime = "ready"
 runtime_error = ""

func set_runtime_error(message: String) -> void:
 runtime = "error"
 runtime_error = message

func cache_status(value: Dictionary) -> void:
 offline = "ready" if value.get("state") == "ready" and value.get("buildId", "") != "" else "incomplete"
 offline_error = str(value.get("error", ""))
 missing = value.get("missing", []) + value.get("corrupt", [])

func set_update_waiting(value: bool) -> void:
 waiting_update = value

func status_text(phase: String) -> String:
 if waiting_update and phase in ["selecting", "victory", "defeat", "error"]: return "Update ready. Close all game windows and reopen to update."
 if offline == "ready": return "Offline ready"
 if offline == "incomplete": return "Offline cache incomplete. Retry the cache check when online."
 return "Checking offline availability…"

func snapshot() -> Dictionary:
 return {"runtime":runtime,"runtimeError":runtime_error,"offline":offline,"offlineError":offline_error,"missing":missing.duplicate(),"waitingUpdate":waiting_update}
