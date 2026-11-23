import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture, img')) return;
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (!div.textContent.trim() && !div.querySelector('picture, img')) {
        div.remove();
      } else if (div.querySelector('picture, img') && !div.textContent.trim()) {
        div.className = 'cards-recognition-card-image';
      } else {
        div.className = 'cards-recognition-card-body';
      }
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    // Scene7 pads logos smaller than `wid`/`hei` onto a transparent canvas
    // (e.g. 122x48 -> 1200x48), which breaks the fixed-height logo row.
    // Request the native size, as the source does.
    if (/\.scene7\.com$/i.test(url.hostname) && url.pathname.includes('/is/image/')
      && (url.searchParams.has('wid') || url.searchParams.has('hei'))) {
      url.searchParams.delete('wid');
      url.searchParams.delete('hei');
      img.src = url.toString();
      return;
    }
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]));
  });
  block.replaceChildren(ul);
}
