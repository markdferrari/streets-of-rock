# US2 combat and tutorial result

**Date:** 2026-09-27

The Heavy action, ordered touch requests, single pending-action buffer, and independent Heavy prompt are implemented. Test-first failures were observed for the missing Heavy action, ordered requests/cancellation, tutorial migration, and distinct Heavy pose. Heavy starts one 14/6/24-tick windup/active/recovery cycle with 30 damage, greater than an individual Light strike, knockback, no cost or invulnerability, and a Light-combo reset only on accepted start. Heavy and Light enemy hits fill the capped meter; table damage and Spin do not. A Heavy strike can break a table for its one drink. Existing unit tests cover Light combo and Special/Dodge rules. New browser checks cover Heavy action and legacy Light completion leading to a separate Heavy prompt.

`bun run typecheck` passed. The full gate after these changes and US3 integration passed 68/68 Vitest tests and 22/22 Playwright browser cases in Chromium/WebKit. A release build and static entry audit also passed. Exact Heavy balance, touch ergonomics, and whole-level timing remain pending reference-phone/player evaluation.
