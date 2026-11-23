/* eslint-disable */
/* global WebImporter */

/**
 * cards-recognition: two columns, one row per card.
 * Cell 1: logo image. Cell 2: description paragraph(s), inline <b>/<i>
 * formatting preserved.
 * Source: div.c-recognitions__grid with section.c-recognition-card units
 * (img.cmp-image__image + .cmp-teaser__description).
 */
export default function parse(element, { document, params }) {
  const cells = [];
  const cards = [...element.querySelectorAll('section.c-recognition-card')];

  cards.forEach((card) => {
    let imageCell = '';
    const src = card.querySelector('.cmp-teaser__image img, img');
    if (src && src.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = src.getAttribute('src');
      img.alt = src.getAttribute('alt') || '';
      imageCell = img;
    }

    const description = card.querySelector('.cmp-teaser__description') || card.querySelector('.cmp-text-content');
    const body = [];
    if (description) {
      const blocks = [...description.querySelectorAll('h2, h3, h4, p')];
      if (blocks.length) {
        blocks.forEach((el) => {
          if (el.textContent.trim()) body.push(el);
        });
      } else if (description.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = description.textContent.replace(/\s+/g, ' ').trim();
        body.push(p);
      }
    }

    if (!imageCell && !body.length) return;
    cells.push([imageCell, body.length ? body : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-recognition', cells });
  element.replaceWith(block);
}
