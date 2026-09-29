import { characters, type CharacterDefinition } from '../content/characters';
import type { DuoAssignment } from '../game/duo';
import type { RunState } from '../game/types';
import { getPlayer } from '../game/selectors';
import { EntryCountdown, type CountdownSnapshot } from './countdown';
import { initialSelection, reduceSelection, type SelectionEvent, type SelectionState } from './selection';

export type SessionPhase = 'selecting' | 'preparing' | 'countdown' | 'running' | 'paused' | 'victory' | 'defeat' | 'error';
export type ResumeTarget = 'preparing' | 'countdown' | 'running' | null;
export type SessionEffect =
  | { readonly type: 'prepare'; readonly duo: Readonly<DuoAssignment>; readonly generation: number }
  | { readonly type: 'launch'; readonly run: RunState }
  | { readonly type: 'clearInputs' }
  | { readonly type: 'disposeViews' };
export interface SessionSnapshot {
  readonly phase: SessionPhase;
  readonly selection: SelectionState;
  readonly duo: Readonly<DuoAssignment> | null;
  readonly run: RunState | null;
  readonly generation: number;
  readonly countdown: CountdownSnapshot | null;
  readonly resumeTarget: ResumeTarget;
  readonly error: string | null;
}

export class RunSession {
  private phase: SessionPhase = 'selecting';
  private selection: SelectionState;
  private duo: Readonly<DuoAssignment> | null = null;
  private run: RunState | null = null;
  private generation = 0;
  private countdown: EntryCountdown | null = null;
  private resumeTarget: ResumeTarget = null;
  private error: string | null = null;

  constructor(private readonly now: () => number = () => performance.now(),
    private readonly roster: readonly CharacterDefinition[] = characters) {
    this.selection = initialSelection(roster);
  }

  snapshot(): SessionSnapshot {
    return { phase: this.phase, selection: this.selection, duo: this.duo, run: this.run,
      generation: this.generation, countdown: this.countdown?.snapshot() ?? null,
      resumeTarget: this.resumeTarget, error: this.error };
  }

  select(event: SelectionEvent): SessionEffect[] {
    if (this.phase !== 'selecting') return [];
    const update = reduceSelection(this.selection, event, this.roster);
    this.selection = update.state;
    if (!update.duo) return [];
    this.duo = update.duo;
    return this.beginPreparation();
  }

  private beginPreparation(): SessionEffect[] {
    if (!this.duo) throw new Error('Cannot prepare without a duo');
    this.generation++;
    this.phase = 'preparing';
    this.run = null;
    this.countdown = null;
    this.resumeTarget = null;
    this.error = null;
    return [{ type: 'clearInputs' }, { type: 'disposeViews' },
      { type: 'prepare', duo: this.duo, generation: this.generation }];
  }

  prepared(generation: number, run: RunState): void {
    if (generation !== this.generation || !this.duo ||
      !(this.phase === 'preparing' || (this.phase === 'paused' && this.resumeTarget === 'preparing'))) return;
    if (run.duo?.fighterId !== this.duo.fighterId || run.duo.partnerId !== this.duo.partnerId || run.tick !== 0) {
      throw new Error('Prepared run does not match the locked duo');
    }
    this.run = run;
    this.countdown = new EntryCountdown(this.now);
    if (this.phase === 'paused') {
      this.countdown.pause();
      this.resumeTarget = 'countdown';
    } else this.phase = 'countdown';
  }

  preparationFailed(generation: number, message: string): void {
    if (generation !== this.generation ||
      !(this.phase === 'preparing' || (this.phase === 'paused' && this.resumeTarget === 'preparing'))) return;
    this.phase = 'error';
    this.resumeTarget = null;
    this.run = null;
    this.countdown = null;
    this.error = message;
  }

  frame(): SessionEffect[] {
    if (this.phase !== 'countdown' || !this.countdown || !this.run) return [];
    if (!this.countdown.frame() || !this.countdown.snapshot().completed) return [];
    this.phase = 'running';
    return [{ type: 'clearInputs' }, { type: 'launch', run: this.run }];
  }

  interrupt(): SessionEffect[] {
    if (this.phase !== 'preparing' && this.phase !== 'countdown' && this.phase !== 'running') return [];
    this.resumeTarget = this.phase;
    if (this.phase === 'countdown') this.countdown?.pause();
    this.phase = 'paused';
    return [{ type: 'clearInputs' }];
  }

  resume(safe: boolean): SessionEffect[] {
    if (!safe || this.phase !== 'paused' || !this.resumeTarget) return [];
    this.phase = this.resumeTarget;
    this.resumeTarget = null;
    if (this.phase === 'countdown') this.countdown?.resume();
    return [{ type: 'clearInputs' }];
  }

  finish(): void {
    if (this.phase !== 'running' || !this.run) return;
    const player = getPlayer(this.run);
    const boss = this.run.actors.find(actor => actor.role === 'liam');
    if (player.hp <= 0 || this.run.result === 'defeat') this.phase = 'defeat';
    else if ((boss && boss.hp <= 0) || this.run.result === 'victory') this.phase = 'victory';
  }

  retry(): SessionEffect[] {
    if (!this.duo || (this.phase !== 'error' && this.phase !== 'victory' && this.phase !== 'defeat')) return [];
    return this.beginPreparation();
  }

  home(): SessionEffect[] {
    this.generation++;
    this.phase = 'selecting';
    this.selection = initialSelection(this.roster);
    this.duo = null;
    this.run = null;
    this.countdown = null;
    this.resumeTarget = null;
    this.error = null;
    return [{ type: 'clearInputs' }, { type: 'disposeViews' }];
  }
}
