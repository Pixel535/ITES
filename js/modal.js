import { initSlider, destroySlider } from './slider.js';

let lastFocusEl = null;

export function openModal(item) {
    const modal = document.querySelector('[data-modal]');
    if (!modal) return;

    lastFocusEl = document.activeElement;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const titleEl = modal.querySelector('[data-title]');
    titleEl.textContent = item.title || '';

    requestAnimationFrame(() => {
        const divider = modal.querySelector('[data-divider]');
        if (divider) divider.style.width = (titleEl.offsetWidth + 40) + 'px';
    });

    initSlider(modal.querySelector('[data-slider]'), item.media || []);

    if (!modal.dataset.boundClose) {
        modal.addEventListener('click', (e) => {
            const close = e.target.closest('[data-modal-close]');
            if (!close) return;
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
        modal.dataset.boundClose = '1';
    }

    document.addEventListener('keydown', onKeydown);

    requestAnimationFrame(() => {
        const closeBtn = modal.querySelector('[data-modal-close].modal__close') || modal.querySelector('.modal__close');
        if (closeBtn) closeBtn.focus();
    });
}

export function closeModal() {
    const modal = document.querySelector('[data-modal]');
    if (!modal) return;

    destroySlider();

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    document.removeEventListener('keydown', onKeydown);

    if (lastFocusEl && typeof lastFocusEl.focus === 'function') {
        lastFocusEl.focus();
    }
    lastFocusEl = null;
}

function onKeydown(e) {
    if (e.key === 'Escape') {
        closeModal();
        return;
    }

    if (e.key !== 'Tab') return;

    const modal = document.querySelector('[data-modal]');
    if (!modal || !modal.classList.contains('is-open')) return;

    const focusables = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const list = Array.from(focusables).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
    if (!list.length) return;

    const first = list[0];
    const last = list[list.length - 1];

    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
}
