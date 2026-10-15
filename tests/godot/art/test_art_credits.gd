extends GutTest
const Screen = preload("res://game/ui/session_screen.gd")
const Catalogue = preload("res://game/content/catalogue.gd")
const Session = preload("res://game/app/run_session.gd")
func test_credits_are_bundled_scrollable_and_preserve_paused_selection() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var session := Session.new(content)
 var screen := Screen.new()
 add_child_autofree(screen)
 var environment := {"width":667.0,"height":375.0,"safeInsets":{"left":0,"right":0,"top":0,"bottom":0},"portrait":false,"visible":true,"focused":true}
 var settings := {"musicVolume":0.7,"effectsVolume":0.8,"screenShake":false}
 screen.render(session,content,environment,settings,0,null)
 assert_true(screen.controls.has("artwork-credits"),"home must expose bundled credits")
 var before := session.selection.duplicate(true)
 screen.set("credits_open",true)
 screen.render(session,content,environment,settings,0,null)
 assert_true(screen.controls.has("close-credits"))
 var scrolls := screen.find_children("*","ScrollContainer",true,false)
 assert_eq(scrolls.size(),1,"long notices must scroll within safe bounds")
 assert_eq(session.selection,before)
 assert_true(str(screen.descriptors).contains("Artwork Credits"))
