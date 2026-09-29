import type { Settings } from '../platform/settings';

export function settingsMarkup(settings: Settings): string {
  return `<dialog class="settings-dialog" aria-labelledby="settings-title"><h2 id="settings-title">Settings</h2>
    <label>Music volume <input data-setting="musicVolume" type="range" min="0" max="1" step="0.1" value="${settings.musicVolume}"></label>
    <label>Effects volume <input data-setting="effectsVolume" type="range" min="0" max="1" step="0.1" value="${settings.effectsVolume}"></label>
    <label>Screen shake <input data-setting="screenShake" type="checkbox" ${settings.screenShake ? 'checked' : ''}></label>
    <button type="button" data-command="settings-close">Close settings</button></dialog>`;
}
