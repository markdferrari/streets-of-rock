# Phone performance — phase 7

Status: **waived by explicit owner decision; unverified** (T076, FR-013, feature SC-005 / PRD SC-006).

No current iPhone 12/Safari or Pixel 6/Chrome measurements are available in this
workspace. Desktop browser tests and prior diagnostics captures are supplementary;
no complete phone run, raw interval series or ten-cycle phone record is claimed.

Follow [the established procedure](procedures.md) and [quickstart](../quickstart.md).
For each phone record exact release and diagnostics build IDs, matching content
and soundtrack digests, OS/browser, viewport/safe areas, duo/settings, full-run
outcome and ten selection/run/retry/home cycles. Preserve raw active-run frame
intervals and each busiest encounter; exclude loading/countdown/paused/hidden/results.
Record target 60 FPS, minimum 30 FPS, visible stalls, draw calls <=100, triangles
<=100,000, DPR <=1.5, decoded backdrop textures <=64 MiB and >=90% combat-view coverage.
Cross-check stalls and content in Release. Save local diagnostics downloads beside
the procedure record; the bounded 120-frame snapshot alone is not a full-run series.

The configured soundtrack is owner approved; see [soundtrack.md](soundtrack.md).

## Closure for this cutover

The owner [waived these manual gates](manual-waiver.md) on 2026-10-14. No measurement
or player response is supplied by that decision. The procedures and thresholds above
are retained for future verification; this task is closed by waiver, not a test pass.
