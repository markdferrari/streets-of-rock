import type { ActorRole } from '../content/types';

export interface Position { x: number; depth: number }
export type Facing = -1 | 1;
export type Team = 'ally' | 'enemy';
export type ActionKind = 'idle' | 'windup' | 'active' | 'recovery' | 'hurt' | 'dodge' | 'knockedOut';
export type MoveId = 'cow1' | 'cow2' | 'cow3' | 'spin' | 'crow' | 'grunt' | 'throw' | 'charge' | 'rope' | 'close' | 'shockwave';

export interface ActionState { kind: ActionKind; moveId?: MoveId; startedTick: number; endTick: number }
export interface Actor {
  id: number;
  role: ActorRole;
  team: Team;
  position: Position;
  facing: Facing;
  hp: number;
  maxHp: number;
  action: ActionState;
  protectionUntilTick: number;
  targetId?: number;
  decisionReadyTick: number;
  attackSlot: boolean;
  phase: 1 | 2;
}
export interface PendingAction { kind: 'attack' | 'dodge' | 'special'; expiresTick: number; sequence: number }
export interface CowState extends Actor {
  role: 'cow';
  comboStep: 0 | 1 | 2;
  comboDeadlineTick: number;
  dodgeReadyTick: number;
  specialMeter: number;
  dodgeDirection?: Position;
  pendingAction?: PendingAction;
}
export interface CrowState extends Actor { role: 'crow'; active: boolean; lastProgressTick: number }
export interface EnemyState extends Actor { role: 'grunt' | 'zoner' | 'enforcer' | 'liam' }
export type GameActor = CowState | CrowState | EnemyState;

export interface AttackInstance {
  id: number;
  ownerId: number;
  moveId: MoveId;
  origin: Position;
  facing: Facing;
  activeUntilTick: number;
  range: number;
  depthTolerance: number;
  damage: number;
  hitTargetIds: number[];
}
export interface Projectile {
  id: number;
  ownerId: number;
  attackId: number;
  position: Position;
  previousPosition: Position;
  velocity: Position;
  remainingTicks: number;
}
export interface BreakableTable { id: number; areaId: string; position: Position; hp: number; broken: boolean; pickupId?: number }
export interface EnergyDrink { id: number; sourceTableId: number; position: Position; available: boolean }
export interface EncounterState {
  areaId: string;
  waveIndex: number;
  status: 'awaitingEntry' | 'active' | 'cleared';
  aliveEnemyIds: number[];
  cameraCenter: number;
}
export type RunResult = 'victory' | 'defeat' | null;
export interface RunState {
  runId: number;
  tick: number;
  nextEntityId: number;
  nextAttackId: number;
  areaIndex: number;
  waveIndex: number;
  actors: GameActor[];
  attacks: AttackInstance[];
  projectiles: Projectile[];
  tables: BreakableTable[];
  pickups: EnergyDrink[];
  encounter: EncounterState;
  result: RunResult;
}
export interface InputFrame { move: Position; attack?: boolean; dodge?: boolean; special?: boolean }
export interface GameEvent { type: string; tick: number; actorId?: number; targetId?: number }

// Game rules depend only on these values. Browser, rendering, audio and storage adapters live outside src/game.
