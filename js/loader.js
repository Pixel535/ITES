let showTimer = null;
let activeCount = 0;

function getEl() {
    return document.querySelector('[data-loader]');
}

export function loaderStart({ delayMs = 150 } = {}) {
    const el = getEl();
    if (!el) return;

    activeCount += 1;

    // jeśli już jest aktywny, nic nie rób
    if (el.classList.contains('is-active')) return;

    // opóźnienie, żeby nie migało przy szybkich przejściach
    clearTimeout(showTimer);
    showTimer = setTimeout(() => {
        // jeżeli nadal coś się ładuje
        if (activeCount > 0) {
            el.classList.add('is-active');
            el.setAttribute('aria-hidden', 'false');
            document.documentElement.classList.add('is-loading');
        }
    }, delayMs);
}

export function loaderEnd() {
    const el = getEl();
    if (!el) return;

    activeCount = Math.max(0, activeCount - 1);

    // jeśli coś jeszcze się ładuje, nie chowaj
    if (activeCount > 0) return;

    clearTimeout(showTimer);
    showTimer = null;

    el.classList.remove('is-active');
    el.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-loading');
}

// awaryjnie: gdyby coś rzuciło error i loader został
export function loaderReset() {
    activeCount = 0;
    clearTimeout(showTimer);
    showTimer = null;
    loaderEnd();
}