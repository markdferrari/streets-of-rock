import './ui/styles.css';
import { GameApp } from './app/game-app';

const app = document.querySelector<HTMLElement>('#app');
if (app) new GameApp(app);
