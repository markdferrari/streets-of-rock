extends RefCounted
static func initial(roster: Array) -> Dictionary:
 return {"step": "fighter", "focusedId": roster[0], "previewedId": null, "fighterId": null, "locked": false}
static func reduce(state: Dictionary, event: Dictionary, roster: Array) -> Dictionary:
 var type: String = event.type
 if type == "reset": return {"state": initial(roster)}
 if state.locked: return {"state": state}
 if type == "back":
  if state.step != "partner": return {"state": state}
  return {"state": {"step": "fighter", "focusedId": state.fighterId, "previewedId": state.fighterId, "fighterId": null, "locked": false}}
 var id: String = event.get("id", "")
 if not id in roster or (state.step == "partner" and id == state.fighterId): return {"state": state}
 var updated := state.duplicate(true)
 updated.focusedId = id
 if type == "focus": return {"state": updated}
 if state.previewedId != id:
  updated.previewedId = id
  return {"state": updated}
 if not event.get("ready", false): return {"state": state}
 if state.step == "fighter":
  var other: String = ""
  for candidate in roster:
   if candidate != id:
    other = candidate
    break
  return {"state": {"step": "partner", "fighterId": id, "focusedId": other, "previewedId": null, "locked": false}, "transition": "partner"}
 updated.locked = true
 return {"state": updated, "duo": {"fighterId": state.fighterId, "partnerId": id}}
