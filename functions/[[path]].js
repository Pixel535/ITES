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
    '/pages/',
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
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        const { pathname } = url;

        const shouldShowMaintenance =
            isMaintenanceEnabled(env) &&
            isHtmlNavigation(request) &&
            !SYSTEM_PAGE_PATHS.has(pathname) &&
            !isStaticAsset(pathname);

        if (shouldShowMaintenance) {
            return Response.redirect(`${url.origin}/maintenance`, 302);
        }

        return context.next();
    } catch (error) {
        return new Response(
            `Maintenance function error: ${error instanceof Error ? error.message : 'unknown error'}`,
            {
                status: 500,
                headers: {
                    'content-type': 'text/plain; charset=utf-8'
                }
            }
        );
    }
}