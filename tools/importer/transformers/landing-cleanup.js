/* eslint-disable */
/* global WebImporter */

/**
 * UNIR landing (estudiar.unir.net, AEM-built) cleanup transformer.
 * Removes non-authorable chrome (header XF, footer XF, cookie banner,
 * sticky CTA bar, contact/video modals), repairs malformed <picture>
 * markup, normalises Scene7 image URLs and strips scripts/styles/tracking.
 */

const SCENE7_HOST = /^https?:\/\/s7g10\.scene7\.com\//i;

function normalizeScene7(src) {
  if (!src || !SCENE7_HOST.test(src)) return src;
  try {
    const url = new URL(src);
    const isImage = url.pathname.includes('/is/image/');
    const wid = url.searchParams.get('wid');
    const hei = url.searchParams.get('hei');
    url.search = '';
    if (isImage) {
      // Keep the authored size only: forcing a width pads small assets (logos) onto a
      // transparent canvas instead of scaling them.
      if (wid) url.searchParams.set('wid', wid);
      if (wid && hei) url.searchParams.set('hei', hei);
      url.searchParams.set('fmt', 'png-alpha');
    }
    return url.toString();
  } catch (e) {
    return src;
  }
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Global chrome and overlays (page-structure.json "excluded").
    WebImporter.DOMUtils.remove(element, [
      'div.experiencefragment.header-component',
      'div.c-header.c-header--logo-title',
      'div.footerxf.experiencefragment',
      '#consent_blackbar',
      'div.c-sticky-buttons',
      'div.distributivecontactformmodalef.experiencefragment',
      'div.c-modal-contact-form',
      'div.c-modal-video',
    ]);

    // Malformed picture markup: empty <source> elements wrap the <img>.
    // Unwrap them so the <img> stays a direct child of <picture>.
    [...element.querySelectorAll('picture source')].reverse().forEach((source) => {
      if (!source.getAttribute('srcset')) {
        source.replaceWith(...source.childNodes);
      }
    });

    // Scene7 images: absolute URL, drop runtime params, keep a sane width.
    element.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src');
      const normalized = normalizeScene7(src);
      if (normalized !== src) img.setAttribute('src', normalized);
    });
  }

  if (hookName === 'afterTransform') {
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'iframe[src=""]',
      '.js-loader',
    ]);

    // Strip tracking / data-layer / inline handler attributes.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (/^data-(cmp-|gtm|ga|track|analytics|datalayer)/i.test(attr.name) || /^on[a-z]+$/i.test(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}
