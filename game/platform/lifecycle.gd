extends RefCounted
var context_lost: bool = false
var reload_required: bool = false

func safe(environment: Dictionary) -> bool:
 return bool(environment.get("visible", true)) and bool(environment.get("focused", true)) and not bool(environment.get("portrait", false)) and not context_lost and not reload_required

func lose_context() -> void:
 context_lost = true

func restore_context() -> void:
 context_lost = false

func fail_context_restore() -> void:
 context_lost = true
 reload_required = true
