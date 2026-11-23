/*
 * Lead form block.
 *
 * Authoring (one row per field):
 *   | Label (append * for required) | Type | Options / placeholder | Required |
 * Types: text (default), email, tel, number, date, textarea, select, radio,
 *   checkbox, consent, hidden, heading, info, submit, success, action.
 * - select/radio: options as a list or comma/semicolon/newline separated.
 * - consent: required checkbox whose label keeps authored links.
 * - action: link (or URL text) in the second/third cell = endpoint to POST to.
 * - success: message shown after a successful submission.
 * A single-cell row holding a link to a .json sheet loads fields from it
 * (columns: Name, Label, Type, Options, Mandatory, Placeholder).
 * Without an authored action the form never sends data to any endpoint.
 *
 * Rendering details:
 * - labels float over the controls (wrapper gets .form-filled once it has a value);
 * - an info row holding only a list renders as a highlights band (.form-highlights);
 * - a long info row (legal text) is clamped with a "Ver más" toggle (.form-legal);
 * - tel fields get a read-only country prefix: a "+NN" token in the options cell,
 *   else the "phone-prefix" page metadata, else DEFAULT_PHONE_PREFIX;
 * - a province/state select right after a country select shares its row.
 */

import { getMetadata } from '../../scripts/aem.js';

const DEFAULT_PHONE_PREFIX = '+34';
const COUNTRY_NAME = /^(pais|country)$/;
const REGION_NAME = /^(provincia|province|estado|state|region|comunidad)$/;

const TYPES = ['text', 'email', 'tel', 'number', 'date', 'textarea', 'select', 'radio',
  'checkbox', 'consent', 'hidden', 'heading', 'info', 'submit', 'success', 'action'];

let idCounter = 0;
let nameCounter = 0;

function fallbackName() {
  nameCounter += 1;
  return `field-${nameCounter}`;
}

function toName(str, fallback) {
  const name = (str || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return name || fallback;
}

function isTruthy(value) {
  return /^(true|yes|y|x|si|sí|required|mandatory|obligatorio|\*)$/i.test((value || '').trim());
}

function splitOptions(cell) {
  if (!cell) return [];
  const items = cell.querySelectorAll('li');
  if (items.length) return [...items].map((li) => li.textContent.trim()).filter(Boolean);
  const paragraphs = cell.querySelectorAll('p');
  const text = paragraphs.length > 1
    ? [...paragraphs].map((p) => p.textContent).join('\n')
    : cell.textContent;
  return text.split(/[\n,;]/).map((s) => s.trim()).filter(Boolean);
}

function parseOptions(value) {
  return (value || '').split(/[\n,;]/).map((s) => s.trim()).filter(Boolean);
}

/* Normalised field: { type, name, label, labelNodes, options, placeholder, required, value } */
function fieldFromRow(row) {
  const cells = [...row.children];
  const [labelCell, typeCell, optionsCell, requiredCell] = cells;
  const rawLabel = labelCell ? labelCell.textContent.trim() : '';
  let type = typeCell ? typeCell.textContent.trim().toLowerCase() : '';
  if (!TYPES.includes(type)) type = 'text';
  const required = rawLabel.endsWith('*') || isTruthy(requiredCell?.textContent);
  const label = rawLabel.replace(/\s*\*$/, '');
  const field = {
    type,
    label,
    labelNodes: labelCell ? [...labelCell.childNodes] : [],
    name: toName(label, fallbackName()),
    required,
    options: [],
    placeholder: '',
    value: '',
  };
  if (['select', 'radio'].includes(type)) field.options = splitOptions(optionsCell);
  else if (type === 'action') {
    const link = (typeCell?.querySelector('a') || optionsCell?.querySelector('a'));
    field.value = link ? link.href : (optionsCell?.textContent.trim() || '');
  } else if (type === 'success') {
    field.labelNodes = optionsCell && optionsCell.textContent.trim()
      ? [...optionsCell.childNodes] : field.labelNodes;
  } else if (type === 'hidden') field.value = optionsCell?.textContent.trim() || '';
  else field.placeholder = optionsCell?.textContent.trim() || '';
  if (type === 'tel') {
    const match = field.placeholder.match(/^\s*(\+\d{1,4})\b\s*/);
    if (match) {
      [, field.prefix] = match;
      field.placeholder = field.placeholder.slice(match[0].length);
    }
  }
  return field;
}

function fieldFromSheet(rowData) {
  const get = (...keys) => {
    const key = Object.keys(rowData).find((k) => keys.includes(k.toLowerCase()));
    return key ? String(rowData[key] ?? '') : '';
  };
  let type = get('type').toLowerCase() || 'text';
  if (!TYPES.includes(type)) type = 'text';
  const label = get('label', 'field');
  return {
    type,
    label,
    labelNodes: [document.createTextNode(label)],
    name: get('name') || toName(label, fallbackName()),
    required: isTruthy(get('mandatory', 'required')),
    options: parseOptions(get('options')),
    placeholder: get('placeholder'),
    value: type === 'action' ? get('options', 'value') : get('value'),
  };
}

function wrap(field, control, labelFirst = true) {
  const wrapper = document.createElement('div');
  // form-float: the label floats over the control
  wrapper.className = `form-field form-float form-${field.type}-field`;
  const label = document.createElement('label');
  label.htmlFor = control.id;
  label.className = 'form-label';
  label.textContent = field.label;
  if (field.required) wrapper.classList.add('form-required');
  if (labelFirst) wrapper.append(label, control);
  else wrapper.append(control, label);
  return wrapper;
}

function buildControl(field) {
  idCounter += 1;
  const id = `form-${field.name}-${idCounter}`;

  switch (field.type) {
    case 'heading': {
      const h = document.createElement('h3');
      h.className = 'form-heading';
      field.labelNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') h.append(...node.childNodes);
        else h.append(node);
      });
      return h;
    }
    case 'info': {
      const div = document.createElement('div');
      div.className = 'form-info';
      div.append(...field.labelNodes);
      const elements = [...div.children];
      const onlyList = elements.length === 1 && ['UL', 'OL'].includes(elements[0].tagName)
        && !div.textContent.replace(elements[0].textContent, '').trim();
      if (onlyList) {
        div.classList.add('form-highlights');
        return div;
      }
      if (div.querySelectorAll('p').length > 1 || div.textContent.trim().length > 280) {
        div.classList.add('form-legal');
        div.id = `${id}-legal`;
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'form-legal-toggle';
        toggle.setAttribute('aria-controls', div.id);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Ver más';
        toggle.addEventListener('click', () => {
          const expanded = div.classList.toggle('form-legal-expanded');
          toggle.setAttribute('aria-expanded', String(expanded));
          toggle.textContent = expanded ? 'Ver menos' : 'Ver más';
        });
        div.append(toggle);
      }
      return div;
    }
    case 'submit': {
      const btn = document.createElement('button');
      btn.type = 'submit';
      btn.className = 'form-submit';
      btn.textContent = field.label || 'Enviar';
      const div = document.createElement('div');
      div.className = 'form-field form-submit-field';
      div.append(btn);
      return div;
    }
    case 'hidden': {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = field.name;
      input.value = field.value;
      return input;
    }
    case 'textarea': {
      const ta = document.createElement('textarea');
      ta.id = id;
      ta.name = field.name;
      ta.required = field.required;
      if (field.placeholder) ta.placeholder = field.placeholder;
      return wrap(field, ta);
    }
    case 'select': {
      const select = document.createElement('select');
      select.id = id;
      select.name = field.name;
      select.required = field.required;
      // empty first option: the floating label stands in for the placeholder
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = '';
      placeholder.disabled = field.required;
      placeholder.selected = true;
      select.append(placeholder);
      field.options.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.append(option);
      });
      return wrap(field, select);
    }
    case 'radio': {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'form-field form-radio-field';
      const legend = document.createElement('legend');
      legend.textContent = field.label;
      fieldset.append(legend);
      field.options.forEach((opt, i) => {
        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `${id}-${i}`;
        input.name = field.name;
        input.value = opt;
        input.required = field.required;
        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = opt;
        const row = document.createElement('div');
        row.append(input, label);
        fieldset.append(row);
      });
      return fieldset;
    }
    case 'checkbox':
    case 'consent': {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = id;
      input.name = field.name;
      input.value = 'true';
      input.required = field.type === 'consent' || field.required;
      const wrapper = document.createElement('div');
      wrapper.className = `form-field form-${field.type}-field`;
      const label = document.createElement('label');
      label.htmlFor = id;
      label.className = 'form-label';
      // keep authored links (privacy policy) in the label
      const nodes = field.labelNodes.length
        ? field.labelNodes
        : [document.createTextNode(field.label)];
      nodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') label.append(...node.childNodes);
        else label.append(node);
      });
      wrapper.append(input, label);
      return wrapper;
    }
    default: {
      const input = document.createElement('input');
      input.type = ['email', 'tel', 'number', 'date'].includes(field.type) ? field.type : 'text';
      input.id = id;
      input.name = field.name;
      input.required = field.required;
      if (field.placeholder) input.placeholder = field.placeholder;
      const autocomplete = {
        email: 'email', tel: 'tel', nombre: 'given-name', name: 'given-name', apellidos: 'family-name',
      }[field.type === 'text' ? field.name : field.type];
      if (autocomplete) input.autocomplete = autocomplete;
      const wrapper = wrap(field, input);
      if (field.type !== 'tel') return wrapper;

      // read-only country dial prefix shown beside the phone number
      const prefixValue = field.prefix || getMetadata('phone-prefix') || DEFAULT_PHONE_PREFIX;
      const prefix = document.createElement('input');
      prefix.type = 'text';
      prefix.readOnly = true;
      prefix.tabIndex = -1;
      prefix.id = `${id}-prefix`;
      prefix.name = `${field.name}-prefix`;
      prefix.value = prefixValue;
      const prefixField = wrap({ type: 'prefix', label: 'Prefijo', required: false }, prefix);
      const row = document.createElement('div');
      row.className = 'form-row form-tel-row';
      row.append(prefixField, wrapper);
      return row;
    }
  }
}

/* keeps .form-filled on a field wrapper while its control has a value (floating label) */
function trackFilled(form) {
  const update = (control) => {
    const wrapper = control.closest('.form-field');
    if (!wrapper || ['checkbox', 'radio', 'hidden'].includes(control.type)) return;
    wrapper.classList.toggle('form-filled', control.value !== '');
  };
  form.querySelectorAll('input, select, textarea').forEach(update);
  ['input', 'change'].forEach((evt) => form.addEventListener(evt, (e) => update(e.target)));
  form.addEventListener('reset', () => {
    setTimeout(() => form.querySelectorAll('input, select, textarea').forEach(update));
  });
}

/* a province/state select directly after a country select shares its row */
function pairRegionWithCountry(form) {
  form.querySelectorAll(':scope > .form-select-field').forEach((field) => {
    const select = field.querySelector('select');
    const next = field.nextElementSibling;
    const nextSelect = next?.classList.contains('form-select-field') && next.querySelector('select');
    if (!select || !nextSelect) return;
    if (!COUNTRY_NAME.test(select.name) || !REGION_NAME.test(nextSelect.name)) return;
    const row = document.createElement('div');
    row.className = 'form-row';
    field.before(row);
    row.append(field, next);
  });
}

async function loadSheetFields(href) {
  try {
    const resp = await fetch(href);
    if (!resp.ok) return [];
    const json = await resp.json();
    const rows = json.data || json[Object.keys(json).find((k) => json[k]?.data)]?.data || [];
    return rows.map(fieldFromSheet);
  } catch (e) {
    return [];
  }
}

function isSafeEndpoint(value) {
  if (!value) return false;
  try {
    const url = new URL(value, window.location.href);
    return url.protocol === 'https:' || url.origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

export default async function decorate(block) {
  // anchor target for in-page CTAs such as "Solicita información" (href="#form")
  if (!block.id && !document.getElementById('form')) block.id = 'form';
  const rows = [...block.children];
  let fields = [];

  // A lone link to a .json definition loads the fields from a sheet.
  const sheetRow = rows.find((row) => {
    const a = row.querySelector('a');
    return row.children.length === 1 && a && /\.json(\?|$)/.test(a.href);
  });
  if (sheetRow) fields = await loadSheetFields(sheetRow.querySelector('a').href);

  rows.forEach((row) => {
    if (row === sheetRow) return;
    if (!row.textContent.trim() && !row.querySelector('a')) return;
    fields.push(fieldFromRow(row));
  });

  const form = document.createElement('form');
  form.className = 'form-form';
  form.noValidate = false;

  let action = '';
  let successNodes = null;
  let hasSubmit = false;

  fields.forEach((field) => {
    if (field.type === 'action') {
      action = field.value;
      return;
    }
    if (field.type === 'success') {
      successNodes = field.labelNodes;
      return;
    }
    if (field.type === 'submit') hasSubmit = true;
    form.append(buildControl(field));
  });

  if (!hasSubmit) form.append(buildControl({ type: 'submit', label: 'Enviar', labelNodes: [] }));
  pairRegionWithCountry(form);
  trackFilled(form);

  const status = document.createElement('div');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.hidden = true;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const submit = form.querySelector('[type="submit"]');
    if (submit) submit.disabled = true;
    const data = Object.fromEntries(new FormData(form).entries());

    let ok = true;
    if (isSafeEndpoint(action)) {
      try {
        const resp = await fetch(action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        });
        ok = resp.ok;
      } catch (err) {
        ok = false;
      }
    }

    status.hidden = false;
    status.classList.toggle('form-status-error', !ok);
    status.replaceChildren();
    if (ok) {
      if (successNodes && successNodes.length) {
        status.append(...successNodes.map((n) => n.cloneNode(true)));
      } else {
        status.textContent = 'Gracias. Hemos recibido tu solicitud.';
      }
      form.reset();
      form.hidden = true;
    } else {
      status.textContent = 'No se ha podido enviar el formulario. Inténtalo de nuevo.';
    }
    if (submit) submit.disabled = false;
  });

  block.replaceChildren(form, status);
}
