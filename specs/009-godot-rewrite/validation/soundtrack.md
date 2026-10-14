# Soundtrack acceptance — phase 7

Status: **complete for T075**. Owner approved; current-build validation recorded in phase7.md (T075, FR-010–011/014–015).

The configured Godot music path is `res://public/assets/audio/brightside.mp3`
(`game/platform/audio.gd`). The file exists and is a stereo MPEG Layer III stream,
44.1 kHz / 128 kbps. SHA-256:
`90279f810f0b8624ebbf247a1e8676244e258b9898e8f2db1e7672cdd93d3fcb`.

Owner approval and authorization to bundle the current asset were provided on
2026-10-14 under the instruction to assume all relevant decisions approved. See
[the decision record](owner-approvals.md). Identity is Brightside by bundled filename;
creator metadata and third-party license provenance have not been supplied. The
owner's bundling authorization is recorded without inventing those details.

The historical placeholder generator was not run and the MP3 was not replaced.
Current import/audio/cache/size results and exact builds are in [phase7.md](phase7.md)
and [release.md](release.md). Required physical gesture-audio and complete offline
phone measurements remain pending independently of asset approval. Any subsequent
music change requires rebuilding and rerunning affected acceptance checks.

Verification: current GUT audio assertions pass within 54 GUT tests; imported-resource
validation passes; all three exported modes pass size/resource audits; current
Chromium offline launch and immutable two-window upgrade/cache checks pass.
The Release/Diagnostics production smoke tests pass in Chromium and WebKit.
Physical gesture listening remains separately required under T066.
