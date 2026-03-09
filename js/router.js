import { loadPage } from './pages.js';
import { initPortfolio } from './portfolio.js';
import { loaderStart, loaderEnd } from './loader.js';

const routes = new Map([
    ['home', '/pages/home.html'],
    ['about', '/pages/about.html'],
    ['portfolio', '/pages/portfolio.html'],
    ['work-process', '/pages/work-process.html'],
    ['services', '/pages/services.html'],
    ['contact', '/pages/contact.html'],
]);

const pathToRouteKey = new Map([
    ['/', 'home'],
    ['/home', 'home'],
    ['/about', 'about'],
    ['/portfolio', 'portfolio'],
    ['/work-process', 'work-process'],
    ['/services', 'services'],
    ['/contact', 'contact'],
]);

function normalizePath(pathname) {
    if (!pathname) return '/';
    const cleanPath = pathname.replace(/\/+$/, '');
    return cleanPath === '' ? '/' : cleanPath;
}

function getRouteKeyFromPath(pathname = location.pathname) {
    const normalizedPath = normalizePath(pathname);
    return pathToRouteKey.get(normalizedPath) || 'home';
}

function getPathByRouteKey(key) {
    for (const [path, routeKey] of pathToRouteKey.entries()) {
        if (routeKey === key) return path;
    }
    return '/home';
}

function setActiveLink(key) {
    document.querySelectorAll('[data-route]').forEach((link) => {
        const isActive = link.dataset.route === key;
        link.classList.toggle('is-active', isActive);

        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

async function render() {
    const outlet = document.querySelector('[data-outlet]');
    if (!outlet) return;

    const key = getRouteKeyFromPath();
    const pagePath = routes.get(key) || routes.get('home');

    setActiveLink(key);
    loaderStart({ delayMs: 150 });

    try {
        outlet.innerHTML = await loadPage(pagePath);

        if (key === 'portfolio') {
            await initPortfolio();
        }

        document.dispatchEvent(new CustomEvent('route:change', { detail: { key } }));
        document.dispatchEvent(new CustomEvent('route:rendered', { detail: { key } }));

        window.scrollTo({ top: 0, behavior: 'auto' });
    } finally {
        loaderEnd();
    }
}

function handleLinkClick(event) {
    const link = event.target.closest('a[data-route]');
    if (!link) return;

    const url = new URL(link.href, window.location.origin);

    if (url.origin !== window.location.origin) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== '_self') return;

    event.preventDefault();

    const key = link.dataset.route;
    const nextPath = getPathByRouteKey(key);
    const currentPath = normalizePath(location.pathname);

    if (nextPath === currentPath) {
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
    }

    history.pushState({}, '', nextPath);
    render();
}

function handlePopState() {
    render();
}

export function initRouter() {
    document.addEventListener('click', handleLinkClick);
    window.addEventListener('popstate', handlePopState);

    const currentPath = normalizePath(location.pathname);

    if (!pathToRouteKey.has(currentPath)) {
        history.replaceState({}, '', '/home');
    }

    render();
}