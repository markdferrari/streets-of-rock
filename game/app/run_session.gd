extends RefCounted
const Selection = preload("res://game/app/selection.gd")
const Clocks = preload("res://game/app/clocks.gd")
const State = preload("res://game/simulation/run_state.gd")
var phase: String = "selecting"
var generation: int = 0
var selection: Dictionary
var duo: Dictionary = {}
var run: Dictionary = {}
var countdown: RefCounted
var resume_target: String = ""
var error: String = ""
var content: RefCounted
func _init(catalogue: RefCounted) -> void:
 content = catalogue
 selection = Selection.initial(content.roster)
func select(event: Dictionary) -> Array:
 if phase != "selecting": return []
 var update := Selection.reduce(selection, event, content.roster)
 selection = update.state
 if not update.has("duo"): return []
 duo = update.duo
 return prepare()
func prepare() -> Array:
 if duo.is_empty(): return []
 generation += 1
 phase = "preparing"
 run = {}
 countdown = null
 resume_target = ""
 error = ""
 return [{"type": "clearInputs"}, {"type": "disposeViews"}, {"type": "prepare", "duo": duo, "generation": generation}]
func prepared(prepared_generation: int, prepared_run: Dictionary, now: float) -> bool:
 if prepared_generation != generation or duo.is_empty() or not (phase == "preparing" or (phase == "paused" and resume_target == "preparing")): return false
 if prepared_run.get("duo") != duo or prepared_run.get("tick") != 0: return false
 run = prepared_run
 countdown = Clocks.Countdown.new(now)
 if phase == "paused":
  countdown.pause(now)
  resume_target = "countdown"
 else: phase = "countdown"
 return true
func failed(failed_generation: int, message: String) -> void:
 if failed_generation != generation or not (phase == "preparing" or (phase == "paused" and resume_target == "preparing")): return
 phase = "error"
 resume_target = ""
 run = {}
 countdown = null
 error = message
func frame(now: float) -> Array:
 if phase != "countdown" or countdown == null or run.is_empty(): return []
 # An interrupt can sample/complete the final second before this frame.
 countdown.frame(now)
 if not countdown.completed: return []
 phase = "running"
 return [{"type": "clearInputs"}, {"type": "launch", "run": run}]
func interrupt(now: float) -> Array:
 if not phase in ["preparing", "countdown", "running"]: return []
 resume_target = phase
 if phase == "countdown": countdown.pause(now)
 phase = "paused"
 return [{"type": "clearInputs"}]
func resume(safe: bool, now: float) -> Array:
 if not safe or phase != "paused" or resume_target.is_empty(): return []
 phase = resume_target
 resume_target = ""
 if phase == "countdown": countdown.resume(now)
 return [{"type": "clearInputs"}]
func finish() -> void:
 if phase != "running" or run.is_empty(): return
 if State.player(run).hp <= 0 or run.result == "defeat": phase = "defeat"
 else:
  if run.result == "victory": phase = "victory"
  else:
   for actor in run.actors:
    if actor.role == "liam" and actor.hp <= 0: phase = "victory"
func retry() -> Array:
 return prepare() if phase in ["error", "victory", "defeat"] and not duo.is_empty() else []
func home() -> Array:
 generation += 1
 phase = "selecting"
 selection = Selection.initial(content.roster)
 duo = {}
 run = {}
 countdown = null
 resume_target = ""
 error = ""
 return [{"type": "clearInputs"}, {"type": "disposeViews"}]
