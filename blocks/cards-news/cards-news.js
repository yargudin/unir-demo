import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * News cards: image | body. In the body, paragraphs before the heading are the
 * image caption; the heading link is the article link and also wraps the image.
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-news-card';
    let image;
    let body;
    [...row.children].forEach((cell) => {
      if (!image && cell.querySelector('picture') && !cell.textContent.trim()) {
        image = cell;
        image.className = 'cards-news-card-image';
      } else if (cell.textContent.trim()) {
        if (!body) {
          body = cell;
          body.className = 'cards-news-card-body';
        } else {
          body.append(...cell.childNodes);
        }
      }
    });
    if (image) li.append(image);
    if (body) li.append(body);
    if (!image) li.classList.add('cards-news-card-text');

    if (body) {
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        heading.classList.add('cards-news-title');
        let el = heading.previousElementSibling;
        while (el) {
          if (el.tagName === 'P') el.classList.add('cards-news-caption');
          el = el.previousElementSibling;
        }
      }
      const link = heading?.querySelector('a[href]');
      const picture = image?.querySelector('picture');
      if (link && picture && !picture.closest('a')) {
        const imageLink = document.createElement('a');
        imageLink.href = link.href;
        imageLink.tabIndex = -1;
        imageLink.setAttribute('aria-hidden', 'true');
        picture.replaceWith(imageLink);
        imageLink.append(picture);
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
