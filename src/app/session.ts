import type { RunState } from '../game/types';
import { createRun } from '../game/run';
export class RunSession {
  phase: 'loading' | 'title' | 'running' | 'paused' | 'victory' | 'defeat' = 'loading';
  run: RunState | null = null;
  private nextRunId = 1;
  loaded(): void { if (this.phase === 'loading') this.phase = 'title'; }
  start(): void {
    if (this.phase !== 'title') return;
    this.run = createRun(this.nextRunId++);
    this.phase = 'running';
  }
  pause(): void { if (this.phase === 'running') this.phase = 'paused'; }
  resume(): void { if (this.phase === 'paused') this.phase = 'running'; }
  finish(): void {
    if ((this.phase !== 'running' && this.phase !== 'paused') || !this.run) return;
    const cow = this.run.actors.find(actor => actor.role === 'cow');
    const liam = this.run.actors.find(actor => actor.role === 'liam');
    if (!cow || cow.hp <= 0 || this.run.result === 'defeat') this.phase = 'defeat';
    else if ((liam && liam.hp <= 0) || this.run.result === 'victory') this.phase = 'victory';
  }
  retry(): void {
    if (this.phase !== 'victory' && this.phase !== 'defeat') return;
    this.run = createRun(this.nextRunId++);
    this.phase = 'running';
  }
}
