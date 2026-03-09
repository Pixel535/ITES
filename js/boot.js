const MAINTENANCE_MODE = false;

const MAINTENANCE_PATH = '/maintenance.html';
const ERROR_PATH = '/error.html';

function isSystemPage(pathname) {
    return pathname === MAINTENANCE_PATH || pathname === ERROR_PATH;
}

function redirectTo(path) {
    const currentPath = window.location.pathname;

    if (currentPath === path) return;

    window.location.replace(path);
}

function handleRuntimeFailure() {
    if (isSystemPage(window.location.pathname)) return;
    redirectTo(ERROR_PATH);
}

window.addEventListener('error', handleRuntimeFailure);
window.addEventListener('unhandledrejection', handleRuntimeFailure);

if (MAINTENANCE_MODE && !isSystemPage(window.location.pathname)) {
    redirectTo(MAINTENANCE_PATH);
} else if (!MAINTENANCE_MODE && window.location.pathname === MAINTENANCE_PATH) {
    redirectTo('/');
} else if (!MAINTENANCE_MODE) {
    import('/js/app.js').catch(handleRuntimeFailure);
}