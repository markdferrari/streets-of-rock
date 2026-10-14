# Grunt and bartender gameplay integration

The owner approved the motion previews: “I am happy with the previews.” The Grunt and Zoner now use their approved KayKit-driven rigs in normal gameplay. They are no longer limited to the review route. The first room's first wave shows Grunts; the second wave adds a bartender. The bar room contains both roles.

From the repository root, use the already exported Web Test build:

```sh
bun run preview -- --dir dist-test --host 127.0.0.1 --port 4173
```

Open **http://127.0.0.1:4173/**. Select your fighter and partner as usual. The `?fixture=enemy-art` route remains a separate motion review. For subsequent source changes, run `bun run build:test` before starting the server. Restart the preview server after a rebuild; if an existing service worker reports an update, close all game tabs and reopen.

Normal bar encounter captures: [Chromium](gameplay-enemies/chromium-bar.png), [WebKit](gameplay-enemies/webkit-bar.png). These show actual enemy AI and imported models through the production world view. The paused screen is used to preserve the captured state.

The runtime catalogue registers `enemy.grunt` and `enemy.zoner`, with editable `.blend` sources and explicit GLBs under `assets/enemies/`. A shared vertex-colour material preserves the approved outfits. Resource preparation validates every registered rig and clip before launching a run, and requires the bartender bottle. Missing registered art produces a preparation error; it cannot silently substitute a box enemy.

Independent instance poses come from existing simulation snapshots. The bartender's held bottle hides at throw-active and returns at the next windup; flying bottles render from existing projectile positions. Defeated rigs remain decorative for 21 simulation ticks, then release their owned resources. Paused/results renders do not consume this lifetime. Retry and Home dispose the old world, rigs and props.

Enforcer and Liam still use the previous basic models while their artwork is implemented. Room scenery is also unchanged. Full role coverage, final spatial contact/foot review, four furnished rooms, credits and physical-phone/final acceptance remain open. Approval of previews is recorded separately from final gameplay acceptance.
