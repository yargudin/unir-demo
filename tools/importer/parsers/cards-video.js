/* eslint-disable */
/* global WebImporter */

/**
 * cards-video: one row per video.
 * Cell 1: poster image. Cell 2: title paragraph + YouTube link.
 * Source: section.slider (tiny-slider) with div.video--cols.slider__item
 * units: figure > picture poster, figcaption > a.gtm_video_play (YouTube href,
 * no text) + p.video__title. Cloned slides are skipped.
 *
 * NOTE: the play anchor has no text, so the importer's preProcess
 * (reviewInlineElement) removes it before parsers run. The URL is read from
 * (1) the anchor when still present, (2) a data-video-url attribute an
 * import-script preprocess hook may set on the item, (3) a known
 * title -> URL map for the UNIR home page.
 */
const KNOWN_VIDEOS = {
  'la fuerza que necesitas': 'https://www.youtube.com/watch?v=J7qkH95Pa8E&t=5s',
  'graduación logroño 2025': 'https://youtu.be/9rB-qhx1do4',
  'acompañamiento personalizado': 'https://youtu.be/Pxuaw-rHDFo?si=V1B_zONTlDlGp_nk',
};

const YT = /(youtube\.com|youtu\.be|youtube-nocookie\.com)/i;

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

function videoUrl(item, title) {
  const anchor = [...item.querySelectorAll('a[href]')].find((a) => YT.test(a.getAttribute('href')));
  if (anchor) return anchor.getAttribute('href');
  const holder = [item, ...item.querySelectorAll('[data-video-url], [data-video], [data-src], [data-url]')];
  for (const el of holder) {
    for (const attr of ['data-video-url', 'data-video', 'data-src', 'data-url']) {
      const value = el.getAttribute(attr);
      if (value && YT.test(value)) return value;
    }
  }
  return KNOWN_VIDEOS[title.toLowerCase()] || '';
}

export default function parse(element, { document, params }) {
  const cells = [];
  let items = [...element.querySelectorAll('.video--cols')];
  if (!items.length) items = [...element.querySelectorAll('.slider__item')];
  items = items.filter((item) => !item.classList.contains('tns-slide-cloned'));

  items.forEach((item) => {
    const img = imageFrom(item.querySelector('figure') || item, document);
    const title = cleanText(item.querySelector('.video__title, h2, h3, p'));
    const href = videoUrl(item, title);
    const body = [];
    if (title) {
      const p = document.createElement('p');
      p.textContent = title;
      body.push(p);
    }
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = href;
      p.append(a);
      body.push(p);
    }
    if (!img && !body.length) return;
    cells.push([img || '', body.length ? body : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-video', cells });
  element.replaceWith(block);
}
