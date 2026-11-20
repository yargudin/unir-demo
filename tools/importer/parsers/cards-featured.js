/* eslint-disable */
/* global WebImporter */

/**
 * cards-featured: one row per card.
 * Cell 1: image (optional). Cell 2: title (H3, the source also uses H1 here),
 * optional description, CTA link in its own paragraph.
 * Source: div.row--small-gap with article.card__item cards. Some CTAs are
 * obfuscated anchors (a.js-decode with base64 data-decode and no href).
 */
function absUrl(url, document) {
  if (!url) return '';
  try {
    return new URL(url, document.baseURI && document.baseURI.startsWith('http') ? document.baseURI : 'https://www.unir.net/').href;
  } catch (e) {
    return url;
  }
}

function cleanText(el) {
  if (!el) return '';
  const clone = el.cloneNode(true);
  clone.querySelectorAll('style, script, noscript').forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function imageFrom(scope, document) {
  const src = scope.querySelector('img');
  if (!src) return null;
  let url = src.getAttribute('src') || src.getAttribute('data-src');
  if (!url || url.startsWith('data:')) {
    const source = scope.querySelector('source[srcset]');
    const srcset = src.getAttribute('srcset') || src.getAttribute('data-srcset') || (source && source.getAttribute('srcset'));
    url = srcset ? srcset.split(',')[0].trim().split(/\s+/)[0] : url;
  }
  if (!url) return null;
  const img = document.createElement('img');
  img.src = absUrl(url, document);
  img.alt = src.getAttribute('alt') || '';
  return img;
}

function decodeBase64(value) {
  try {
    const bin = atob(value);
    try {
      return decodeURIComponent(escape(bin));
    } catch (e) {
      return bin;
    }
  } catch (e) {
    return '';
  }
}

function linkHref(a) {
  if (!a) return '';
  const href = a.getAttribute('href');
  if (href && !href.startsWith('#') && !href.startsWith('javascript:')) return href;
  const encoded = a.getAttribute('data-decode');
  return encoded ? decodeBase64(encoded) : '';
}

export default function parse(element, { document, params }) {
  const cells = [];
  element.querySelectorAll('article.card__item').forEach((card) => {
    const figure = card.querySelector('.card__figure');
    const img = figure ? imageFrom(figure, document) : null;

    const body = [];
    const titleEl = card.querySelector('.card__title, h1, h2, h3, h4');
    const title = cleanText(titleEl);
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      body.push(h3);
    }
    const content = card.querySelector('.card__content');
    if (content) {
      content.querySelectorAll(':scope > p').forEach((p) => {
        const text = cleanText(p);
        if (!text) return;
        const para = document.createElement('p');
        para.textContent = text;
        body.push(para);
      });
    }
    const ctaEl = card.querySelector('.card__footer a') || card.querySelector('a[href], a[data-decode]');
    const ctaText = cleanText(ctaEl);
    if (ctaEl && ctaText) {
      const href = linkHref(ctaEl);
      const p = document.createElement('p');
      if (href) {
        const a = document.createElement('a');
        a.href = absUrl(href, document);
        a.textContent = ctaText;
        p.append(a);
      } else {
        p.textContent = ctaText;
      }
      body.push(p);
    }

    if (!img && !body.length) return;
    cells.push([img || '', body.length ? body : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-featured', cells });
  element.replaceWith(block);
}
