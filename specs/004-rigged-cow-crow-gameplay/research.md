# Research

- **Articulation**: Existing named meshes permit rigid vertex weights to an armature without rebuilding topology. This preserves the approved concept appearance and keeps Blender edits possible. Smooth bending remains deferred.
- **Export**: Blender 5.2 `bpy.ops.export_scene.gltf` supports selected-object GLB export and animation actions/NLA tracks. Use one scene per character and explicitly validate exported clip names and mesh contents. Reference: https://docs.blender.org/api/5.2/bpy.ops.export_scene.html
- **Runtime**: Three 0.186 `GLTFLoader` returns a scene and clips; `AnimationMixer` animates a clone of the scene. Share immutable geometry/materials, but own each actor mixer and animation state. References: https://threejs.org/docs/pages/GLTFLoader.html and https://threejs.org/docs/pages/AnimationMixer.html
- **Packaging**: Vite `?url` imports create hashed output URLs. The repo's PWA plugin is installed but not configured and its build audit is a placeholder. Asset presence is testable now; full offline readiness is not.
