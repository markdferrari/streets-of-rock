extends GutTest
const Catalogue = preload("res://game/content/catalogue.gd")
const Store = preload("res://game/content/resource_store.gd")
const View = preload("res://game/presentation/character_view.gd")
func test_shared_material_batching_keeps_hero_skeletons_materials_and_all_triangles() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 var store := Store.new()
 for id in content.roster:
  assert_true(store.prepare_hero(content,id))
  var instance := store.create(id)
  var originals := instance.find_children("*","MeshInstance3D",true,false)
  var triangles := 0
  for mesh in originals:
   for surface in mesh.mesh.get_surface_count():
    var arrays: Array = mesh.mesh.surface_get_arrays(surface)
    triangles += arrays[Mesh.ARRAY_INDEX].size() if arrays[Mesh.ARRAY_INDEX]!=null else arrays[Mesh.ARRAY_VERTEX].size()
  var view := View.new()
  add_child(view)
  view.attach(instance)
  var visible_surfaces := 0
  var batched_triangles := 0
  for mesh in instance.find_children("*","MeshInstance3D",true,false):
   if not mesh.visible: continue
   assert_not_null(mesh.skin)
   assert_true(mesh.get_node(mesh.skeleton) is Skeleton3D)
   for surface in mesh.mesh.get_surface_count():
    visible_surfaces += 1
    var arrays: Array = mesh.mesh.surface_get_arrays(surface)
    batched_triangles += arrays[Mesh.ARRAY_INDEX].size() if arrays[Mesh.ARRAY_INDEX]!=null else arrays[Mesh.ARRAY_VERTEX].size()
    assert_gt(arrays[Mesh.ARRAY_BONES].size(),0)
    assert_gt(arrays[Mesh.ARRAY_WEIGHTS].size(),0)
  assert_lte(visible_surfaces,10,id+": shared materials should draw once")
  assert_eq(batched_triangles,triangles,"preserve every hero triangle")
  view.pose(3,1,1,"Idle",0.25)
  assert_eq(view.position,Vector3(3,0,1))
  assert_false(view.animation.is_playing())
  store.release(instance)
  view.free()
 assert_eq(store.live_count(),0)

func test_node_animated_mesh_is_excluded_from_skin_batches() -> void:
 var store := Store.new()
 assert_true(store.prepare("cow","res://assets/characters/cow-crow/runtime/cow.glb",["Idle"]))
 var instance := store.create("cow")
 var mesh: MeshInstance3D = instance.find_children("*","MeshInstance3D",true,false)[0]
 var player := Store.find_animation(instance)
 var animation := Animation.new()
 var index := animation.add_track(Animation.TYPE_POSITION_3D)
 var root := player.get_node(player.root_node)
 animation.track_set_path(index, root.get_path_to(mesh))
 animation.position_track_insert_key(index,0,Vector3.ZERO)
 animation.position_track_insert_key(index,1,Vector3(0,1,0))
 var library := AnimationLibrary.new()
 library.add_animation("AnimatedAttachment",animation)
 player.add_animation_library("attachment",library)
 var view := View.new()
 add_child(view)
 view.attach(instance)
 assert_true(mesh.visible,"animated node cannot be hidden behind a static material batch")
 player.remove_animation_library("attachment")
 store.release(instance)
 view.free()
