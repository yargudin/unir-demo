import { createOptimizedPicture } from '../../scripts/aem.js';

// icons drawn from the unir-icons font (see cards-icon-feature.css); no SVG exists for them
const FONT_ICONS = ['professor', 'screen', 'mentor'];
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
}
