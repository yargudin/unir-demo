/* eslint-disable */
/* global WebImporter */

/**
 * carousel-hero: one row per slide.
 * Cell 1: slide image. Cell 2: H2 title (linked to the slide target) + excerpt.
 * Source: section.slider.hero--slider-half (tiny-slider, gallery mode).
 * Cloned slides (.tns-slide-cloned) are skipped.
 */
function absUrl(url, document) {
  if (!url) return '';
  try {
    return new URL(url, document.baseURI && document.baseURI.startsWith('http') ? document.baseURI : 'https://www.unir.net/').href;
  } catch (e) {
    return url;
  }
}

function imageFrom(scope, document) {
  const src = scope.querySelector('img');
  if (!src) return null;
  let url = src.getAttribute('src') || src.getAttribute('data-src');
  if (!url || url.startsWith('data:')) {
    const srcset = src.getAttribute('srcset') || src.getAttribute('data-srcset')
      || (scope.querySelector('source[srcset]') || { getAttribute: () => '' }).getAttribute('srcset');
    url = srcset ? srcset.split(',')[0].trim().split(/\s+/)[0] : url;
  }
  if (!url) return null;
  const img = document.createElement('img');
  img.src = absUrl(url, document);
  img.alt = src.getAttribute('alt') || '';
  return img;
}

export default function parse(element, { document, params }) {
  const cells = [];
  const slides = [...element.querySelectorAll('article.slider__item')]
    .filter((slide) => !slide.classList.contains('tns-slide-cloned'));

  slides.forEach((slide) => {
    const img = imageFrom(slide.querySelector('.hero__image') || slide, document);
    const titleEl = slide.querySelector('.hero__title, h1, h2, h3');
    const excerptEl = slide.querySelector('.hero__excerpt');
    const linkEl = slide.querySelector('a.hero__action[href]') || slide.querySelector('a[href]');
    const href = linkEl ? absUrl(linkEl.getAttribute('href'), document) : '';

    const content = [];
    if (titleEl && titleEl.textContent.trim()) {
      const h2 = document.createElement('h2');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = titleEl.textContent.trim();
        h2.append(a);
      } else {
        h2.textContent = titleEl.textContent.trim();
      }
      content.push(h2);
    }
    if (excerptEl && excerptEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = excerptEl.textContent.trim();
      content.push(p);
    }
    if (!img && !content.length) return;
    cells.push([img || '', content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
