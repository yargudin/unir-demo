/* eslint-disable */
/* global WebImporter */

/**
 * cards-event: one row per event.
 * Cell 1: banner image. Cell 2: date paragraph
 * ("24 Nov 2026 | De 16:00 a 17:00 | Online"), bulleted tag list,
 * H3 title linked to the event page, description paragraph.
 * Source: div.card--event with one column div per event (figure.card__figure
 * holding the date badge + image, ul.card__list tags, h3.card__title, p.card__text).
 */
function absUrl(url, document) {
  if (!url) return '';
  try {
    return new URL(url, document.baseURI && document.baseURI.startsWith('http') ? document.baseURI : 'https://www.unir.net/').href;
  } catch (e) {
    return url;
  }
}

function cleanText(el) {
  if (!el) return '';
  const clone = el.cloneNode(true);
  clone.querySelectorAll('style, script, noscript').forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function imageFrom(scope, document) {
  const src = scope.querySelector('img');
  if (!src) return null;
  let url = src.getAttribute('src') || src.getAttribute('data-src');
  if (!url || url.startsWith('data:')) {
    const source = scope.querySelector('source[srcset]');
    const srcset = src.getAttribute('srcset') || src.getAttribute('data-srcset') || (source && source.getAttribute('srcset'));
    url = srcset ? srcset.split(',')[0].trim().split(/\s+/)[0] : url;
  }
  if (!url) return null;
  const img = document.createElement('img');
  img.src = absUrl(url, document);
  img.alt = src.getAttribute('alt') || '';
  return img;
}

// "DE 16:00 A 17:00" -> "De 16:00 a 17:00", "online" -> "Online"
function sentenceCase(text) {
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default function parse(element, { document, params }) {
  const cells = [];
  let units = [...element.querySelectorAll(':scope > div')].filter((d) => d.querySelector('.card__figure, .card__title'));
  if (!units.length) units = [...element.querySelectorAll('.card__figure')].map((f) => f.parentElement);

  units.forEach((unit) => {
    const figure = unit.querySelector('.card__figure') || unit;
    const img = imageFrom(figure, document);
    const body = [];

    // date paragraph
    const day = cleanText(unit.querySelector('.card__day'));
    const month = cleanText(unit.querySelector('.card__month'));
    const hour = cleanText(unit.querySelector('.card__hour'));
    const type = cleanText(unit.querySelector('.card__type'));
    const parts = [];
    const dayMonth = [day, month].filter(Boolean).join(' ');
    if (dayMonth) parts.push(dayMonth);
    if (hour) parts.push(sentenceCase(hour));
    if (type) parts.push(sentenceCase(type));
    if (parts.length) {
      const p = document.createElement('p');
      p.textContent = parts.join(' | ');
      body.push(p);
    }

    // tags
    const tags = [...unit.querySelectorAll('.card__list li')].map((li) => cleanText(li)).filter(Boolean);
    if (tags.length) {
      const ul = document.createElement('ul');
      tags.forEach((tag) => {
        const li = document.createElement('li');
        li.textContent = tag;
        ul.append(li);
      });
      body.push(ul);
    }

    // title
    const titleEl = unit.querySelector('.card__title, h3, h2');
    const title = cleanText(titleEl);
    const titleLink = (titleEl && titleEl.querySelector('a[href]')) || figure.querySelector('a[href]');
    if (title) {
      const h3 = document.createElement('h3');
      if (titleLink) {
        const a = document.createElement('a');
        a.href = absUrl(titleLink.getAttribute('href'), document);
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      body.push(h3);
    }

    // description
    const text = cleanText(unit.querySelector('.card__text'));
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      body.push(p);
    }

    if (!img && !body.length) return;
    cells.push([img || '', body.length ? body : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-event', cells });
  element.replaceWith(block);
}
