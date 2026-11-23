/* eslint-disable */
/* global WebImporter */

/**
 * accordion-programs: two columns, one row per study area.
 * Cell 1: area name. Cell 2: for each study type an H3 subheading followed by
 * a <ul> of program links; each link text is "pretitle title"
 * (e.g. "Máster Universitario en Educación Especial").
 * Source: div.c-filter with div.c-filter__group units (15 areas). Each group
 * has h2.c-filter__group-title (area) and main.c-filter__group-list holding
 * h3.c-filter__group-title subheadings interleaved with a.c-filter__course
 * links, paired in document order.
 */
function cleanText(el) {
  if (!el) return '';
  return el.textContent.replace(/\s+/g, ' ').trim();
}

// One source program link has empty pretitle/title; derive a readable label
// from its URL slug so the link is not lost (e.g. ".../emp-pro-cur-tpr-noa-
// diploma-especialista-...-empleo/" -> "Diploma especialista ... empleo").
function slugLabel(href) {
  if (!href) return '';
  try {
    const slug = new URL(href, 'https://estudiar.unir.net/').pathname.split('/').filter(Boolean).pop() || '';
    const words = slug.replace(/^([a-z]{3}-){2,}(noa-)?/, '').split('-').filter(Boolean);
    if (!words.length) return '';
    const text = words.join(' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
  } catch (e) {
    return '';
  }
}

export default function parse(element, { document, params }) {
  const cells = [];
  const groups = [...element.querySelectorAll('.c-filter__group')];

  groups.forEach((group) => {
    const area = cleanText(group.querySelector('.js-filterResultsGroupTitle, h2'));
    const list = group.querySelector('.c-filter__group-list') || group.querySelector('.c-filter__group-content');
    const body = [];
    let ul = null;

    if (list) {
      list.querySelectorAll('h3, a').forEach((node) => {
        if (node.tagName === 'H3') {
          const text = cleanText(node);
          if (!text) return;
          const h3 = document.createElement('h3');
          h3.textContent = text;
          body.push(h3);
          ul = null;
          return;
        }
        const pretitle = cleanText(node.querySelector('.c-filter__course-pretitle'));
        const title = cleanText(node.querySelector('.c-filter__course-title'));
        const href = node.getAttribute('href');
        const label = [pretitle, title].filter(Boolean).join(' ') || cleanText(node) || slugLabel(href);
        if (!label) return;
        if (!ul) {
          ul = document.createElement('ul');
          body.push(ul);
        }
        const li = document.createElement('li');
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          a.textContent = label;
          li.append(a);
        } else {
          li.textContent = label;
        }
        ul.append(li);
      });
    }

    if (!area && !body.length) return;
    cells.push([area, body.length ? body : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-programs', cells });
  element.replaceWith(block);
}
