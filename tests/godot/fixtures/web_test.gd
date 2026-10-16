extends Node
const Main = preload("res://game/app/main.gd")
const TestBridge = preload("res://game/platform/test_bridge.gd")
func _ready() -> void:
 var query: String = str(JavaScriptBridge.eval("location.search")) if OS.has_feature("web") else ""
 var review_scene := TestBridge.fixture_scene(query)
 if not review_scene.is_empty():
  add_child(load(review_scene).instantiate())
 elif "fixture=enemy-art" in query:
  add_child(load("res://tests/godot/fixtures/art/representative.tscn").instantiate())
 elif "fixture=foundation" in query:
  add_child(load("res://tests/godot/fixtures/foundation.tscn").instantiate())
 else:
  var app := Main.new()
  add_child(app)
  var test_bridge := TestBridge.new()
  add_child(test_bridge)
  if OS.has_feature("web"): test_bridge.initialize(app)
