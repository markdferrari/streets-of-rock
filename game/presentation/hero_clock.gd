extends RefCounted
var elapsed: float = 0.0
func advance(delta: float, active: bool, reduced: bool) -> float:
 if reduced: return 0.0
 if active: elapsed += maxf(delta, 0.0)
 return elapsed
