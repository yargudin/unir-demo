/* eslint-disable */
/* global WebImporter */

/**
 * cards-icon-feature: one row per item.
 * Cell 1: icon as an :icon-name: token. Cell 2: H3 title + text.
 * Source: section.panel-icons with article.panel-icons__item; the icon is a
 * font icon <i class="unir-icon-professor">, emitted as :professor:.
 *
 * NOTE: the importer's preProcess removes empty inline elements (including
 * the <i> font icons) before parsers run. The icon name is therefore read from
 * (1) the <i> class, (2) a data-icon attribute an import-script preprocess hook
 * may set on the item, (3) a known title -> icon map for the UNIR home page.
 */
const KNOWN_ICONS = {
  'docencia 100% online': 'professor',
  'clases en directo': 'screen',
  'mentor - unir': 'mentor',
};

function cleanText(el) {
  if (!el) return '';
  const clone = el.cloneNode(true);
  clone.querySelectorAll('style, script, noscript').forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function iconName(item, title) {
  const i = item.querySelector('[class*="unir-icon-"]');
  if (i) {
    const cls = [...i.classList].find((c) => c.startsWith('unir-icon-'));
    if (cls) return cls.replace('unir-icon-', '');
  }
  const data = item.getAttribute('data-icon') || (item.querySelector('[data-icon]') || { getAttribute: () => '' }).getAttribute('data-icon');
  if (data) return data.replace('unir-icon-', '');
  return KNOWN_ICONS[title.toLowerCase()] || '';
}

export default function parse(element, { document, params }) {
  const cells = [];
  let items = [...element.querySelectorAll(':scope > .panel-icons__item')];
  if (!items.length) items = [...element.querySelectorAll('article')];

  items.forEach((item) => {
    const paragraphs = [...item.querySelectorAll(':scope > p, :scope > h2, :scope > h3, :scope > h4')];
    const titleEl = item.querySelector('.heading--h3, h2, h3, h4') || paragraphs[0];
    const title = cleanText(titleEl);
    const body = [];
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      body.push(h3);
    }
    paragraphs.filter((p) => p !== titleEl).forEach((p) => {
      const text = cleanText(p);
      if (!text) return;
      const para = document.createElement('p');
      para.textContent = text;
      body.push(para);
    });

    const icon = iconName(item, title);
    let iconCell = '';
    if (icon) {
      iconCell = document.createElement('p');
      iconCell.textContent = `:${icon}:`;
    }
    if (!body.length && !iconCell) return;
    cells.push([iconCell, body.length ? body : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-feature', cells });
  element.replaceWith(block);
}
