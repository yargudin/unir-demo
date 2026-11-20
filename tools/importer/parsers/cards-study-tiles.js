/* eslint-disable */
/* global WebImporter */

/**
 * cards-study-tiles: one row per tile.
 * Cell 1: image (empty for text-only link bars). Cell 2: tile title as a link (H2).
 * Source: div.distributor-block with article.distributor-block__item photo tiles
 * followed by a div.distributor-block__links list of link bars.
 * The source nests <button> inside <a>; text and href are read from the unit
 * (heading / list item) rather than the button so flattened markup still works.
 */
function absUrl(url, document) {
  if (!url) return '';
  try {
    return new URL(url, document.baseURI && document.baseURI.startsWith('http') ? document.baseURI : 'https://www.unir.net/').href;
  } catch (e) {
    return url;
  }
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

// visible text only: the live page injects <style> blocks inside headings
function cleanText(el) {
  if (!el) return '';
  const clone = el.cloneNode(true);
  clone.querySelectorAll('style, script, noscript').forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function titleLink(unit, textScope, tag, document) {
  const text = cleanText(textScope || unit);
  if (!text) return null;
  const link = unit.querySelector('a[href]');
  const el = document.createElement(tag);
  if (link) {
    const a = document.createElement('a');
    a.href = absUrl(link.getAttribute('href'), document);
    a.textContent = text;
    el.append(a);
  } else {
    el.textContent = text;
  }
  return el;
}

export default function parse(element, { document, params }) {
  const cells = [];
  // photo tiles and link-bar list items, in document order (non-overlapping)
  const units = element.querySelectorAll('.distributor-block__item, .distributor-block__links li');
  units.forEach((unit) => {
    if (unit.matches('.distributor-block__item')) {
      const img = imageFrom(unit, document);
      const heading = unit.querySelector('.distributor-block__title, h2, h3, figcaption');
      const title = titleLink(unit, heading, 'h2', document);
      if (!img && !title) return;
      cells.push([img || '', title || '']);
    } else {
      const title = titleLink(unit, unit, 'p', document);
      if (title) cells.push(['', title]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-study-tiles', cells });
  element.replaceWith(block);
}
