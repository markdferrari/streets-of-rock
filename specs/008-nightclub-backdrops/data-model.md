# Data Model: Illustrated Nightclub Scenery

## BackdropDefinition

A readonly presentation record, separate from LevelDefinition and run state:

- `areaId`: existing stable simulation ID, unique and exhaustive for this level.
- `setting`: outsideEntrance | bar | danceFloor | stageVip.
- `displayName`: review/debug name; do not display a room label during recognition tests.
- `wallAssetKey`, `floorAssetKey`: keys into a static imported resource manifest.
- `palette`: quiet backing/floor edge colours and shared neon accents.
- `landmarkRegions`: named normalized wall-image rectangles for required setting cues; guides crop tests/reviews, not colliders.
- `routeSide`: right for rooms 1–3, none for room 4; visual alignment metadata only, never an unlock condition.

| Stable area ID | Visual setting | Existing X bounds | Required landmarks |
| --- | --- | --- | --- |
| dance-floor | outsideEntrance | 0–16 | Club sign, neon entrance toward right-hand route, frontage, pavement, queue barriers, posters, doorway light. |
| vip-lounge | bar | 18–34 | Counter, bottle shelves, stools, booths, warm/neon lighting. |
| backstage-corridor | danceFloor | 36–52 | Dance floor, DJ booth, speakers, overhead fixtures, coloured light pools. |
| alley-exit | stageVip | 54–70 | Curtains, stage backdrop, VIP seating, branding, dramatic static light. |

The table is descriptive baseline evidence; runtime bounds must be read from existing level data rather than copied into scenery definitions. Walkable depth remains [-3,3]; table positions remain (22,-2)/(28,2). No gameplay IDs, waves, collision or health values change.

## BackdropAssetDescriptor

- `key`, `url`: stable logical key plus bundled hashed URL from explicit static import.
- `width`, `height`: declared raster dimensions matching SVG intrinsic width/height and viewBox ratio.
- `kind`: wall | floor.
- `required`: true for all eight production textures.

Validation: one wall and one floor per definition, no duplicate/unknown area IDs, known resource keys, positive bounded dimensions, opaque base fill, no embedded scripts/foreignObject/external href/fonts/animations. Use path-based lettering or bundled vector shapes for club branding, avoiding runtime font/network dependencies. Offline audit tracks emitted resources, including any inlined resources through their containing chunk.

## Layout and ownership

`VenueLayout` derives room panel transforms, connector surfaces and quiet overscan geometry from level bounds and feature 006 CameraFrame. Decorated wall faces sit behind movement space (initial depth -3.9). No decorative foreground geometry is introduced. Floor art lies on the existing ground plane, with existing actor shadows/effects and objects retaining their readable ordering.

Coverage validation intersects the supported camera frustum with the ground and rear-wall plane, including outgoing/current/incoming visible regions during travel. Overscan follows viewport coverage only; it never changes the legal arena or stretches landmarks. Keep all four small room groups and connectors available, letting ordinary frustum visibility control drawing rather than hiding by areaIndex.

`BackdropAssetStore` owns shared textures and in-flight loads. States: idle → loading → ready or failed; failed → loading on retry; any state → disposed on retirement. Matching generation and full resource success are required for ready. Coalesce repeated loads; discard/dispose resources from retired generations, including late resolutions. On a partial failure clean successful allocations before retry. Scene layer disposal never disposes shared textures; store disposal is idempotent and follows disposal of all consumers.

`VenueLayer` owns a group plus geometry/material allocations. It can update coverage when the camera frame/viewport changes, but never updates run state. Static artwork has no time progression, animation state or preference storage.

## VisualReviewRecord

Per-room record under `specs/008-nightclub-backdrops/reviews/`: concept references, review decision/status, final asset revision, gameplay screenshots with camera/viewport/build identity, mandatory landmark results, route/table distinction, muted/no-shake/reduced-motion observations and unresolved work.

Combined `validation.md`: FR/scenario mappings, red/green test evidence, full inventory and decoded-memory estimates, phone/browser versions, frame timings, offline/reset outcomes and five-player responses. Concept approval is separate from final gameplay acceptance; neither is inferred from successful loading.
