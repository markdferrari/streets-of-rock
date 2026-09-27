export type ActorRole = 'cow' | 'crow' | 'grunt' | 'zoner' | 'enforcer' | 'liam';
export type EnemyRole = Exclude<ActorRole, 'cow' | 'crow'>;

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
