/* eslint-disable */
/* global WebImporter */

/**
 * widget: the UNIR course finder form (#up139 / section.js-filter-offer-dinamic)
 * is not authorable content. It is replaced by the project widget block:
 * one row, one cell holding a link to /widgets/course-finder. The `base` query
 * parameter becomes data-base on the widget and routes searches to the source site.
 */
export default function parse(element, { document, params }) {
  const href = '/widgets/course-finder?base=https://www.unir.net';
  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;
  const p = document.createElement('p');
  p.append(a);

  const cells = [[p]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'widget', cells });
  element.replaceWith(block);
}
