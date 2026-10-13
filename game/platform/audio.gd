extends Node
const MUSIC_PATH := "res://public/assets/audio/brightside.mp3"
const EFFECTS := {"attack":"res://public/assets/audio/sfx-attack.wav", "heavy":"res://public/assets/audio/sfx-attack.wav", "special":"res://public/assets/audio/sfx-attack.wav", "special-release":"res://public/assets/audio/sfx-attack.wav", "headrest-release":"res://public/assets/audio/sfx-attack.wav", "roar-wave":"res://public/assets/audio/sfx-attack.wav", "damage":"res://public/assets/audio/sfx-damage.wav", "hit":"res://public/assets/audio/sfx-hit.wav", "table-broken":"res://public/assets/audio/sfx-hit.wav", "pickup":"res://public/assets/audio/sfx-pickup.wav", "victory":"res://public/assets/audio/sfx-result.wav", "defeat":"res://public/assets/audio/sfx-result.wav"}
var music: AudioStreamPlayer
var voices: Array[AudioStreamPlayer] = []
var samples: Dictionary = {}
var next_voice: int = 0
var enabled: bool = false
var preferences: Dictionary = {"musicVolume":0.7,"effectsVolume":0.8}

func _ready() -> void:
 music = AudioStreamPlayer.new()
 music.name = "Music"
 if ResourceLoader.exists(MUSIC_PATH):
  var stream := load(MUSIC_PATH) as AudioStreamMP3
  if stream != null:
   stream.loop = true
   music.stream = stream
 add_child(music)
 for index in range(8):
  var voice := AudioStreamPlayer.new()
  voice.name = "EffectVoice%d" % index
  add_child(voice)
  voices.append(voice)
 for event_type in EFFECTS:
  var path: String = EFFECTS[event_type]
  if ResourceLoader.exists(path): samples[event_type] = load(path)
 apply_settings(preferences)

func apply_settings(value: Dictionary) -> void:
 preferences.musicVolume = clampf(float(value.get("musicVolume",0.7)),0.0,1.0)
 preferences.effectsVolume = clampf(float(value.get("effectsVolume",0.8)),0.0,1.0)
 if music != null: music.volume_db = linear_to_db(maxf(0.0001,preferences.musicVolume))
 for voice in voices: voice.volume_db = linear_to_db(maxf(0.0001,preferences.effectsVolume))

func unlock(running: bool) -> void:
 enabled = true
 if music.stream != null and not music.playing: music.play()
 music.stream_paused = not running
 for voice in voices: voice.stream_paused = not running

func set_running(running: bool) -> void:
 if not enabled: return
 if running and music.stream != null and not music.playing: music.play()
 music.stream_paused = not running
 for voice in voices: voice.stream_paused = not running

func retry(running: bool) -> void:
 if not enabled: return
 music.stop()
 if music.stream != null: music.play()
 music.stream_paused = not running
 for voice in voices: voice.stream_paused = not running

func play_events(events: Array) -> void:
 if not enabled or voices.is_empty(): return
 for event in events:
  var kind: String = str(event.get("type",""))
  if kind == "attack": kind = "hit"
  if not samples.has(kind): continue
  var voice: AudioStreamPlayer = voices[next_voice]
  next_voice = (next_voice + 1) % voices.size()
  voice.stream = samples[kind]
  voice.play()

func voice_count() -> int: return voices.size()
