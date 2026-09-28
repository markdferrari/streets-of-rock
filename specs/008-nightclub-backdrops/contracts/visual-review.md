# Contract: Room Appearance and Review

## Shared direction

Bold outlined cartoon illustration, exaggerated shapes, coherent scruffy neon rock-club palette and existing Bondi Beach branding. Preserve the current character art. Keep the fighting floor quieter than the rear wall; do not paint characters, fake pickups, combat markers or breakable-looking foreground furniture into scenery. Lighting is static; do not introduce flashes, strobe, moving spotlights or decorative particles.

## Required room cues

| Room | Illustration requirements | Gameplay relationship |
| --- | --- | --- |
| Outside entrance | Frontage, pavement, readable club sign, neon doorway, queue barriers, event posters and doorway light. | Doorway at the rightward exit region; barriers flank scenery outside the walking path. |
| Bar | Long counter, bottle shelves, stools, booths, warm light/neon accents and matching branding. | Decorative furniture behind/outside arena; existing two interactive tables remain visually distinct at original positions. |
| Dance floor | Recognizable floor pattern, DJ booth, speakers, overhead fixtures and static coloured light pools. | Floor contrast cannot conceal ground warnings or actor feet; no playable DJ platform. |
| Stage/VIP | Curtains, stage backdrop, VIP seating, branding and dramatic static illumination. | Existing final boss arena remains flat; decorative stage is clearly inaccessible and no onward route is implied after victory. |

## Concept review before final production

Prepare all four concepts together under `specs/008-nightclub-backdrops/reviews/`, using draft SVG layouts and camera-composited previews with representative existing characters and control overlays. Review room identity, shared palette, rightward travel and playable-floor separation. Record actual decisions and revisions; reuse explicit existing approval rather than repeatedly requesting it. Specification approval alone is not approval of artwork that has not yet been shown. Final asset production follows concrete concept review; other independent code/test work may proceed while review is pending.

## In-game review

For every room capture rear/front/left/right player positions and the busiest encounter; include large roster silhouettes available in the integrated build, boss warnings, table/drop visibility, Specials, overlaid controls and GO where eligible. Review all three transitions with a trailing partner using 006 framing, including resized supported landscape views. Initial automated viewports: 844×390 and 915×412 plus inherited minimum/maximum supported layouts; physical phones remain mandatory.

No exposed scenery gaps, hidden essential cue, false walking route, unintended apparent obstacle, unrecognizable setting or flashing passes review. A static scene already satisfies scenery reduced-motion/pause rules; verify the existing game settings still work. Test muted/no-shake play and ensure decoration is not confused with gameplay cues.

Five testers identify each setting without room labels or coaching; at least four must correctly identify all four. Retain separate combat-readability and control ratings (at least four of five ≥4/5) and the existing next-direction-within-three-seconds criterion. Record responses, not a general statement that artwork looks good. Art acceptance does not waive full-level offline/performance gates.
