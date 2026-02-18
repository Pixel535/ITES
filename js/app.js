import { initRouter } from './router.js';
import { initNav } from './nav.js';

initNav();
initRouter();

document.querySelector('[data-year]').textContent = String(new Date().getFullYear());
