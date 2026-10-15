extends ScrollContainer
# Plain bundled text; opening this view never changes session state.
func build(rect: Rect2) -> String:
 position = rect.position
 size = rect.size
 horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
 var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://public/assets/credits/art-credits.json"))
 var text: String = parsed.get("text", "Artwork credits unavailable; restore bundled notices.") if parsed is Dictionary else "Artwork credits unavailable; restore bundled notices."
 var body := Label.new()
 body.text = text
 body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
 body.custom_minimum_size.x = maxf(100,rect.size.x-24)
 body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
 body.add_theme_font_size_override("font_size",16)
 body.mouse_filter = Control.MOUSE_FILTER_IGNORE
 add_child(body)
 return text
