import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Builds the date badge from the authored date paragraph, e.g.
 * "24 Nov 2026 | De 16:00 a 17:00 | Online". A leading day number becomes the
 * large day figure; the remaining parts (split on | or line breaks) stack beside it.
 */
function buildDateBadge(paragraph) {
  const badge = document.createElement('div');
  badge.className = 'cards-event-date';
  const parts = [];
  let current = '';
  paragraph.childNodes.forEach((node) => {
    if (node.nodeName === 'BR') {
      parts.push(current);
      current = '';
    } else {
      current += node.textContent;
    }
  });
  parts.push(current);
  const lines = parts
    .flatMap((part) => part.split('|'))
    .map((part) => part.trim())
    .filter(Boolean);
  if (!lines.length) return null;

  const match = lines[0].match(/^(\d{1,2})\s*(.*)$/);
  if (match) {
    const [, dayNumber, rest] = match;
    const day = document.createElement('span');
    day.className = 'cards-event-date-day';
    day.textContent = dayNumber;
    badge.append(day);
    if (rest) lines.splice(0, 1, rest);
    else lines.shift();
  }
  const details = document.createElement('span');
  details.className = 'cards-event-date-details';
  lines.forEach((line) => {
    const span = document.createElement('span');
    span.textContent = line;
    details.append(span);
  });
  badge.append(details);
  return badge;
}

export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-event-card';
    let image;
    let body;
    [...row.children].forEach((cell) => {
      if (!image && cell.querySelector('picture') && !cell.textContent.trim()) {
        image = cell;
        image.className = 'cards-event-card-image';
      } else if (cell.textContent.trim()) {
        if (!body) {
          body = cell;
          body.className = 'cards-event-card-body';
        } else {
          body.append(...cell.childNodes);
        }
      }
    });
    if (image) li.append(image);
    if (body) li.append(body);

    if (body) {
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      // everything before the heading is metadata: a paragraph = date, a list = tags
      const before = [];
      let el = body.firstElementChild;
      while (el && el !== heading) {
        before.push(el);
        el = el.nextElementSibling;
      }
      const dateParagraph = before.find((node) => node.tagName === 'P' && /\d/.test(node.textContent));
      const tagList = before.find((node) => node.tagName === 'UL' || node.tagName === 'OL');
      if (tagList) tagList.classList.add('cards-event-tags');
      if (dateParagraph) {
        const badge = buildDateBadge(dateParagraph);
        if (badge) {
          (image || li).prepend(badge);
          dateParagraph.remove();
        }
      }
      if (heading) heading.classList.add('cards-event-title');

      // image links to the same detail page as the title
      const link = heading?.querySelector('a[href]') || body.querySelector('a[href]');
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
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]));
  });
  block.replaceChildren(list);
}
