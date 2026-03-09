let timer = null;
let index = 0;
let images = [];
let els = {};

let swipeCleanup = null;

const AUTOPLAY_MS = 4500;
const SWIPE_THRESHOLD = 40;
const FADE_MS = 180;

export function initSlider(root, imgs) {
    if (!root) return;

    destroySlider();

    images = Array.isArray(imgs) ? imgs.filter(Boolean) : [];
    index = 0;

    els.root = root;
    els.viewport = root.querySelector('[data-viewport]');
    els.prev = root.querySelector('[data-prev]');
    els.next = root.querySelector('[data-next]');

    render();

    if (els.prev) {
        els.prev.onclick = () => {
            prev();
            restart();
        };
    }

    if (els.next) {
        els.next.onclick = () => {
            next();
            restart();
        };
    }

    swipeCleanup = attachSwipe(els.viewport);

    if (images.length > 1) {
        timer = window.setInterval(() => {
            next();
        }, AUTOPLAY_MS);
    }
}

export function destroySlider() {
    if (timer) {
        clearInterval(timer);
    }
    timer = null;

    if (els.prev) els.prev.onclick = null;
    if (els.next) els.next.onclick = null;

    if (typeof swipeCleanup === 'function') {
        swipeCleanup();
    }
    swipeCleanup = null;

    if (els.viewport) {
        els.viewport.innerHTML = '';
    }

    images = [];
    index = 0;
    els = {};
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

    if (images.length > 1) {
        preload(nextIndex());
    }
}

function next() {
    if (images.length <= 1 || !els.viewport) return;

    const imgEl = els.viewport.querySelector('.slider__img');
    if (imgEl) imgEl.classList.add('is-fading');

    window.setTimeout(() => {
        index = nextIndex();
        render();
    }, FADE_MS);
}

function prev() {
    if (images.length <= 1 || !els.viewport) return;

    const imgEl = els.viewport.querySelector('.slider__img');
    if (imgEl) imgEl.classList.add('is-fading');

    window.setTimeout(() => {
        index = (index - 1 + images.length) % images.length;
        render();
    }, FADE_MS);
}

function nextIndex() {
    if (images.length === 0) return 0;
    return (index + 1) % images.length;
}

function restart() {
    if (images.length <= 1) return;

    if (timer) {
        clearInterval(timer);
    }

    timer = window.setInterval(() => {
        next();
    }, AUTOPLAY_MS);
}

function attachSwipe(el) {
    if (!el) return null;

    let startX = 0;
    let dx = 0;
    let isPointerDown = false;

    const onPointerDown = (e) => {
        isPointerDown = true;
        startX = e.clientX;
        dx = 0;
        el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (!isPointerDown) return;
        dx = e.clientX - startX;
    };

    const onPointerUp = () => {
        if (!isPointerDown) return;

        isPointerDown = false;

        if (Math.abs(dx) < SWIPE_THRESHOLD) return;

        if (dx < 0) {
            next();
        } else {
            prev();
        }

        restart();
    };

    const onPointerCancel = () => {
        isPointerDown = false;
        dx = 0;
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerCancel);

    return () => {
        el.removeEventListener('pointerdown', onPointerDown);
        el.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerup', onPointerUp);
        el.removeEventListener('pointercancel', onPointerCancel);
    };
}

function preload(srcOrIndex) {
    const url = typeof srcOrIndex === 'string'
        ? srcOrIndex
        : images[srcOrIndex];

    if (!url) return;

    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = url;
}

function escapeAttr(s = '') {
    return String(s).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[m]));
}