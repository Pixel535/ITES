import { loadPage } from './pages.js';

const routes = new Map([
    ['home',  '/pages/home.html'],
    ['about', '/pages/about.html'],
    ['work',  '/pages/work.html'],
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
    const key = getRouteKey();

    setActiveLink(key);
    outlet.innerHTML = await loadPage(routes.get(key));

    window.scrollTo({ top: 0, behavior: 'instant' });
}

export function initRouter() {
    window.addEventListener('hashchange', render);
    if (!location.hash) location.hash = '#/home';
    render();
}
