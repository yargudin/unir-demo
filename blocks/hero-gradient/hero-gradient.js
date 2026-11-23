import { createOptimizedPicture } from '../../scripts/aem.js';

function optimizeImages(root, width) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, true, [{ width }]));
  });
}

// Scene7 smart crops the source hero swaps per breakpoint (same media/sizes as the source)
// [media, crop, wid, hei]
const SCENE7_CROPS = [
  ['(max-width: 679px)', '5a2', 735, 294],
  ['(max-width: 959px)', '2a1', 960, 480],
  ['(max-width: 1279px)', '3a1', 1279, 426],
  ['(max-width: 1599px)', '7a2', 1599, 457],
  ['(min-width: 1600px)', '7a2', 1920, 548],
];

function scene7Url(url, [, crop, wid, hei]) {
  const u = new URL(url);
  u.pathname = u.pathname.replace(/:[a-z0-9]+$/i, `:${crop}`);
  u.searchParams.set('wid', wid);
  u.searchParams.set('hei', hei);
  return u.toString();
}

/* Dynamic Media images with a smart crop (".../is/image/...:5a2") get the
   source's art-directed crops so desktop is not an upscaled mobile crop */
function addScene7Sources(picture) {
  const img = picture.querySelector('img');
  if (!img) return;
  let url;
  try {
    url = new URL(img.getAttribute('src'), window.location.href);
  } catch (e) {
    return;
  }
  if (!/scene7\.com$/.test(url.hostname) || !/\/is\/image\/.+:[a-z0-9]+$/i.test(url.pathname)) return;
  picture.querySelectorAll('source').forEach((s) => s.remove());
  SCENE7_CROPS.forEach((c) => {
    const source = document.createElement('source');
    [source.media] = c;
    source.srcset = scene7Url(url, c);
    img.before(source);
  });
}

export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'hero-gradient-media';
  const content = document.createElement('div');
  content.className = 'hero-gradient-content';

  // Authors may put the image in its own row or in the same row as the text.
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic) {
        media.append(pic);
        // keep any text that shared the image cell
        const p = pic.closest('p');
        if (p && !p.textContent.trim() && !p.children.length) p.remove();
      }
      if (cell.textContent.trim() || cell.querySelector('a')) {
        while (cell.firstChild) content.append(cell.firstChild);
      }
    });
  });

  content.querySelectorAll('p:empty').forEach((p) => p.remove());
  content.querySelectorAll('a').forEach((a) => {
    if (a.closest('p') && a.closest('p').textContent.trim() === a.textContent.trim()) {
      a.classList.add('button');
      a.closest('p').classList.add('button-container');
    }
  });

  block.replaceChildren();
  if (media.querySelector('picture')) {
    block.append(media);
    block.classList.add('has-media');
    optimizeImages(media, '2000');
    media.querySelectorAll('picture').forEach(addScene7Sources);
  }
  block.append(content);
}
