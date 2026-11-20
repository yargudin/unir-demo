/* eslint-disable */
/* global WebImporter */

/**
 * UNIR cleanup transformer.
 * Removes non-authorable chrome (header, footer, cookie banner, modals,
 * floating contact button), tiny-slider runtime artifacts and
 * scripts/styles, and normalises default-content headings.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Global chrome and overlays that would otherwise be matched by parsers.
    WebImporter.DOMUtils.remove(element, [
      'header.header.js-datalayer',
      '#footer',
      '#consent_blackbar',
      'div.modal',
      '#modalVideo',
      '#modalImage',
      '#modalSearch',
      '#modalInfoForm',
      '#modalTelf',
      '#modalDirectory',
      'div.contact-button--telf',
    ]);

    // tiny-slider artifacts: cloned slides duplicate real content.
    WebImporter.DOMUtils.remove(element, [
      '.tns-slide-cloned',
      '.tns-liveregion',
      '.tns-nav',
      '.tns-controls',
    ]);

    // Obfuscated links: UNIR stores some hrefs base64-encoded in data-decode
    // (decoded client-side by js-decode). Restore the real href.
    element.querySelectorAll('[data-decode]').forEach((el) => {
      const href = (el.getAttribute('href') || '').trim();
      if (href && href !== '#') return;
      try {
        const decoded = atob(el.getAttribute('data-decode').trim());
        if (/^(https?:)?\/\//i.test(decoded) || decoded.startsWith('/')) el.setAttribute('href', decoded);
      } catch (e) { /* not base64: leave as is */ }
    });

    // Default content fix: div.heading--h2 is a visual h2.
    const doc = element.ownerDocument || element;
    element.querySelectorAll('div.heading--h2').forEach((div) => {
      const h2 = doc.createElement('h2');
      h2.innerHTML = div.innerHTML;
      div.replaceWith(h2);
    });
  }

  if (hookName === 'afterTransform') {
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'iframe[src=""]',
    ]);

    // Strip tracking / inline handler attributes.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (/^data-(gtm|ga|track|analytics|datalayer)/i.test(attr.name) || /^on[a-z]+$/i.test(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}
