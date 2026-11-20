/* eslint-disable */
/* global WebImporter */

/**
 * cards-news: one row per article.
 * Cell 1: image (optional). Cell 2: optional caption paragraph, H3 title linked
 * to the article, excerpt paragraph.
 * Source: div.card.row--no-gap with .card__item units, which are <article> in
 * the news instances and <section> in the "proyectos" instance. In the latter
 * the title anchor is obfuscated (a.js-decode without href), so the link falls
 * back to the figure link.
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
  let items = [...element.querySelectorAll(':scope > .card__item')];
  if (!items.length) items = [...element.querySelectorAll('article.card__item, section.card__item')];

  items.forEach((item) => {
    const figure = item.querySelector('.card__figure, figure');
    const img = figure ? imageFrom(figure, document) : null;
    const content = item.querySelector('.card__content') || item;
    const body = [];

    const caption = cleanText(content.querySelector('.card__caption-text'));
    if (caption) {
      const p = document.createElement('p');
      p.textContent = caption;
      body.push(p);
    }

    const titleEl = content.querySelector('h1, h2, h3, h4');
    const title = cleanText(titleEl);
    if (title) {
      const titleAnchor = titleEl.querySelector('a');
      const href = linkHref(titleAnchor) || linkHref(figure && figure.querySelector('a'));
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = absUrl(href, document);
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      body.push(h3);
    }

    [...content.querySelectorAll(':scope > p')]
      .filter((p) => !p.classList.contains('card__caption-text'))
      .forEach((p) => {
        const text = cleanText(p);
        if (!text) return;
        const para = document.createElement('p');
        para.textContent = text;
        body.push(para);
      });

    if (!img && !body.length) return;
    cells.push([img || '', body.length ? body : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
