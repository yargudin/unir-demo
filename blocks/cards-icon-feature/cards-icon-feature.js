import { createOptimizedPicture } from '../../scripts/aem.js';

// icons drawn from an icon font (see cards-icon-feature.css); no SVG exists for them:
// unir-icons on the home page, Phosphor on landings
const FONT_ICONS = ['professor', 'screen', 'mentor', 'spinner', 'lightbulb', 'briefcase'];
const ICON_TOKEN = /^:([a-z0-9-]+):$/i;

/**
 * Turns `:icon-name:` text (left as-is in local .plain.html) into an icon span and drops
 * the <img> EDS adds to font icons, since /icons/{name}.svg does not exist for them.
 * @param {Element} cell
 */
function decorateFontIcons(cell) {
  [cell, ...cell.querySelectorAll('p, div')].forEach((el) => {
    if (el.children.length) return;
    const match = el.textContent.trim().match(ICON_TOKEN);
    if (!match) return;
    const span = document.createElement('span');
    span.className = `icon icon-${match[1].toLowerCase()}`;
    el.replaceChildren(span);
  });
  cell.querySelectorAll('.icon').forEach((icon) => {
    const name = [...icon.classList].find((c) => c.startsWith('icon-'))?.slice(5);
    if (FONT_ICONS.includes(name)) {
      icon.querySelectorAll('img').forEach((img) => img.remove());
      icon.classList.add('icon-font');
      icon.setAttribute('aria-hidden', 'true');
    }
  });
}

function navButton(dir, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `cards-icon-feature-nav-btn cards-icon-feature-nav-${dir}`;
  button.setAttribute('aria-label', label);
  return button;
}

/**
 * Landing carousel: the card row scrolls horizontally (scroll snap) and, while it
 * overflows, shows a progress bar (one segment per snap stop) and prev/next buttons.
 * @param {Element} block
 * @param {Element} list
 */
function decorateCarousel(block, list) {
  const controls = document.createElement('div');
  controls.className = 'cards-icon-feature-controls';
  const progress = document.createElement('div');
  progress.className = 'cards-icon-feature-progress';
  const nav = document.createElement('div');
  nav.className = 'cards-icon-feature-nav';
  const prev = navButton('prev', 'Anterior');
  const next = navButton('next', 'Siguiente');
  const divider = document.createElement('span');
  divider.className = 'cards-icon-feature-nav-divider';
  nav.append(prev, divider, next);
  controls.append(progress, nav);
  block.append(controls);

  let stops = [];
  let current = 0;

  const update = () => {
    const pos = list.scrollLeft;
    current = stops.reduce((best, stop, i) => (
      Math.abs(stop - pos) < Math.abs(stops[best] - pos) ? i : best), 0);
    [...progress.children].forEach((seg, i) => {
      seg.classList.toggle('active', i === current);
      seg.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
    prev.disabled = current <= 0;
    next.disabled = current >= stops.length - 1;
  };

  const goTo = (i) => {
    const index = Math.max(0, Math.min(i, stops.length - 1));
    list.scrollTo({ left: stops[index] });
  };

  const measure = () => {
    const max = list.scrollWidth - list.clientWidth;
    // snap stops are card offsets past the start padding (= scroll-padding)
    const start = list.getBoundingClientRect().left + list.clientLeft - list.scrollLeft;
    const padLeft = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0;
    stops = [];
    if (max > 1) {
      [...list.children].forEach((li) => {
        const stop = Math.min(Math.max(li.getBoundingClientRect().left - start - padLeft, 0), max);
        if (!stops.some((s) => Math.abs(s - stop) < 2)) stops.push(stop);
      });
    }
    block.classList.toggle('scrollable', stops.length > 1);
    if (progress.children.length !== stops.length) {
      progress.replaceChildren(...stops.map((_, i) => {
        const seg = document.createElement('button');
        seg.type = 'button';
        seg.className = 'cards-icon-feature-progress-segment';
        seg.setAttribute('aria-label', `Diapositiva ${i + 1} de ${stops.length}`);
        return seg;
      }));
    }
    update();
  };

  progress.addEventListener('click', (e) => {
    const seg = e.target.closest('.cards-icon-feature-progress-segment');
    if (seg) goTo([...progress.children].indexOf(seg));
  });
  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  list.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(measure).observe(list);
}

/**
 * Icon features: icon | title + text. The icon may be a picture or an
 * `:icon-name:` span; an empty icon cell is dropped.
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    [...row.children].forEach(decorateFontIcons);
    if (!row.textContent.trim() && !row.querySelector('picture, .icon')) return;
    const li = document.createElement('li');
    li.className = 'cards-icon-feature-card';
    [...row.children].forEach((cell) => {
      const hasIcon = cell.querySelector('picture, .icon, svg');
      const text = cell.textContent.trim();
      if (hasIcon && !text) {
        cell.className = 'cards-icon-feature-card-icon';
        li.prepend(cell);
      } else if (text || hasIcon) {
        cell.className = 'cards-icon-feature-card-body';
        li.append(cell);
      }
    });
    // single-cell rows: a leading icon-only paragraph becomes the icon cell
    const body = li.querySelector('.cards-icon-feature-card-body');
    const lead = body?.firstElementChild;
    if (!li.querySelector('.cards-icon-feature-card-icon') && lead
      && lead.querySelector('picture, .icon, svg') && !lead.textContent.trim()) {
      const icon = document.createElement('div');
      icon.className = 'cards-icon-feature-card-icon';
      icon.append(lead);
      li.prepend(icon);
    }
    li.querySelector('.cards-icon-feature-card-body h1, .cards-icon-feature-card-body h2, .cards-icon-feature-card-body h3, .cards-icon-feature-card-body h4, .cards-icon-feature-card-body h5, .cards-icon-feature-card-body h6')
      ?.classList.add('cards-icon-feature-title');
    list.append(li);
  });

  // icons are usually SVG and stay as authored; raster icons are optimized small
  list.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '160' }]));
  });
  block.replaceChildren(list);
  // landings show the cards as a scrolling carousel; the home page keeps a static row
  if (document.body.classList.contains('landing')) decorateCarousel(block, list);
}
