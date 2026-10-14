extends Node

func _ready() -> void:
	# Packs are mounted before any scene referring to their resources is loaded.
	var packs: Array = []
	if OS.has_feature("web"):
		packs = JSON.parse_string(str(JavaScriptBridge.eval("JSON.stringify(window.SorPackMountOrder || [])")))
	for pack in packs:
		if not ProjectSettings.load_resource_pack(str(pack), false):
			push_error("Required pack could not mount: " + str(pack))
			return
	var entry: String = ProjectSettings.get_setting("application/run/content_scene", "")
	if not entry.is_empty():
		var scene: PackedScene = load(entry)
		if scene == null:
			push_error("Required entry scene failed: " + entry)
			return
		add_child(scene.instantiate())
