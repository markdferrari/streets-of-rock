extends GutTest
const Persistence = preload("res://game/platform/persistence.gd")

func test_settings_fallback_validation_and_storage_denial_remain_playable() -> void:
 var raw := {"sor.settings.v1": "{\"schemaVersion\":1,\"musicVolume\":4,\"effectsVolume\":0.25,\"screenShake\":false}"}
 var writes: Array = []
 var store := Persistence.new(func(key: String) -> Variant: return raw.get(key), func(key: String, value: String) -> bool: writes.append([key, value]); return true)
 var settings: Dictionary = store.load_settings()
 assert_eq(settings.musicVolume, 0.7)
 assert_eq(settings.effectsVolume, 0.25)
 assert_false(settings.screenShake)
 store.save_settings({"musicVolume": 0.4})
 assert_eq(writes.size(), 1)
 var denied := Persistence.new(func(_key: String) -> Variant: return null, func(_key: String, _value: String) -> bool: return false)
 assert_eq(denied.load_settings().musicVolume, 0.7)
 denied.save_settings({"effectsVolume": 0.1})
 assert_eq(denied.settings.effectsVolume, 0.1)

func test_best_result_replaces_only_strictly_better_victories() -> void:
 var raw := {"streets-of-rock.best.v1": "{\"schemaVersion\":1,\"bestSuccessfulMs\":1200}"}
 var writes: Array = []
 var store := Persistence.new(func(key: String) -> Variant: return raw.get(key), func(key: String, value: String) -> bool: writes.append([key, value]); return true)
 assert_eq(store.load_best_result(), 1200)
 assert_false(store.record_victory(1200))
 assert_false(store.record_victory(1300))
 assert_true(store.record_victory(1100))
 assert_eq(writes.size(), 1)

func test_tutorial_uses_only_canonical_ids_and_transient_state_is_not_saved() -> void:
 var writes: Array = []
 var raw := {"streets-of-rock.tutorial.v1": "{\"schemaVersion\":1,\"completed\":[\"movement\",\"made-up\",\"light\"]}"}
 var store := Persistence.new(func(key: String) -> Variant: return raw.get(key), func(key: String, value: String) -> bool: writes.append([key, value]); return true)
 assert_eq(store.load_tutorial(), ["movement"])
 store.save_tutorial(["movement", "attack", "light", "heavy"])
 assert_eq(store.tutorial_completed, ["movement", "attack", "heavy"])
 assert_eq(writes.size(), 1)
 store.save_settings({"screenShake": false})
 assert_eq(writes.size(), 2)
