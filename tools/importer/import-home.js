/* eslint-disable */
/* global WebImporter */

import carouselHeroParser from './parsers/carousel-hero.js';
import widgetParser from './parsers/widget.js';
import cardsStudyTilesParser from './parsers/cards-study-tiles.js';
import cardsAreaLinksParser from './parsers/cards-area-links.js';
import cardsFeaturedParser from './parsers/cards-featured.js';
import cardsEventParser from './parsers/cards-event.js';
import cardsProgramSliderParser from './parsers/cards-program-slider.js';
import cardsNewsParser from './parsers/cards-news.js';
import cardsPressParser from './parsers/cards-press.js';
import cardsIconFeatureParser from './parsers/cards-icon-feature.js';
import cardsVideoParser from './parsers/cards-video.js';
import cleanupTransformer from './transformers/unir-cleanup.js';
import sectionsTransformer from './transformers/unir-sections.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://www.unir.net/"
  ],
  "representativeUrl": "https://www.unir.net/",
  "description": "UNIR homepage",
  "blocks": [
    {
      "name": "carousel-hero",
      "instances": [
        "body > main > div.container > section.slider.hero--slider-half"
      ]
    },
    {
      "name": "widget",
      "instances": [
        "#up139"
      ]
    },
    {
      "name": "cards-study-tiles",
      "instances": [
        "body > main > div.container > section.l-to-edge.-padding-vertical--element div.distributor-block"
      ]
    },
    {
      "name": "cards-area-links",
      "instances": [
        "body > main > div.container > div.row--content-small div.row.-padding-vertical--element"
      ]
    },
    {
      "name": "cards-featured",
      "instances": [
        "body > main > div.container > section.l-to-edge.-bg-neutral-light.-padding-vertical--block:not(.card) div.row--small-gap"
      ]
    },
    {
      "name": "cards-event",
      "instances": [
        "body > main > div.container > section.-margin-top--block div.card--event"
      ]
    },
    {
      "name": "cards-program-slider",
      "instances": [
        "body > main > div.container > section.l-to-edge.-bg-neutral-light.card div.js-cards-filter"
      ]
    },
    {
      "name": "cards-news",
      "instances": [
        "body > main > div.container > div.card.row--no-gap.-border-top:nth-of-type(4)",
        "body > main > div.container > div.card.row--no-gap.-border-top:nth-of-type(7)",
        "body > main > div.container > div.card.row--no-gap.-border-top:nth-of-type(10)"
      ]
    },
    {
      "name": "cards-press",
      "instances": [
        "body > main > div.container > div.card.row--no-gap.-border-top:nth-of-type(11)"
      ]
    },
    {
      "name": "cards-icon-feature",
      "instances": [
        "body > section.panel-icons"
      ]
    },
    {
      "name": "cards-video",
      "instances": [
        "body > section.slider"
      ]
    }
  ],
  "urlPattern": "/",
  "sections": [
    {
      "id": "section-1",
      "name": "Hero slider",
      "selector": [
        "body > main > div.container > section.slider.hero--slider-half"
      ],
      "style": null,
      "blocks": [
        "carousel-hero"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Course finder",
      "selector": [
        "#up139"
      ],
      "style": null,
      "blocks": [
        "widget"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "Study type tiles",
      "selector": [
        "body > main > div.container > section.l-to-edge.-padding-vertical--element"
      ],
      "style": null,
      "blocks": [
        "cards-study-tiles"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Oferta académica por áreas de estudio",
      "selector": [
        "body > main > div.container > div.row--content-small"
      ],
      "style": null,
      "blocks": [
        "cards-area-links"
      ],
      "defaultContent": [
        "body > main > div.container > div.row--content-small div.heading--h2",
        "body > main > div.container > div.-margin-bottom--segment"
      ]
    },
    {
      "id": "section-5",
      "name": "Destacados",
      "selector": [
        "body > main > div.container > section.l-to-edge.-bg-neutral-light.-padding-vertical--block:not(.card)"
      ],
      "style": "light-grey",
      "blocks": [
        "cards-featured"
      ],
      "defaultContent": [
        "body > main > div.container > section.l-to-edge.-bg-neutral-light.-padding-vertical--block:not(.card) div.heading--h2"
      ]
    },
    {
      "id": "section-6",
      "name": "Próximos eventos en directo",
      "selector": [
        "body > main > div.container > section.-margin-top--block"
      ],
      "style": null,
      "blocks": [
        "cards-event"
      ],
      "defaultContent": [
        "body > main > div.container > section.-margin-top--block > h2",
        "body > main > div.container > section.-margin-top--block > a.link--icon-after"
      ]
    },
    {
      "id": "section-7",
      "name": "Descubre los principales títulos",
      "selector": [
        "body > main > div.container > section.l-to-edge.-bg-neutral-light.card"
      ],
      "style": "light-grey",
      "blocks": [
        "cards-program-slider"
      ],
      "defaultContent": [
        "body > main > div.container > section.l-to-edge.-bg-neutral-light.card h2"
      ]
    },
    {
      "id": "section-8",
      "name": "Actualidad académica",
      "selector": [
        "body > main > div.container > div.editor.-margin-top--block.-margin-bottom--element:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [
        "cards-news"
      ],
      "defaultContent": [
        "body > main > div.container > div.editor.-margin-top--block.-margin-bottom--element:nth-of-type(3)",
        "body > main > div.container > div.editor.-margin-bottom--block.-margin-top--element:nth-of-type(5)"
      ]
    },
    {
      "id": "section-9",
      "name": "Investigación",
      "selector": [
        "body > main > div.container > div.editor.-margin-top--block.-margin-bottom--element:nth-of-type(6)"
      ],
      "style": null,
      "blocks": [
        "cards-news"
      ],
      "defaultContent": [
        "body > main > div.container > div.editor.-margin-top--block.-margin-bottom--element:nth-of-type(6)",
        "body > main > div.container > div.editor.-margin-bottom--block.-margin-top--element:nth-of-type(8)"
      ]
    },
    {
      "id": "section-10",
      "name": "Compromiso social y cultural",
      "selector": [
        "body > main > div.container > div.editor.-margin-top--block.-margin-bottom--element:nth-of-type(9)"
      ],
      "style": null,
      "blocks": [
        "cards-news"
      ],
      "defaultContent": [
        "body > main > div.container > div.editor.-margin-top--block.-margin-bottom--element:nth-of-type(9)"
      ]
    },
    {
      "id": "section-11",
      "name": "UNIR en los medios",
      "selector": [
        "body > main > div.container > article.editor.-margin-top--block.-margin-bottom--block"
      ],
      "style": null,
      "blocks": [
        "cards-press"
      ],
      "defaultContent": [
        "body > main > div.container > article.editor.-margin-top--block.-margin-bottom--block",
        "body > main > div.container > div.editor.-margin-bottom--block.-margin-top--element:nth-of-type(12)"
      ]
    },
    {
      "id": "section-12",
      "name": "Value proposition icons",
      "selector": [
        "body > section.panel-icons"
      ],
      "style": null,
      "blocks": [
        "cards-icon-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "section-13",
      "name": "Video slider",
      "selector": [
        "body > section.slider"
      ],
      "style": null,
      "blocks": [
        "cards-video"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'carousel-hero': carouselHeroParser,
  widget: widgetParser,
  'cards-study-tiles': cardsStudyTilesParser,
  'cards-area-links': cardsAreaLinksParser,
  'cards-featured': cardsFeaturedParser,
  'cards-event': cardsEventParser,
  'cards-program-slider': cardsProgramSliderParser,
  'cards-news': cardsNewsParser,
  'cards-press': cardsPressParser,
  'cards-icon-feature': cardsIconFeatureParser,
  'cards-video': cardsVideoParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
// Page corrections (unir-page-corrections.js, when it exists) run last.
const correctionTransformers = [];
const transformers = [cleanupTransformer, ...lateTransformers, ...correctionTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

// The importer drops text-less inline elements (font icons, empty play links) before transform.
// Copy their values onto attributes of the surrounding items so the parsers can still read them.
const YOUTUBE = /youtube\.com|youtu\.be/i;
function preserveEmptyInlineData(document) {
  document.querySelectorAll('.panel-icons__item').forEach((item) => {
    const icon = item.querySelector('[class*="unir-icon-"]');
    const cls = icon && [...icon.classList].find((c) => c.startsWith('unir-icon-'));
    if (cls) item.setAttribute('data-icon', cls.replace('unir-icon-', ''));
  });
  document.querySelectorAll('.video--cols, body > section.slider .slider__item').forEach((item) => {
    const a = [...item.querySelectorAll('a[href]')].find((el) => YOUTUBE.test(el.getAttribute('href')));
    if (a) item.setAttribute('data-video-url', a.getAttribute('href'));
  });
}

export default {
  preprocess: (payload) => {
    preserveEmptyInlineData(payload.document);
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
