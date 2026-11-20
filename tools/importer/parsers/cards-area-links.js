/* eslint-disable */
/* global WebImporter */

/**
 * cards-area-links: one row per area, one cell with the area link in an H4.
 * Source: div.row with four div.col-md-3 columns, each a ul.list--square-links
 * of li > h4 > a. Items are read in document order across all columns.
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

export default function parse(element, { document, params }) {
  const cells = [];
  element.querySelectorAll('ul > li').forEach((li) => {
    const text = cleanText(li);
    if (!text) return;
    const link = li.querySelector('a[href]');
    const h4 = document.createElement('h4');
    if (link) {
      const a = document.createElement('a');
      a.href = absUrl(link.getAttribute('href'), document);
      a.textContent = text;
      h4.append(a);
    } else {
      h4.textContent = text;
    }
    cells.push([h4]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-area-links', cells });
  element.replaceWith(block);
}
