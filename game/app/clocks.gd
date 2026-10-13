extends RefCounted
const STEP_MS: float = 1000.0 / 60.0
var discarded_ms: float = 0.0
var last_now: Variant = null
var accumulated_ms: float = 0.0
func frame(now: float, running: bool) -> int:
 if not running:
  reset()
  return 0
 if last_now == null:
  last_now = now
  return 0
 accumulated_ms += maxf(0.0, now - last_now)
 last_now = now
 if accumulated_ms > 5.0 * STEP_MS:
  discarded_ms += accumulated_ms - 5.0 * STEP_MS
  accumulated_ms = 5.0 * STEP_MS
 var steps: int = 0
 while accumulated_ms + 1e-9 >= STEP_MS and steps < 5:
  accumulated_ms -= STEP_MS
  steps += 1
 return steps
func reset() -> void:
 last_now = null
 accumulated_ms = 0.0
class ActiveClock:
 extends RefCounted
 var accumulated_ms: float = 0.0
 var active_since: Variant = null
 func start(now: float) -> void:
  if active_since == null: active_since = now
 func pause(now: float) -> void:
  if active_since != null:
   accumulated_ms += maxf(0.0, now - active_since)
   active_since = null
 func elapsed(now: float) -> float:
  return accumulated_ms + (0.0 if active_since == null else maxf(0.0, now - active_since))
 func reset() -> void:
  accumulated_ms = 0.0
  active_since = null
class Countdown:
 extends RefCounted
 var number: Variant = 3
 var elapsed_ms: float = 0.0
 var completed: bool = false
 var paused: bool = false
 var last_sample: float
 func _init(now: float) -> void: last_sample = now
 func frame(now: float) -> bool:
  if paused or completed: return false
  elapsed_ms += maxf(0.0, now - last_sample)
  last_sample = now
  if elapsed_ms < 1000.0: return false
  elapsed_ms = 0.0
  if number == 1:
   number = null
   completed = true
  else: number -= 1
  return true
 func pause(now: float) -> void:
  if paused or completed: return
  frame(now)
  paused = true
 func resume(now: float) -> void:
  if not paused or completed: return
  paused = false
  last_sample = now
