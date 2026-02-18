export function initNav() {
    const btn = document.querySelector('.nav-toggle');
    const nav = document.querySelector('#nav');

    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('is-open', !expanded);
    });

    // auto-close on navigation
    nav.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        btn.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
    });
}
