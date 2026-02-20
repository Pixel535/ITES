let timer = null;
let index = 0;
let images = [];
let els = {};
let isBound = false;

const AUTOPLAY_MS = 4500;

export function initSlider(root, imgs) {
    if (!root) return;

    destroySlider(); // ważne: czyścimy poprzedni stan w 100%

    images = Array.isArray(imgs) ? imgs.filter(Boolean) : [];
    index = 0;

    els.root = root;
    els.viewport = root.querySelector('[data-viewport]');
    els.prev = root.querySelector('[data-prev]');
    els.next = root.querySelector('[data-next]');

    render();

    if (els.prev) els.prev.onclick = () => { prev(); restart(); };
    if (els.next) els.next.onclick = () => { next(); restart(); };

    attachSwipe(els.viewport);

    if (images.length > 1) {
        timer = setInterval(() => next(), AUTOPLAY_MS);
    }
}

export function destroySlider() {
    if (timer) clearInterval(timer);
    timer = null;

    if (els.prev) els.prev.onclick = null;
    if (els.next) els.next.onclick = null;

    images = [];
    index = 0;
    els = {};
    isBound = false;
}

function render() {
    if (!els.viewport) return;

    const src = images[index];
    if (!src) {
        els.viewport.innerHTML = '';
        return;
    }

    els.viewport.innerHTML = `
    <div class="slider__imgwrap" style="--slide-url: url('${escapeAttr(src)}');">
      <img class="slider__img" src="${escapeAttr(src)}" alt="" loading="eager" decoding="async">
    </div>
  `;

    preload(nextIndex());
}

function next() {
    if (images.length <= 1) return;
    const imgEl = els.viewport?.querySelector('.slider__img');
    if (imgEl) imgEl.classList.add('is-fading');

    window.setTimeout(() => {
        index = nextIndex();
        render();
    }, 180);
}

function prev() {
    if (images.length <= 1) return;
    const imgEl = els.viewport?.querySelector('.slider__img');
    if (imgEl) imgEl.classList.add('is-fading');

    window.setTimeout(() => {
        index = (index - 1 + images.length) % images.length;
        render();
    }, 180);
}

function nextIndex() {
    return (index + 1) % images.length;
}

function restart() {
    if (!timer) return;
    clearInterval(timer);
    timer = setInterval(() => next(), AUTOPLAY_MS);
}

function attachSwipe(el) {
    if (!el || isBound) return;
    isBound = true;

    let startX = 0;
    let dx = 0;
    let down = false;

    el.addEventListener('pointerdown', (e) => {
        down = true;
        startX = e.clientX;
        dx = 0;
        el.setPointerCapture?.(e.pointerId);
    });

    el.addEventListener('pointermove', (e) => {
        if (!down) return;
        dx = e.clientX - startX;
    });

    el.addEventListener('pointerup', () => {
        down = false;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) next();
        else prev();
        restart();
    });
}

function preload(src) {
    const s = images[src] ? images[src] : src; // obsługa gdy przekażemy indeks albo url
    const url = typeof s === 'string' ? s : images[src];
    if (!url) return;

    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = url;
}

function escapeAttr(s='') {
    return String(s).replace(/[&<>"']/g, m => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[m]));
}