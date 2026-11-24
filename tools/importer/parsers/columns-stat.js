/* eslint-disable */
/* global WebImporter */

/**
 * columns-stat: one row, two columns.
 * Cell 1: H2 title + description paragraph.
 * Cell 2: stat value paragraph (e.g. "+400") + caption paragraph.
 * Source: div.c-highlighted-data; left column .c-highlighted-data__left,
 * stat column .c-highlighted-data__right (list items with the number and
 * caption). The empty logos list in the bottom row is ignored.
 */
function cleanText(el) {
  if (!el) return '';
  return el.textContent.replace(/\s+/g, ' ').trim();
}

function para(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

export default function parse(element, { document, params }) {
  const cells = [];

  const left = element.querySelector('.c-highlighted-data__left');
  const textCell = [];
  if (left) {
    const title = cleanText(left.querySelector('.c-highlighted-data__title, h2, h3'));
    if (title) {
      const h2 = document.createElement('h2');
      h2.textContent = title;
      textCell.push(h2);
    }
    left.querySelectorAll('p').forEach((p) => {
      const text = cleanText(p);
      if (text) textCell.push(para(document, text));
    });
  }

  const right = element.querySelector('.c-highlighted-data__right');
  const statCell = [];
  if (right) {
    right.querySelectorAll('.c-highlighted-data__data, .c-highlighted-data__text').forEach((p) => {
      const text = cleanText(p);
      if (text) statCell.push(para(document, text));
    });
  }

  if (textCell.length || statCell.length) {
    cells.push([textCell.length ? textCell : '', statCell.length ? statCell : '']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-stat', cells });
  element.replaceWith(block);
}
