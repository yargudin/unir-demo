let panelCount = 0;

/**
 * Fetches the footer fragment. Metadata-independent on purpose:
 * /content first (local preview), then the site root (DA/EDS production).
 * @returns {Promise<{ body: HTMLElement, base: string } | null>}
 */
async function fetchFooterFragment() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  // DOMParser yields an inert document, so relative media is not requested
  // against the page URL before it is rebased on the fragment URL below.
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return { body: doc.body, base: resp.url || new URL('/footer.plain.html', window.location).href };
}

/**
 * Rebases relative img/source URLs on the fragment URL so the footer renders
 * on every page, not only on pages that sit next to the fragment.
 * @param {Element} root fragment root
 * @param {string} base fragment URL
 */
function rebaseMedia(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    img.setAttribute('src', new URL(img.getAttribute('src'), base).href);
    img.loading = 'lazy';
  });
  root.querySelectorAll('source[srcset]').forEach((source) => {
    const srcset = source.getAttribute('srcset')
      .split(',')
      .map((entry) => {
        const [url, ...descriptor] = entry.trim().split(/\s+/);
        return [new URL(url, base).href, ...descriptor].join(' ');
      })
      .join(', ');
    source.setAttribute('srcset', srcset);
  });
}

/**
 * @param {Element} section fragment section
 * @returns {boolean} true when the section only holds images
 */
function isMediaOnly(section) {
  const children = [...section.children];
  return children.length > 0 && children.every((child) => child.querySelector('img')
    && !child.textContent.trim());
}

/**
 * Opens or closes one mobile accordion column.
 * @param {HTMLAnchorElement} toggle accordion toggle
 * @param {boolean} expanded new state
 */
function setExpanded(toggle, expanded) {
  toggle.setAttribute('aria-expanded', String(expanded));
  const panel = toggle.closest('.footer-col').querySelector('.footer-col-panel');
  if (panel) panel.classList.toggle('is-open', expanded);
}

/**
 * Builds a static column: heading paragraph followed by the group content.
 * @param {Node[]} headingNodes heading content
 * @param {Element[]} content group content (lists, paragraphs)
 * @returns {HTMLElement}
 */
function buildStaticColumn(headingNodes, content) {
  const column = document.createElement('div');
  column.className = 'footer-col';
  const heading = document.createElement('p');
  heading.className = 'footer-col-heading';
  heading.append(...headingNodes);
  column.append(heading, ...content);
  return column;
}

/**
 * Builds the mobile accordion version of a column (same links, collapsible).
 * @param {Node[]} headingNodes heading content
 * @param {Element[]} content group content
 * @param {string} panelId id of the collapsible panel
 * @returns {HTMLElement}
 */
function buildAccordionColumn(headingNodes, content, panelId) {
  const column = document.createElement('div');
  column.className = 'footer-col footer-col-mobile';
  const toggle = document.createElement('a');
  toggle.className = 'footer-acc-toggle';
  toggle.href = `#${panelId}`;
  toggle.setAttribute('role', 'button');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', panelId);
  const icon = document.createElement('span');
  icon.className = 'footer-acc-icon';
  icon.setAttribute('aria-hidden', 'true');
  toggle.append(...headingNodes, icon);

  const panel = document.createElement('div');
  panel.className = 'footer-col-panel';
  panel.id = panelId;
  const inner = document.createElement('div');
  inner.className = 'footer-col-panel-inner';
  content.filter((node) => node.tagName === 'UL').forEach((list) => list.classList.add('footer-acc-list'));
  inner.append(...content);
  panel.append(inner);
  column.append(toggle, panel);

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    setExpanded(toggle, toggle.getAttribute('aria-expanded') !== 'true');
  });
  toggle.addEventListener('keydown', (e) => {
    if (e.key !== ' ') return;
    e.preventDefault();
    toggle.click();
  });
  return column;
}

/**
 * Builds the link band: content before the first heading becomes the brand
 * column; each heading plus the content up to the next heading is a group.
 * h1/h2 groups render twice, like the source: a static column for desktop and
 * a collapsible accordion for mobile. h3+ groups stay open at every width.
 * @param {Element} section fragment section
 * @returns {HTMLElement}
 */
function buildLinkBand(section) {
  const band = document.createElement('div');
  band.className = 'footer-links';
  const brand = document.createElement('div');
  brand.className = 'footer-brand';
  const groups = [];

  [...section.children].forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) {
      groups.push({ heading: node, content: [] });
    } else if (groups.length) {
      if (node.tagName === 'UL') node.classList.add('footer-list');
      groups[groups.length - 1].content.push(node);
    } else {
      brand.append(node);
    }
  });

  if (brand.children.length) band.append(brand);
  groups.forEach(({ heading, content }) => {
    if (heading.tagName === 'H1' || heading.tagName === 'H2') {
      const desktop = buildStaticColumn(
        [...heading.cloneNode(true).childNodes],
        content.map((node) => node.cloneNode(true)),
      );
      desktop.classList.add('footer-col-desktop');
      panelCount += 1;
      band.append(
        desktop,
        buildAccordionColumn([...heading.childNodes], content, `footer-panel-${panelCount}`),
      );
    } else {
      band.append(buildStaticColumn([...heading.childNodes], content));
    }
  });
  return band;
}

/**
 * Builds a band that only holds images (logos, badges).
 * @param {Element} section fragment section
 * @returns {HTMLElement}
 */
function buildMediaBand(section) {
  const band = document.createElement('div');
  band.className = 'footer-logos';
  section.querySelectorAll('picture, img').forEach((media) => {
    if (media.tagName === 'IMG' && media.closest('picture')) return;
    media.classList.add('footer-logo-item');
    band.append(media);
  });
  // expose each badge's intrinsic width so CSS can cap it per breakpoint
  band.querySelectorAll('img').forEach((img) => {
    const applySize = () => {
      if (img.naturalWidth) img.style.setProperty('--intrinsic-width', `${img.naturalWidth}px`);
    };
    if (img.complete) applySize();
    else img.addEventListener('load', applySize, { once: true });
  });
  return band;
}

/**
 * Derives a platform name from a link host, e.g. www.facebook.com -> facebook.
 * @param {HTMLAnchorElement} link
 * @returns {string}
 */
function platformFromLink(link) {
  try {
    const host = new URL(link.href).hostname.replace(/^(www|m)\./, '');
    return host.split('.')[0];
  } catch {
    return '';
  }
}

/**
 * Builds the bottom band: lists become the social icon row, paragraphs the
 * copyright. Link text stays as the accessible name (visually hidden).
 * @param {Element} section fragment section
 * @returns {HTMLElement}
 */
function buildBottomBand(section) {
  const band = document.createElement('div');
  band.className = 'footer-bottom';
  [...section.children].forEach((node) => {
    if (node.tagName === 'UL') {
      node.classList.add('footer-social');
      // inline icon row: drop whitespace between items so spacing is CSS-only
      [...node.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && !n.textContent.trim())
        .forEach((n) => n.remove());
      node.querySelectorAll('a').forEach((link) => {
        const platform = platformFromLink(link);
        const label = document.createElement('span');
        label.className = 'footer-sr-only';
        label.append(...link.childNodes);
        const icon = document.createElement('span');
        icon.className = `footer-social-icon footer-social-${platform}`;
        icon.setAttribute('aria-hidden', 'true');
        link.append(icon, label);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      });
    } else if (node.tagName === 'P') {
      node.classList.add('footer-copyright');
    }
    band.append(node);
  });
  return band;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooterFragment();
  if (!fragment) return;
  const { body, base } = fragment;
  rebaseMedia(body, base);

  block.textContent = '';
  const container = document.createElement('div');
  container.className = 'footer-container';

  [...body.children].filter((el) => el.tagName === 'DIV').forEach((section) => {
    if (section.querySelector('h1, h2, h3, h4, h5, h6')) {
      container.append(buildLinkBand(section));
    } else if (isMediaOnly(section)) {
      container.append(buildMediaBand(section));
    } else {
      container.append(buildBottomBand(section));
    }
  });

  block.append(container);
}
