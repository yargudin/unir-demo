/* eslint-disable */
/* global WebImporter */

import heroGradientParser from './parsers/hero-gradient.js';
import accordionProgramsParser from './parsers/accordion-programs.js';
import quotePortraitParser from './parsers/quote-portrait.js';
import cardsIconFeatureParser from './parsers/cards-icon-feature.js';
import columnsStatParser from './parsers/columns-stat.js';
import cardsRecognitionParser from './parsers/cards-recognition.js';
import cardsNewsParser from './parsers/cards-news.js';
import formParser from './parsers/form.js';
import cleanupTransformer from './transformers/landing-cleanup.js';
import sectionsTransformer from './transformers/landing-sections.js';

const PAGE_TEMPLATE = {
  "name": "landing",
  "urls": [
    "https://estudiar.unir.net/landings/es_es/edu_der_pol_seg_emp_art_hum_mba_com_ing_dis_sal_soc_mus_idi-gen-mas_exu_prg_cur-ofi_tpr-noa-estes-donde-estes-unir-sitio/"
  ],
  "representativeUrl": "https://estudiar.unir.net/landings/es_es/edu_der_pol_seg_emp_art_hum_mba_com_ing_dis_sal_soc_mus_idi-gen-mas_exu_prg_cur-ofi_tpr-noa-estes-donde-estes-unir-sitio/",
  "description": "UNIR study landing page",
  "blocks": [
    {
      "name": "hero-gradient",
      "instances": [
        "div.c-hero"
      ]
    },
    {
      "name": "accordion-programs",
      "instances": [
        "div.distributiveFilter div.c-filter"
      ]
    },
    {
      "name": "quote-portrait",
      "instances": [
        "div.c-testimonies-carousel"
      ]
    },
    {
      "name": "cards-icon-feature",
      "instances": [
        "section.m-card-block div.m-card-block__cards"
      ]
    },
    {
      "name": "columns-stat",
      "instances": [
        "div.c-highlighted-data"
      ]
    },
    {
      "name": "cards-recognition",
      "instances": [
        "section.c-recognitions div.c-recognitions__container > div.c-recognitions__grid"
      ]
    },
    {
      "name": "cards-news",
      "instances": [
        "div.c-sections main.c-sections__main"
      ]
    },
    {
      "name": "form",
      "instances": [
        "div.l-sidebar div.c-form"
      ]
    }
  ],
  "urlPattern": "/landings/es_es/*",
  "sections": [
    {
      "id": "s1",
      "name": "Hero",
      "selector": [
        "div.c-hero"
      ],
      "style": null,
      "blocks": [
        "hero-gradient"
      ],
      "defaultContent": []
    },
    {
      "id": "s2",
      "name": "Tu postgrado donde, cuando y como tú quieras",
      "selector": [
        "div.c-textandmedia.c-textandmedia--right"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "div.c-textandmedia.c-textandmedia--right"
      ]
    },
    {
      "id": "s3",
      "name": "Study areas accordion",
      "selector": [
        "div.distributiveFilter"
      ],
      "style": null,
      "blocks": [
        "accordion-programs"
      ],
      "defaultContent": []
    },
    {
      "id": "s4",
      "name": "Te lo ponemos fácil",
      "selector": [
        "div.aem-Grid--12 > div.c-textandmedia:nth-of-type(3)",
        "#container-1d639a69c2 > div.aem-Grid.aem-Grid--12 > div.c-textandmedia:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "div.aem-Grid--12 > div.c-textandmedia:nth-of-type(3)"
      ]
    },
    {
      "id": "s5",
      "name": "Testimonial",
      "selector": [
        "div.c-testimonies-carousel"
      ],
      "style": null,
      "blocks": [
        "quote-portrait"
      ],
      "defaultContent": []
    },
    {
      "id": "s6",
      "name": "Trabajamos en tu mejora profesional",
      "selector": [
        "div.iconographic-carousel-target"
      ],
      "style": null,
      "blocks": [
        "cards-icon-feature"
      ],
      "defaultContent": [
        "section.m-card-block header.m-card-block__header"
      ]
    },
    {
      "id": "s7",
      "name": "Salidas profesionales",
      "selector": [
        "div.aem-Grid--12 > div.c-textandmedia:nth-of-type(6)",
        "#container-1d639a69c2 > div.aem-Grid.aem-Grid--12 > div.c-textandmedia:nth-of-type(6)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "div.aem-Grid--12 > div.c-textandmedia:nth-of-type(6)"
      ]
    },
    {
      "id": "s8",
      "name": "Highlighted data",
      "selector": [
        "div.cmp-experiencefragment--datos-destacados"
      ],
      "style": "light-blue",
      "blocks": [
        "columns-stat"
      ],
      "defaultContent": []
    },
    {
      "id": "s9",
      "name": "UNIR, la universidad en línea nº1 del mundo en español",
      "selector": [
        "div.cmp-experiencefragment--la-universidad-en-linea-n-1"
      ],
      "style": "light-grey",
      "blocks": [
        "cards-recognition"
      ],
      "defaultContent": [
        "section.c-recognitions header.c-recognitions__header"
      ]
    },
    {
      "id": "s10",
      "name": "UNIR, entre la élite universitaria",
      "selector": [
        "div.cmp-experiencefragment--secciones"
      ],
      "style": null,
      "blocks": [
        "cards-news"
      ],
      "defaultContent": [
        "div.c-sections header.c-sections__header"
      ]
    },
    {
      "id": "s11",
      "name": "Lead form sidebar",
      "selector": [
        "div.l-sidebar div.c-form"
      ],
      "style": null,
      "blocks": [
        "form"
      ],
      "defaultContent": []
    }
  ]
};

// User-chosen document path for this landing (instead of the long source path).
const PAGE_PATHS = {
  'https://estudiar.unir.net/landings/es_es/edu_der_pol_seg_emp_art_hum_mba_com_ing_dis_sal_soc_mus_idi-gen-mas_exu_prg_cur-ofi_tpr-noa-estes-donde-estes-unir-sitio': '/landings/estudia-donde-estes',
};

const parsers = {
  'hero-gradient': heroGradientParser,
  'accordion-programs': accordionProgramsParser,
  'quote-portrait': quotePortraitParser,
  'cards-icon-feature': cardsIconFeatureParser,
  'columns-stat': columnsStatParser,
  'cards-recognition': cardsRecognitionParser,
  'cards-news': cardsNewsParser,
  'form': formParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
// Page corrections (landing-page-corrections.js, when it exists) run last.
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

const pageKey = (u) => {
  try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
  catch { return u; }
};

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
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

export default {
  preprocess: (payload) => {
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
    // Template metadata: EDS adds it as a body class (body.landing) so landing-only styles stay scoped.
    const metaTable = [...main.querySelectorAll('table')].reverse()
      .find((t) => /^metadata$/i.test((t.querySelector('th, td')?.textContent || '').trim()));
    if (metaTable) {
      const row = document.createElement('tr');
      row.innerHTML = `<td>Template</td><td>${PAGE_TEMPLATE.name}</td>`;
      (metaTable.querySelector('tbody') || metaTable).append(row);
    }
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = PAGE_PATHS[pageKey(params.originalURL)] || new URL(params.originalURL).pathname
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
