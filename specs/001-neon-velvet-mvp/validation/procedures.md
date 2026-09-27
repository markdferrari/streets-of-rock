# Manual validation procedures

These procedures were defined before gameplay implementation. Record build ID, device model, OS and browser version, tester, date, action, outcome, and a reproducible failure note for each scenario. A desktop browser check supplements but does not replace the iPhone 12/Safari and Pixel 6/Chrome runs.

| Scenarios | Procedure | Expected observation |
| --- | --- | --- |
| AC-001–007, AC-022–024 | Fresh run: follow prompts; move and attack with separate fingers; cancel each touch; attack across depth; try combo, dodge during a warning, and spin at empty/full meter; permit consecutive enemy attacks. | Prompts follow valid actions; no stuck input; one hit per strike, protected dodge/hurt, bounded enemy pressure, clear unavailable feedback. |
| AC-008–014, AC-025–029 | Traverse all four areas, break both VIP tables, collect drinks at damaged/full health, let Crow fall, finish solo, lose Cow, retry, and exceed five minutes on a separate run. | Exact waves, GO, pickups, boss phase, outcomes, timing, best result, and full reset match the spec. |
| AC-015–018, AC-030–032, AC-034 | On both phones, pause, background, blur, rotate, reload, toggle settings, mute, disable shake, deny audio start, and inspect all encounter effects. | Explicit resume and cleared inputs; audio/clock stop; saved settings; legible controls/telegraphs and character identity. |
| AC-019–021, AC-033 | Cache over HTTPS, close, disable network, relaunch and finish/retry; interrupt cache, remove one cached asset, issue music ranges, and offer a second build while old clients run. | Truthful cache state, complete offline run and audio, correct range responses, deferred activation. |
| SC-001–004 | Five casual action players, no coaching, at most three attempts each. Measure first move+attack, attempts, first successful active duration, separate responsiveness/readability ratings. | At least four meet each stated threshold. |
| SC-005–006 | Run every scenario on release build; warm up with one full run, then record next full run on each phone with frame windows every 250 ms and all >100 ms stalls. | All scenarios pass and every full second in busiest encounter has at least 30 rendered frames on both reference phones. |

The final owner-supplied music must be identified by source/provenance and be included in offline tests. Before AWS hosting acceptance, repeat root loading, MIME type, cache header, range, and offline/update checks on the CloudFront HTTPS origin.
