/* eslint-disable */
/* global WebImporter */

/**
 * form: one row per field, four columns, as read by blocks/form/form.js:
 *   Label | Type | Options (list) or placeholder | Required ("yes")
 * Source: div.l-sidebar div.c-form (estudiar.unir.net lead form). The cleaned
 * DOM has lost input type/name/required attributes, so the type is inferred
 * from the control id/class and "required" from the presence of an
 * .error-msg-required message in the field group.
 *
 * No "action" row is authored on purpose: the source endpoint must not be
 * reused, so the migrated form never submits to the source site.
 *
 * Skipped controls: unnamed hidden tracking inputs, the read-only phone
 * prefix / "nine" inputs and the conditional "Área" phone input (hidden
 * unless a specific country is chosen).
 */
const SKIP_IDS = ['prefix', 'phone-area', 'automatricula'];
const TYPE_BY_ID = { email: 'email', phone: 'tel' };

function cleanText(el) {
  if (!el) return '';
  return el.textContent.replace(/\s+/g, ' ').trim();
}

function para(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function isRequired(group) {
  return !!group.querySelector('.error-msg-required');
}

/* Copy inline content (text + links) of a source node into a new <p>. */
function inlineCopy(document, nodes) {
  const p = document.createElement('p');
  nodes.forEach((node) => {
    if (node.nodeType === 3) {
      p.append(node.textContent.replace(/\s+/g, ' '));
    } else if (node.nodeType === 1 && node.tagName === 'A') {
      const a = document.createElement('a');
      a.href = node.getAttribute('href') || '';
      a.textContent = cleanText(node);
      p.append(a);
    } else if (node.nodeType === 1 && node.tagName !== 'BR') {
      p.append(cleanText(node));
    }
  });
  p.innerHTML = p.innerHTML.replace(/^\s+|\s+$/g, '').replace(/\s{2,}/g, ' ');
  return p.textContent.trim() ? p : null;
}

/* Split a <label> holding "<br><br>"-separated text into paragraphs. */
function paragraphsFrom(document, el) {
  const out = [];
  let chunk = [];
  const flush = () => {
    const p = inlineCopy(document, chunk);
    if (p) out.push(p);
    chunk = [];
  };
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === 1 && node.tagName === 'BR') flush();
    else chunk.push(node);
  });
  flush();
  return out;
}

export default function parse(element, { document, params }) {
  const cells = [];
  const row = (label, type, options = '', required = false) => {
    cells.push([label, type, options, required ? 'yes' : '']);
  };

  // Highlights above the form ("Plazas limitadas", ...).
  const highlights = [...element.querySelectorAll('.c-accelerators__text')].map(cleanText).filter(Boolean);
  if (highlights.length) {
    const ul = document.createElement('ul');
    highlights.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      ul.append(li);
    });
    row(ul, 'info');
  }

  const form = element.querySelector('form') || element;

  const heading = cleanText(form.querySelector('.cmp-title__text, h1, h2, h3'));
  if (heading) row(heading, 'heading');

  // Field groups in document order: selects, text inputs, consent checkbox.
  const groups = form.querySelectorAll('.c-form__select-group, .c-form__group, fieldset.checkbox__fieldset');
  groups.forEach((group) => {
    const select = group.querySelector('select');
    const input = group.querySelector('input');
    const control = select || input;
    if (!control) return;
    const id = control.getAttribute('id') || '';
    if (!id || SKIP_IDS.includes(id)) return;
    if (group.classList.contains('input-hidden')) return;

    if (id === 'gdpr' || group.matches('fieldset')) {
      const text = group.querySelector('.checkbox__checkbox-text');
      const p = text ? inlineCopy(document, [...text.childNodes]) : null;
      if (p) row(p, 'consent', '', true);
      return;
    }

    const label = cleanText(group.querySelector('.form-label, label'));
    if (!label) return;
    const required = isRequired(group);

    if (select) {
      const options = [...select.querySelectorAll('option')].map(cleanText).filter(Boolean);
      if (options.length) {
        const ul = document.createElement('ul');
        options.forEach((text) => {
          const li = document.createElement('li');
          li.textContent = text;
          ul.append(li);
        });
        row(label, 'select', ul, required);
      } else {
        // Options are filled at runtime from the selected area (study type,
        // program title); author a free-text field instead of an empty select.
        row(label, 'text', '', required);
      }
      return;
    }

    // The source's "required" hint (e.g. "Escribe tu nombre") becomes the placeholder.
    const hint = cleanText(group.querySelector('.error-msg-required'));
    row(label, TYPE_BY_ID[id] || 'text', hint, required);
  });

  // Privacy notice below the consent checkbox.
  const policies = form.querySelector('.c-form__policies-label');
  if (policies) {
    const paragraphs = paragraphsFrom(document, policies);
    if (paragraphs.length) row(paragraphs, 'info');
  }

  const submit = form.querySelector('#submitcontactform, .c-form__button button, button[type="submit"]');
  const submitLabel = cleanText(submit);
  if (submitLabel) row(submitLabel, 'submit');

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
