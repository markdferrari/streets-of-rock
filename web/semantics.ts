import type { UiDescriptor } from './browser';

const tags: Record<UiDescriptor['role'], string> = { button: 'button', slider: 'input', checkbox: 'button', heading: 'h2', meter: 'meter', dialog: 'div' };
export function validateSemanticDescriptor(value: UiDescriptor): boolean {
  const b = value.bounds;
  if (!value.id || !value.name || !Number.isFinite(b.x) || !Number.isFinite(b.y) || !Number.isFinite(b.width) || !Number.isFinite(b.height) || b.width < 0 || b.height < 0) return false;
  if (value.role === 'slider' && (!Number.isFinite(value.value) || !Number.isFinite(value.min) || !Number.isFinite(value.max) || value.min! > value.value! || value.value! > value.max!)) return false;
  if (value.role === 'meter' && (!Number.isFinite(value.value) || !Number.isFinite(value.min) || !Number.isFinite(value.max))) return false;
  return true;
}

export class SemanticProjection {
  private elements = new Map<string, HTMLElement>();
  private modal = false;
  private dialogId: string | undefined;
  private returnFocus = new Map<string,string|undefined>();
  constructor(private readonly layer: HTMLElement, private readonly dispatch: (id: string, kind: string, value?: unknown) => void) {}
  render(generation: number, descriptors: UiDescriptor[]): void {
    const previousDialog=this.dialogId;
    this.dialogId=descriptors.find(d=>d.role==='dialog')?.id;
    this.modal=!!this.dialogId;
    const changedDialog=previousDialog!==this.dialogId;
    const returning=previousDialog ? this.returnFocus.get(previousDialog) : undefined;
    const returningToParent=!!returning && descriptors.some(d=>d.id===returning);
    if(changedDialog&&this.dialogId&&!returningToParent)this.returnFocus.set(this.dialogId,(document.activeElement as HTMLElement)?.dataset.controlId);
    const current = new Set(descriptors.map(d => d.id));
    for (const [id, element] of this.elements) if (!current.has(id)) { element.remove(); this.elements.delete(id); }
    let dialogElement: HTMLElement | null = null;
    for (const descriptor of descriptors) {
      let element = this.elements.get(descriptor.id);
      const tag = tags[descriptor.role];
      if (element && element.tagName.toLowerCase() !== tag) { element.remove(); this.elements.delete(descriptor.id); element = undefined; }
      if (!element) {
        element = document.createElement(tag);
        element.dataset.controlId = descriptor.id;
        element.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        if (descriptor.role === 'slider') {
          (element as HTMLInputElement).type = 'range'; (element as HTMLInputElement).step = 'any';
          element.addEventListener('input', () => this.dispatch(descriptor.id, 'value', Number((element as HTMLInputElement).value)));
        } else if (descriptor.role === 'checkbox') {
          element.addEventListener('click', () => this.dispatch(descriptor.id, 'value', (element as HTMLButtonElement).getAttribute('aria-checked') !== 'true'));
        } else if (descriptor.role === 'button') element.addEventListener('click', () => this.dispatch(descriptor.id, 'activate'));
        element.addEventListener('focus', () => this.dispatch(descriptor.id, 'focus'));
        element.addEventListener('keydown', event => {
          if (descriptor.role === 'button' && ['Enter', ' '].includes(event.key)) { event.preventDefault(); event.stopImmediatePropagation(); if (!event.repeat) this.dispatch(descriptor.id, 'activate'); }
          if (descriptor.id.startsWith('character-') && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
            const roster = [...this.elements.values()].filter(item => item.dataset.controlId?.startsWith('character-')).sort((a,b) => Number(a.dataset.focusOrder)-Number(b.dataset.focusOrder));
            const index = roster.indexOf(element!); const step = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
            if (roster.length) { event.preventDefault(); roster[(index + step + roster.length) % roster.length]!.focus(); }
          }
          if (this.modal && event.key === 'Tab') this.trapTab(event);
        });
        this.elements.set(descriptor.id, element);
      }
      if (descriptor.role === 'dialog') dialogElement = element;
      const parent = descriptor.role === 'dialog' ? this.layer : this.modal ? dialogElement : this.layer;
      if (parent && element.parentElement !== parent) parent.append(element);
      element.dataset.generation = String(generation);
      if(descriptor.role!=='dialog'&&descriptor.role!=='slider'&&element.textContent!==(descriptor.text??descriptor.name))element.textContent = descriptor.text ?? descriptor.name;
      element.setAttribute('aria-label', descriptor.name);
      if (descriptor.role === 'button' || descriptor.role === 'checkbox') {
        (element as HTMLButtonElement).disabled = !!descriptor.disabled;
        if (descriptor.role === 'checkbox') element.setAttribute('aria-checked', String(!!descriptor.pressed));
        else element.setAttribute('aria-pressed', String(!!descriptor.pressed));
      }
      if (descriptor.role === 'slider') {
        const input = element as HTMLInputElement;
        input.disabled = !!descriptor.disabled; input.min = String(descriptor.min); input.max = String(descriptor.max); input.value = String(descriptor.value);
        element.setAttribute('aria-valuenow', input.value); element.setAttribute('aria-valuemin', input.min); element.setAttribute('aria-valuemax', input.max);
      }
      if (descriptor.role === 'meter') { const meter = element as HTMLMeterElement; meter.min = descriptor.min!; meter.max = descriptor.max!; meter.value = descriptor.value!; }
      if (descriptor.role === 'dialog') { element.setAttribute('role', 'dialog'); element.setAttribute('aria-modal', 'true'); }
      if (descriptor.liveRegion) element.setAttribute('aria-live', descriptor.liveRegion);
      element.dataset.focusOrder = String(descriptor.focusOrder ?? 0);
      element.tabIndex = ['heading', 'dialog', 'meter'].includes(descriptor.role) || descriptor.id.startsWith('character-') && !descriptor.focused ? -1 : descriptor.focusOrder ?? 0;
      element.hidden = descriptor.visible === false;
      const b = descriptor.bounds; Object.assign(element.style, { left: `${b.x}px`, top: `${b.y}px`, width: `${b.width}px`, height: `${b.height}px` });
    }
    this.layer.setAttribute('aria-label', this.modal ? `${descriptors.find(d=>d.role==='dialog')!.name} dialog` : 'Game controls');
    this.layer.setAttribute('role', 'group');
    if(changedDialog){
      if(returningToParent)this.elements.get(returning!)?.focus();
      else if(this.modal)this.focusable()[0]?.focus();
      if(previousDialog&&(returningToParent||!this.dialogId))this.returnFocus.delete(previousDialog);
    }
  }
  private focusable():HTMLElement[] {
    return [...this.elements.values()].filter(el=>!el.hidden&&!('disabled' in el&&(el as HTMLButtonElement).disabled)&&el.tabIndex>=0).sort((a,b)=>Number(a.dataset.focusOrder)-Number(b.dataset.focusOrder));
  }
  private trapTab(event: KeyboardEvent): void {
    const focusable = this.focusable();
    if (!focusable.length) { event.preventDefault(); return; }
    const active = focusable.indexOf(document.activeElement as HTMLElement);
    if (event.shiftKey && active <= 0) { event.preventDefault(); focusable.at(-1)!.focus(); }
    else if (!event.shiftKey && (active < 0 || active === focusable.length - 1)) { event.preventDefault(); focusable[0]!.focus(); }
  }
}
