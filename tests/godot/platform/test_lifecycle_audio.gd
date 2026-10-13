extends GutTest
const Lifecycle = preload("res://game/platform/lifecycle.gd")
const Audio = preload("res://game/platform/audio.gd")

func test_visibility_focus_portrait_and_context_require_explicit_safe_resume() -> void:
 var lifecycle := Lifecycle.new()
 var env := {"visible":true,"focused":true,"portrait":false}
 assert_true(lifecycle.safe(env))
 for key in ["visible", "focused"]:
  var interrupted := env.duplicate()
  interrupted[key] = false
  assert_false(lifecycle.safe(interrupted))
 assert_false(lifecycle.safe({"visible":true,"focused":true,"portrait":true}))
 lifecycle.lose_context()
 assert_false(lifecycle.safe(env))
 lifecycle.restore_context()
 assert_true(lifecycle.safe(env))
 lifecycle.lose_context()
 lifecycle.fail_context_restore()
 lifecycle.restore_context()
 assert_false(lifecycle.safe(env))

func test_audio_uses_one_stream_and_eight_reusable_voices_and_preserves_pause() -> void:
 var audio := Audio.new()
 add_child(audio)
 await get_tree().process_frame
 assert_eq(audio.voice_count(), 8)
 assert_eq(audio.get_child_count(), 9)
 audio.apply_settings({"musicVolume":0.35,"effectsVolume":0.6})
 audio.unlock(false)
 assert_true(audio.enabled)
 assert_true(audio.music.stream_paused)
 var start := audio.music.get_playback_position()
 audio.set_running(true)
 audio.play_events([{"type":"hit"}])
 audio.set_running(false)
 assert_true(audio.music.stream_paused)
 assert_true(audio.voices[0].stream_paused)
 audio.set_running(true)
 assert_false(audio.music.stream_paused)
 assert_false(audio.voices[0].stream_paused)
 audio.retry(false)
 assert_true(audio.music.stream_paused)
 audio.free()
