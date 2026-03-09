const SYSTEM_PAGE_PATHS = new Set([
    '/maintenance',
    '/maintenance.html',
    '/error',
    '/error.html'
]);

const STATIC_PREFIXES = [
    '/assets/',
    '/css/',
    '/js/',
    '/meta/',
    '/data/',
    '/favicon.ico'
];

function isStaticAsset(pathname) {
    return STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isHtmlNavigation(request) {
    if (request.method !== 'GET') return false;

    const accept = request.headers.get('accept') || '';
    return accept.includes('text/html');
}

function isMaintenanceEnabled(env) {
    return String(env.MAINTENANCE_MODE ?? '').trim().toLowerCase() === 'true';
}

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const { pathname } = url;

    if (
        isMaintenanceEnabled(env) &&
        isHtmlNavigation(request) &&
        !SYSTEM_PAGE_PATHS.has(pathname) &&
        !isStaticAsset(pathname)
    ) {
        return env.ASSETS.fetch(new URL('/maintenance', url.origin));
    }

    return env.ASSETS.fetch(request);
}