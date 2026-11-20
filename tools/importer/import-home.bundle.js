/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  function absUrl(url, document) {
    if (!url) return "";
    try {
      return new URL(url, document.baseURI && document.baseURI.startsWith("http") ? document.baseURI : "https://www.unir.net/").href;
    } catch (e) {
      return url;
    }
  }
  function imageFrom(scope, document) {
    const src = scope.querySelector("img");
    if (!src) return null;
    let url = src.getAttribute("src") || src.getAttribute("data-src");
    if (!url || url.startsWith("data:")) {
      const srcset = src.getAttribute("srcset") || src.getAttribute("data-srcset") || (scope.querySelector("source[srcset]") || { getAttribute: () => "" }).getAttribute("srcset");
      url = srcset ? srcset.split(",")[0].trim().split(/\s+/)[0] : url;
    }
    if (!url) return null;
    const img = document.createElement("img");
    img.src = absUrl(url, document);
    img.alt = src.getAttribute("alt") || "";
    return img;
  }
  function parse(element, { document, params }) {
    const cells = [];
    const slides = [...element.querySelectorAll("article.slider__item")].filter((slide) => !slide.classList.contains("tns-slide-cloned"));
    slides.forEach((slide) => {
      const img = imageFrom(slide.querySelector(".hero__image") || slide, document);
      const titleEl = slide.querySelector(".hero__title, h1, h2, h3");
      const excerptEl = slide.querySelector(".hero__excerpt");
      const linkEl = slide.querySelector("a.hero__action[href]") || slide.querySelector("a[href]");
      const href = linkEl ? absUrl(linkEl.getAttribute("href"), document) : "";
      const content = [];
      if (titleEl && titleEl.textContent.trim()) {
        const h2 = document.createElement("h2");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = titleEl.textContent.trim();
          h2.append(a);
        } else {
          h2.textContent = titleEl.textContent.trim();
        }
        content.push(h2);
      }
      if (excerptEl && excerptEl.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = excerptEl.textContent.trim();
        content.push(p);
      }
      if (!img && !content.length) return;
      cells.push([img || "", content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/widget.js
  function parse2(element, { document, params }) {
    const href = "/widgets/course-finder?base=https://www.unir.net";
    const a = document.createElement("a");
    a.href = href;
    a.textContent = href;
    const p = document.createElement("p");
    p.append(a);
    const cells = [[p]];
    const block = WebImporter.Blocks.createBlock(document, { name: "widget", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-study-tiles.js
  function absUrl2(url, document) {
    if (!url) return "";
    try {
      return new URL(url, document.baseURI && document.baseURI.startsWith("http") ? document.baseURI : "https://www.unir.net/").href;
    } catch (e) {
      return url;
    }
  }
  function imageFrom2(scope, document) {
    const src = scope.querySelector("img");
    if (!src) return null;
    let url = src.getAttribute("src") || src.getAttribute("data-src");
    if (!url || url.startsWith("data:")) {
      const source = scope.querySelector("source[srcset]");
      const srcset = src.getAttribute("srcset") || src.getAttribute("data-srcset") || source && source.getAttribute("srcset");
      url = srcset ? srcset.split(",")[0].trim().split(/\s+/)[0] : url;
    }
    if (!url) return null;
    const img = document.createElement("img");
    img.src = absUrl2(url, document);
    img.alt = src.getAttribute("alt") || "";
    return img;
  }
  function cleanText(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll("style, script, noscript").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function titleLink(unit, textScope, tag, document) {
    const text = cleanText(textScope || unit);
    if (!text) return null;
    const link = unit.querySelector("a[href]");
    const el = document.createElement(tag);
    if (link) {
      const a = document.createElement("a");
      a.href = absUrl2(link.getAttribute("href"), document);
      a.textContent = text;
      el.append(a);
    } else {
      el.textContent = text;
    }
    return el;
  }
  function parse3(element, { document, params }) {
    const cells = [];
    const units = element.querySelectorAll(".distributor-block__item, .distributor-block__links li");
    units.forEach((unit) => {
      if (unit.matches(".distributor-block__item")) {
        const img = imageFrom2(unit, document);
        const heading = unit.querySelector(".distributor-block__title, h2, h3, figcaption");
        const title = titleLink(unit, heading, "h2", document);
        if (!img && !title) return;
        cells.push([img || "", title || ""]);
      } else {
        const title = titleLink(unit, unit, "p", document);
        if (title) cells.push(["", title]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-study-tiles", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-area-links.js
  function absUrl3(url, document) {
    if (!url) return "";
    try {
      return new URL(url, document.baseURI && document.baseURI.startsWith("http") ? document.baseURI : "https://www.unir.net/").href;
    } catch (e) {
      return url;
    }
  }
  function cleanText2(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll("style, script, noscript").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function parse4(element, { document, params }) {
    const cells = [];
    element.querySelectorAll("ul > li").forEach((li) => {
      const text = cleanText2(li);
      if (!text) return;
      const link = li.querySelector("a[href]");
      const h4 = document.createElement("h4");
      if (link) {
        const a = document.createElement("a");
        a.href = absUrl3(link.getAttribute("href"), document);
        a.textContent = text;
        h4.append(a);
      } else {
        h4.textContent = text;
      }
      cells.push([h4]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-area-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-featured.js
  function absUrl4(url, document) {
    if (!url) return "";
    try {
      return new URL(url, document.baseURI && document.baseURI.startsWith("http") ? document.baseURI : "https://www.unir.net/").href;
    } catch (e) {
      return url;
    }
  }
  function cleanText3(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll("style, script, noscript").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imageFrom3(scope, document) {
    const src = scope.querySelector("img");
    if (!src) return null;
    let url = src.getAttribute("src") || src.getAttribute("data-src");
    if (!url || url.startsWith("data:")) {
      const source = scope.querySelector("source[srcset]");
      const srcset = src.getAttribute("srcset") || src.getAttribute("data-srcset") || source && source.getAttribute("srcset");
      url = srcset ? srcset.split(",")[0].trim().split(/\s+/)[0] : url;
    }
    if (!url) return null;
    const img = document.createElement("img");
    img.src = absUrl4(url, document);
    img.alt = src.getAttribute("alt") || "";
    return img;
  }
  function decodeBase64(value) {
    try {
      const bin = atob(value);
      try {
        return decodeURIComponent(escape(bin));
      } catch (e) {
        return bin;
      }
    } catch (e) {
      return "";
    }
  }
  function linkHref(a) {
    if (!a) return "";
    const href = a.getAttribute("href");
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) return href;
    const encoded = a.getAttribute("data-decode");
    return encoded ? decodeBase64(encoded) : "";
  }
  function parse5(element, { document, params }) {
    const cells = [];
    element.querySelectorAll("article.card__item").forEach((card) => {
      const figure = card.querySelector(".card__figure");
      const img = figure ? imageFrom3(figure, document) : null;
      const body = [];
      const titleEl = card.querySelector(".card__title, h1, h2, h3, h4");
      const title = cleanText3(titleEl);
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title;
        body.push(h3);
      }
      const content = card.querySelector(".card__content");
      if (content) {
        content.querySelectorAll(":scope > p").forEach((p) => {
          const text = cleanText3(p);
          if (!text) return;
          const para = document.createElement("p");
          para.textContent = text;
          body.push(para);
        });
      }
      const ctaEl = card.querySelector(".card__footer a") || card.querySelector("a[href], a[data-decode]");
      const ctaText = cleanText3(ctaEl);
      if (ctaEl && ctaText) {
        const href = linkHref(ctaEl);
        const p = document.createElement("p");
        if (href) {
          const a = document.createElement("a");
          a.href = absUrl4(href, document);
          a.textContent = ctaText;
          p.append(a);
        } else {
          p.textContent = ctaText;
        }
        body.push(p);
      }
      if (!img && !body.length) return;
      cells.push([img || "", body.length ? body : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-event.js
  function absUrl5(url, document) {
    if (!url) return "";
    try {
      return new URL(url, document.baseURI && document.baseURI.startsWith("http") ? document.baseURI : "https://www.unir.net/").href;
    } catch (e) {
      return url;
    }
  }
  function cleanText4(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll("style, script, noscript").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imageFrom4(scope, document) {
    const src = scope.querySelector("img");
    if (!src) return null;
    let url = src.getAttribute("src") || src.getAttribute("data-src");
    if (!url || url.startsWith("data:")) {
      const source = scope.querySelector("source[srcset]");
      const srcset = src.getAttribute("srcset") || src.getAttribute("data-srcset") || source && source.getAttribute("srcset");
      url = srcset ? srcset.split(",")[0].trim().split(/\s+/)[0] : url;
    }
    if (!url) return null;
    const img = document.createElement("img");
    img.src = absUrl5(url, document);
    img.alt = src.getAttribute("alt") || "";
    return img;
  }
  function sentenceCase(text) {
    const lower = text.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  function parse6(element, { document, params }) {
    const cells = [];
    let units = [...element.querySelectorAll(":scope > div")].filter((d) => d.querySelector(".card__figure, .card__title"));
    if (!units.length) units = [...element.querySelectorAll(".card__figure")].map((f) => f.parentElement);
    units.forEach((unit) => {
      const figure = unit.querySelector(".card__figure") || unit;
      const img = imageFrom4(figure, document);
      const body = [];
      const day = cleanText4(unit.querySelector(".card__day"));
      const month = cleanText4(unit.querySelector(".card__month"));
      const hour = cleanText4(unit.querySelector(".card__hour"));
      const type = cleanText4(unit.querySelector(".card__type"));
      const parts = [];
      const dayMonth = [day, month].filter(Boolean).join(" ");
      if (dayMonth) parts.push(dayMonth);
      if (hour) parts.push(sentenceCase(hour));
      if (type) parts.push(sentenceCase(type));
      if (parts.length) {
        const p = document.createElement("p");
        p.textContent = parts.join(" | ");
        body.push(p);
      }
      const tags = [...unit.querySelectorAll(".card__list li")].map((li) => cleanText4(li)).filter(Boolean);
      if (tags.length) {
        const ul = document.createElement("ul");
        tags.forEach((tag) => {
          const li = document.createElement("li");
          li.textContent = tag;
          ul.append(li);
        });
        body.push(ul);
      }
      const titleEl = unit.querySelector(".card__title, h3, h2");
      const title = cleanText4(titleEl);
      const titleLink2 = titleEl && titleEl.querySelector("a[href]") || figure.querySelector("a[href]");
      if (title) {
        const h3 = document.createElement("h3");
        if (titleLink2) {
          const a = document.createElement("a");
          a.href = absUrl5(titleLink2.getAttribute("href"), document);
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        body.push(h3);
      }
      const text = cleanText4(unit.querySelector(".card__text"));
      if (text) {
        const p = document.createElement("p");
        p.textContent = text;
        body.push(p);
      }
      if (!img && !body.length) return;
      cells.push([img || "", body.length ? body : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-event", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-program-slider.js
  function absUrl6(url, document) {
    if (!url) return "";
    try {
      return new URL(url, document.baseURI && document.baseURI.startsWith("http") ? document.baseURI : "https://www.unir.net/").href;
    } catch (e) {
      return url;
    }
  }
  function cleanText5(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll("style, script, noscript").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imageFrom5(scope, document) {
    const src = scope.querySelector("img");
    if (!src) return null;
    let url = src.getAttribute("src") || src.getAttribute("data-src");
    if (!url || url.startsWith("data:")) {
      const source = scope.querySelector("source[srcset]");
      const srcset = src.getAttribute("srcset") || src.getAttribute("data-srcset") || source && source.getAttribute("srcset");
      url = srcset ? srcset.split(",")[0].trim().split(/\s+/)[0] : url;
    }
    if (!url) return null;
    const img = document.createElement("img");
    img.src = absUrl6(url, document);
    img.alt = src.getAttribute("alt") || "";
    return img;
  }
  var splitList = (value) => (value || "").split(";").map((v) => v.trim()).filter(Boolean);
  function parse7(element, { document, params }) {
    const cells = [];
    const chipNames = {};
    const chipOrder = [];
    element.querySelectorAll("[data-term-id]").forEach((chip) => {
      const id = chip.getAttribute("data-term-id");
      const name = cleanText5(chip);
      if (!id || id === "all" || !name) return;
      chipNames[id] = name;
      chipOrder.push(name);
    });
    let items = [...element.querySelectorAll(".js-cards-filter-item")];
    if (!items.length) items = [...element.querySelectorAll("article.list-comparison__wrapper")];
    items = items.filter((item) => !item.classList.contains("tns-slide-cloned"));
    items.forEach((item) => {
      const img = imageFrom5(item.querySelector(".list-comparison__picture") || item, document);
      const link = item.querySelector("a.list-comparison__content[href]") || item.querySelector("a[href]");
      const href = link ? absUrl6(link.getAttribute("href"), document) : "";
      const body = [];
      const heading = item.querySelector(".list-comparison__heading, h3");
      const titleEl = item.querySelector(".list-comparison__title");
      let eyebrow = "";
      let title = "";
      if (heading) {
        const rest = heading.cloneNode(true);
        rest.querySelectorAll(".list-comparison__title").forEach((n) => n.remove());
        eyebrow = cleanText5(rest);
        title = titleEl ? cleanText5(titleEl) : cleanText5(heading);
        if (!titleEl) eyebrow = "";
      }
      if (eyebrow) {
        const p = document.createElement("p");
        p.textContent = eyebrow;
        body.push(p);
      }
      if (title) {
        const h3 = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        body.push(h3);
      }
      const desc = cleanText5(item.querySelector(".list-comparison__body > p"));
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        body.push(p);
      }
      const props = [...item.querySelectorAll(".list-comparison__property")].map((li) => cleanText5(li)).filter(Boolean);
      if (props.length) {
        const ul = document.createElement("ul");
        props.forEach((text) => {
          const li = document.createElement("li");
          li.textContent = text;
          ul.append(li);
        });
        body.push(ul);
      }
      let areas = splitList(item.getAttribute("data-course-terms-names"));
      if (!areas.length) {
        areas = splitList(item.getAttribute("data-course-terms-ids")).map((id) => chipNames[id]).filter(Boolean);
      }
      areas = [...new Set(areas)].sort((a, b) => {
        const ia = chipOrder.indexOf(a);
        const ib = chipOrder.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      });
      if (!img && !body.length) return;
      cells.push([img || "", body.length ? body : "", areas.join(", ")]);
    });
    const intro = [];
    const introScope = element.querySelector(".list--square") || element;
    introScope.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > p").forEach((el) => {
      const text = cleanText5(el);
      if (!text) return;
      const copy = document.createElement(el.tagName.toLowerCase() === "p" ? "p" : "h2");
      copy.textContent = text;
      intro.push(copy);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-program-slider", cells });
    intro.forEach((el) => element.before(el));
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  function absUrl7(url, document) {
    if (!url) return "";
    try {
      return new URL(url, document.baseURI && document.baseURI.startsWith("http") ? document.baseURI : "https://www.unir.net/").href;
    } catch (e) {
      return url;
    }
  }
  function cleanText6(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll("style, script, noscript").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imageFrom6(scope, document) {
    const src = scope.querySelector("img");
    if (!src) return null;
    let url = src.getAttribute("src") || src.getAttribute("data-src");
    if (!url || url.startsWith("data:")) {
      const source = scope.querySelector("source[srcset]");
      const srcset = src.getAttribute("srcset") || src.getAttribute("data-srcset") || source && source.getAttribute("srcset");
      url = srcset ? srcset.split(",")[0].trim().split(/\s+/)[0] : url;
    }
    if (!url) return null;
    const img = document.createElement("img");
    img.src = absUrl7(url, document);
    img.alt = src.getAttribute("alt") || "";
    return img;
  }
  function decodeBase642(value) {
    try {
      const bin = atob(value);
      try {
        return decodeURIComponent(escape(bin));
      } catch (e) {
        return bin;
      }
    } catch (e) {
      return "";
    }
  }
  function linkHref2(a) {
    if (!a) return "";
    const href = a.getAttribute("href");
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) return href;
    const encoded = a.getAttribute("data-decode");
    return encoded ? decodeBase642(encoded) : "";
  }
  function parse8(element, { document, params }) {
    const cells = [];
    let items = [...element.querySelectorAll(":scope > .card__item")];
    if (!items.length) items = [...element.querySelectorAll("article.card__item, section.card__item")];
    items.forEach((item) => {
      const figure = item.querySelector(".card__figure, figure");
      const img = figure ? imageFrom6(figure, document) : null;
      const content = item.querySelector(".card__content") || item;
      const body = [];
      const caption = cleanText6(content.querySelector(".card__caption-text"));
      if (caption) {
        const p = document.createElement("p");
        p.textContent = caption;
        body.push(p);
      }
      const titleEl = content.querySelector("h1, h2, h3, h4");
      const title = cleanText6(titleEl);
      if (title) {
        const titleAnchor = titleEl.querySelector("a");
        const href = linkHref2(titleAnchor) || linkHref2(figure && figure.querySelector("a"));
        const h3 = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.href = absUrl7(href, document);
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        body.push(h3);
      }
      [...content.querySelectorAll(":scope > p")].filter((p) => !p.classList.contains("card__caption-text")).forEach((p) => {
        const text = cleanText6(p);
        if (!text) return;
        const para = document.createElement("p");
        para.textContent = text;
        body.push(para);
      });
      if (!img && !body.length) return;
      cells.push([img || "", body.length ? body : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-press.js
  function absUrl8(url, document) {
    if (!url) return "";
    try {
      return new URL(url, document.baseURI && document.baseURI.startsWith("http") ? document.baseURI : "https://www.unir.net/").href;
    } catch (e) {
      return url;
    }
  }
  function cleanText7(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll("style, script, noscript").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function parse9(element, { document, params }) {
    const cells = [];
    let items = [...element.querySelectorAll(":scope > .card__item")];
    if (!items.length) items = [...element.querySelectorAll(".card__item")];
    items.forEach((item) => {
      const body = [];
      const title = cleanText7(item.querySelector("h1, h2, h3, h4, .heading--h3"));
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title;
        body.push(h3);
      }
      const content = item.querySelector(".card__content");
      if (content) {
        content.querySelectorAll(":scope > p").forEach((p) => {
          const text = cleanText7(p);
          if (!text) return;
          const para = document.createElement("p");
          para.textContent = text;
          body.push(para);
        });
      }
      item.querySelectorAll(".card__links a").forEach((link) => {
        const text = cleanText7(link);
        const href = link.getAttribute("href");
        if (!text) return;
        const p = document.createElement("p");
        if (href) {
          const a = document.createElement("a");
          a.href = absUrl8(href, document);
          a.textContent = text;
          p.append(a);
        } else {
          p.textContent = text;
        }
        body.push(p);
      });
      if (body.length) cells.push([body]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-press", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-feature.js
  var KNOWN_ICONS = {
    "docencia 100% online": "professor",
    "clases en directo": "screen",
    "mentor - unir": "mentor"
  };
  function cleanText8(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll("style, script, noscript").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function iconName(item, title) {
    const i = item.querySelector('[class*="unir-icon-"]');
    if (i) {
      const cls = [...i.classList].find((c) => c.startsWith("unir-icon-"));
      if (cls) return cls.replace("unir-icon-", "");
    }
    const data = item.getAttribute("data-icon") || (item.querySelector("[data-icon]") || { getAttribute: () => "" }).getAttribute("data-icon");
    if (data) return data.replace("unir-icon-", "");
    return KNOWN_ICONS[title.toLowerCase()] || "";
  }
  function parse10(element, { document, params }) {
    const cells = [];
    let items = [...element.querySelectorAll(":scope > .panel-icons__item")];
    if (!items.length) items = [...element.querySelectorAll("article")];
    items.forEach((item) => {
      const paragraphs = [...item.querySelectorAll(":scope > p, :scope > h2, :scope > h3, :scope > h4")];
      const titleEl = item.querySelector(".heading--h3, h2, h3, h4") || paragraphs[0];
      const title = cleanText8(titleEl);
      const body = [];
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title;
        body.push(h3);
      }
      paragraphs.filter((p) => p !== titleEl).forEach((p) => {
        const text = cleanText8(p);
        if (!text) return;
        const para = document.createElement("p");
        para.textContent = text;
        body.push(para);
      });
      const icon = iconName(item, title);
      let iconCell = "";
      if (icon) {
        iconCell = document.createElement("p");
        iconCell.textContent = `:${icon}:`;
      }
      if (!body.length && !iconCell) return;
      cells.push([iconCell, body.length ? body : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-video.js
  var KNOWN_VIDEOS = {
    "la fuerza que necesitas": "https://www.youtube.com/watch?v=J7qkH95Pa8E&t=5s",
    "graduaci\xF3n logro\xF1o 2025": "https://youtu.be/9rB-qhx1do4",
    "acompa\xF1amiento personalizado": "https://youtu.be/Pxuaw-rHDFo?si=V1B_zONTlDlGp_nk"
  };
  var YT = /(youtube\.com|youtu\.be|youtube-nocookie\.com)/i;
  function absUrl9(url, document) {
    if (!url) return "";
    try {
      return new URL(url, document.baseURI && document.baseURI.startsWith("http") ? document.baseURI : "https://www.unir.net/").href;
    } catch (e) {
      return url;
    }
  }
  function cleanText9(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll("style, script, noscript").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function imageFrom7(scope, document) {
    const src = scope.querySelector("img");
    if (!src) return null;
    let url = src.getAttribute("src") || src.getAttribute("data-src");
    if (!url || url.startsWith("data:")) {
      const source = scope.querySelector("source[srcset]");
      const srcset = src.getAttribute("srcset") || src.getAttribute("data-srcset") || source && source.getAttribute("srcset");
      url = srcset ? srcset.split(",")[0].trim().split(/\s+/)[0] : url;
    }
    if (!url) return null;
    const img = document.createElement("img");
    img.src = absUrl9(url, document);
    img.alt = src.getAttribute("alt") || "";
    return img;
  }
  function videoUrl(item, title) {
    const anchor = [...item.querySelectorAll("a[href]")].find((a) => YT.test(a.getAttribute("href")));
    if (anchor) return anchor.getAttribute("href");
    const holder = [item, ...item.querySelectorAll("[data-video-url], [data-video], [data-src], [data-url]")];
    for (const el of holder) {
      for (const attr of ["data-video-url", "data-video", "data-src", "data-url"]) {
        const value = el.getAttribute(attr);
        if (value && YT.test(value)) return value;
      }
    }
    return KNOWN_VIDEOS[title.toLowerCase()] || "";
  }
  function parse11(element, { document, params }) {
    const cells = [];
    let items = [...element.querySelectorAll(".video--cols")];
    if (!items.length) items = [...element.querySelectorAll(".slider__item")];
    items = items.filter((item) => !item.classList.contains("tns-slide-cloned"));
    items.forEach((item) => {
      const img = imageFrom7(item.querySelector("figure") || item, document);
      const title = cleanText9(item.querySelector(".video__title, h2, h3, p"));
      const href = videoUrl(item, title);
      const body = [];
      if (title) {
        const p = document.createElement("p");
        p.textContent = title;
        body.push(p);
      }
      if (href) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        p.append(a);
        body.push(p);
      }
      if (!img && !body.length) return;
      cells.push([img || "", body.length ? body : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/unir-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header.header.js-datalayer",
        "#footer",
        "#consent_blackbar",
        "div.modal",
        "#modalVideo",
        "#modalImage",
        "#modalSearch",
        "#modalInfoForm",
        "#modalTelf",
        "#modalDirectory",
        "div.contact-button--telf"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".tns-slide-cloned",
        ".tns-liveregion",
        ".tns-nav",
        ".tns-controls"
      ]);
      element.querySelectorAll("[data-decode]").forEach((el) => {
        const href = (el.getAttribute("href") || "").trim();
        if (href && href !== "#") return;
        try {
          const decoded = atob(el.getAttribute("data-decode").trim());
          if (/^(https?:)?\/\//i.test(decoded) || decoded.startsWith("/")) el.setAttribute("href", decoded);
        } catch (e) {
        }
      });
      const doc = element.ownerDocument || element;
      element.querySelectorAll("div.heading--h2").forEach((div) => {
        const h2 = doc.createElement("h2");
        h2.innerHTML = div.innerHTML;
        div.replaceWith(h2);
      });
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "link",
        'iframe[src=""]'
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (/^data-(gtm|ga|track|analytics|datalayer)/i.test(attr.name) || /^on[a-z]+$/i.test(attr.name)) {
            el.removeAttribute(attr.name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/unir-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const doc = root.ownerDocument || root;
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      let el = null;
      try {
        el = doc.querySelector(sel) || root.querySelector(sel);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument || element;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el || !el.parentNode) continue;
        if (i === 0) {
          if (section.style) {
            const hr2 = doc.createElement("hr");
            hr2.setAttribute(MARKER, section.id);
            el.parentNode.insertBefore(hr2, el);
          }
          continue;
        }
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`) || doc.querySelector(`hr[${MARKER}="${section.id}"]`);
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (marker) {
          let next = marker.nextElementSibling;
          let boundary = null;
          while (next) {
            if (next.tagName === "HR") {
              boundary = next;
              break;
            }
            next = next.nextElementSibling;
          }
          if (boundary) boundary.parentNode.insertBefore(metadata, boundary);
          else marker.parentNode.appendChild(metadata);
          if (i === 0) marker.remove();
          else marker.removeAttribute(MARKER);
        } else {
          const el = findSectionElement(element, section);
          if (el) el.after(metadata);
        }
      }
      element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
    }
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
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
        "name": "Oferta acad\xE9mica por \xE1reas de estudio",
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
        "name": "Pr\xF3ximos eventos en directo",
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
        "name": "Descubre los principales t\xEDtulos",
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
        "name": "Actualidad acad\xE9mica",
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
        "name": "Investigaci\xF3n",
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
  var parsers = {
    "carousel-hero": parse,
    widget: parse2,
    "cards-study-tiles": parse3,
    "cards-area-links": parse4,
    "cards-featured": parse5,
    "cards-event": parse6,
    "cards-program-slider": parse7,
    "cards-news": parse8,
    "cards-press": parse9,
    "cards-icon-feature": parse10,
    "cards-video": parse11
  };
  var sectionTransformers = [transform2];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var correctionTransformers = [];
  var transformers = [transform, ...lateTransformers, ...correctionTransformers];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document.querySelectorAll(selector);
      } catch (e) {
        return;
      }
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
  function markPageTargets(payload) {
    const { document, params } = payload;
    executeTransformers("beforeTransform", document.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var YOUTUBE = /youtube\.com|youtu\.be/i;
  function preserveEmptyInlineData(document) {
    document.querySelectorAll(".panel-icons__item").forEach((item) => {
      const icon = item.querySelector('[class*="unir-icon-"]');
      const cls = icon && [...icon.classList].find((c) => c.startsWith("unir-icon-"));
      if (cls) item.setAttribute("data-icon", cls.replace("unir-icon-", ""));
    });
    document.querySelectorAll(".video--cols, body > section.slider .slider__item").forEach((item) => {
      const a = [...item.querySelectorAll("a[href]")].find((el) => YOUTUBE.test(el.getAttribute("href")));
      if (a) item.setAttribute("data-video-url", a.getAttribute("href"));
    });
  }
  var import_home_default = {
    preprocess: (payload) => {
      preserveEmptyInlineData(payload.document);
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_home_exports);
})();
