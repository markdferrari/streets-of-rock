import type { PartnerState, PlayerState, RunState } from './types';

export function getPlayer(run: RunState): PlayerState {
  const players = run.actors.filter((actor): actor is PlayerState => actor.role === 'player');
  if (players.length !== 1) throw new Error('Run must contain exactly one player');
  return players[0]!;
}

export function getPartner(run: RunState): PartnerState {
  const partners = run.actors.filter((actor): actor is PartnerState => actor.role === 'partner');
  if (partners.length !== 1) throw new Error('Run must contain exactly one partner');
  return partners[0]!;
}
