import { openModal } from './modal.js';

let items = [];
let activeTag = 'All';

export async function initWork() {
    const tagbar = document.querySelector('[data-tagbar]');
    const grid = document.querySelector('[data-work-grid]');
    if (!tagbar || !grid) return;

    items = await fetch('/data/portfolio.json', { cache: 'no-store' }).then(r => r.json());

    renderTags(tagbar, items);
    renderGrid(grid, items);

    tagbar.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-tag]');
        if (!btn) return;
        activeTag = btn.dataset.tag;
        setActiveTag(tagbar, activeTag);
        renderGrid(grid, items);
    });

    grid.addEventListener('click', (e) => {
        const card = e.target.closest('[data-id]');
        if (!card) return;
        const item = items.find(x => x.id === card.dataset.id);
        if (item) openModal(item);
    });

    grid.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('[data-id]');
        if (!card) return;
        e.preventDefault();
        const item = items.find(x => x.id === card.dataset.id);
        if (item) openModal(item);
    });
}

function renderTags(tagbar, items) {
    const tags = new Set();
    items.forEach(i => (i.tags || []).forEach(t => tags.add(t)));

    const all = ['All', ...Array.from(tags)];
    tagbar.innerHTML = all.map(t => `
    <button class="tag ${t === activeTag ? 'is-active' : ''}"
            type="button"
            data-tag="${escapeAttr(t)}">
      ${escapeHtml(t)}
    </button>
  `).join('');
}

function setActiveTag(tagbar, active) {
    tagbar.querySelectorAll('.tag').forEach(b => {
        b.classList.toggle('is-active', b.dataset.tag === active);
    });
}

function renderGrid(grid, items) {
    const filtered = activeTag === 'All'
        ? items
        : items.filter(i => (i.tags || []).includes(activeTag));

    grid.innerHTML = filtered.map(i => `
    <article class="work-card"
             data-id="${escapeAttr(i.id)}"
             tabindex="0"
             role="button"
             aria-label="Open ${escapeAttr(i.title)}">
      <div class="work-card__media" style="--cover-url: url('${escapeAttr(i.cover)}');">
          <img src="${escapeAttr(i.cover)}" ...>
      </div>
      <div class="work-card__body">
        <h3 class="work-card__title">${escapeHtml(i.title)}</h3>
        <div class="work-card__tags">
          ${(i.tags || []).slice(0, 3).map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
    </article>
  `).join('');
}

function escapeHtml(s='') {
    return String(s).replace(/[&<>"']/g, m => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[m]));
}
function escapeAttr(s='') { return escapeHtml(s); }