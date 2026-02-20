import { initSlider, destroySlider } from './slider.js';

let lastFocusEl = null;

export function openModal(item) {
    const modal = document.querySelector('[data-modal]');
    if (!modal) return;

    lastFocusEl = document.activeElement;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    modal.querySelector('[data-title]').textContent = item.title || '';

    // ADDRESS (tekst, nie link)
    const addressEl = modal.querySelector('[data-address]');
    const address = (item.address || '').trim();
    if (address) {
        addressEl.textContent = address;
        addressEl.style.display = 'block';
    } else {
        addressEl.textContent = '';
        addressEl.style.display = 'none';
    }

    modal.querySelector('[data-desc]').textContent = item.description || '';

    const tagsEl = modal.querySelector('[data-tags]');
    tagsEl.innerHTML = (item.tags || [])
        .map(t => `<span class="chip">${escapeHtml(t)}</span>`)
        .join('');

    initSlider(modal.querySelector('[data-slider]'), item.images || []);

    // close handlers (bind tylko raz)
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

    // focus-trap (Tab)
    if (e.key !== 'Tab') return;

    const modal = document.querySelector('[data-modal]');
    if (!modal || !modal.classList.contains('is-open')) return;

    const focusables = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
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

function escapeHtml(s='') {
    return String(s).replace(/[&<>"']/g, m => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[m]));
}