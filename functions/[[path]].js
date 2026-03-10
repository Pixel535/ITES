import maintenanceHtml from '../maintenance.html';

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
    return (request.headers.get('accept') || '').includes('text/html');
}

function isMaintenanceEnabled(env) {
    return String(env.MAINTENANCE_MODE ?? '').trim().toLowerCase() === 'true';
}

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    if (
        isMaintenanceEnabled(env) &&
        isHtmlNavigation(request) &&
        !isStaticAsset(url.pathname)
    ) {
        return new Response(maintenanceHtml, {
            status: 503,
            headers: {
                'content-type': 'text/html; charset=utf-8',
                'cache-control': 'no-store, no-cache, must-revalidate',
                'retry-after': '3600'
            }
        });
    }

    return context.next();
}