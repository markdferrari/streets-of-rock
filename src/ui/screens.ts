export function titleMarkup(): string {
  return `<main class="menu"><h1>Streets of Rock</h1><p>Bondi Beach</p><button data-command="start">Start</button></main>`;
}
export function resultMarkup(result: 'victory' | 'defeat', elapsedMs: number, bestMs: number | null, pwaStatus = ''): string {
  const heading = result === 'victory' ? 'Victory' : 'Defeat';
  const seconds = Math.floor(elapsedMs / 1000);
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const best = bestMs === null ? '' : `<p>Best ${Math.floor(bestMs / 60000)}:${String(Math.floor(bestMs / 1000) % 60).padStart(2, '0')}</p>`;
  return `<div class="result-menu"><h2>${heading}</h2><p>Time ${time}</p>${best}<p class="pwa-status" aria-live="polite">${pwaStatus}</p><button data-command="retry">Retry</button><button data-command="title">Return to title</button></div>`;
}
import type { DuoAssignment } from '../game/duo';
import { portraits } from './selection';

function portrait(id: string): string {
  if (id !== 'cow' && id !== 'crow') throw new Error(`Unknown portrait: ${id}`);
  return portraits[id];
}

export function lockedDuoMarkup(duo: Readonly<DuoAssignment>): string {
  return `<div class="locked-duo" aria-label="Chosen duo"><figure><img src="${portrait(duo.fighterId)}" alt="${duo.fighterId === 'cow' ? 'Cow' : 'Crow'} portrait"><figcaption>Your Chieftain: ${duo.fighterId === 'cow' ? 'Cow' : 'Crow'}</figcaption></figure><figure><img src="${portrait(duo.partnerId)}" alt="${duo.partnerId === 'cow' ? 'Cow' : 'Crow'} portrait"><figcaption>AI Partner: ${duo.partnerId === 'cow' ? 'Cow' : 'Crow'}</figcaption></figure></div>`;
}

export function preparingMarkup(duo: Readonly<DuoAssignment>, stage: string): string {
  return `<main class="menu preparation"><h1>Preparing your duo</h1>${lockedDuoMarkup(duo)}<p role="status">${stage}</p><div class="overlay" hidden></div></main>`;
}

export function preparationErrorMarkup(duo: Readonly<DuoAssignment>, message: string): string {
  return `<main class="menu preparation"><h1>Unable to prepare your duo</h1>${lockedDuoMarkup(duo)}<p role="alert">${message}</p><button data-command="retry">Retry</button><button data-command="title">Return to homepage</button></main>`;
}

export function countdownMarkup(duo: Readonly<DuoAssignment>, number: 3 | 2 | 1): string {
  return `<div class="countdown-menu">${lockedDuoMarkup(duo)}<strong class="countdown-number" role="status" aria-live="assertive" aria-atomic="true">${number}</strong></div>`;
}
