import { createRun } from '../game/run';
import { stepRun } from '../game/step';
import { clearCowPendingAction } from '../game/actions';
import type { GameEvent, RunState } from '../game/types';
import { PointerControls, type PointerRegion } from '../input/pointers';
import { toInputFrame } from '../input/frame';
import { GameScene } from '../presentation/scene';
import { CharacterAssetStore } from '../presentation/character-assets';
import { combatHudMarkup } from '../ui/combat';
import { TutorialProgress } from '../ui/tutorial';
import { titleMarkup, resultMarkup } from '../ui/screens';
import { BestResultStore } from '../platform/best-result';
import { ActiveClock } from './clock';
import { FixedStepLoop } from './loop';

export class GameApp {
  private run: RunState | null = null;
  private scene: GameScene | null = null;
  private characterAssets = new CharacterAssetStore();
  private pointers = new PointerControls();
  private tutorial = new TutorialProgress();
  private clock = new ActiveClock(() => performance.now());
  private loop = new FixedStepLoop(() => this.step());
  private screen: 'title' | 'loading' | 'running' | 'paused' | 'victory' | 'defeat' | 'error' = 'title';
  private events: GameEvent[] = [];
  private hudMarkup = '';
  private feedbackUntilTick = 0;
  private pauseReason: 'manual' | 'rotate' | 'interrupted' = 'manual';
  private bestResult: BestResultStore;
  constructor(private readonly root: HTMLElement) {
    if (import.meta.env.VITE_TEST_MODE === '1') {
      Object.defineProperty(window, '__sorTest', { value: {
        snapshot: () => this.run ? structuredClone(this.run) : null,
        placeCow: (x: number) => {
          const cow = this.run?.actors.find(actor => actor.role === 'cow');
          if (cow && Number.isFinite(x)) { cow.position.x = Math.max(0, Math.min(16, x)); cow.position.depth = 0; cow.facing = 1; }
        },
        stageCowHit: () => {
          const cow = this.run?.actors.find(actor => actor.role === 'cow');
          const enemies = this.run?.actors.filter(actor => actor.team === 'enemy' && actor.hp > 0) ?? [];
          if (!cow || !enemies.length || !this.run) return;
          cow.position.x = 6;
          cow.position.depth = 0;
          cow.facing = 1;
          enemies.forEach((enemy, index) => {
            enemy.position.x = index === 0 ? 6.9 : 10 + index;
            enemy.position.depth = 0;
            enemy.decisionReadyTick = this.run!.tick + 120;
          });
        },
        defeatCow: () => { const cow = this.run?.actors.find(actor => actor.role === 'cow'); if (cow) cow.hp = 0; },
      }, configurable: true });
    }
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { /* Play without local persistence. */ }
    this.bestResult = new BestResultStore(storage);
    this.tutorial = new TutorialProgress([], storage);
    this.root.innerHTML = titleMarkup();
    this.root.addEventListener('click', event => this.onClick(event));
    this.root.addEventListener('pointerdown', event => this.onPointerDown(event));
    this.root.addEventListener('pointermove', event => this.pointers.move(event.pointerId, { x: event.clientX, y: event.clientY }));
    this.root.addEventListener('pointerup', event => { this.pointers.up(event.pointerId); this.setPressed(event, false); });
    this.root.addEventListener('pointercancel', event => { this.pointers.cancel(event.pointerId); this.setPressed(event, false); });
    this.root.addEventListener('lostpointercapture', event => { this.pointers.cancel(event.pointerId); this.setPressed(event, false); });
    window.addEventListener('resize', () => {
      this.scene?.resize(); this.centerJoystick();
      if (this.isPortrait() && this.screen === 'running') this.pause('rotate');
      else if (this.screen === 'paused') this.updatePauseOverlay();
    });
    window.addEventListener('blur', () => { if (this.screen === 'running') this.pause('interrupted'); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.screen === 'running') this.pause('interrupted'); });
    requestAnimationFrame(now => this.frame(now));
  }
  private onClick(event: Event): void {
    const command = (event.target as HTMLElement).closest<HTMLElement>('[data-command]')?.dataset.command;
    if (command === 'start') this.start();
    else if (command === 'pause' && this.screen === 'running') this.pause();
    else if (command === 'resume' && this.screen === 'paused') this.resume();
    else if (command === 'retry' && (this.screen === 'victory' || this.screen === 'defeat' || this.screen === 'error')) this.start();
    else if (command === 'title' && (this.screen === 'victory' || this.screen === 'defeat')) this.returnToTitle();
  }
  private onPointerDown(event: PointerEvent): void {
    if (this.screen !== 'running') return;
    const element = (event.target as HTMLElement).closest<HTMLElement>('[data-region]');
    const region = (element?.dataset.region ?? 'none') as PointerRegion;
    if (region === 'none' || region === 'hud') return;
    event.preventDefault();
    element?.setPointerCapture(event.pointerId);
    this.pointers.down(event.pointerId, { x: event.clientX, y: event.clientY }, region);
    this.setPressed(event, true);
  }
  private setPressed(event: PointerEvent, pressed: boolean): void {
    const button = (event.target as HTMLElement).closest<HTMLElement>('.actions button');
    button?.classList.toggle('pressed', pressed);
  }
  private async start(): Promise<void> {
    if (this.screen === 'loading') return;
    this.screen = 'loading';
    this.root.innerHTML = `<main class="menu"><h1>Loading characters</h1><p>Preparing Cow and Crow…</p></main>`;
    try {
      await this.characterAssets.load();
    } catch {
      this.screen = 'error';
      this.root.innerHTML = `<main class="menu"><h1>Unable to load characters</h1><p>Check your connection and try again.</p><button data-command="retry">Retry</button></main>`;
      return;
    }
    this.run = createRun(Date.now());
    this.pointers.clear();
    this.clock.reset();
    this.loop.reset();
    this.events = [];
    this.hudMarkup = '';
    this.feedbackUntilTick = 0;
    this.root.innerHTML = `<div class="game"><div class="scene-host"></div><div class="hud-host"></div><div class="prompt" aria-live="polite"></div><div class="joystick" data-region="movement" aria-label="Move"><div class="knob"></div></div><div class="actions"><button class="light" data-region="attack" aria-label="Light">Light</button><button class="heavy" data-region="heavy" aria-label="Heavy">Heavy</button><button class="dodge" data-region="dodge" aria-label="Dodge">Dodge</button><button class="special" data-region="special" aria-label="Special">Special</button></div><div class="overlay" hidden></div></div>`;
    try {
      this.scene?.dispose();
      this.scene = new GameScene(this.root.querySelector<HTMLElement>('.scene-host')!, this.characterAssets);
      this.screen = 'running';
      this.clock.start();
      this.centerJoystick();
      this.updateUi();
      if (this.isPortrait()) this.pause('rotate');
    } catch {
      this.screen = 'error';
      this.root.innerHTML = `<main class="menu"><h1>Unable to start</h1><p>WebGL may be unavailable.</p><button data-command="start">Retry</button></main>`;
    }
  }
  private pause(reason: 'manual' | 'rotate' | 'interrupted' = 'manual'): void {
    this.screen = 'paused';
    this.pauseReason = reason;
    this.clock.pause();
    this.loop.reset();
    this.pointers.clear();
    this.root.querySelectorAll('.actions .pressed').forEach(button => button.classList.remove('pressed'));
    if (this.run) clearCowPendingAction(this.run);
    this.updatePauseOverlay();
  }
  private isPortrait(): boolean { return window.innerHeight > window.innerWidth; }
  private updatePauseOverlay(): void {
    const overlay = this.root.querySelector<HTMLElement>('.overlay');
    if (!overlay) return;
    overlay.hidden = false;
    overlay.innerHTML = this.isPortrait()
      ? `<div class="pause-menu"><h2>Rotate device</h2><p>Turn your device to landscape to continue.</p></div>`
      : `<div class="pause-menu"><h2>${this.pauseReason === 'manual' ? 'Paused' : 'Ready to resume'}</h2><button data-command="resume">Resume</button></div>`;
  }
  private resume(): void {
    if (this.isPortrait() || document.hidden) return;
    this.pointers.clear();
    this.root.querySelectorAll('.actions .pressed').forEach(button => button.classList.remove('pressed'));
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
    if (this.run.result) this.finish(this.run.result);
  }
  private finish(result: 'victory' | 'defeat'): void {
    this.screen = result;
    this.clock.pause();
    this.pointers.clear();
    clearCowPendingAction(this.run!);
    const elapsed = this.clock.elapsedMs();
    if (result === 'victory') this.bestResult.record(elapsed);
    const overlay = this.root.querySelector<HTMLElement>('.overlay');
    if (overlay) { overlay.hidden = false; overlay.innerHTML = resultMarkup(result, elapsed, this.bestResult.best()); }
  }
  private returnToTitle(): void {
    this.scene?.dispose();
    this.scene = null;
    this.run = null;
    this.pointers.clear();
    this.clock.reset();
    this.screen = 'title';
    this.root.innerHTML = titleMarkup();
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
      const label = { movement: 'Move to fight', attack: 'Tap Light', heavy: 'Tap Heavy', dodge: 'Dodge attacks', special: 'Use your Special' };
      const id = this.tutorial.suggest(this.run);
      prompt.textContent = id ? label[id] : '';
    }
    const joystick = this.root.querySelector<HTMLElement>('.joystick .knob');
    const position = this.pointers.joystick();
    if (joystick && position) { joystick.style.left = `${56 + position.knob.x - position.anchor.x}px`; joystick.style.top = `${56 + position.knob.y - position.anchor.y}px`; }
    const cow = this.run.actors.find(actor => actor.role === 'cow');
    if (cow?.role === 'cow') {
      const dodge = this.root.querySelector<HTMLElement>('.actions .dodge');
      const special = this.root.querySelector<HTMLElement>('.actions .special');
      if (dodge) dodge.textContent = `Dodge ${cow.dodgeReadyTick > this.run.tick ? `${((cow.dodgeReadyTick - this.run.tick) / 60).toFixed(1)}s` : 'Ready'}`;
      if (special) special.textContent = `Special ${cow.specialMeter >= 100 ? 'Ready' : `${cow.specialMeter}%`}`;
    }
  }
  private centerJoystick(): void {
    const ring = this.root.querySelector<HTMLElement>('.joystick');
    if (!ring) return;
    const box = ring.getBoundingClientRect();
    this.pointers.clear();
    this.pointers.setCenter({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
    if (this.run) clearCowPendingAction(this.run);
    this.updateUi();
  }
  private frame(now: number): void {
    if (this.screen === 'running') this.loop.frame(now, true);
    else this.loop.frame(now, false);
    if (this.scene && this.run) this.scene.render(this.run, this.events.splice(0), now);
    requestAnimationFrame(time => this.frame(time));
  }
}
