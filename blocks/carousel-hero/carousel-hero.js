import { createOptimizedPicture } from '../../scripts/aem.js';

// source slider: 7s per slide, shown as a progress ring on the active dot
const AUTOPLAY_DELAY = 7000;
let carouselId = 0;

/**
 * Replaces same-origin, non-SVG pictures with optimized ones.
 * Remote (not yet uploaded) and SVG images keep their authored picture.
 * @param {Element} root Element to search
 * @param {boolean} eagerFirst Load the first image eagerly (LCP)
 */
function optimizePictures(root, eagerFirst) {
  root.querySelectorAll('picture > img').forEach((img, idx) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(
      img.src,
      img.alt,
      eagerFirst && idx === 0,
      [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }],
    ));
  });
}

function setActive(block, index) {
  const slides = [...block.querySelectorAll('.carousel-hero-slide')];
  block.dataset.activeSlide = index;
  slides.forEach((slide, idx) => {
    const active = idx === index;
    slide.setAttribute('aria-hidden', !active);
    slide.querySelectorAll('a, button').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });
  block.querySelectorAll('.carousel-hero-dot button').forEach((button, idx) => {
    if (idx === index) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
}

function showSlide(block, index) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  if (!slides.length) return;
  const target = ((index % slides.length) + slides.length) % slides.length;
  const track = block.querySelector('.carousel-hero-slides');
  track.scrollTo({ top: 0, left: slides[target].offsetLeft, behavior: 'smooth' });
  setActive(block, target);
}

/**
 * Autoplay is driven by the active dot's progress ring (a CSS animation):
 * when the ring completes, the next slide is shown. Pausing the carousel
 * pauses the ring, so the progress indicator and the timing never drift.
 */
function bindAutoplay(block) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let hovered = false;
  let focused = false;
  const update = () => {
    block.classList.toggle('is-paused', hovered || focused || document.hidden);
  };

  block.addEventListener('mouseenter', () => { hovered = true; update(); });
  block.addEventListener('mouseleave', () => { hovered = false; update(); });
  // pause for keyboard users only; a mouse click on a dot must not stop autoplay
  block.addEventListener('focusin', (e) => {
    focused = e.target.matches(':focus-visible');
    update();
  });
  block.addEventListener('focusout', (e) => {
    if (!block.contains(e.relatedTarget)) { focused = false; update(); }
  });
  document.addEventListener('visibilitychange', update);

  block.addEventListener('animationend', (e) => {
    if (e.animationName !== 'carousel-hero-spinner') return;
    if (!e.target.closest('.carousel-hero-dot button[aria-current="true"]')) return;
    showSlide(block, (parseInt(block.dataset.activeSlide, 10) || 0) + 1);
  });

  block.style.setProperty('--carousel-hero-duration', `${AUTOPLAY_DELAY}ms`);
  block.classList.add('is-autoplay');
}

function createSpinner() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'carousel-hero-spinner');
  svg.setAttribute('viewBox', '0 0 40 40');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', '20');
  circle.setAttribute('cy', '20');
  circle.setAttribute('r', '18');
  svg.append(circle);
  return svg;
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-hero-dot button').forEach((button, idx) => {
    button.addEventListener('click', () => showSlide(block, idx));
  });

  // keep dots in sync with manual swipes/scrolls
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActive(block, parseInt(entry.target.dataset.slideIndex, 10));
      }
    });
  }, { root: block.querySelector('.carousel-hero-slides'), threshold: 0.6 });
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => observer.observe(slide));

  bindAutoplay(block);
}

function createSlide(row, index, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-hero-slide';
  slide.dataset.slideIndex = index;
  slide.id = `carousel-hero-${id}-slide-${index}`;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');

  const cells = [...row.children];
  // authors may swap or omit cells: detect the image cell instead of trusting position
  const imageCell = cells.find((cell) => cell.querySelector('picture') && !cell.querySelector('h1, h2, h3, h4, h5, h6, p:not(:has(picture))'));
  const contentCells = cells.filter((cell) => cell !== imageCell && cell.textContent.trim());

  const content = document.createElement('div');
  content.className = 'carousel-hero-slide-content';
  contentCells.forEach((cell) => content.append(...cell.childNodes));
  if (content.childNodes.length) slide.append(content);

  if (imageCell) {
    imageCell.className = 'carousel-hero-slide-image';
    slide.append(imageCell);
  } else {
    slide.classList.add('carousel-hero-slide-no-image');
  }

  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    if (!heading.id) heading.id = `${slide.id}-title`;
    slide.setAttribute('aria-labelledby', heading.id);
  }
  return slide;
}

export default function decorate(block) {
  carouselId += 1;
  const rows = [...block.children].filter((row) => row.textContent.trim() || row.querySelector('picture'));
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.id = block.id || `carousel-hero-${carouselId}`;

  const track = document.createElement('ul');
  track.className = 'carousel-hero-slides';
  rows.forEach((row, idx) => track.append(createSlide(row, idx, carouselId)));

  const container = document.createElement('div');
  container.className = 'carousel-hero-slides-container';
  container.append(track);

  const nodes = [container];
  if (rows.length > 1) {
    const nav = document.createElement('nav');
    nav.className = 'carousel-hero-dots-nav';
    nav.setAttribute('aria-label', 'Carousel slide controls');
    const dots = document.createElement('ol');
    dots.className = 'carousel-hero-dots';
    rows.forEach((_, idx) => {
      const dot = document.createElement('li');
      dot.className = 'carousel-hero-dot';
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-controls', `carousel-hero-${carouselId}-slide-${idx}`);
      button.setAttribute('aria-label', `Show slide ${idx + 1} of ${rows.length}`);
      button.append(createSpinner());
      dot.append(button);
      dots.append(dot);
    });
    nav.append(dots);
    nodes.push(nav);
  }

  block.replaceChildren(...nodes);
  optimizePictures(block, true);
  setActive(block, 0);
  if (rows.length > 1) bindEvents(block);
}
