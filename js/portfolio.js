import { openModal } from './modal.js';
import { loaderStart, loaderEnd } from './loader.js';

let items = [];
let activeTag = 'All';

export async function initPortfolio() {
    const tagbar = document.querySelector('[data-tagbar]');
    const grid = document.querySelector('[data-portfolio-grid]');
    if (!tagbar || !grid) return;

    loaderStart({ delayMs: 150 });
    try {
        items = await fetch('/data/portfolio.json', { cache: 'no-store' }).then((r) => r.json());
    } finally {
        loaderEnd();
    }

    const saved = sessionStorage.getItem('portfolio:activeTag');
    sessionStorage.removeItem('portfolio:activeTag');

    if (saved) {
        const tagSet = new Set();
        items.forEach((item) => (item.tags || []).forEach((tag) => tagSet.add(tag)));
        activeTag = tagSet.has(saved) ? saved : 'All';
    } else {
        activeTag = 'All';
    }

    renderTags(tagbar, items);
    setActiveTag(tagbar, activeTag);
    renderGrid(grid, items);

    if (!tagbar.dataset.bound) {
        tagbar.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-tag]');
            if (!btn) return;

            activeTag = btn.dataset.tag;
            setActiveTag(tagbar, activeTag);
            renderGrid(grid, items);
        });

        tagbar.dataset.bound = '1';
    }

    if (!grid.dataset.boundClick) {
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('[data-id]');
            if (!card) return;

            const item = items.find((x) => x.id === card.dataset.id);
            if (item) openModal(item);
        });

        grid.dataset.boundClick = '1';
    }

    if (!grid.dataset.boundKeydown) {
        grid.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;

            const card = e.target.closest('[data-id]');
            if (!card) return;

            e.preventDefault();
            const item = items.find((x) => x.id === card.dataset.id);
            if (item) openModal(item);
        });

        grid.dataset.boundKeydown = '1';
    }
}

function renderTags(tagbar, items) {
    const tags = new Set();
    items.forEach((item) => (item.tags || []).forEach((tag) => tags.add(tag)));

    const allTags = ['All', ...Array.from(tags)];

    tagbar.innerHTML = allTags.map((tag) => `
        <button
            class="tag ${tag === activeTag ? 'is-active' : ''}"
            type="button"
            data-tag="${escapeAttr(tag)}"
        >
            ${escapeHtml(tag)}
        </button>
    `).join('');
}

function setActiveTag(tagbar, active) {
    tagbar.querySelectorAll('.tag').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.tag === active);
    });
}

function renderGrid(grid, items) {
    const filtered = activeTag === 'All'
        ? items
        : items.filter((item) => (item.tags || []).includes(activeTag));

    grid.innerHTML = filtered.map((item) => `
        <article
            class="portfolio-card"
            data-id="${escapeAttr(item.id)}"
            tabindex="0"
            role="button"
            aria-label="Open ${escapeAttr(item.title)}"
        >
            <div class="portfolio-card__media" style="--cover-url: url('${escapeAttr(item.cover)}');">
                <img
                    src="${escapeAttr(item.cover)}"
                    alt="${escapeAttr(item.title)}"
                    loading="lazy"
                    decoding="async"
                >
            </div>

            <div class="portfolio-card__body">
                <h3 class="portfolio-card__title">${escapeHtml(item.title)}</h3>

                <div class="portfolio-card__tags">
                    ${(item.tags || [])
        .slice(0, 3)
        .map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`)
        .join('')}
                </div>
            </div>
        </article>
    `).join('');
}

function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[m]));
}

function escapeAttr(s = '') {
    return escapeHtml(s);
}