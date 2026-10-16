extends RefCounted
# Merge only compatible bone-driven surfaces sharing immutable resources.
static func build(instance: Node3D) -> void:
 var groups: Dictionary = {}
 var animated: Dictionary = {}
 for player in instance.find_children("*", "AnimationPlayer", true, false):
  var root: Node = player.get_node_or_null(player.root_node)
  if root == null: continue
  for name in player.get_animation_list():
   var animation: Animation = player.get_animation(name)
   for track in animation.get_track_count():
    var path: NodePath = animation.track_get_path(track)
    var target := root.get_node_or_null(NodePath(path.get_concatenated_names()))
    if target is MeshInstance3D: animated[target.get_instance_id()] = true
 for node in instance.find_children("*","MeshInstance3D",true,false):
  if animated.has(node.get_instance_id()): continue
  if node.mesh==null or node.mesh.get_surface_count()!=1 or node.skin==null or not node.transform.is_equal_approx(Transform3D.IDENTITY): continue
  var skeleton: Node = node.get_node_or_null(node.skeleton)
  if not skeleton is Skeleton3D: continue
  for surface in node.mesh.get_surface_count():
   var material: Material = node.get_active_material(surface)
   var key := str([node.get_parent().get_instance_id(),skeleton.get_instance_id(),node.skin.get_instance_id(),material.get_instance_id() if material!=null else 0])
   if not groups.has(key): groups[key]={"nodes":[],"surfaces":[],"parent":node.get_parent(),"skeleton":skeleton,"skin":node.skin,"material":material}
   groups[key].nodes.append(node)
   groups[key].surfaces.append(surface)
 for group in groups.values():
  if group.nodes.size()<2: continue
  var builder := SurfaceTool.new()
  builder.begin(Mesh.PRIMITIVE_TRIANGLES)
  for i in group.nodes.size(): builder.append_from(group.nodes[i].mesh,group.surfaces[i],Transform3D.IDENTITY)
  var batch := MeshInstance3D.new()
  batch.name="SharedMaterialBatch"
  batch.mesh=builder.commit()
  batch.skin=group.skin
  batch.material_override=group.material
  group.parent.add_child(batch)
  batch.skeleton=batch.get_path_to(group.skeleton)
  # Every hero input mesh has one surface. Keep the guard for future mixed assets.
  for node in group.nodes:
   if node.mesh.get_surface_count()==1: node.hide()
