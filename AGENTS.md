# Working agreements

- Follow test-driven development: reproduce automatable changes with a meaningful failing test, implement the smallest fix, then refactor. Define manual visual/device checks before work that cannot be usefully automated. Documentation-only changes require consistency validation.
- Never work on `main`; create or use the feature branch for the active task before editing. Preserve unrelated user changes.
- Use conventional commits. All existing automated tests must pass before committing; record commands and results. Never report unrun or unavailable tests as passing.
- Use Bun for JavaScript/TypeScript package management and repository scripts. Keep pinned engine, exporter and dependency versions unless the task requires a reviewed change.
- Never ever commit a valid secret to the repo. Use environment variables or ignored local configuration; never print secrets in logs or tool output.
- Follow `PRD.md`, `.specify/memory/constitution.md` and the active feature's spec/plan/tasks. Read the relevant sections; reference their requirements instead of copying them into new documents. Resolve conflicts explicitly.

## Mobile game development

- Design for landscape touch first. Support simultaneous movement/action touches, cancellation, thumb reach, safe areas and browser resizing. Essential cues must remain readable at actual phone size, without sound, screen shake or colour alone.
- Keep deterministic gameplay authoritative: fixed-step simulation owns movement, damage, cooldowns, AI, progression and results. Rendering and animation consume state; they must not silently change timing, hit windows, reach or input eligibility.
- Treat pause, hidden tabs, focus loss and orientation changes as normal flows. Freeze gameplay, animation, active time and audio appropriately; clear held/pending input and require explicit Resume. Never apply accumulated background wall time on return.
- Keep actors' animation and transient state independent. Dispose owned resources on Home/retry, reset effects and projectiles, and test repeated cycles for retained objects or memory growth.
- Profile the complete game on iPhone 12/Safari and Pixel 6/Chrome. Target 60 fps and meet the PRD minimum of 30 fps in the busiest encounter. Record build identity, OS/browser versions, frame pacing, stalls and sustained-play behavior; desktop emulation is supplementary.
- Measure before optimizing. Limit draw calls/materials, transparent overdraw, real-time lights, texture residency and unnecessary per-frame allocations/work. Prefer shared immutable resources and baked assets; introduce pooling, batching or extra complexity only for a measured bottleneck. Check features against the pinned Compatibility/web renderer.
- Preserve established content/download budgets and audit the exported build, including imported dependencies, soundtrack and engine accounting. Exclude source art, unused donor assets and test fixtures from release; retain editable sources and license provenance separately.
- Prepare required assets before countdown with actionable failure/retry. Claim offline readiness only after complete verified caching. Test cold offline launch through a full run/results/retry, safe between-run updates and nonblocking audio/storage failures on supported browsers.
- Respect reduced motion and avoid flashing/strobing. Evaluate silhouettes, anticipation/contact/recovery, hit feedback and enemy warnings during crowded combat, not just isolated previews.
- Keep balance adjustable in existing tuning data. Preserve solo completion after companion knockout, current controls and existing mechanics unless the feature explicitly changes them. Record real device/player evidence before declaring acceptance.

## Token and execution efficiency

- Start with the smallest useful next action. For a bounded edit, inspect the affected files, change them and validate; avoid a broad repository audit or elaborate plan unless required by scope or an invoked skill.
- Use `rg`/`rg --files` to locate targets, then read bounded sections. Batch independent reads/searches. Avoid dumping entire documents, generated assets or long logs into context; capture logs to files and surface the relevant failure/summary.
- Reuse findings already established in the conversation and current artifacts. Re-read only when files changed, context is missing or a dependency requires it. Research a technical question once, record its decision/source, then move on.
- Keep task lists executable and proportional: one task per meaningful test, implementation slice or acceptance outcome. Group closely related edits; avoid separate tasks for routine bookkeeping and duplicate requirements copied across artifacts. Satisfy the invoked workflow without adding unrequested deliverables.
- During red–green–refactor, run the narrowest meaningful tests first. Expand to affected integration checks and the full suite before committing. Reuse passing results for unchanged inputs/tooling; repeat expensive builds/tests only after relevant changes, failures or identified concerns.
- Use parallel tool calls for independent work. Delegate only when explicitly requested or required by an applicable instruction/skill, with a bounded non-overlapping assignment; do not duplicate an agent's research in the parent.
- Prefer existing utilities and conventions over new abstractions. Keep edits within the authorized scope; defer unrelated cleanup. Make reversible implementation choices without repeatedly asking for approval already granted.
- Keep progress updates brief: concrete findings, decisions or blockers. Final responses state changes, validation and remaining limitations; link artifacts instead of repeating them.
- Stop research and tool use once the authorized outcome and required checks are complete. If a check is blocked, state the exact dependency and continue independent work instead of polling or repeating the same failed attempt.

## Technical references

Use version-appropriate official documentation when needed: [Godot 3D performance](https://docs.godotengine.org/en/stable/tutorials/performance/optimizing_3d_performance.html) and [Godot web export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html). Project budgets and acceptance requirements remain defined by the PRD and constitution.
