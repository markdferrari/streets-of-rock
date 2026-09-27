export function titleMarkup(): string {
  return `<main class="menu"><h1>Streets of Rock</h1><p>The Neon Velvet</p><button data-command="start">Start</button></main>`;
}
export function resultMarkup(result: 'victory' | 'defeat', elapsedMs: number, bestMs: number | null): string {
  const heading = result === 'victory' ? 'Victory' : 'Defeat';
  const seconds = Math.floor(elapsedMs / 1000);
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const best = bestMs === null ? '' : `<p>Best ${Math.floor(bestMs / 60000)}:${String(Math.floor(bestMs / 1000) % 60).padStart(2, '0')}</p>`;
  return `<div class="result-menu"><h2>${heading}</h2><p>Time ${time}</p>${best}<button data-command="retry">Retry</button><button data-command="title">Return to title</button></div>`;
}
