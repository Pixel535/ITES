import { initRouter } from './router.js';
import { initNav } from './nav.js';
import { initHome } from './home.js';
import { loaderStart, loaderEnd } from './loader.js';

initNav();
initHome();
loaderStart({ delayMs: 150 });
initRouter();

document.querySelector('[data-year]').textContent = String(new Date().getFullYear());
document.addEventListener('route:rendered', () => loaderEnd(), { once: true });