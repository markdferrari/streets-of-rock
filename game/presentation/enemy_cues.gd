extends RefCounted
# Read-only projection of EnemyAI/Combat regions. It never submits attacks.
static func resolve(snapshot: Dictionary, tick: int) -> Dictionary:
 var action: Dictionary = snapshot.get("action", {})
 var move: String = action.get("moveId", "")
 var visible: bool = snapshot.get("hp", 0) > 0 and action.get("kind") in ["windup", "active"] and (snapshot.get("role") == "liam" or tick >= snapshot.get("stunnedUntilTick", 0))
 var reach: float = {"grunt":1.5,"throw":15.0,"charge":1.0,"close":1.1,"rope":3.0,"shockwave":20.0}.get(move, 0.0)
 var depth: float = {"grunt":0.45,"throw":0.45,"charge":0.6,"close":0.45,"rope":0.45,"shockwave":6.0}.get(move,0.0)
 return {"visible":visible and reach > 0,"move":move,"range":reach,"depthTolerance":depth,"radial":move=="shockwave","facing":snapshot.get("facing",1),"active":action.get("kind")=="active"}
static func geometry(cue: Dictionary, snapshot: Dictionary) -> ArrayMesh:
 var mesh := ArrayMesh.new()
 var vertices := PackedVector3Array()
 if cue.radial:
  for i in 64:
   vertices.append(Vector3.ZERO)
   vertices.append(Vector3(cos(i*TAU/64)*cue.range,0,sin(i*TAU/64)*cue.range))
   vertices.append(Vector3(cos((i+1)*TAU/64)*cue.range,0,sin((i+1)*TAU/64)*cue.range))
 else:
  var direction := Vector2(cue.facing,0)
  if cue.move=="throw":
   var aim: Dictionary = snapshot.action.get("aimPosition", snapshot.position)
   var offset := Vector2(float(aim.x)-float(snapshot.position.x),float(aim.depth)-float(snapshot.position.depth))
   if offset.length()>0: direction=offset.normalized()
  var side := Vector2(-direction.y,direction.x)*float(cue.depthTolerance)
  var end := direction*float(cue.range)
  var points := [side,-side,end-side,end+side]
  for index in [0,1,2,0,2,3]: vertices.append(Vector3(points[index].x,0,points[index].y))
 var arrays := []
 arrays.resize(Mesh.ARRAY_MAX)
 arrays[Mesh.ARRAY_VERTEX]=vertices
 mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays)
 return mesh
