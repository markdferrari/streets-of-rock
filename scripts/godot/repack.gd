extends SceneTree
# Write resource-boundary partitions of the complete pinned export. Every
# resource payload remains exactly the original exported bytes.
func _init() -> void:
 var args := OS.get_cmdline_user_args()
 var entries: Array = JSON.parse_string(FileAccess.get_file_as_string(args[1]))
 var packer := PCKPacker.new()
 if packer.pck_start(args[0]) != OK:
  push_error("PCK staging could not start")
  quit(1)
  return
 for entry in entries:
  if packer.add_file(entry.path, entry.file) != OK:
   push_error("Could not preserve exported resource: " + str(entry.path))
   quit(1)
   return
 var result := packer.flush()
 quit(0 if result == OK else 1)
