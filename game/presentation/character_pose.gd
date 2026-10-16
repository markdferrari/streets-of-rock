extends RefCounted
## Pure semantic resolution. Gameplay owns position, eligibility and action timing.
static func sample(binding: Dictionary, progress: float, weight: float = 1.0) -> Dictionary:
 return {"clipName":binding.clipName,"timeSeconds":lerpf(binding.startSeconds, binding.endSeconds, clampf(progress, 0.0, 1.0)),"weight":weight}
static func support_group(id: String) -> String:
 return {"cow":"cow1","crow":"crow","lion":"lionSupport","plates":"platesSupport"}[id]
static func group(actor: Dictionary) -> String:
 var move: String = actor.action.get("moveId", "")
 if move == "support": return support_group(actor.characterId)
 if move == "heavy": return actor.characterId + "Heavy"
 if move == "special": return {"cow":"spin","crow":"wingSpin","lion":"roar","plates":"headrest"}[actor.characterId]
 if move.begins_with("light"): return actor.characterId + move.right(1)
 return move
static func resolve(actor: Dictionary, profile: Dictionary, motion: RefCounted) -> Dictionary:
 var key := "Idle"
 var progress := fposmod(motion.idle_elapsed / profile.idleCycleSeconds, 1.0)
 var samples: Array = []
 var action: Dictionary = actor.action
 var partner: bool = actor.get("role") == "partner"
 var authoritative: bool = action.kind in ["windup", "active", "recovery", "dodge"] and not (partner and action.get("moveId") == "special")
 if actor.hp <= 0 or motion.knocked_out:
  key = "KnockedOut"
  progress = clampf(motion.knockout_elapsed / profile.knockoutSeconds, 0, 1)
 elif authoritative:
  key = "Dodge" if action.kind == "dodge" else group(actor) + "." + action.kind
  var duration: int = action.endTick - action.startedTick
  progress = clampf(float(motion.last_tick - action.startedTick) / duration, 0, 1) if duration > 0 else 1.0
 elif motion.last_tick - motion.reaction_tick < profile.hurtSeconds * 60:
  key = "Hurt"
  progress = clampf(float(motion.last_tick - motion.reaction_tick) / (profile.hurtSeconds * 60), 0, 1)
 elif motion.moving:
  key = "Move"
  var local := Vector2(motion.direction.x * actor.facing, motion.direction.y * actor.facing)
  var total: float = absf(local.x) + absf(local.y)
  for axis in [0, 1]:
   if absf(local[axis]) <= 0.000001: continue
   var direction: String = ("forward" if local.x > 0 else "backward") if axis == 0 else ("right" if local.y > 0 else "left")
   var loop: Dictionary = profile.locomotion[direction]
   samples.append(sample(loop, fposmod(motion.distance / loop.strideDistance, 1.0), absf(local[axis]) / total))
 if partner and key == "Idle" and actor.hp > 0:
  var age: int = motion.last_tick - motion.support_tick
  if age >= 6 and age < 12:
   key = support_group(actor.characterId) + ".recovery"
   progress = float(age - 6) / 6.0
  elif actor.get("intentState", {}).get("intent") == "engage":
   key = support_group(actor.characterId) + ".windup"
   progress = clampf(1.0 - float(actor.get("decisionReadyTick", motion.last_tick + 6) - motion.last_tick) / 6.0, 0.0, 1.0)
 var binding: Dictionary = profile.bindings[key]
 if samples.is_empty():
  samples.append(sample(binding, progress))
  if binding.mode == "hold": samples[0].timeSeconds = binding.fixedSampleSeconds
 var reaction: Dictionary = {}
 if authoritative and action.kind != "active" and actor.hp > 0 and motion.last_tick - motion.reaction_tick < profile.hurtSeconds * 60:
  reaction = sample(profile.bindings.Hurt, float(motion.last_tick - motion.reaction_tick) / (profile.hurtSeconds * 60))
  reaction.boneNames = profile.reactionBoneNames
  reaction.restRelative = true
 var blend: float = minf(0.1, profile.transitionSeconds.get("action", 0.0))
 if action.kind != "windup" or key == "KnockedOut": blend = 0.0
 else: blend = minf(blend, maxf(0, action.endTick - motion.last_tick) / 60.0)
 return {"semanticKey":key,"samples":samples,"reaction":reaction,"blendSeconds":blend,"terminalHold":key == "KnockedOut" and progress >= 1.0,"actionIdentity":motion.action_identity,"transitionWeight":clampf(float(motion.last_tick - motion.phase_anchor) / (blend * 60.0), 0, 1) if blend > 0 else 1.0}
