# Data model

| Entity | Fields / contract |
| --- | --- |
| Rigged character | Role `Cow` or `Crow`; root at ground origin; armature, named bones, rigidly bound named meshes, editable materials. |
| Export asset | One GLB per role; only character nodes/materials/animation; no external URI, cameras, lights or venue. |
| Action clip | Named by role/action/phase, bound to one character rig. Idle and move loop; combat clips seek from simulation phase progress. |
| Runtime actor instance | GLB clone, mixer, cached clip actions, role, current phase/move; disposal ownership separate from shared template resources. |

Cow is taller and broader than Crow. Runtime facing maps Blender's -Y forward to Three's +Z convention, then existing ±90° actor turns map forward onto ±X. Simulation owns hit timing and positions.
