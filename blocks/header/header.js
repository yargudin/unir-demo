// media query match that indicates the desktop header layout
const isDesktop = window.matchMedia('(width >= 1200px)');

const CLOSE_DELAY = 150;
const SPLIT_LIST_MIN_ITEMS = 11;

/**
 * Fetches the nav fragment. Metadata-independent dual fetch:
 * /content/nav.plain.html (local preview) first, then /nav.plain.html (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  let base = '/content/';
  if (!resp.ok) {
    resp = await fetch('/nav.plain.html');
    base = '/';
  }
  if (!resp.ok) return null;
  return { html: await resp.text(), base };
}

/**
 * Parses the fragment and resolves relative image paths against the fragment location.
 * @param {string} html fragment markup
 * @param {string} base fragment base path
 * @returns {Element[]} top-level section divs
 */
function parseNav(html, base) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', new URL(src, new URL(base, window.location.origin)).pathname);
    }
  });
  return [...doc.body.children].filter((node) => node.tagName === 'DIV');
}

const directText = (node) => [...node.childNodes]
  .filter((n) => n.nodeType === Node.TEXT_NODE)
  .map((n) => n.textContent)
  .join(' ')
  .replace(/\s+/g, ' ')
  .trim();

function isExternal(a) {
  try {
    const url = new URL(a.href, window.location.href);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function el(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  children.forEach((c) => c && node.append(c));
  return node;
}

/**
 * Builds a titled link group (title + list) from a list item that holds text + nested list.
 * @param {Element} li source list item
 * @param {string} className group class
 */
function buildGroup(li, className) {
  const group = el('div', className);
  const title = directText(li);
  if (title) group.append(el('p', 'nav-megamenu-title', [document.createTextNode(title)]));
  const list = li.querySelector(':scope > ul');
  if (list) {
    const ul = el('ul', 'nav-megamenu-links');
    [...list.children].forEach((item) => {
      const link = item.querySelector(':scope > a');
      if (!link) return;
      if (isExternal(link)) {
        link.classList.add('nav-link-external');
        link.target = '_blank';
        link.rel = 'noopener';
      }
      ul.append(el('li', '', [link]));
    });
    if (ul.children.length >= SPLIT_LIST_MIN_ITEMS) group.classList.add('nav-megamenu-group-split');
    group.append(ul);
  }
  return group;
}

/**
 * Activates one tab inside a tabbed megamenu.
 * @param {Element} layout tab layout container
 * @param {number} index tab index
 */
function activateTab(layout, index) {
  layout.querySelectorAll('.nav-tab').forEach((tab, i) => {
    tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
    tab.closest('li').classList.toggle('is-active', i === index);
  });
  layout.querySelectorAll('.nav-tab-panel').forEach((panel, i) => {
    panel.hidden = i !== index;
  });
}

/**
 * Builds a tabbed layout (vertical tab list + detail column) from tab list items.
 * @param {Element[]} tabItems list items with a label link + nested list
 * @param {string} id unique id prefix
 */
function buildTabs(tabItems, id) {
  const layout = el('div', 'nav-tabs-layout');
  const tabList = el('ul', 'nav-tab-list');
  tabList.setAttribute('role', 'tablist');
  const panels = el('div', 'nav-tab-panels');
  tabItems.forEach((li, i) => {
    const label = li.querySelector(':scope > a');
    const tab = el('button', 'nav-tab', [document.createTextNode(label.textContent.trim())]);
    tab.type = 'button';
    tab.id = `${id}-tab-${i}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${id}-tabpanel-${i}`);
    tab.addEventListener('mouseenter', () => { if (isDesktop.matches) activateTab(layout, i); });
    tab.addEventListener('click', () => activateTab(layout, i));
    tab.addEventListener('focus', () => activateTab(layout, i));
    tabList.append(el('li', '', [tab]));

    const panel = el('div', 'nav-tab-panel');
    panel.id = `${id}-tabpanel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    const nested = li.querySelector(':scope > ul');
    [...(nested ? nested.children : [])].forEach((item) => {
      if (item.querySelector(':scope > ul')) {
        panel.append(buildGroup(item, 'nav-megamenu-group'));
      } else {
        const more = item.querySelector(':scope > a');
        if (more) {
          more.classList.add('nav-tab-more');
          panel.append(more);
        }
      }
    });
    panels.append(panel);
  });
  layout.append(tabList, panels);
  activateTab(layout, 0);
  return layout;
}

/**
 * Builds a megamenu panel from a fragment section (h2 label, optional bottom link, list).
 * @param {Element} section fragment section
 * @param {string} id unique id
 */
function buildMegamenu(section, id) {
  const panel = el('div', 'nav-megamenu');
  panel.id = id;
  const inner = el('div', 'nav-megamenu-inner');
  const list = section.querySelector(':scope > ul');
  const items = list ? [...list.children] : [];
  const tabItems = items.filter((li) => li.querySelector(':scope > a') && li.querySelector(':scope > ul'));
  if (tabItems.length) {
    panel.classList.add('nav-megamenu-tabbed');
    inner.append(buildTabs(tabItems, id));
  } else {
    const columns = el('div', 'nav-megamenu-columns');
    items.forEach((li) => columns.append(buildGroup(li, 'nav-megamenu-group')));
    inner.append(columns);
  }
  panel.append(inner);
  const bottom = section.querySelector(':scope > p > a');
  if (bottom) {
    bottom.classList.add('nav-megamenu-cta');
    panel.append(bottom);
  }
  return panel;
}

const getPanel = (drop) => {
  const id = drop.querySelector(':scope > .nav-trigger')?.getAttribute('aria-controls');
  return id ? drop.closest('nav').querySelector(`#${id}`) : null;
};

/**
 * Horizontally positions an open panel: centred under its trigger, clamped to the nav content box.
 * @param {Element} drop the nav item
 * @param {Element} panel the drop's megamenu panel
 */
function positionPanel(drop, panel) {
  const bar = drop.closest('.nav-bar-inner');
  if (!panel || !bar || !isDesktop.matches) return;
  panel.style.left = '0px';
  const barRect = bar.getBoundingClientRect();
  const dropRect = drop.getBoundingClientRect();
  const { width } = panel.getBoundingClientRect();
  const originLeft = (panel.offsetParent || bar).getBoundingClientRect().left;
  const barStyle = getComputedStyle(bar);
  const minLeft = barRect.left + parseFloat(barStyle.paddingLeft);
  const maxLeft = Math.max(minLeft, barRect.right - parseFloat(barStyle.paddingRight) - width);
  const centred = dropRect.left + dropRect.width / 2 - width / 2;
  const left = Math.min(Math.max(centred, minLeft), maxLeft);
  panel.style.left = `${Math.round(left - originLeft)}px`;
}

function setOpen(nav, drop, open) {
  const trigger = drop.querySelector(':scope > .nav-trigger');
  const panel = getPanel(drop);
  drop.classList.toggle('is-open', open);
  if (panel) {
    // an open panel sits right after its trigger (reading/focus order); closed panels are parked
    // after the trigger list so their links never precede later triggers
    const slot = drop.querySelector(':scope > .nav-megamenu-slot');
    const parking = nav.querySelector('.nav-megamenus');
    if (open && slot && panel.parentElement !== slot) slot.append(panel);
    if (!open && parking && panel.parentElement !== parking) parking.append(panel);
    panel.classList.toggle('is-open', open);
  }
  trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) positionPanel(drop, panel);
  const anyOpen = !!nav.querySelector('.nav-drop.is-open');
  nav.closest('.nav-wrapper').classList.toggle('is-drop-open', anyOpen && isDesktop.matches);
}

function closeAll(nav, except) {
  nav.querySelectorAll('.nav-drop.is-open').forEach((d) => {
    if (d !== except) setOpen(nav, d, false);
  });
}

/**
 * Wires hover (desktop), click and keyboard behaviour on nav items.
 * The trigger and its panel form one hover zone.
 * @param {Element} nav nav element
 */
function wireDrops(nav) {
  nav.querySelectorAll('.nav-drop').forEach((drop) => {
    let timer;
    let hovering = false;
    const trigger = drop.querySelector(':scope > .nav-trigger');
    const panel = getPanel(drop);
    const enter = () => {
      hovering = true;
      if (!isDesktop.matches) return;
      clearTimeout(timer);
      closeAll(nav, drop);
      setOpen(nav, drop, true);
    };
    const leave = () => {
      hovering = false;
      if (!isDesktop.matches) return;
      clearTimeout(timer);
      timer = setTimeout(() => setOpen(nav, drop, false), CLOSE_DELAY);
    };
    [drop, panel].filter(Boolean).forEach((zone) => {
      zone.addEventListener('mouseenter', enter);
      zone.addEventListener('mouseleave', leave);
    });
    trigger.addEventListener('click', () => {
      // a pointer click on an already hover-opened panel keeps it open (as on source)
      const open = (isDesktop.matches && hovering) || !drop.classList.contains('is-open');
      closeAll(nav, drop);
      setOpen(nav, drop, open);
    });
  });
  nav.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('.nav-drop.is-open');
    if (open) {
      setOpen(nav, open, false);
      open.querySelector('.nav-trigger').focus();
    }
  });
  nav.addEventListener('focusout', (e) => {
    if (isDesktop.matches && !nav.contains(e.relatedTarget)) closeAll(nav);
  });
}

function toggleMobileMenu(wrapper, force) {
  const expanded = force !== undefined ? force : !wrapper.classList.contains('is-menu-open');
  wrapper.classList.toggle('is-menu-open', expanded);
  const button = wrapper.querySelector('.nav-hamburger button');
  button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  button.setAttribute('aria-label', expanded ? 'Cerrar menú' : 'Abrir menú');
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
/**
 * Landing template header (body.landing): its own logo-only fragment
 * (/landings/nav), overlaid on the hero. Fixed dual-fetch, local first.
 * @param {Element} block header block
 */
async function decorateLandingHeader(block) {
  let resp = await fetch('/content/landings/nav.plain.html');
  let base = '/content/landings/';
  if (!resp.ok) {
    resp = await fetch('/landings/nav.plain.html');
    base = '/landings/';
  }
  if (!resp.ok) return;
  const sections = parseNav(await resp.text(), base);
  const bar = el('div', 'nav-landing-bar');
  const img = sections.length ? sections[0].querySelector('img') : null;
  if (img) {
    const link = img.closest('a');
    const logo = link || img;
    logo.classList.add('nav-landing-logo');
    if (link && !link.getAttribute('aria-label')) link.setAttribute('aria-label', img.alt || 'Inicio');
    bar.append(logo);
  }
  const nav = el('nav', 'nav-landing', [bar]);
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Principal');
  block.textContent = '';
  block.append(nav);
}

export default async function decorate(block) {
  if (document.body.classList.contains('landing')) {
    await decorateLandingHeader(block);
    return;
  }
  const fragment = await fetchNav();
  if (!fragment) return;
  const sections = parseNav(fragment.html, fragment.base);
  const [brandSection, toolbarSection, mainSection, ...panelSections] = sections;

  // row 0: brand bar (logo + claim link)
  const brand = el('div', 'nav-brand');
  const brandInner = el('div', 'nav-brand-inner');
  if (brandSection) {
    const links = [...brandSection.querySelectorAll('a')];
    const logoLink = links.find((a) => a.querySelector('img'));
    if (logoLink) {
      logoLink.classList.add('nav-logo');
      if (!logoLink.getAttribute('aria-label')) logoLink.setAttribute('aria-label', logoLink.querySelector('img').alt || 'Inicio');
      brandInner.append(logoLink);
    }
    links.filter((a) => a !== logoLink).forEach((a) => {
      a.classList.add('nav-claim');
      brandInner.append(a);
    });
  }
  const hamburger = el('div', 'nav-hamburger');
  const hamburgerButton = el('button', '', [el('span', 'nav-hamburger-icon')]);
  hamburgerButton.type = 'button';
  hamburgerButton.setAttribute('aria-controls', 'nav');
  hamburgerButton.setAttribute('aria-expanded', 'false');
  hamburgerButton.setAttribute('aria-label', 'Abrir menú');
  hamburger.append(hamburgerButton);
  brandInner.append(hamburger);
  brand.append(brandInner);

  // row 1: utility toolbar
  const toolbar = el('div', 'nav-toolbar');
  const toolbarInner = el('div', 'nav-toolbar-inner');
  const toolList = toolbarSection && toolbarSection.querySelector('ul');
  if (toolList) {
    toolList.classList.add('nav-toolbar-links');
    toolList.querySelectorAll('a').forEach((a) => {
      if (isExternal(a)) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
    });
    toolbarInner.append(toolList);
  }
  toolbar.append(toolbarInner);

  // row 2: main nav bar (megamenu triggers + CTA) — the <nav> landmark, as on source
  const nav = el('nav', 'nav-bar');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Principal');
  const barInner = el('div', 'nav-bar-inner');
  const sectionsList = el('ul', 'nav-sections nav-list');
  const panelsByLabel = new Map();
  panelSections.forEach((s) => {
    const h = s.querySelector('h2, h3');
    if (h) panelsByLabel.set(h.textContent.trim().toLowerCase(), s);
  });
  const mainList = mainSection && mainSection.querySelector('ul');
  const panels = [];
  [...(mainList ? mainList.children : [])].forEach((li, i) => {
    const existingLink = li.querySelector(':scope > a');
    const label = (existingLink ? existingLink.textContent : directText(li)).trim();
    const item = el('li', 'nav-item');
    const panelSection = panelsByLabel.get(label.toLowerCase()) || panelSections[i];
    if (panelSection) {
      item.classList.add('nav-drop');
      const trigger = el('button', 'nav-trigger', [document.createTextNode(label)]);
      trigger.type = 'button';
      trigger.setAttribute('aria-expanded', 'false');
      const panel = buildMegamenu(panelSection, `nav-megamenu-${i}`);
      trigger.setAttribute('aria-controls', panel.id);
      item.append(trigger, el('div', 'nav-megamenu-slot'));
      panels.push(panel);
    } else if (existingLink) {
      existingLink.classList.add('nav-trigger');
      item.append(existingLink);
    }
    sectionsList.append(item);
  });
  // panels follow all triggers in DOM order (keeps trigger labels first in reading order)
  barInner.append(sectionsList, el('div', 'nav-megamenus', panels));
  const cta = mainSection && mainSection.querySelector(':scope > p a');
  if (cta) {
    cta.classList.add('nav-cta-button');
    barInner.append(el('div', 'nav-cta', [cta]));
  }
  nav.append(barInner);
  const backdrop = el('div', 'nav-backdrop');
  backdrop.addEventListener('mouseenter', () => closeAll(nav));
  backdrop.addEventListener('click', () => closeAll(nav));

  const navWrapper = el('div', 'nav-wrapper', [brand, toolbar, nav, backdrop]);
  block.textContent = '';
  block.append(navWrapper);

  wireDrops(nav);
  hamburgerButton.addEventListener('click', () => toggleMobileMenu(navWrapper));

  // compact fixed header on scroll (source switches to a fixed, condensed bar)
  const onScroll = () => {
    const threshold = block.closest('header')?.offsetHeight || 152;
    navWrapper.classList.toggle('is-fixed', isDesktop.matches && window.scrollY > threshold);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    closeAll(nav);
    toggleMobileMenu(navWrapper, false);
    navWrapper.classList.remove('is-drop-open');
    nav.querySelectorAll('.nav-megamenu').forEach((p) => { p.style.left = ''; });
    onScroll();
  });
}
