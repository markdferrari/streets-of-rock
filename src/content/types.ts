export type ActorRole = 'player' | 'partner' | 'grunt' | 'zoner' | 'enforcer' | 'liam';
export type EnemyRole = Exclude<ActorRole, 'player' | 'partner'>;

export interface SpawnDefinition {
  readonly role: EnemyRole;
  readonly x: number;
  readonly depth: number;
}

export interface AreaDefinition {
  readonly id: string;
  readonly minX: number;
  readonly maxX: number;
  readonly minDepth: number;
  readonly maxDepth: number;
  readonly waves: readonly (readonly SpawnDefinition[])[];
}

export interface LevelDefinition {
  readonly id: string;
  readonly areas: readonly AreaDefinition[];
}
