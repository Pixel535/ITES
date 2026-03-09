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

function getMaintenanceHtml() {
    return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Page under maintenance — ITES Ltd.</title>
  <meta name="description" content="ITES Ltd. website is currently under maintenance. We will be back shortly." />
  <style>
    :root{
      --bg: #f5f5f5;
      --card-bg: #ffffff;
      --text: #1f2937;
      --muted: #6b7280;
      --border: #e5e7eb;
      --radius: 24px;
      --shadow: 0 20px 60px rgba(0,0,0,.08);
    }

    *{ box-sizing: border-box; }

    html, body{
      margin: 0;
      min-height: 100%;
      font-family: Inter, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    body{
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
    }

    .system-page{
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .system-page__card{
      width: min(100%, 720px);
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 48px 24px;
      text-align: center;
    }

    .system-page__inner{
      max-width: 560px;
      margin: 0 auto;
    }

    .system-page__icon{
      font-size: 56px;
      line-height: 1;
      margin-bottom: 20px;
    }

    .system-page__title{
      margin: 0 0 12px;
      font-size: clamp(2rem, 4vw, 3rem);
      line-height: 1.1;
    }

    .system-page__text{
      margin: 0;
      color: var(--muted);
      font-size: 1rem;
      line-height: 1.7;
    }
  </style>
</head>
<body>
  <main class="system-page" aria-labelledby="maintenance-title">
    <section class="system-page__card" role="status" aria-live="polite">
      <div class="system-page__inner">
        <div class="system-page__icon" aria-hidden="true">🚧</div>
        <h1 id="maintenance-title" class="system-page__title">Page under maintenance</h1>
        <p class="system-page__text">We are currently working on the website and will be back shortly.</p>
      </div>
    </section>
  </main>
</body>
</html>`;
}

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const { pathname } = url;

    const shouldShowMaintenance =
        isMaintenanceEnabled(env) &&
        isHtmlNavigation(request) &&
        !isStaticAsset(pathname);

    if (shouldShowMaintenance) {
        return new Response(getMaintenanceHtml(), {
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