import { describe, expect, it } from 'vitest';
import { characters } from '../../../src/content/characters';
import { initialSelection, reduceSelection } from '../../../src/app/selection';

describe('fighter selection', () => {
  it('starts with focus available but no preview or confirmed fighter', () => {
    expect(initialSelection(characters)).toEqual({ step: 'fighter', focusedId: 'cow', previewedId: null, fighterId: null, locked: false });
  });

  it('keeps focus separate from preview and changes previews without confirmation', () => {
    const start = initialSelection(characters);
    const focused = reduceSelection(start, { type: 'focus', id: 'crow' }, characters).state;
    expect(focused).toMatchObject({ focusedId: 'crow', previewedId: null });
    const preview = reduceSelection(focused, { type: 'activate', id: 'crow', ready: true }, characters).state;
    expect(preview).toMatchObject({ step: 'fighter', previewedId: 'crow', fighterId: null });
    const switched = reduceSelection(preview, { type: 'activate', id: 'cow', ready: true }, characters).state;
    expect(switched).toMatchObject({ step: 'fighter', previewedId: 'cow', fighterId: null });
  });

  it('requires a fresh activation of a ready preview before one partner transition', () => {
    const start = initialSelection(characters);
    const preview = reduceSelection(start, { type: 'activate', id: 'cow', ready: false }, characters).state;
    expect(reduceSelection(preview, { type: 'activate', id: 'cow', ready: false }, characters).state.step).toBe('fighter');
    const confirmed = reduceSelection(preview, { type: 'activate', id: 'cow', ready: true }, characters);
    expect(confirmed.state).toMatchObject({ step: 'partner', fighterId: 'cow', previewedId: null, focusedId: 'crow' });
    expect(confirmed.transition).toBe('partner');
    expect(reduceSelection(confirmed.state, { type: 'activate', id: 'cow', ready: true }, characters).transition).toBeUndefined();
  });
});

describe('partner selection', () => {
  const chooseFighter = (id: 'cow' | 'crow') => {
    const preview = reduceSelection(initialSelection(characters), { type: 'activate', id, ready: true }, characters).state;
    return reduceSelection(preview, { type: 'activate', id, ready: true }, characters).state;
  };

  it('never previews or confirms the only eligible partner automatically', () => {
    const state = chooseFighter('cow');
    expect(state).toMatchObject({ step: 'partner', fighterId: 'cow', previewedId: null, focusedId: 'crow' });
    expect(reduceSelection(state, { type: 'activate', id: 'cow', ready: true }, characters).state).toBe(state);
    const preview = reduceSelection(state, { type: 'activate', id: 'crow', ready: true }, characters).state;
    expect(preview).toMatchObject({ previewedId: 'crow', locked: false });
    expect(reduceSelection(preview, { type: 'activate', id: 'crow', ready: false }, characters).duo).toBeUndefined();
    const confirmed = reduceSelection(preview, { type: 'activate', id: 'crow', ready: true }, characters);
    expect(confirmed.duo).toEqual({ fighterId: 'cow', partnerId: 'crow' });
    expect(confirmed.state.locked).toBe(true);
    expect(reduceSelection(confirmed.state, { type: 'activate', id: 'crow', ready: true }, characters).duo).toBeUndefined();
  });

  it('supports reverse roles, Back and reconfirmation', () => {
    const state = chooseFighter('crow');
    const preview = reduceSelection(state, { type: 'activate', id: 'cow', ready: true }, characters).state;
    const back = reduceSelection(preview, { type: 'back' }, characters).state;
    expect(back).toMatchObject({ step: 'fighter', fighterId: null, previewedId: 'crow', focusedId: 'crow' });
    expect(reduceSelection(back, { type: 'activate', id: 'crow', ready: false }, characters).state.step).toBe('fighter');
    expect(reduceSelection(back, { type: 'activate', id: 'crow', ready: true }, characters).state.step).toBe('partner');
  });

  it('blocks confirmation when the roster becomes invalid', () => {
    const state = chooseFighter('cow');
    expect(() => reduceSelection(state, { type: 'activate', id: 'crow', ready: true }, [characters[0]!])).toThrow('Two characters');
  });
});
