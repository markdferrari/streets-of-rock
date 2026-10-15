# Bundled soundtrack

The existing approved `public/assets/audio/brightside.mp3` is unchanged. SHA-256: `90279f810f0b8624ebbf247a1e8676244e258b9898e8f2db1e7672cdd93d3fcb`. The feature 009 owner authorization/identity record is retained at `../../009-godot-rewrite/validation/soundtrack.md`; no new creator or third-party license claim is inferred.

Current release packaging includes the actual imported MP3 in the inventoried pack and cache. Forced splitting rejects a three-MiB cap because the individual unchanged soundtrack exceeds it, then succeeds at five MiB without byte-splitting the resource. Browser audio/storage/lifecycle tests and complete offline fixtures are retained. Physical gesture listening and phone performance with music remain device acceptance work.
