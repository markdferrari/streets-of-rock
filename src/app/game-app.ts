import { createRun } from '../game/run';
import { getPartner, getPlayer } from '../game/selectors';
import { stepRun } from '../game/step';
import { clearPlayerPendingAction } from '../game/actions';
import type { GameEvent, RunState } from '../game/types';
import type { DuoAssignment } from '../game/duo';
import { PointerControls, type PointerRegion } from '../input/pointers';
import { SelectionInput } from '../input/selection';
import { toInputFrame } from '../input/frame';
import { GameScene } from '../presentation/scene';
import { CharacterAssetStore, validateCharacterResources } from '../presentation/character-assets';
import { CharacterPreview } from '../presentation/character-preview';
import { combatHudMarkup } from '../ui/combat';
import { TutorialProgress } from '../ui/tutorial';
import { countdownMarkup, preparingMarkup, preparationErrorMarkup, resultMarkup } from '../ui/screens';
import { selectionMarkup, type ActivationModality, type PreviewStatus } from '../ui/selection';
import { BestResultStore } from '../platform/best-result';
import { ActiveClock } from './clock';
import { FixedStepLoop } from './loop';
import { RunSession, type SessionEffect } from './session';
import { characters, type CharacterDefinition } from '../content/characters';
import { SettingsStore, type Settings } from '../platform/settings';
import { AudioController } from '../platform/audio';
import { pwaStatusText, type PwaStatus } from '../platform/pwa';
import { FrameDiagnostics } from '../platform/diagnostics';
import { settingsMarkup } from '../ui/settings';
import { neonVelvet } from '../content/neon-velvet';
import { deriveProgressionCue, placeProgressionCue, progressionMarkup, type UiRect } from '../ui/progression';

export class GameApp {
  private readonly session: RunSession;
  private readonly characterAssets = new CharacterAssetStore();
  private readonly pointers = new PointerControls();
  private readonly selectionInput: SelectionInput;
  private readonly clock = new ActiveClock(() => performance.now());
  private readonly loop = new FixedStepLoop(() => this.step());
  private readonly bestResult: BestResultStore;
  private readonly settingsStore: SettingsStore;
  private settings: Settings;
  private readonly audio: AudioController;
  private pwaStatus: PwaStatus = { readiness: 'unknown', waiting: false, buildId: null };
  private readonly diagnostics = import.meta.env.VITE_DIAGNOSTICS === '1' ? new FrameDiagnostics() : null;
  private tutorial: TutorialProgress;
  private scene: GameScene | null = null;
  private preview: CharacterPreview | null = null;
  private previewStatus: PreviewStatus = 'empty';
  private selectionModality: ActivationModality = 'pointer';
  private events: GameEvent[] = [];
  private hudMarkup = '';
  private lastCueKey = '';
  private feedbackUntilTick = 0;
  private readonly testMoves: string[] = [];
  private nextRunId = 1;
  private pauseReason: 'manual' | 'rotate' | 'interrupted' = 'manual';

  constructor(private readonly root: HTMLElement, private readonly roster: readonly CharacterDefinition[] = characters) {
    this.session = new RunSession(() => performance.now(), this.roster);
    if (import.meta.env.VITE_DIAGNOSTICS === '1' && this.diagnostics) {
      Object.defineProperty(window, '__sorDiagnostics', { value: {
        snapshot: () => this.diagnostics!.snapshot(),
        download: () => {
          const url = URL.createObjectURL(new Blob([this.diagnostics!.exportJson()], { type: 'application/json' }));
          const link = document.createElement('a');
          link.href = url; link.download = 'streets-of-rock-diagnostics.json'; link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      }, configurable: true });
    }
    if (import.meta.env.VITE_TEST_MODE === '1') {
      Object.defineProperty(window, '__sorTest', { value: {
        snapshot: () => this.run ? structuredClone(this.run) : null,
        cameraFrame: () => this.scene?.frameSnapshot() ?? null,
        moves: () => [...this.testMoves],
        placePlayer: (x: number) => {
          const player = this.run ? getPlayer(this.run) : null;
          if (player && Number.isFinite(x)) { player.position.x = Math.max(0, Math.min(neonVelvet.areas.at(-1)!.maxX, x)); player.position.depth = 0; player.facing = 1; }
        },
        placePartner: (x: number) => {
          const partner = this.run ? getPartner(this.run) : null;
          if (partner && Number.isFinite(x)) { partner.position.x = Math.max(0, Math.min(neonVelvet.areas.at(-1)!.maxX, x)); partner.position.depth = 0; partner.facing = 1; }
        },
        clearWave: () => {
          if (!this.run) return;
          for (const id of this.run.encounter.aliveEnemyIds) {
            const enemy = this.run.actors.find(actor => actor.id === id);
            if (enemy) enemy.hp = 0;
          }
        },
        stagePlayerHit: () => {
          const player = this.run ? getPlayer(this.run) : null;
          const enemies = this.run?.actors.filter(actor => actor.team === 'enemy' && actor.hp > 0) ?? [];
          if (!player || !enemies.length || !this.run) return;
          player.position.x = 6; player.position.depth = 0; player.facing = 1;
          enemies.forEach((enemy, index) => {
            enemy.position.x = index === 0 ? 6.9 : 10 + index;
            enemy.position.depth = 0;
            enemy.decisionReadyTick = this.run!.tick + 120;
          });
        },
        defeatPlayer: () => { if (this.run) getPlayer(this.run).hp = 0; },
      }, configurable: true });
    }
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { /* Play without local persistence. */ }
    this.bestResult = new BestResultStore(storage);
    this.settingsStore = new SettingsStore(storage);
    this.settings = this.settingsStore.read();
    this.audio = new AudioController('/assets/audio/brightside.mp3', this.settings);
    this.tutorial = new TutorialProgress([], storage);
    this.selectionInput = new SelectionInput(this.root,
      (id, modality) => this.activateSelection(id, modality), id => this.focusSelection(id));
    this.renderSelection();
    this.root.addEventListener('click', event => this.onClick(event));
    this.root.addEventListener('input', event => this.onSettingInput(event));
    this.root.addEventListener('keydown', event => this.selectionInput.keyDown(event));
    this.root.addEventListener('keyup', event => this.selectionInput.keyUp(event));
    this.root.addEventListener('focusin', event => this.selectionInput.focusIn(event));
    this.root.addEventListener('pointerdown', event => this.onPointerDown(event));
    this.root.addEventListener('pointermove', event => {
      this.selectionInput.pointerMove(event);
      this.pointers.move(event.pointerId, { x: event.clientX, y: event.clientY });
    });
    this.root.addEventListener('pointerup', event => { this.pointers.up(event.pointerId); this.setPressed(event, false); });
    this.root.addEventListener('pointercancel', event => {
      this.selectionInput.pointerCancel(event); this.pointers.cancel(event.pointerId); this.setPressed(event, false);
    });
    this.root.addEventListener('lostpointercapture', event => { this.pointers.cancel(event.pointerId); this.setPressed(event, false); });
    window.addEventListener('resize', () => {
      this.preview?.resize(); this.scene?.resize(); this.centerJoystick();
      if (this.run) this.updateProgressionUi(this.run);
      if (this.isPortrait() && ['preparing', 'countdown', 'running'].includes(this.phase)) this.pause('rotate');
      else if (this.phase === 'paused') this.updatePauseOverlay();
    });
    window.addEventListener('blur', () => {
      this.selectionInput.clear();
      if (['preparing', 'countdown', 'running'].includes(this.phase)) this.pause('interrupted');
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && ['preparing', 'countdown', 'running'].includes(this.phase)) this.pause('interrupted');
    });
    requestAnimationFrame(now => this.frame(now));
  }

  private get phase() { return this.session.snapshot().phase; }
  private get run(): RunState | null { return this.session.snapshot().run; }
  private isPortrait(): boolean { return window.innerHeight > window.innerWidth; }
  private canResume(): boolean { return !document.hidden && document.hasFocus() && !this.isPortrait(); }

  setPwaStatus(status: PwaStatus): void {
    this.pwaStatus = status;
    if (this.phase !== 'selecting' && this.phase !== 'victory' && this.phase !== 'defeat') return;
    const text = pwaStatusText(status);
    this.root.querySelectorAll<HTMLElement>('.pwa-status').forEach(element => { element.textContent = text; });
  }

  private onClick(event: Event): void {
    if (this.phase === 'selecting' && this.selectionInput.click(event as MouseEvent)) return;
    const command = (event.target as HTMLElement).closest<HTMLElement>('[data-command]')?.dataset.command;
    if (command === 'settings' && (this.phase === 'selecting' || this.phase === 'paused')) this.openSettings((event.target as HTMLElement).closest<HTMLElement>('[data-command="settings"]')!);
    else if (command === 'settings-close') this.root.querySelector<HTMLDialogElement>('.settings-dialog')?.close();
    else if (command === 'selection-back' && this.phase === 'selecting') this.backSelection();
    else if (command === 'preview-retry' && this.phase === 'selecting') void this.loadSelectionPreview();
    else if (command === 'pause' && this.phase === 'running') this.pause();
    else if (command === 'resume' && this.phase === 'paused') { this.audio.unlock(); this.resume(); }
    else if (command === 'retry' && ['victory', 'defeat', 'error'].includes(this.phase)) { this.audio.unlock(); this.applyEffects(this.session.retry()); }
    else if (command === 'title' && ['victory', 'defeat', 'error'].includes(this.phase)) this.returnToTitle();
  }

  private onPointerDown(event: PointerEvent): void {
    if (this.phase === 'selecting') { this.selectionInput.pointerDown(event); return; }
    if (this.phase !== 'running') return;
    const element = (event.target as HTMLElement).closest<HTMLElement>('[data-region]');
    const region = (element?.dataset.region ?? 'none') as PointerRegion;
    if (region === 'none' || region === 'hud') return;
    event.preventDefault();
    element?.setPointerCapture(event.pointerId);
    this.pointers.down(event.pointerId, { x: event.clientX, y: event.clientY }, region);
    this.setPressed(event, true);
  }

  private setPressed(event: PointerEvent, pressed: boolean): void {
    (event.target as HTMLElement).closest<HTMLElement>('.actions button')?.classList.toggle('pressed', pressed);
  }

  private openSettings(origin: HTMLElement): void {
    if (this.root.querySelector('.settings-dialog')) return;
    this.root.insertAdjacentHTML('beforeend', settingsMarkup(this.settings));
    const dialog = this.root.querySelector<HTMLDialogElement>('.settings-dialog')!;
    dialog.addEventListener('close', () => { dialog.remove(); origin.focus(); }, { once: true });
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[data-setting]')?.focus();
  }

  private onSettingInput(event: Event): void {
    const field = (event.target as HTMLElement).closest<HTMLInputElement>('[data-setting]');
    if (!field) return;
    const key = field.dataset.setting;
    if (key === 'musicVolume' || key === 'effectsVolume') this.settings = this.settingsStore.write({ [key]: Number(field.value) });
    else if (key === 'screenShake') this.settings = this.settingsStore.write({ screenShake: field.checked });
    this.audio.setSettings(this.settings);
  }

  private applyEffects(effects: readonly SessionEffect[]): void {
    for (const effect of effects) {
      if (effect.type === 'clearInputs') this.clearInputs();
      else if (effect.type === 'disposeViews') {
        this.preview?.dispose(); this.preview = null;
        this.scene?.dispose(); this.scene = null;
      } else if (effect.type === 'prepare') void this.prepare(effect.duo, effect.generation);
      else if (effect.type === 'launch') this.launch(effect.run);
    }
  }

  private clearInputs(): void {
    this.selectionInput.clear();
    this.pointers.clear();
    this.root.querySelectorAll('.actions .pressed').forEach(button => button.classList.remove('pressed'));
    if (this.run) clearPlayerPendingAction(this.run);
    this.loop.reset();
  }

  private async prepare(duo: Readonly<DuoAssignment>, generation: number): Promise<void> {
    this.clock.reset();
    this.events = [];
    this.hudMarkup = '';
    this.lastCueKey = '';
    this.feedbackUntilTick = 0;
    this.testMoves.length = 0;
    this.root.innerHTML = preparingMarkup(duo, 'Loading character models…');
    let candidate: GameScene | null = null;
    try {
      const selected = [duo.fighterId, duo.partnerId].map(id => this.roster.find(character => character.id === id)!);
      validateCharacterResources(selected.map(character => character.definition));
      await Promise.all(selected.map(character => this.characterAssets.loadCharacter(character)));
      if (generation !== this.session.snapshot().generation || !['preparing', 'paused'].includes(this.phase)) return;
      this.root.querySelector('[role="status"]')!.textContent = 'Building the level…';
      const run = createRun(this.nextRunId++, duo);
      this.root.innerHTML = `<div class="game"><div class="scene-host"></div><div class="hud-host"></div><div class="prompt" aria-live="polite"></div><div class="progression-layer"></div><div class="joystick" data-region="movement" aria-label="Move"><div class="knob"></div></div><div class="actions"><button class="light" data-region="attack" aria-label="Light">Light</button><button class="heavy" data-region="heavy" aria-label="Heavy">Heavy</button><button class="dodge" data-region="dodge" aria-label="Dodge">Dodge</button><button class="special" data-region="special" aria-label="Special">Special</button></div><div class="overlay" hidden></div></div>`;
      candidate = new GameScene(this.root.querySelector<HTMLElement>('.scene-host')!, this.characterAssets);
      candidate.render(run, [], performance.now());
      if (generation !== this.session.snapshot().generation || !['preparing', 'paused'].includes(this.phase)) { candidate.dispose(); return; }
      this.scene = candidate;
      this.centerJoystick();
      this.session.prepared(generation, run);
      if (this.isPortrait() && this.phase === 'countdown') this.pause('rotate');
      if (this.phase === 'paused') this.updatePauseOverlay();
      else this.renderCountdown();
    } catch {
      candidate?.dispose();
      if (generation !== this.session.snapshot().generation) return;
      this.scene = null;
      this.session.preparationFailed(generation, 'Required characters or WebGL could not load.');
      this.root.innerHTML = preparationErrorMarkup(duo, 'Required characters or WebGL could not load. Check your connection and try again.');
    }
  }

  private renderCountdown(): void {
    const count = this.session.snapshot().countdown;
    const overlay = this.root.querySelector<HTMLElement>('.overlay');
    if (!count || !overlay) return;
    overlay.hidden = false;
    if (count.number && this.session.snapshot().duo) overlay.innerHTML = countdownMarkup(this.session.snapshot().duo!, count.number);
  }

  private launch(run: RunState): void {
    this.clearInputs();
    this.clock.reset();
    this.loop.reset();
    this.events = [];
    this.clock.start();
    this.audio.startRun();
    const overlay = this.root.querySelector<HTMLElement>('.overlay');
    if (overlay) overlay.hidden = true;
    this.centerJoystick();
    this.updateUi();
    if (this.isPortrait()) this.pause('rotate');
    if (run.tick !== 0) throw new Error('Run advanced before launch');
  }

  private pause(reason: 'manual' | 'rotate' | 'interrupted' = 'manual'): void {
    if (!['preparing', 'countdown', 'running'].includes(this.phase)) return;
    this.pauseReason = reason;
    this.applyEffects(this.session.interrupt());
    this.clock.pause();
    this.audio.pause();
    this.updatePauseOverlay();
  }

  private updatePauseOverlay(): void {
    if (this.phase !== 'paused') return;
    const overlay = this.root.querySelector<HTMLElement>('.overlay');
    if (!overlay) return;
    overlay.hidden = false;
    overlay.innerHTML = this.isPortrait()
      ? `<div class="pause-menu"><h2>Rotate device</h2><p>Turn your device to landscape to continue.</p></div>`
      : `<div class="pause-menu"><h2>${this.pauseReason === 'manual' ? 'Paused' : 'Ready to resume'}</h2><button data-command="resume">Resume</button><button data-command="settings">Settings</button></div>`;
  }

  private resume(): void {
    this.applyEffects(this.session.resume(this.canResume()));
    if (this.phase === 'paused') return;
    if (this.phase === 'running') {
      this.clock.start();
      this.audio.startRun();
      const overlay = this.root.querySelector<HTMLElement>('.overlay');
      if (overlay) overlay.hidden = true;
    } else if (this.phase === 'countdown') this.renderCountdown();
  }

  private step(): void {
    const run = this.run;
    if (this.phase !== 'running' || !run) return;
    const input = toInputFrame(this.pointers.frame());
    this.events = stepRun(run, input, undefined, this.scene?.arenaContext(run));
    if (import.meta.env.VITE_TEST_MODE === '1' && this.events.some(event =>
      event.actorId === getPlayer(run).id && (event.type === 'attack' || event.type === 'heavy' || event.type === 'special'))) {
      const move = getPlayer(run).action.moveId;
      if (move) this.testMoves.push(move);
    }
    for (const event of this.events) {
      if (event.type === 'attack' || event.type === 'heavy' || event.type === 'special') this.audio.effect('attack');
      else if (event.type === 'hit' || event.type === 'partner-hit') this.audio.effect('hit');
      else if (event.type === 'pickup') this.audio.effect('pickup');
    }
    if (this.events.some(event => event.type === 'unavailable')) this.feedbackUntilTick = run.tick + 50;
    this.tutorial.accept(this.events, input.move.x !== 0 || input.move.depth !== 0);
    this.updateUi();
    if (run.result) this.finish(run.result);
  }

  private finish(result: 'victory' | 'defeat'): void {
    this.session.finish();
    if (this.phase !== 'victory' && this.phase !== 'defeat') return;
    this.clock.pause();
    this.audio.effect('result');
    this.audio.pause();
    const cueLayer = this.root.querySelector<HTMLElement>('.progression-layer');
    if (cueLayer) cueLayer.innerHTML = '';
    this.lastCueKey = '';
    this.clearInputs();
    const elapsed = this.clock.elapsedMs();
    if (result === 'victory') this.bestResult.record(elapsed);
    const overlay = this.root.querySelector<HTMLElement>('.overlay');
    if (overlay) { overlay.hidden = false; overlay.innerHTML = resultMarkup(this.phase, elapsed, this.bestResult.best(), pwaStatusText(this.pwaStatus)); }
  }

  private returnToTitle(): void {
    this.applyEffects(this.session.home());
    this.clock.reset();
    this.audio.pause();
    this.previewStatus = 'empty';
    this.renderSelection();
  }

  private updateUi(): void {
    const run = this.run;
    if (!run || this.phase !== 'running') return;
    const next = combatHudMarkup(run, run.tick < this.feedbackUntilTick ? 'Action not ready' : '').replace('data-action="pause"', 'data-command="pause" data-region="hud"');
    if (next !== this.hudMarkup) {
      this.hudMarkup = next;
      const host = this.root.querySelector<HTMLElement>('.hud-host');
      if (host) host.innerHTML = next;
    }
    this.updateProgressionUi(run);
    const prompt = this.root.querySelector<HTMLElement>('.prompt');
    if (prompt) {
      const label = { movement: 'Move to fight', attack: 'Tap Light', heavy: 'Tap Heavy', dodge: 'Dodge attacks', special: 'Use your Special' };
      const id = this.tutorial.suggest(run);
      prompt.textContent = id ? label[id] : '';
    }
    const joystick = this.root.querySelector<HTMLElement>('.joystick .knob');
    const position = this.pointers.joystick();
    if (joystick && position) { joystick.style.left = `${56 + position.knob.x - position.anchor.x}px`; joystick.style.top = `${56 + position.knob.y - position.anchor.y}px`; }
    const player = getPlayer(run);
    const dodge = this.root.querySelector<HTMLElement>('.actions .dodge');
    const special = this.root.querySelector<HTMLElement>('.actions .special');
    if (dodge) dodge.textContent = `Dodge ${player.dodgeReadyTick > run.tick ? `${((player.dodgeReadyTick - run.tick) / 60).toFixed(1)}s` : 'Ready'}`;
    if (special) special.textContent = `Special ${player.specialMeter >= 100 ? 'Ready' : `${player.specialMeter}%`}`;
  }

  private updateProgressionUi(run: RunState): void {
    const layer = this.root.querySelector<HTMLElement>('.progression-layer');
    const game = this.root.querySelector<HTMLElement>('.game');
    if (!layer || !game) return;
    const cue = deriveProgressionCue(run, this.phase);
    const key = cue.visible ? `${cue.areaId}:${cue.nextAreaId}` : '';
    if (!cue.visible) {
      if (this.lastCueKey) layer.innerHTML = '';
      this.lastCueKey = '';
      return;
    }
    const gameBounds = game.getBoundingClientRect();
    const measured = ['.hud-host', '.actions', '.joystick', '.prompt'].map(selector => game.querySelector<HTMLElement>(selector))
      .filter((element): element is HTMLElement => !!element)
      .map(element => {
        const bounds = element.getBoundingClientRect();
        return { x: bounds.left - gameBounds.left, y: bounds.top - gameBounds.top,
          width: bounds.width, height: bounds.height } satisfies UiRect;
      });
    const hud = game.querySelector<HTMLElement>('.hud-host');
    const safeStyle = hud ? getComputedStyle(hud) : null;
    const inset = (value: string | undefined) => Math.max(12, Number.parseFloat(value ?? '') || 0);
    const placement = placeProgressionCue(cue, { width: gameBounds.width, height: gameBounds.height,
      safe: { top: inset(safeStyle?.top), right: inset(safeStyle?.right),
        bottom: 12, left: inset(safeStyle?.left) } }, measured);
    if (!placement) return;
    if (key !== this.lastCueKey) {
      layer.innerHTML = progressionMarkup(cue, placement);
      this.lastCueKey = key;
    } else {
      const element = layer.querySelector<HTMLElement>('.progression-cue');
      if (element) { element.style.left = `${placement.x}px`; element.style.top = `${placement.y}px`; }
    }
  }

  private centerJoystick(): void {
    const ring = this.root.querySelector<HTMLElement>('.joystick');
    if (!ring) return;
    const box = ring.getBoundingClientRect();
    this.pointers.clear();
    this.pointers.setCenter({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
    if (this.run) clearPlayerPendingAction(this.run);
    this.updateUi();
  }

  private frame(now: number): void {
    if (this.phase === 'selecting' && !document.hidden && document.hasFocus() && !this.isPortrait() && !this.root.querySelector('.settings-dialog[open]')) {
      this.preview?.render(now, window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    if (this.phase === 'countdown') {
      const previous = this.session.snapshot().countdown?.number;
      this.applyEffects(this.session.frame());
      if (this.phase === 'countdown' && this.session.snapshot().countdown?.number !== previous) this.renderCountdown();
    }
    this.loop.frame(now, this.phase === 'running');
    if (this.scene && this.run) this.scene.render(this.run, this.events.splice(0), now,
      this.settings.screenShake && !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      this.phase === 'running');
    if (this.diagnostics) {
      const stats = this.scene?.drawStats() ?? this.preview?.drawStats() ?? { draws: 0, triangles: 0 };
      this.diagnostics.sample({ now, phase: this.phase, encounter: this.run?.encounter.areaId ?? null,
        hidden: document.hidden, draws: stats.draws, triangles: stats.triangles });
    }
    requestAnimationFrame(time => this.frame(time));
  }

  private renderSelection(focus = false): void {
    const previousHost = this.root.querySelector<HTMLElement>('.preview-canvas-host');
    const selection = this.session.snapshot().selection;
    this.root.innerHTML = selectionMarkup(selection, this.roster, this.previewStatus, this.selectionModality);
    this.root.querySelector<HTMLElement>('.pwa-status')!.textContent = pwaStatusText(this.pwaStatus);
    if (previousHost && this.preview) this.root.querySelector('.preview-canvas-host')?.replaceWith(previousHost);
    if (focus) this.root.querySelector<HTMLElement>(`[data-character="${selection.focusedId}"]`)?.focus();
  }

  private focusSelection(id: string): void {
    if (this.phase !== 'selecting') return;
    this.session.select({ type: 'focus', id });
    this.root.querySelectorAll<HTMLElement>('[data-character]').forEach(button => { button.tabIndex = button.dataset.character === id ? 0 : -1; });
  }

  private activateSelection(id: string, modality: ActivationModality): void {
    if (this.phase !== 'selecting') return;
    this.audio.unlock();
    this.selectionModality = modality;
    const before = this.session.snapshot().selection;
    const ready = this.previewStatus === 'ready' && this.preview?.currentId === id;
    const effects = this.session.select({ type: 'activate', id, ready });
    if (effects.length) { this.applyEffects(effects); return; }
    const after = this.session.snapshot().selection;
    if (before.step !== after.step) {
      this.preview?.dispose(); this.preview = null;
      this.previewStatus = 'empty';
      this.selectionInput.clear();
      this.renderSelection(true);
    } else if (before.previewedId !== after.previewedId) {
      this.previewStatus = 'loading';
      this.renderSelection(modality === 'keyboard');
      void this.loadSelectionPreview();
    } else this.renderSelection(modality === 'keyboard');
  }

  private async loadSelectionPreview(): Promise<void> {
    const selectedId = this.session.snapshot().selection.previewedId;
    const character = this.roster.find(entry => entry.id === selectedId);
    if (!character || this.phase !== 'selecting') return;
    const host = this.root.querySelector<HTMLElement>('.preview-canvas-host');
    if (!host) return;
    this.preview ??= new CharacterPreview(host, this.characterAssets);
    this.previewStatus = 'loading';
    this.renderSelection(this.selectionModality === 'keyboard');
    try {
      const applied = await this.preview.show(character);
      if (!applied || this.phase !== 'selecting' || this.session.snapshot().selection.previewedId !== character.id) return;
      this.previewStatus = 'ready';
    } catch {
      if (this.phase !== 'selecting' || this.session.snapshot().selection.previewedId !== character.id) return;
      this.previewStatus = 'error';
    }
    this.renderSelection(this.selectionModality === 'keyboard');
  }

  private backSelection(): void {
    const before = this.session.snapshot().selection;
    this.session.select({ type: 'back' });
    if (before === this.session.snapshot().selection) return;
    this.preview?.dispose(); this.preview = null;
    this.previewStatus = 'loading';
    this.selectionInput.clear();
    this.renderSelection(true);
    void this.loadSelectionPreview();
  }
}
