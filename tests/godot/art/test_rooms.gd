extends GutTest
const Catalogue = preload("res://game/content/catalogue.gd")
const Store = preload("res://game/content/resource_store.gd")
const Art = preload("res://game/content/art_catalog.gd")
const Venue = preload("res://game/presentation/venue_view.gd")
const World = preload("res://game/presentation/world_view.gd")
const MAPPING = {"dance-floor":"exterior", "vip-lounge":"bar", "backstage-corridor":"dance-floor", "alley-exit":"stage-vip"}
func content() -> RefCounted:
 var c := Catalogue.new()
 assert_true(c.load_catalogue(), str(c.errors))
 return c
func test_four_rooms_preserve_stable_area_map_and_required_landmarks() -> void:
 var c := content()
 assert_eq(c.room_presentations.size(), 4, "all four approved room definitions must be present")
 if c.room_presentations.size() != 4: return
 var x := 0.0
 for area in c.level.areas:
  var room: Dictionary = c.room_presentations[area.id]
  assert_eq(room.visualId, MAPPING[area.id])
  assert_eq([area.minX,area.maxX,area.minDepth,area.maxDepth], [x,x+16.0,-3.0,3.0])
  assert_eq(room.requiredLandmarks, Art.LANDMARKS[room.visualId])
  x += 18
 var tables: Array = c.level.tables
 assert_eq(tables, [{"x":22.0,"depth":-2.0},{"x":28.0,"depth":2.0}])
func test_imported_rooms_have_real_landmark_geometry_without_gameplay_nodes() -> void:
 var c := content()
 assert_eq(c.room_presentations.size(), 4)
 if c.room_presentations.size() != 4: return
 for definition in c.room_presentations.values():
  var scene: PackedScene = load("res://" + c.resources.art[definition.sceneResourceId].path)
  var room := scene.instantiate()
  add_child_autofree(room)
  assert_eq(Art.inspect_room(room, definition), [] as Array[String])
  for landmark in definition.requiredLandmarks:
   var nodes := room.find_children(landmark, "Node3D", true, false)
   assert_eq(nodes.size(), 1, landmark + " has one reviewable region")
   if nodes.size() == 1:
    var meshes := nodes[0].find_children("*", "MeshInstance3D", true, false)
    assert_gt(meshes.size(), 0, landmark + " has actual geometry")
  assert_eq(room.find_children("*", "AnimationPlayer", true, false).size(), 0)
  for node in Art.descendants(room):
   if node is MeshInstance3D:
    assert_gt(node.mesh.get_aabb().size.length(), 0.001)
    for surface in node.mesh.get_surface_count():
     var material: StandardMaterial3D = node.mesh.surface_get_material(surface)
     assert_eq(material.transparency, BaseMaterial3D.TRANSPARENCY_DISABLED)
     assert_true(material.vertex_color_use_as_albedo)
func test_room_preparation_is_atomic_and_missing_room_is_actionable() -> void:
 var c := content()
 var store := Store.new()
 assert_true(store.prepare_rooms(c), str(store.errors))
 if c.room_presentations.size() != 4: return
 c.resources = c.resources.duplicate(true)
 c.resources.art["room.bar"].path = "scenes/art/rooms/missing.tscn"
 assert_false(store.prepare_rooms(c))
 assert_true(str(store.errors).contains("bar"))
func test_venue_keeps_all_rooms_connectors_and_camera_margins_with_no_new_gameplay() -> void:
 var c := content()
 var store := Store.new()
 assert_true(store.prepare_rooms(c), str(store.errors))
 if c.room_presentations.size() != 4: return
 var venue := Venue.new()
 add_child_autofree(venue)
 var instances := venue.build(store, c)
 assert_eq(instances.size(), 4)
 assert_eq(venue.room_groups.size(), 4)
 for i in range(1,4): assert_not_null(venue.get_node_or_null("Connector"+str(i)))
 assert_not_null(venue.get_node_or_null("QuietBacking"))
 assert_eq(venue.find_children("*", "CollisionObject3D", true, false).size(), 0)
 for index in range(4):
  var group: Node3D = venue.room_groups[c.level.areas[index].id]
  assert_eq(group.position.x, float(c.level.areas[index].minX))
  assert_true(group.visible, "frustum culling retains visible neighbors, independent of area index")
 for instance in instances: store.release(instance)
 assert_eq(store.live_count(), 0)
func test_world_owns_and_releases_four_furnished_room_instances() -> void:
 var c := content()
 var store := Store.new()
 assert_true(store.prepare_rooms(c))
 if c.room_presentations.size() != 4: return
 var world := World.new()
 add_child(world)
 world.initialize(store, c)
 assert_eq(store.live_count(), 4)
 assert_true(world.backdrops is Venue)
 world.dispose()
 assert_eq(store.live_count(), 0)
 await get_tree().process_frame

func test_solid_furniture_stays_outside_the_unchanged_combat_floor() -> void:
 var c := content()
 for definition in c.room_presentations.values():
  var scene: PackedScene = load("res://" + c.resources.art[definition.sceneResourceId].path)
  var room := scene.instantiate()
  add_child_autofree(room)
  for mesh in room.find_children("*", "MeshInstance3D", true, false):
   var parent: Node = mesh
   var floor_surface := false
   while parent != room and parent != null:
    if str(parent.name) in ["pavement", "QuietFloor", "dance-floor", "light-spill", "coloured-light-pools"]: floor_surface = true
    parent = parent.get_parent()
   if floor_surface: continue
   var bounds: AABB = mesh.global_transform * mesh.mesh.get_aabb()
   assert_true(bounds.end.z <= -3.0 or bounds.position.z >= 3.0, definition.visualId + ": furniture cannot intrude into [-3,3], " + str(mesh.name) + " " + str(bounds))
func test_connector_and_margin_floor_use_the_imported_floor_palette_exactly() -> void:
 var c := content()
 var store := Store.new()
 assert_true(store.prepare_rooms(c))
 var venue := Venue.new()
 add_child_autofree(venue)
 var instances := venue.build(store, c)
 var group: Node3D = venue.room_groups["dance-floor"].find_child("pavement", true, false)
 var authored: MeshInstance3D = group.find_children("*", "MeshInstance3D", true, false)[0]
 var expected: PackedColorArray = authored.mesh.surface_get_arrays(0)[Mesh.ARRAY_COLOR]
 for floor_mesh in [venue.get_node("QuietBacking").get_child(0), venue.get_node("Connector1").get_child(0)]:
  var colors: Variant = floor_mesh.mesh.surface_get_arrays(0)[Mesh.ARRAY_COLOR]
  assert_true(colors is PackedColorArray and colors.size() > 0, "margin/connector must use the actual imported vertex palette, not a differently converted colour")
  if colors is PackedColorArray and colors.size() > 0: assert_eq(colors[0], expected[0])
 for instance in instances: store.release(instance)
func test_actual_backing_covers_camera_extrema_and_all_connector_travel() -> void:
 var c := content()
 var store := Store.new()
 assert_true(store.prepare_rooms(c))
 var venue := Venue.new()
 add_child_autofree(venue)
 var instances := venue.build(store, c)
 var floor_mesh: MeshInstance3D = venue.get_node("QuietBacking").get_child(0)
 var wall_mesh: MeshInstance3D = venue.get_node("QuietBacking").get_child(1)
 var floor_bounds: AABB = floor_mesh.global_transform * floor_mesh.mesh.get_aabb()
 var wall_bounds: AABB = wall_mesh.global_transform * wall_mesh.mesh.get_aabb()
 for viewport in [{"width":667,"height":375},{"width":844,"height":390},{"width":915,"height":412}]:
  for duo in [{"fighterId":"cow","partnerId":"crow"},{"fighterId":"lion","partnerId":"plates"}]:
   var run: Dictionary = load("res://game/simulation/run_state.gd").create_run(1, duo, c)
   for index in range(4):
    run.areaIndex = index
    var area: Dictionary = c.level.areas[index]
    for edge in [-1,0,1]:
     run.encounter.status = "cleared" if edge == 1 and index < 3 else "active"
     run.actors[0].position = {"x":area.minX if edge == -1 else (area.maxX + (1.0 if index < 3 else 0.0) if edge == 1 else area.minX + 8.0),"depth":edge * 3.0}
     run.actors[1].position = {"x":area.minX + 1.0,"depth":0.0}
     var frame: Dictionary = load("res://game/presentation/camera_math.gd").compute(run, viewport, {"player":c.resources.bodyEnvelopes[duo.fighterId],"partner":c.resources.bodyEnvelopes[duo.partnerId]}, c)
     var direction := Vector3(0,-8,-12).normalized()
     var up := Vector3(0,-direction.z,direction.y)
     var origin := Vector3(frame.anchorX,frame.anchorHeight+8,12)
     for horizontal in [-1.0,0.0,1.0]:
      for vertical in [-1.0,0.0,1.0]:
       var ray: Vector3 = origin + Vector3.RIGHT * horizontal * frame.halfHeight * frame.aspect + up * vertical * frame.halfHeight
       var on_wall := ray + direction * ((wall_bounds.end.z-ray.z)/direction.z)
       var on_floor := ray + direction * ((floor_bounds.end.y-ray.y)/direction.y)
       var covered: bool = (on_wall.x >= wall_bounds.position.x and on_wall.x <= wall_bounds.end.x and on_wall.y >= wall_bounds.position.y and on_wall.y <= wall_bounds.end.y) or (on_floor.x >= floor_bounds.position.x and on_floor.x <= floor_bounds.end.x and on_floor.z >= floor_bounds.position.z and on_floor.z <= floor_bounds.end.z)
       assert_true(covered,str([viewport,duo,index,edge,horizontal,vertical])+": exposed camera edge")
 for instance in instances: store.release(instance)

func test_runtime_batches_room_geometry_by_shared_palette_without_changing_triangles() -> void:
 var c := content()
 var store := Store.new()
 assert_true(store.prepare_rooms(c))
 var venue := Venue.new()
 add_child_autofree(venue)
 var instances := venue.build(store,c)
 for room in instances:
  var visible_surfaces := 0
  var original_vertices := 0
  var batched_vertices := 0
  for mesh in room.find_children("*","MeshInstance3D",true,false):
   for surface in mesh.mesh.get_surface_count():
    var arrays: Array = mesh.mesh.surface_get_arrays(surface)
    var count: int = arrays[Mesh.ARRAY_INDEX].size() if arrays[Mesh.ARRAY_INDEX]!=null and arrays[Mesh.ARRAY_INDEX].size()>0 else arrays[Mesh.ARRAY_VERTEX].size()
    if mesh.visible:
     visible_surfaces+=1
     batched_vertices+=count
    else: original_vertices+=count
  assert_lte(visible_surfaces,3,"each room must batch shared opaque/glow surfaces")
  assert_eq(batched_vertices,original_vertices,"batching preserves every source triangle")
 for instance in instances: store.release(instance)
