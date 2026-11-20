/* eslint-disable */
/* global WebImporter */

/**
 * cards-program-slider: one row per program.
 * Cell 1: image. Cell 2: eyebrow paragraph ("Máster Universitario en"),
 * H3 title linked to the program page, description, bulleted meta list.
 * Cell 3: area name(s), plain text, comma separated.
 *
 * Source: div.js-cards-filter with chip buttons (button.card__chip[data-term-id])
 * and article.js-cards-filter-item cards. Cards are linked to chips by
 * data-course-terms-ids ("10;88;") and carry data-course-terms-names
 * ("Educación;Humanidades;"). Areas are ordered by chip order so the block
 * rebuilds its chips in the source order.
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

const splitList = (value) => (value || '').split(';').map((v) => v.trim()).filter(Boolean);

export default function parse(element, { document, params }) {
  const cells = [];

  // chip id -> name, and chip order for sorting
  const chipNames = {};
  const chipOrder = [];
  element.querySelectorAll('[data-term-id]').forEach((chip) => {
    const id = chip.getAttribute('data-term-id');
    const name = cleanText(chip);
    if (!id || id === 'all' || !name) return;
    chipNames[id] = name;
    chipOrder.push(name);
  });

  let items = [...element.querySelectorAll('.js-cards-filter-item')];
  if (!items.length) items = [...element.querySelectorAll('article.list-comparison__wrapper')];
  items = items.filter((item) => !item.classList.contains('tns-slide-cloned'));

  items.forEach((item) => {
    const img = imageFrom(item.querySelector('.list-comparison__picture') || item, document);
    const link = item.querySelector('a.list-comparison__content[href]') || item.querySelector('a[href]');
    const href = link ? absUrl(link.getAttribute('href'), document) : '';
    const body = [];

    const heading = item.querySelector('.list-comparison__heading, h3');
    const titleEl = item.querySelector('.list-comparison__title');
    let eyebrow = '';
    let title = '';
    if (heading) {
      // the eyebrow is the heading text outside .list-comparison__title
      // (a <span> on the live page; unwrapped to a text node by the importer)
      const rest = heading.cloneNode(true);
      rest.querySelectorAll('.list-comparison__title').forEach((n) => n.remove());
      eyebrow = cleanText(rest);
      title = titleEl ? cleanText(titleEl) : cleanText(heading);
      if (!titleEl) eyebrow = '';
    }
    if (eyebrow) {
      const p = document.createElement('p');
      p.textContent = eyebrow;
      body.push(p);
    }
    if (title) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      body.push(h3);
    }
    const desc = cleanText(item.querySelector('.list-comparison__body > p'));
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      body.push(p);
    }
    const props = [...item.querySelectorAll('.list-comparison__property')].map((li) => cleanText(li)).filter(Boolean);
    if (props.length) {
      const ul = document.createElement('ul');
      props.forEach((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        ul.append(li);
      });
      body.push(ul);
    }

    // areas: names attribute first, ids mapped through the chips as fallback
    let areas = splitList(item.getAttribute('data-course-terms-names'));
    if (!areas.length) {
      areas = splitList(item.getAttribute('data-course-terms-ids')).map((id) => chipNames[id]).filter(Boolean);
    }
    areas = [...new Set(areas)].sort((a, b) => {
      const ia = chipOrder.indexOf(a);
      const ib = chipOrder.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    if (!img && !body.length) return;
    cells.push([img || '', body.length ? body : '', areas.join(', ')]);
  });

  // the section intro (H2 + optional paragraph) sits inside the matched element;
  // keep it as default content before the block
  const intro = [];
  const introScope = element.querySelector('.list--square') || element;
  introScope.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > p').forEach((el) => {
    const text = cleanText(el);
    if (!text) return;
    const copy = document.createElement(el.tagName.toLowerCase() === 'p' ? 'p' : 'h2');
    copy.textContent = text;
    intro.push(copy);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-program-slider', cells });
  intro.forEach((el) => element.before(el));
  element.replaceWith(block);
}
