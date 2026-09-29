import { characters } from '../content/characters';
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
  const definition = characters.find(character => character.id === getPlayer(run).characterId)?.definition;
  if (!definition) throw new Error(`Unknown player move ${move}`);
  if (move === 'special') {
    const special = definition.player.special;
    const base = { windup: special.windupTicks, active: special.activeTicks, recovery: special.recoveryTicks };
    if (special.kind === 'areaStrike') return { ...base, damage: special.damage, range: special.range, depthTolerance: special.depthTolerance, knockback: special.knockback };
    if (special.kind === 'roar') return { ...base, damage: 0, range: special.radius, depthTolerance: special.radius, knockback: 0 };
    return { ...base, damage: special.damage, range: special.maxDistance, depthTolerance: special.collisionRadius, knockback: 0 };
  }
  const moveData = move === 'heavy' ? definition.player.heavy : definition.player.light[Number(move.at(-1)) - 1];
  if (moveData === undefined) throw new Error(`Missing player move ${move}`);
  return { windup: moveData.windupTicks, active: moveData.activeTicks, recovery: moveData.recoveryTicks,
    damage: moveData.damage, range: moveData.range, depthTolerance: moveData.depthTolerance, knockback: moveData.knockback };
}
