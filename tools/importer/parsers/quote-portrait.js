/* eslint-disable */
/* global WebImporter */

/**
 * quote-portrait: single-column block.
 * Row 1: portrait image (optional). Row 2: quotation paragraph(s).
 * Row 3: attribution, name (bold) and role.
 * Source: div.c-testimonies-carousel with one div.c-testimony per slide
 * (single slide on the landing). Additional slides become additional
 * quote-portrait blocks placed right after the first one.
 */
function cleanText(el) {
  if (!el) return '';
  return el.textContent.replace(/\s+/g, ' ').trim();
}

function buildCells(item, document) {
  const cells = [];

  const src = item.querySelector('.c-testimony__primary-image img, img');
  if (src && src.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = src.getAttribute('src');
    img.alt = src.getAttribute('alt') || cleanText(item.querySelector('.c-testimony__author')).replace(/,$/, '');
    cells.push([img]);
  }

  const quote = [...item.querySelectorAll('blockquote p')]
    .map((p) => cleanText(p))
    .filter(Boolean)
    .map((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      return p;
    });
  if (!quote.length) {
    const text = cleanText(item.querySelector('blockquote'));
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      quote.push(p);
    }
  }
  if (quote.length) cells.push([quote]);

  const author = cleanText(item.querySelector('.c-testimony__author, figcaption strong'));
  const role = cleanText(item.querySelector('.c-testimony__author-position'));
  if (author || role) {
    const p = document.createElement('p');
    if (author) {
      const strong = document.createElement('strong');
      strong.textContent = author;
      p.append(strong);
    }
    if (role) p.append(`${author ? ' ' : ''}${role}`);
    cells.push([p]);
  }
  return cells;
}

export default function parse(element, { document, params }) {
  let items = [...element.querySelectorAll('.c-testimony')];
  if (!items.length) items = [element];

  const blocks = items
    .map((item) => buildCells(item, document))
    .filter((cells) => cells.length)
    .map((cells) => WebImporter.Blocks.createBlock(document, { name: 'quote-portrait', cells }));

  const block = blocks.shift() || WebImporter.Blocks.createBlock(document, { name: 'quote-portrait', cells: [] });
  element.replaceWith(block);
  if (blocks.length) block.after(...blocks);
}
