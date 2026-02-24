import { loadPage } from './pages.js';
import { initPortfolio } from './portfolio.js';

const routes = new Map([
    ['home', '/pages/home.html'],
    ['about', '/pages/about.html'],
    ['portfolio', '/pages/portfolio.html'],
    ['work-process', '/pages/work-process.html'],
    ['services', '/pages/services.html'],
    ['contact', '/pages/contact.html'],
]);

function getRouteKey() {
    const hash = location.hash || '#/home';
    const key = hash.replace('#/', '').split('?')[0].trim();
    return routes.has(key) ? key : 'home';
}

function setActiveLink(key) {
    document.querySelectorAll('[data-route]').forEach(a => {
        const active = a.dataset.route === key;
        a.classList.toggle('is-active', active);
        if (active) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
    });
}

async function render() {
    const outlet = document.querySelector('[data-outlet]');
    if (!outlet) return;
    const key = getRouteKey();
    setActiveLink(key);
    outlet.innerHTML = await loadPage(routes.get(key));

    if (key === 'portfolio') {
        initPortfolio();
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
}

export function initRouter() {
    window.addEventListener('hashchange', render);
    if (!location.hash) location.hash = '#/home';
    render();
}