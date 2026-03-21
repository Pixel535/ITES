let timer = null;
let index = 0;
let media = [];
let els = {};

let swipeCleanup = null;

const AUTOPLAY_MS = 4500;
const SWIPE_THRESHOLD = 40;
const FADE_MS = 180;

export function initSlider(root, items) {
    if (!root) return;

    destroySlider();

    media = normalizeMedia(items);
    index = 0;

    els.root = root;
    els.viewport = root.querySelector('[data-viewport]');
    els.prev = root.querySelector('[data-prev]');
    els.next = root.querySelector('[data-next]');

    render();

    if (els.prev) {
        els.prev.onclick = () => {
            prev();
            restartAutoplay();
        };
    }

    if (els.next) {
        els.next.onclick = () => {
            next();
            restartAutoplay();
        };
    }

    swipeCleanup = attachSwipe(els.viewport);

    restartAutoplay();
}

export function destroySlider() {
    stopAutoplay();
    pauseActiveVideo();

    if (els.prev) els.prev.onclick = null;
    if (els.next) els.next.onclick = null;

    if (typeof swipeCleanup === 'function') {
        swipeCleanup();
    }
    swipeCleanup = null;

    if (els.viewport) {
        els.viewport.innerHTML = '';
    }

    media = [];
    index = 0;
    els = {};
}

function render() {
    if (!els.viewport) return;

    const item = media[index];
    if (!item?.src) {
        els.viewport.innerHTML = '';
        updateNavState();
        return;
    }

    els.viewport.innerHTML = `
        <div class="slider__mediawrap ${item.type === 'video' ? 'is-video' : 'is-image'}">
            ${renderMedia(item)}
        </div>
    `;

    bindVideoEvents();
    updateNavState();

    if (media.length > 1) {
        preload(nextIndex());
    }
}

function renderMedia(item) {
    if (item.type === 'video') {
        return `
            <div class="slider__video-container">
                <video
                    class="slider__media slider__video"
                    src="${escapeAttr(item.src)}"
                    ${item.poster ? `poster="${escapeAttr(item.poster)}"` : ''}
                    controls
                    playsinline
                    preload="metadata"
                    muted
                    defaultMuted
                    disablePictureInPicture
                    controlsList="nodownload noplaybackrate nofullscreen"
                ></video>

                <button class="slider__video-toggle" type="button" aria-label="Play video">
                    <span class="slider__video-icon"></span>
                </button>
            </div>
        `;
    }

    return `
        <img
            class="slider__media slider__img"
            src="${escapeAttr(item.src)}"
            alt="${escapeAttr(item.alt || '')}"
            loading="eager"
            decoding="async"
        >
    `;
}

function next() {
    if (media.length <= 1 || !els.viewport) return;
    transitionTo(nextIndex());
}

function prev() {
    if (media.length <= 1 || !els.viewport) return;
    transitionTo((index - 1 + media.length) % media.length);
}

function transitionTo(nextSlideIndex) {
    const currentMediaEl = getActiveMediaEl();
    if (currentMediaEl) currentMediaEl.classList.add('is-fading');

    pauseActiveVideo();
    stopAutoplay();

    window.setTimeout(() => {
        index = nextSlideIndex;
        render();
        restartAutoplay();
    }, FADE_MS);
}

function nextIndex() {
    if (media.length === 0) return 0;
    return (index + 1) % media.length;
}

function restartAutoplay() {
    stopAutoplay();

    if (media.length <= 1) return;
    if (isVideoSlide()) return;

    timer = window.setInterval(() => {
        next();
    }, AUTOPLAY_MS);
}

function stopAutoplay() {
    if (timer) {
        clearInterval(timer);
    }
    timer = null;
}

function isVideoSlide(i = index) {
    return media[i]?.type === 'video';
}

function attachSwipe(el) {
    if (!el) return null;

    let startX = 0;
    let dx = 0;
    let isPointerDown = false;
    let ignoreSwipe = false;

    const onPointerDown = (e) => {
        ignoreSwipe = !!e.target.closest(
            'video, .slider__video-toggle, button, a, input, textarea, select, [data-no-swipe]'
        );

        if (ignoreSwipe) return;

        isPointerDown = true;
        startX = e.clientX;
        dx = 0;
        el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (!isPointerDown || ignoreSwipe) return;
        dx = e.clientX - startX;
    };

    const onPointerUp = () => {
        if (!isPointerDown || ignoreSwipe) {
            isPointerDown = false;
            dx = 0;
            ignoreSwipe = false;
            return;
        }

        isPointerDown = false;

        if (Math.abs(dx) < SWIPE_THRESHOLD) {
            dx = 0;
            return;
        }

        if (dx < 0) {
            next();
        } else {
            prev();
        }

        restartAutoplay();
        dx = 0;
    };

    const onPointerCancel = () => {
        isPointerDown = false;
        dx = 0;
        ignoreSwipe = false;
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

function bindVideoEvents() {
    const video = els.viewport?.querySelector('.slider__video');
    const btn = els.viewport?.querySelector('.slider__video-toggle');

    if (!video || !btn) return;

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;

    const forceMuted = () => {
        if (!video.muted) video.muted = true;
        if (video.volume !== 0) video.volume = 0;
    };

    const showPlayButton = () => {
        btn.classList.remove('is-hidden');
        btn.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-label', 'Play video');
    };

    const hidePlayButton = () => {
        btn.classList.add('is-hidden');
        btn.setAttribute('aria-hidden', 'true');
    };

    const playVideo = async () => {
        forceMuted();

        if (video.ended) {
            video.currentTime = 0;
        }

        try {
            await video.play();
        } catch (_) {
            showPlayButton();
        }
    };

    const pauseVideo = () => {
        video.pause();
    };

    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await playVideo();
    });

    video.addEventListener('click', async () => {
        if (!video.paused && !video.ended) {
            pauseVideo();
        } else {
            await playVideo();
        }
    });

    video.addEventListener('play', () => {
        forceMuted();
        stopAutoplay();
        hidePlayButton();
    });

    video.addEventListener('pause', () => {
        forceMuted();
        showPlayButton();
    });

    video.addEventListener('ended', () => {
        forceMuted();
        showPlayButton();
        restartAutoplay();
    });

    video.addEventListener('volumechange', forceMuted);

    if (video.paused || video.ended) {
        showPlayButton();
    } else {
        hidePlayButton();
    }
}

function pauseActiveVideo() {
    const video = els.viewport?.querySelector('.slider__video');
    if (!video) return;

    try {
        video.pause();
    } catch (_) {
        // noop
    }
}

function getActiveMediaEl() {
    return els.viewport?.querySelector('.slider__media') || null;
}

function updateNavState() {
    const isInteractive = media.length > 1;

    if (els.prev) {
        els.prev.disabled = !isInteractive;
        els.prev.setAttribute('aria-hidden', String(!isInteractive));
    }

    if (els.next) {
        els.next.disabled = !isInteractive;
        els.next.setAttribute('aria-hidden', String(!isInteractive));
    }
}

function preload(srcOrIndex) {
    const item = typeof srcOrIndex === 'number'
        ? media[srcOrIndex]
        : srcOrIndex;

    if (!item?.src) return;

    if (item.type === 'video') {
        return;
    }

    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = item.src;
}

function normalizeMedia(items) {
    if (!Array.isArray(items)) return [];

    return items
        .map((item) => {
            if (!item) return null;

            if (typeof item === 'string') {
                return {
                    type: 'image',
                    src: item,
                    alt: '',
                };
            }

            const type = item.type === 'video' ? 'video' : 'image';
            const src = typeof item.src === 'string' ? item.src.trim() : '';

            if (!src) return null;

            return {
                type,
                src,
                alt: typeof item.alt === 'string' ? item.alt : '',
                poster: typeof item.poster === 'string' ? item.poster : '',
            };
        })
        .filter(Boolean);
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