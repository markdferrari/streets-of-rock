export class SelectionInput {
  private held = new Set<string>();
  private pointer: { id: number; x: number; y: number; target: HTMLElement; canceled: boolean } | null = null;
  private suppressClick = false;
  constructor(private readonly root: HTMLElement, private readonly activate: (id: string, modality: 'pointer' | 'keyboard') => void,
    private readonly focus: (id: string) => void) {}

  pointerDown(event: PointerEvent): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-character]');
    if (target) { this.suppressClick = false; this.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, target, canceled: false }; }
  }
  pointerMove(event: PointerEvent): void {
    if (!this.pointer || this.pointer.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - this.pointer.x, event.clientY - this.pointer.y) > 8) this.pointer.canceled = true;
  }
  pointerCancel(event: PointerEvent): void {
    if (this.pointer?.id === event.pointerId) { this.pointer.canceled = true; this.suppressClick = true; }
  }
  click(event: MouseEvent): boolean {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-character]');
    if (!target || target.hasAttribute('disabled')) return false;
    if (event.detail === 0) return true; // Keyboard activation is handled at keydown.
    if (this.pointer && this.pointer.target === target && this.pointer.canceled || this.suppressClick) {
      this.pointer = null; this.suppressClick = false; return true;
    }
    this.pointer = null;
    this.activate(target.dataset.character!, 'pointer');
    return true;
  }
  keyDown(event: KeyboardEvent): boolean {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-character]');
    if (!target || target.hasAttribute('disabled')) return false;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!event.repeat && !this.held.has(event.key)) {
        this.held.add(event.key);
        this.activate(target.dataset.character!, 'keyboard');
      }
      return true;
    }
    const buttons = [...this.root.querySelectorAll<HTMLElement>('[data-character]:not([disabled])')];
    const current = buttons.indexOf(target);
    const columns = Math.max(1, Math.round(this.root.querySelector<HTMLElement>('.roster')?.clientWidth! / Math.max(1, target.clientWidth)));
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowDown' ? columns : event.key === 'ArrowUp' ? -columns : 0;
    if (!delta) return false;
    event.preventDefault();
    const next = buttons[Math.min(buttons.length - 1, Math.max(0, current + delta))];
    if (next) { next.focus(); next.scrollIntoView({ block: 'nearest', inline: 'nearest' }); this.focus(next.dataset.character!); }
    return true;
  }
  keyUp(event: KeyboardEvent): void { this.held.delete(event.key); }
  focusIn(event: FocusEvent): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-character]');
    if (target && !target.hasAttribute('disabled')) this.focus(target.dataset.character!);
  }
  clear(): void { this.held.clear(); this.pointer = null; this.suppressClick = false; }
}
