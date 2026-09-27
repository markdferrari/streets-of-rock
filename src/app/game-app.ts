import { createRun } from '../game/run';
import { stepRun } from '../game/step';
import { clearCowPendingAction } from '../game/actions';
import type { GameEvent, RunState } from '../game/types';
import { addTrainingGrunt } from '../content/training';
import { PointerControls, type PointerRegion } from '../input/pointers';
import { toInputFrame } from '../input/frame';
import { GameScene } from '../presentation/scene';
import { combatHudMarkup } from '../ui/combat';
import { TutorialProgress } from '../ui/tutorial';
import { ActiveClock } from './clock';
import { FixedStepLoop } from './loop';

export class GameApp {
  private run: RunState | null = null;
  private scene: GameScene | null = null;
  private pointers = new PointerControls();
  private tutorial = new TutorialProgress();
  private clock = new ActiveClock(() => performance.now());
  private loop = new FixedStepLoop(() => this.step());
  private screen: 'title' | 'running' | 'paused' | 'error' = 'title';
  private events: GameEvent[] = [];
  private hudMarkup = '';
  private feedbackUntilTick = 0;
  constructor(private readonly root: HTMLElement) {
    if (import.meta.env.VITE_TEST_MODE === '1') {
      Object.defineProperty(window, '__sorTest', { value: {
        snapshot: () => this.run ? structuredClone(this.run) : null,
        placeCow: (x: number) => {
          const cow = this.run?.actors.find(actor => actor.role === 'cow');
          if (cow && Number.isFinite(x)) { cow.position.x = Math.max(0, Math.min(16, x)); cow.position.depth = 0; cow.facing = 1; }
        },
      }, configurable: true });
    }
    this.root.innerHTML = `<main class="menu"><h1>Streets of Rock</h1><p>The Neon Velvet</p><button data-command="start">Start</button></main>`;
    this.root.addEventListener('click', event => this.onClick(event));
    this.root.addEventListener('pointerdown', event => this.onPointerDown(event));
    this.root.addEventListener('pointermove', event => this.pointers.move(event.pointerId, { x: event.clientX, y: event.clientY }));
    this.root.addEventListener('pointerup', event => this.pointers.up(event.pointerId));
    this.root.addEventListener('pointercancel', event => this.pointers.cancel(event.pointerId));
    this.root.addEventListener('lostpointercapture', event => this.pointers.cancel(event.pointerId));
    window.addEventListener('resize', () => this.scene?.resize());
    requestAnimationFrame(now => this.frame(now));
  }
  private onClick(event: Event): void {
    const command = (event.target as HTMLElement).closest<HTMLElement>('[data-command]')?.dataset.command;
    if (command === 'start') this.start();
    else if (command === 'pause' && this.screen === 'running') this.pause();
    else if (command === 'resume' && this.screen === 'paused') this.resume();
  }
  private onPointerDown(event: PointerEvent): void {
    if (this.screen !== 'running') return;
    const element = (event.target as HTMLElement).closest<HTMLElement>('[data-region]');
    const region = (element?.dataset.region ?? 'none') as PointerRegion;
    if (region === 'none' || region === 'hud') return;
    event.preventDefault();
    element?.setPointerCapture(event.pointerId);
    this.pointers.down(event.pointerId, { x: event.clientX, y: event.clientY }, region);
  }
  private start(): void {
    this.run = createRun(Date.now());
    addTrainingGrunt(this.run);
    this.pointers.clear();
    this.clock.reset();
    this.loop.reset();
    this.root.innerHTML = `<div class="game"><div class="scene-host"></div><div class="hud-host"></div><div class="prompt" aria-live="polite"></div><div class="move-region" data-region="movement"><div class="joystick" hidden></div></div><div class="actions"><button class="attack" data-region="attack" aria-label="Attack">Attack</button><button data-region="dodge" aria-label="Dodge">Dodge</button><button data-region="special" aria-label="Special">Special</button></div><div class="overlay" hidden></div></div>`;
    try {
      this.scene?.dispose();
      this.scene = new GameScene(this.root.querySelector<HTMLElement>('.scene-host')!);
      this.screen = 'running';
      this.clock.start();
      this.updateUi();
    } catch {
      this.screen = 'error';
      this.root.innerHTML = `<main class="menu"><h1>Unable to start</h1><p>WebGL may be unavailable.</p><button data-command="start">Retry</button></main>`;
    }
  }
  private pause(): void {
    this.screen = 'paused';
    this.clock.pause();
    this.loop.reset();
    this.pointers.clear();
    if (this.run) clearCowPendingAction(this.run);
    const overlay = this.root.querySelector<HTMLElement>('.overlay');
    if (overlay) { overlay.hidden = false; overlay.innerHTML = `<div class="pause-menu"><h2>Paused</h2><button data-command="resume">Resume</button></div>`; }
  }
  private resume(): void {
    this.pointers.clear();
    this.loop.reset();
    this.screen = 'running';
    this.clock.start();
    const overlay = this.root.querySelector<HTMLElement>('.overlay');
    if (overlay) overlay.hidden = true;
  }
  private step(): void {
    if (!this.run) return;
    const input = toInputFrame(this.pointers.frame());
    this.events = stepRun(this.run, input);
    if (this.events.some(event => event.type === 'unavailable')) this.feedbackUntilTick = this.run.tick + 50;
    this.tutorial.accept(this.events, input.move.x !== 0 || input.move.depth !== 0);
    this.updateUi();
  }
  private updateUi(): void {
    if (!this.run) return;
    const next = combatHudMarkup(this.run, this.run.tick < this.feedbackUntilTick ? 'Action not ready' : '').replace('data-action="pause"', 'data-command="pause" data-region="hud"');
    if (next !== this.hudMarkup) {
      this.hudMarkup = next;
      const host = this.root.querySelector<HTMLElement>('.hud-host');
      if (host) host.innerHTML = next;
    }
    const prompt = this.root.querySelector<HTMLElement>('.prompt');
    if (prompt) {
      const label = { movement: 'Move to fight', attack: 'Tap Attack', dodge: 'Dodge attacks', special: 'Use your Special' };
      const id = this.tutorial.suggest(this.run);
      prompt.textContent = id ? label[id] : '';
    }
    const joystick = this.root.querySelector<HTMLElement>('.joystick');
    const position = this.pointers.joystick();
    if (joystick) { joystick.hidden = !position; if (position) { joystick.style.left = `${position.anchor.x}px`; joystick.style.top = `${position.anchor.y}px`; } }
  }
  private frame(now: number): void {
    if (this.screen === 'running') this.loop.frame(now, true);
    else this.loop.frame(now, false);
    if (this.scene && this.run) this.scene.render(this.run, this.events.splice(0), now);
    requestAnimationFrame(time => this.frame(time));
  }
}
