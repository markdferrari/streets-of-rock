import { characters } from '../content/characters';
import { cowMoveTuning } from '../content/tuning';
import type { MoveId, RunState } from './types';
import { getPlayer } from './selectors';

const playerMoves = new Set<MoveId>(['light1', 'light2', 'light3', 'heavy', 'special']);
export function isPlayerMove(move: MoveId): boolean { return playerMoves.has(move); }

export function playerMoveId(kind: 'light' | 'heavy' | 'special', comboStep = 0): MoveId {
  if (kind === 'special') return 'special';
  if (kind === 'heavy') return 'heavy';
  return `light${comboStep + 1}` as MoveId;
}

export function playerMoveTuning(run: RunState, move: MoveId) {
  if (!isPlayerMove(move)) return null;
  const baseName = move === 'heavy' ? 'cowHeavy' : move === 'special' ? 'spin' : `cow${move.at(-1)}`;
  const base = cowMoveTuning[baseName as keyof typeof cowMoveTuning];
  const profile = characters.find(character => character.id === getPlayer(run).characterId)?.playerProfile;
  if (!profile) throw new Error(`Unknown player move ${move}`);
  return { ...base, damage: profile.damage[move as keyof typeof profile.damage] };
}
