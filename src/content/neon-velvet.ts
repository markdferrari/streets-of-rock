import type { EnemyDefinition, EnemyRole, LevelDefinition } from './types';
import { tuning } from './tuning';
export const enemyDefinitions: Readonly<Record<EnemyRole, EnemyDefinition>> = Object.freeze({
  grunt: { role: 'grunt', combatClass: 'normal', hp: tuning.gruntHp },
  zoner: { role: 'zoner', combatClass: 'normal', hp: tuning.zonerHp },
  enforcer: { role: 'enforcer', combatClass: 'normal', hp: tuning.enforcerHp },
  liam: { role: 'liam', combatClass: 'boss', hp: tuning.liamHp },
});
export const neonVelvet: LevelDefinition = {
  id: 'neon-velvet', areas: [
    { id: 'dance-floor', minX: 0, maxX: 16, minDepth: -3, maxDepth: 3, waves: [
      [{ role: 'grunt', x: 5, depth: -1 }, { role: 'grunt', x: 6, depth: 1 }, { role: 'grunt', x: 7, depth: 0 }],
      [{ role: 'grunt', x: 9, depth: -1 }, { role: 'grunt', x: 10, depth: 1 }, { role: 'zoner', x: 12, depth: 0 }],
    ] },
    { id: 'vip-lounge', minX: 18, maxX: 34, minDepth: -3, maxDepth: 3, waves: [
      [{ role: 'zoner', x: 25, depth: -1 }, { role: 'zoner', x: 27, depth: 1 }, { role: 'grunt', x: 23, depth: 0 }, { role: 'grunt', x: 24, depth: 1 }],
      [{ role: 'enforcer', x: 29, depth: 0 }, { role: 'grunt', x: 30, depth: -1 }, { role: 'grunt', x: 31, depth: 1 }],
    ] },
    { id: 'backstage-corridor', minX: 36, maxX: 52, minDepth: -3, maxDepth: 3, waves: [
      [{ role: 'enforcer', x: 43, depth: -1 }, { role: 'enforcer', x: 45, depth: 1 }, { role: 'zoner', x: 47, depth: -1 }, { role: 'zoner', x: 49, depth: 1 }],
    ] },
    { id: 'alley-exit', minX: 54, maxX: 70, minDepth: -3, maxDepth: 3, waves: [
      [{ role: 'liam', x: 64, depth: 0 }],
    ] },
  ],
};
export const vipTables: readonly { x: number; depth: number }[] = [{ x: 22, depth: -2 }, { x: 28, depth: 2 }];
