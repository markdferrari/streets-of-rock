# Combat Contract: ROAR and Headrest Throw

## Common rules

Integrate into 005 role-based actions and 006 visible-arena context. Check eligibility at actual action start, including buffered requests; input-time target availability is not sufficient. Full meter is consumed once after validation. Ordinary action interruption rules continue; cancellation before release clears prepared state without refund. New Specials never fill meter, affect allies, break tables or collect pickups.

Keep tick-stage ordering explicit: status expiry at tick start; player action advance and release effects at the existing input stage; normal-enemy stun cancellation before enemy AI; existing movement/projectiles; batched contacts including queued ROAR boss damage; existing terminal and progression. Guard each enemy AI and attacker-slot allocation against active stun. Removing a normal's active attack must occur before contacts, including charge hitboxes.

## ROAR

One radius sample centered on Lion at release, using arena-plane distance. Each living enemy in range gets exactly one effect by explicit combatClass. Normals lose no HP and receive no knockback; their attack/movement stops until tick expiry. Bosses receive damage without action mutation, hurt reaction, stun or knockback. Normal released projectiles survive their owner's stun. Existing boss phase transition/death rules still apply; a living boss's current attack is not cancelled just because ROAR damages it.

Refresh replaces remaining stun duration with the configured duration rather than adding it. Expiry restores idle decision-making, not the previous attack. Stunned enemies count toward room clearance. Pause advances neither expiry nor action; retry clears status. No-target ROAR is permitted and spends meter.

## Headrest Throw

At action start select nearest living enemy inside the actual visible arena from 006, including bosses; compare squared distance then ID. Store target position. No candidate emits unavailable feedback and leaves meter intact. The renderer's visible region is input data, not queried from inside deterministic simulation.

On release conjure/throw the headrest from Plates' current release position toward the stored position, then keep velocity fixed. Target death/movement cannot re-evaluate aim. Coincident origin/aim uses facing fallback and permits fraction-zero collision. Every projectile sweeps its distance-clipped segment; choose the first physical impact, not first actor-array/ID intersection. Ties use ID only after contact fraction.

Consume on first enemy hit, even if ordinary protection prevents damage; no piercing/stun/knockback. Misses expire exactly at maxDistance. Pause freezes travel; results/retry clears everything. Do not let changes to headrest collision silently change enemy bottle damage, owner-death policy or ordering.

## Required tests

ROAR: every normal attack phase, active charge, attack slots, refreshed/exact-expiry stun, paused duration, live released bottle, mixed boss/normal targets, radius boundary, boss phase/death and simultaneous defeat. Headrest: buffered no-target case, moving/dead target, reverse-ID interceptor, high-speed sweep, tangent/initial overlap, clipped last segment, interrupted windup, one release/impact, boss hit, pause/reset and full-meter accounting.

Visual status/impact events describe these outcomes without changing simulation. ROAR stun must look different from boss damage; headrest conjure/release/path must be understandable muted and without shake.
