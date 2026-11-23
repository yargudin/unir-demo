/* eslint-disable */
/* global WebImporter */

/**
 * UNIR landing (estudiar.unir.net) sections transformer.
 * Driven by payload.template.sections (selectors are arrays tried in order).
 *
 * beforeTransform:
 *   - moves the sidebar lead form (div.l-sidebar div.c-form) to the end of
 *     the main content so it becomes the final section;
 *   - inserts <hr> section breaks before every non-first section, marking
 *     the breaks of styled sections with a temporary data-excat-section-id.
 * afterTransform:
 *   - inserts Section Metadata blocks for styled sections and removes the
 *     temporary markers.
 */

const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) { /* invalid selector: try next */ }
  }
  return null;
}

function moveSidebarFormToEnd(root) {
  const form = root.querySelector('div.l-sidebar div.c-form');
  if (!form) return;
  const mainGrid = root.querySelector('div.l-main div.aem-Grid--12')
    || root.querySelector('div.l-main');
  if (!mainGrid) return;
  // Move the whole sidebar wrapper (not just the form) so the form block
  // parser selector "div.l-sidebar div.c-form" still matches afterwards.
  const sidebar = form.closest('div.l-sidebar');
  mainGrid.append(sidebar || form);
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const doc = element.ownerDocument || element;

  if (hookName === 'beforeTransform') {
    // Resolve all section elements first (before the sidebar form is moved
    // out of div.l-sidebar, and before inserted <hr> elements could affect
    // :nth-of-type based selectors).
    const resolved = sections.map((section) => findSectionElement(element, section));

    moveSidebarFormToEnd(element);

    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = resolved[i];
      if (!el) continue;
      const isFirst = resolved.slice(0, i).every((prev) => !prev);
      if (isFirst && !section.style) continue;
      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      if (isFirst) hr.setAttribute('data-excat-first-section', 'true');
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (!marker) continue;
      // Section Metadata may sit anywhere in its section: place it right
      // after the section break (marker) that opens it.
      const metadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      marker.after(metadata);
      if (marker.hasAttribute('data-excat-first-section')) marker.remove();
      else marker.removeAttribute(MARKER);
    }
  }
}
