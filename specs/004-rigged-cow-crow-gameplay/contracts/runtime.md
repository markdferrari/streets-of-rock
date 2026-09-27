# Character runtime contract

- `loadCharacterAssets()` resolves only after both Cow and Crow GLBs have parsed and passed required scene/clip validation. Repeated calls reuse the same successful load; failure permits retry.
- `createCharacterInstance(role)` returns a separately animatable clone for one actor. The scene owns that clone and mixer; loaded templates own shared GPU resources.
- For each actor frame, choose a clip from `action.kind` and `moveId`. Seek combat pose using `(tick - startedTick)/(endTick - startedTick)`, clamped to `[0,1]`; idle/walk motion uses simulation ticks. Pause freezes because ticks stop.
- Missing required assets block run start with an actionable retry message. Disposal removes instances and their mixer actions; it must not dispose shared geometry/materials while templates remain in use.
- Enemies retain existing procedural visuals. Gameplay rule objects and public input contracts are unchanged.
