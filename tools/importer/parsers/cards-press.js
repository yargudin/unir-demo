/* eslint-disable */
/* global WebImporter */

/**
 * cards-press: one row per press mention, one cell:
 * H3 title + paragraph with the "date - outlet" link to the article.
 * Source: div.card.row--no-gap with article.card__item (h3.heading--h3 title,
 * div.card__links > a with the outlet label).
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
  let items = [...element.querySelectorAll(':scope > .card__item')];
  if (!items.length) items = [...element.querySelectorAll('.card__item')];

  items.forEach((item) => {
    const body = [];
    const title = cleanText(item.querySelector('h1, h2, h3, h4, .heading--h3'));
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      body.push(h3);
    }
    const content = item.querySelector('.card__content');
    if (content) {
      content.querySelectorAll(':scope > p').forEach((p) => {
        const text = cleanText(p);
        if (!text) return;
        const para = document.createElement('p');
        para.textContent = text;
        body.push(para);
      });
    }
    item.querySelectorAll('.card__links a').forEach((link) => {
      const text = cleanText(link);
      const href = link.getAttribute('href');
      if (!text) return;
      const p = document.createElement('p');
      if (href) {
        const a = document.createElement('a');
        a.href = absUrl(href, document);
        a.textContent = text;
        p.append(a);
      } else {
        p.textContent = text;
      }
      body.push(p);
    });
    if (body.length) cells.push([body]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-press', cells });
  element.replaceWith(block);
}
