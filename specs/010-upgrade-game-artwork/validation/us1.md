# Furnished venue implementation

All four production rooms are present with the original stable simulation mapping: dance-floor → exterior, vip-lounge → bar, backstage-corridor → dance-floor, alley-exit → stage-vip. Playable bounds, waves, tables, exits and camera equations are unchanged. `content/rooms.json` owns decorative coverage/landmarks and the existing resource registry owns dependencies.

Editable Blender scenes and explicit GLBs live in `assets/rooms/`; scene lettering and imported shared furniture are composed in `scenes/art/rooms/`. Shared opaque/glow palettes use imported vertex colours. Furnishings stay outside depth [-3,3]. Three connectors and quiet floor/wall backing cover camera limits and enlarged companion views. All four room groups remain available to ordinary frustum culling. Runtime material batches retain room bounds and every source triangle.

`tests/godot/art/test_rooms.gd` checks actual imports, landmark/geometry/material presence, no gameplay nodes, atomic preparation, ownership, floor clearance, exact connector palette, 648 camera-ray coverage combinations and triangle-preserving batches. `artwork-rooms.spec.ts` captures both edges of every room at 667/844/915 with Lion/Plates and 844 with Cow/Crow in Chromium/WebKit. Inherited `godot-backdrops.spec.ts` retains all three connector/GO/wave/table/exit/retry assertions with furnished scenery. All 26 deterministic checkpoints remain exact.

The owner approves the visual direction under [the current instruction](owner-approval.md). Captures and machine-readable camera/render observations are in `../reviews/rooms-final/`. Five-player setting recognition and physical-phone coverage remain pending; desktop captures do not establish those outcomes.
