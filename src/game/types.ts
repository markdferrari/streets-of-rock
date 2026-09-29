import type { ActorRole } from '../content/types';
import type { CharacterId } from '../content/characters';
import type { DuoAssignment } from './duo';

export interface Position { x: number; depth: number }
export type Facing = -1 | 1;
export type Team = 'ally' | 'enemy';
export type ActionKind = 'idle' | 'windup' | 'active' | 'recovery' | 'hurt' | 'dodge' | 'knockedOut';
export type MoveId = 'light1' | 'light2' | 'light3' | 'heavy' | 'special' | 'support' |
  'grunt' | 'throw' | 'charge' | 'rope' | 'close' | 'shockwave';
export type PlayerAction = 'light' | 'heavy' | 'dodge' | 'special';
export interface ActionRequest { kind: PlayerAction; sourcePointerId: number; order: number }

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
export interface PendingAction extends ActionRequest { expiresTick: number }
export interface PlayerState extends Actor {
  role: 'player';
  characterId: CharacterId;
  comboStep: 0 | 1 | 2;
  comboDeadlineTick: number;
  dodgeReadyTick: number;
  specialMeter: number;
  dodgeDirection?: Position;
  pendingAction?: PendingAction;
  preparedSpecial?: { activationId: number; kind: 'roar' | 'headrest'; aimPosition?: Position; targetIdForDiagnostics?: number; released: boolean };
}
export interface PartnerIntentState {
  intent: 'engage' | 'regroup' | 'idle' | 'recover';
  targetId: number | null;
  destination: Position | null;
  lastHorizontalFacing: Facing;
  blockedTicks: number;
  blockedDestination: Position | null;
  lastResolvedPosition: Position;
  lastRecoveryTick: number;
}
export interface PartnerState extends Actor { role: 'partner'; characterId: CharacterId; active: boolean; lastProgressTick: number; intentState: PartnerIntentState }
export interface EnemyState extends Actor {
  role: 'grunt' | 'zoner' | 'enforcer' | 'liam';
  combatClass: 'normal' | 'boss';
  stunnedUntilTick?: number;
  shockwaveReadyTick?: number;
}
export type GameActor = PlayerState | PartnerState | EnemyState;

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
export interface BottleProjectile {
  kind?: 'bottle';
  id: number;
  ownerId: number;
  attackId: number;
  position: Position;
  previousPosition: Position;
  velocity: Position;
  remainingTicks: number;
}
export interface HeadrestProjectile {
  kind: 'headrest'; id: number; ownerId: number; activationId: number;
  position: Position; previousPosition: Position; direction: Position;
  speedPerSecond: number; remainingDistance: number; damage: number; radius: number;
}
export type Projectile = BottleProjectile | HeadrestProjectile;
export interface PendingSpecialDamage { activationId: number; ownerId: number; targetId: number; damage: number }
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
  duo: Readonly<DuoAssignment>;
  runId: number;
  tick: number;
  nextEntityId: number;
  nextAttackId: number;
  nextSpecialActivationId: number;
  areaIndex: number;
  waveIndex: number;
  actors: GameActor[];
  attacks: AttackInstance[];
  projectiles: Projectile[];
  pendingSpecialDamage: PendingSpecialDamage[];
  tables: BreakableTable[];
  pickups: EnergyDrink[];
  encounter: EncounterState;
  result: RunResult;
}
export interface InputFrame { move: Position; requests?: ActionRequest[]; canceledPointerIds?: number[] }
export interface GameEvent { type: string; tick: number; actorId?: number; targetId?: number }

// Game rules depend only on these values. Browser, rendering, audio and storage adapters live outside src/game.
