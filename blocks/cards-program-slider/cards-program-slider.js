import { createOptimizedPicture } from '../../scripts/aem.js';

const ALL_LABEL = 'Todos';

/**
 * A row's area cell: text-only (no heading, link, picture or list), placed after
 * the card body. Several areas can be separated by commas or semicolons.
 */
function isAreaCell(cell, index, cells) {
  if (index < 2 || index !== cells.length - 1) return false;
  if (cell.querySelector('picture, h1, h2, h3, h4, h5, h6, a, ul, ol')) return false;
  return Boolean(cell.textContent.trim());
}

function parseAreas(text) {
  return text.split(/[;,\n]/).map((area) => area.trim()).filter(Boolean);
}

function buildCard(row) {
  const li = document.createElement('li');
  li.className = 'cards-program-slider-card';
  const cells = [...row.children];
  let areas = [];
  let image;
  let body;
  cells.forEach((cell, idx) => {
    if (isAreaCell(cell, idx, cells)) {
      areas = parseAreas(cell.textContent);
    } else if (!image && cell.querySelector('picture') && !cell.textContent.trim()) {
      image = cell;
      image.className = 'cards-program-slider-card-image';
    } else if (cell.textContent.trim()) {
      if (!body) {
        body = cell;
        body.className = 'cards-program-slider-card-body';
      } else {
        body.append(...cell.childNodes);
      }
    }
  });
  if (image) li.append(image);
  if (body) li.append(body);
  li.dataset.areas = JSON.stringify(areas);

  if (body) {
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      heading.classList.add('cards-program-slider-title');
      let el = heading.previousElementSibling;
      while (el) {
        if (el.tagName === 'P') el.classList.add('cards-program-slider-eyebrow');
        el = el.previousElementSibling;
      }
    }
    const lists = body.querySelectorAll(':scope > ul, :scope > ol');
    if (lists.length) lists[lists.length - 1].classList.add('cards-program-slider-meta');
    const link = heading?.querySelector('a[href]') || body.querySelector('a[href]');
    if (link) {
      link.classList.add('cards-program-slider-card-link');
      link.classList.remove('button');
      link.closest('.button-container')?.classList.remove('button-container');
      li.classList.add('cards-program-slider-card-linked');
    }
  }
  return { li, areas };
}

function updateArrows(track, prev, next) {
  const max = track.scrollWidth - track.clientWidth - 1;
  const left = Math.abs(track.scrollLeft);
  prev.disabled = left <= 0;
  next.disabled = left >= max;
}

function createArrow(direction, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `cards-program-slider-arrow cards-program-slider-${direction}`;
  button.setAttribute('aria-label', label);
  return button;
}

let sliderId = 0;

export default function decorate(block) {
  sliderId += 1;
  const track = document.createElement('ul');
  track.className = 'cards-program-slider-track';
  track.id = `cards-program-slider-${sliderId}`;
  track.tabIndex = 0;
  track.setAttribute('aria-label', 'Programas');

  const allAreas = [];
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const { li, areas } = buildCard(row);
    areas.forEach((area) => { if (!allAreas.includes(area)) allAreas.push(area); });
    track.append(li);
  });

  track.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }]));
  });

  const prev = createArrow('prev', 'Anterior');
  const next = createArrow('next', 'Siguiente');
  [prev, next].forEach((button) => button.setAttribute('aria-controls', track.id));
  const nav = document.createElement('div');
  nav.className = 'cards-program-slider-nav';
  nav.append(prev, next);

  const page = (dir) => track.scrollBy({ left: dir * track.clientWidth * 0.9, behavior: 'smooth' });
  prev.addEventListener('click', () => page(-1));
  next.addEventListener('click', () => page(1));
  track.addEventListener('scroll', () => updateArrows(track, prev, next), { passive: true });
  new ResizeObserver(() => updateArrows(track, prev, next)).observe(track);

  const nodes = [];
  // chips only make sense with at least two areas to choose between
  if (allAreas.length > 1) {
    const chips = document.createElement('div');
    chips.className = 'cards-program-slider-chips';
    chips.setAttribute('role', 'group');
    chips.setAttribute('aria-label', 'Filtrar por área');
    [ALL_LABEL, ...allAreas].forEach((area, idx) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'cards-program-slider-chip';
      chip.textContent = area;
      chip.dataset.area = idx === 0 ? '' : area;
      chip.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
      chip.setAttribute('aria-controls', track.id);
      chips.append(chip);
    });
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.cards-program-slider-chip');
      if (!chip) return;
      chips.querySelectorAll('.cards-program-slider-chip').forEach((c) => {
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
      });
      const { area } = chip.dataset;
      track.querySelectorAll('.cards-program-slider-card').forEach((card) => {
        card.hidden = Boolean(area) && !JSON.parse(card.dataset.areas).includes(area);
      });
      track.scrollTo({ left: 0 });
      updateArrows(track, prev, next);
    });
    nodes.push(chips);
  }

  const viewport = document.createElement('div');
  viewport.className = 'cards-program-slider-viewport';
  viewport.append(track);
  nodes.push(viewport, nav);
  block.replaceChildren(...nodes);
  updateArrows(track, prev, next);
}
