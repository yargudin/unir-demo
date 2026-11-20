/* eslint-disable */
/* global WebImporter */

/**
 * UNIR sections transformer.
 * Inserts <hr> section breaks in beforeTransform (while parser targets still
 * exist) and Section Metadata blocks for styled sections in afterTransform.
 * Handles sections inside <main> as well as those that are direct children
 * of <body> (section-12 panel-icons, section-13 slider).
 */
const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const doc = root.ownerDocument || root;
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    let el = null;
    try {
      el = doc.querySelector(sel) || root.querySelector(sel);
    } catch (e) {
      el = null;
    }
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;
  const doc = element.ownerDocument || element;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el || !el.parentNode) continue;
      if (i === 0) {
        // Styled first section: temporary marker only, removed in afterTransform.
        if (section.style) {
          const hr = doc.createElement('hr');
          hr.setAttribute(MARKER, section.id);
          el.parentNode.insertBefore(hr, el);
        }
        continue;
      }
      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`)
        || doc.querySelector(`hr[${MARKER}="${section.id}"]`);
      const metadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      if (marker) {
        // Place metadata at the end of this section: before the next <hr>
        // sibling after the marker, or at the end of the parent.
        let next = marker.nextElementSibling;
        let boundary = null;
        while (next) {
          if (next.tagName === 'HR') { boundary = next; break; }
          next = next.nextElementSibling;
        }
        if (boundary) boundary.parentNode.insertBefore(metadata, boundary);
        else marker.parentNode.appendChild(metadata);

        if (i === 0) marker.remove();
        else marker.removeAttribute(MARKER);
      } else {
        const el = findSectionElement(element, section);
        if (el) el.after(metadata);
      }
    }
    // Safety: clear any leftover markers.
    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
  }
}
