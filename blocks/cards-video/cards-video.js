import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Returns the YouTube video id and start time for a YouTube URL, or null.
 * Handles watch?v=, youtu.be/, /embed/ and /shorts/ forms, plus t= / start=.
 */
function parseYouTube(href) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch (e) {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, '');
  let id = null;
  if (host === 'youtu.be') {
    [id] = url.pathname.slice(1).split('/');
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/);
      if (match) [, id] = match;
    }
  }
  if (!id || !/^[\w-]{6,}$/.test(id)) return null;

  const t = url.searchParams.get('t') || url.searchParams.get('start') || '';
  // "5s", "1m30s" or "90"
  const parts = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  const start = parts
    ? (parseInt(parts[1] || 0, 10) * 3600) + (parseInt(parts[2] || 0, 10) * 60)
      + parseInt(parts[3] || 0, 10)
    : 0;
  return { id, start };
}

function buildDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'cards-video-dialog';
  dialog.setAttribute('closedby', 'any');
  dialog.setAttribute('aria-label', 'Video');

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'cards-video-dialog-close';
  close.setAttribute('aria-label', 'Close');
  close.addEventListener('click', () => dialog.close());

  const frame = document.createElement('div');
  frame.className = 'cards-video-dialog-frame';
  dialog.append(close, frame);

  // light-dismiss fallback where closedby is unsupported (Safari)
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside = rect.top <= event.clientY && event.clientY <= rect.bottom
        && rect.left <= event.clientX && event.clientX <= rect.right;
      if (!inside) dialog.close();
    });
  }

  // stop playback when the dialog closes
  dialog.addEventListener('close', () => {
    frame.replaceChildren();
    document.body.classList.remove('cards-video-modal-open');
  });
  return dialog;
}

function openVideo(dialog, video, title) {
  const frame = dialog.querySelector('.cards-video-dialog-frame');
  const iframe = document.createElement('iframe');
  const params = new URLSearchParams({ autoplay: '1', rel: '0' });
  if (video.start) params.set('start', video.start);
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?${params}`;
  iframe.title = title || 'YouTube video';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  frame.replaceChildren(iframe);
  dialog.setAttribute('aria-label', title || 'Video');
  document.body.classList.add('cards-video-modal-open');
  dialog.showModal();
}

/**
 * Prev/next buttons for the one-tile-per-view mobile track (hidden by CSS once all
 * tiles fit). Wraps around at either end, like the source slider.
 */
function buildControls(list) {
  const controls = document.createElement('div');
  controls.className = 'cards-video-controls';
  [['prev', 'Previous video', -1], ['next', 'Next video', 1]].forEach(([name, label, dir]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `cards-video-${name}`;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', () => {
      const max = list.scrollWidth - list.clientWidth;
      let left = list.scrollLeft + dir * list.clientWidth;
      if (dir > 0 && list.scrollLeft >= max - 2) left = 0;
      if (dir < 0 && list.scrollLeft <= 2) left = max;
      list.scrollTo({ left, behavior: 'smooth' });
    });
    controls.append(button);
  });
  return controls;
}

export default function decorate(block) {
  const dialog = buildDialog();
  const list = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-video-card';
    let poster;
    const body = document.createElement('div');
    body.className = 'cards-video-card-body';
    [...row.children].forEach((cell) => {
      if (!poster && cell.querySelector('picture') && !cell.textContent.trim()) {
        poster = cell;
        poster.className = 'cards-video-card-poster';
      } else {
        body.append(...cell.childNodes);
      }
    });
    if (poster) li.append(poster);
    li.append(body);

    const links = [...body.querySelectorAll('a[href]')];
    const videoLink = links.find((a) => parseYouTube(a.href)) || links[0];
    const video = videoLink ? parseYouTube(videoLink.href) : null;
    const titleEl = body.querySelector('h1, h2, h3, h4, h5, h6')
      || [...body.querySelectorAll('p')].find((p) => p.textContent.trim() && !p.querySelector('a'));
    const title = titleEl?.textContent.trim()
      || (videoLink && videoLink.textContent.trim() !== videoLink.href ? videoLink.textContent.trim() : '');
    if (titleEl) titleEl.classList.add('cards-video-title');

    if (videoLink) {
      // the link becomes the play control. If its text is the only title, keep that
      // text as the visible title; otherwise drop the link (and an emptied paragraph).
      const holder = videoLink.closest('p');
      if (!titleEl && title) {
        const titleText = document.createElement('p');
        titleText.className = 'cards-video-title';
        titleText.textContent = title;
        const linkOnly = holder && holder.textContent.trim() === videoLink.textContent.trim();
        (linkOnly ? holder : videoLink).replaceWith(titleText);
      } else {
        videoLink.remove();
        if (holder && !holder.textContent.trim()) holder.remove();
      }
    }
    if (!title && !body.textContent.trim()) body.remove();

    if (video) {
      const play = document.createElement('button');
      play.type = 'button';
      play.className = 'cards-video-play';
      play.setAttribute('aria-label', title ? `Play video: ${title}` : 'Play video');
      play.addEventListener('click', () => openVideo(dialog, video, title));
      li.append(play);
    } else if (videoLink) {
      // not a YouTube link: keep it as a plain link over the tile
      videoLink.className = 'cards-video-play';
      videoLink.setAttribute('aria-label', title || videoLink.textContent.trim());
      li.append(videoLink);
    }
    list.append(li);
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  const parts = [list];
  if (list.children.length > 1) parts.push(buildControls(list));
  block.replaceChildren(...parts, dialog);
}
