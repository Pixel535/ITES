const cache = new Map();

export async function loadPage(path) {
    if (cache.has(path)) return cache.get(path);

    const res = await fetch(path, { cache: 'force-cache' });
    if (!res.ok) return `<section class="section"><p class="page-kicker">Error</p><h1 class="h1">Not found</h1></section>`;

    const html = await res.text();
    cache.set(path, html);
    return html;
}
