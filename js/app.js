import { initRouter } from './router.js';
import { initNav } from './nav.js';
import { initHome } from './home.js';

initNav();
initHome();
initRouter();

document.querySelector('[data-year]').textContent = String(new Date().getFullYear());