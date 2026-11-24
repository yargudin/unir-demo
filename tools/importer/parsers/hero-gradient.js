/* eslint-disable */
/* global WebImporter */

/**
 * hero-gradient: single-column block.
 * Row 1: image (optional). Row 2: H1 title, subtitle paragraph, CTA link.
 * Source: div.c-hero (estudiar.unir.net landing). The CTA is a <button> that
 * opens the contact-form modal (no href), so it is rebuilt as a link to the
 * on-page form anchor.
 */
const CTA_HREF = '#form';

function cleanText(el) {
  if (!el) return '';
  return el.textContent.replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document, params }) {
  const cells = [];

  const img = element.querySelector('.c-hero__figure img, img');
  if (img && img.getAttribute('src')) {
    const image = document.createElement('img');
    image.src = img.getAttribute('src');
    image.alt = img.getAttribute('alt') || '';
    cells.push([image]);
  }

  const content = [];
  const title = cleanText(element.querySelector('.c-hero__title, h1'));
  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title;
    content.push(h1);
  }
  const subtitle = cleanText(element.querySelector('.c-hero__subtitle'));
  if (subtitle) {
    const p = document.createElement('p');
    p.textContent = subtitle;
    content.push(p);
  }
  element.querySelectorAll('.c-hero__ctas .c-hero__cta').forEach((cta) => {
    const label = cleanText(cta);
    if (!label) return;
    const href = cta.getAttribute('href');
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href && !href.startsWith('javascript:') ? href : CTA_HREF;
    a.textContent = label;
    p.append(a);
    content.push(p);
  });
  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-gradient', cells });
  element.replaceWith(block);
}
