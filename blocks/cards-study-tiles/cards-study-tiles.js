import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * A link leaves the site when it points to another host. Absolute links to the
 * source site's main host (not yet rewritten by the import) count as internal.
 */
function isExternal(href) {
  try {
    const { hostname } = new URL(href, window.location.href);
    return hostname !== window.location.hostname && hostname !== 'www.unir.net';
  } catch (e) {
    return false;
  }
}

function buildCard(row) {
  const li = document.createElement('li');
  li.className = 'cards-study-tiles-card';
  [...row.children].forEach((cell) => {
    if (cell.querySelector('picture') && !cell.textContent.trim()) {
      cell.className = 'cards-study-tiles-card-image';
      li.append(cell);
    } else if (cell.textContent.trim()) {
      cell.className = 'cards-study-tiles-card-body';
      li.append(cell);
    }
  });
  li.classList.add(li.querySelector('.cards-study-tiles-card-image')
    ? 'cards-study-tiles-card-photo' : 'cards-study-tiles-card-text');

  const link = li.querySelector('.cards-study-tiles-card-body a[href]');
  if (link) {
    li.classList.add('cards-study-tiles-card-linked');
    link.classList.add('cards-study-tiles-card-link');
    if (isExternal(link.href)) {
      link.classList.add('cards-study-tiles-card-link-external');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  }
  return li;
}

export default function decorate(block) {
  const list = document.createElement('ul');
  let stack = null;

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const card = buildCard(row);
    if (card.classList.contains('cards-study-tiles-card-text')) {
      // consecutive text-only cards share one grid column as stacked link bars
      if (!stack) {
        const stackItem = document.createElement('li');
        stackItem.className = 'cards-study-tiles-stack';
        stack = document.createElement('ul');
        stackItem.append(stack);
        list.append(stackItem);
      }
      stack.append(card);
    } else {
      stack = null;
      list.append(card);
    }
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(list);
}
