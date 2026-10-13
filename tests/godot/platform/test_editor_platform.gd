extends GutTest
const Bridge = preload("res://game/platform/browser_bridge.gd")
func test_editor_adapter_keeps_allowlisted_values_in_memory_and_reports_geometry() -> void:
 var bridge := Bridge.new()
 assert_true(bridge.initialize())
 assert_eq(bridge.mode, "editor")
 assert_true(bridge.environment.width > 0)
 assert_true(bridge.write_stored("sor.settings.v1", "{\"schemaVersion\":1}"))
 assert_eq(bridge.read_stored("sor.settings.v1"), "{\"schemaVersion\":1}")
 assert_false(bridge.write_stored("unrelated.key", "{}"))
 assert_null(bridge.read_stored("unrelated.key"))
 bridge.dispose()
