/**
 * Press mentions: text-only cards with a title and a "date - outlet" link to
 * the external article. Cells of a row are merged; the first link makes the
 * whole card clickable.
 */
function isExternal(href) {
  try {
    const { hostname } = new URL(href, window.location.href);
    return hostname !== window.location.hostname && hostname !== 'www.unir.net';
  } catch (e) {
    return false;
  }
}

export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim()) return;
    const li = document.createElement('li');
    li.className = 'cards-press-card';
    const body = document.createElement('div');
    body.className = 'cards-press-card-body';
    [...row.children].forEach((cell) => {
      if (cell.textContent.trim()) body.append(...cell.childNodes);
    });
    body.querySelectorAll('picture').forEach((picture) => picture.remove());
    li.append(body);

    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add('cards-press-title');

    const links = [...body.querySelectorAll('a[href]')];
    links.forEach((link) => {
      link.classList.remove('button');
      link.closest('.button-container')?.classList.remove('button-container');
      // press items open in a new tab on the source, including hosted PDFs
      if (isExternal(link.href) || /\.pdf($|[?#])/i.test(link.href)) {
        link.classList.add('cards-press-link-external');
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    });
    const source = links[links.length - 1];
    if (source) {
      source.classList.add('cards-press-source');
      source.closest('p')?.classList.add('cards-press-meta');
      li.classList.add('cards-press-card-linked');
    }
    list.append(li);
  });
  block.replaceChildren(list);
}
