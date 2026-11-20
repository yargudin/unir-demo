import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Featured promo grid. Cards with an image become the tall lead tile;
 * text-only cards fill the remaining grid cells. The last paragraph that holds
 * only a link is the card's CTA.
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-featured-card';
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'cards-featured-card-image';
        li.append(cell);
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-featured-card-body';
        li.append(cell);
      }
    });
    li.classList.add(li.querySelector('.cards-featured-card-image')
      ? 'cards-featured-card-has-image' : 'cards-featured-card-text');

    const body = li.querySelector('.cards-featured-card-body');
    if (body) {
      const ctaParagraph = [...body.querySelectorAll(':scope > p')].reverse().find((p) => {
        const link = p.querySelector('a[href]');
        return link && p.textContent.trim() === link.textContent.trim();
      });
      if (ctaParagraph) {
        ctaParagraph.classList.add('cards-featured-card-cta');
        ctaParagraph.querySelector('a').classList.remove('button');
        ctaParagraph.classList.remove('button-container');
      }
    }
    list.append(li);
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(list);
}
