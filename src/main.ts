import './ui/styles.css';
import { GameApp } from './app/game-app';
import { registerPwa } from './platform/pwa';
import type { CharacterDefinition } from './content/characters';

const app = document.querySelector<HTMLElement>('#app');
if (app) {
  const start = (roster?: readonly CharacterDefinition[]) => {
    const game = new GameApp(app, roster);
    void registerPwa(status => game.setPwaStatus(status));
  };
  if (import.meta.env.VITE_TEST_MODE === '1' && new URLSearchParams(location.search).get('roster') === '12') {
    void import('../tests/fixtures/roster').then(module => start(module.twelveCharacterRoster));
  } else start();
}
