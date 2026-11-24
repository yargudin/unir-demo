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

  // tools/importer/import-landing.js
  var import_landing_exports = {};
  __export(import_landing_exports, {
    default: () => import_landing_default
  });

  // tools/importer/parsers/hero-gradient.js
  var CTA_HREF = "#form";
  function cleanText(el) {
    if (!el) return "";
    return el.textContent.replace(/\s+/g, " ").trim();
  }
  function parse(element, { document, params }) {
    const cells = [];
    const img = element.querySelector(".c-hero__figure img, img");
    if (img && img.getAttribute("src")) {
      const image = document.createElement("img");
      image.src = img.getAttribute("src");
      image.alt = img.getAttribute("alt") || "";
      cells.push([image]);
    }
    const content = [];
    const title = cleanText(element.querySelector(".c-hero__title, h1"));
    if (title) {
      const h1 = document.createElement("h1");
      h1.textContent = title;
      content.push(h1);
    }
    const subtitle = cleanText(element.querySelector(".c-hero__subtitle"));
    if (subtitle) {
      const p = document.createElement("p");
      p.textContent = subtitle;
      content.push(p);
    }
    element.querySelectorAll(".c-hero__ctas .c-hero__cta").forEach((cta) => {
      const label = cleanText(cta);
      if (!label) return;
      const href = cta.getAttribute("href");
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = href && !href.startsWith("javascript:") ? href : CTA_HREF;
      a.textContent = label;
      p.append(a);
      content.push(p);
    });
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-gradient", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-programs.js
  function cleanText2(el) {
    if (!el) return "";
    return el.textContent.replace(/\s+/g, " ").trim();
  }
  function slugLabel(href) {
    if (!href) return "";
    try {
      const slug = new URL(href, "https://estudiar.unir.net/").pathname.split("/").filter(Boolean).pop() || "";
      const words = slug.replace(/^([a-z]{3}-){2,}(noa-)?/, "").split("-").filter(Boolean);
      if (!words.length) return "";
      const text = words.join(" ");
      return text.charAt(0).toUpperCase() + text.slice(1);
    } catch (e) {
      return "";
    }
  }
  function parse2(element, { document, params }) {
    const cells = [];
    const groups = [...element.querySelectorAll(".c-filter__group")];
    groups.forEach((group) => {
      const area = cleanText2(group.querySelector(".js-filterResultsGroupTitle, h2"));
      const list = group.querySelector(".c-filter__group-list") || group.querySelector(".c-filter__group-content");
      const body = [];
      let ul = null;
      if (list) {
        list.querySelectorAll("h3, a").forEach((node) => {
          if (node.tagName === "H3") {
            const text = cleanText2(node);
            if (!text) return;
            const h3 = document.createElement("h3");
            h3.textContent = text;
            body.push(h3);
            ul = null;
            return;
          }
          const pretitle = cleanText2(node.querySelector(".c-filter__course-pretitle"));
          const title = cleanText2(node.querySelector(".c-filter__course-title"));
          const href = node.getAttribute("href");
          const label = [pretitle, title].filter(Boolean).join(" ") || cleanText2(node) || slugLabel(href);
          if (!label) return;
          if (!ul) {
            ul = document.createElement("ul");
            body.push(ul);
          }
          const li = document.createElement("li");
          if (href) {
            const a = document.createElement("a");
            a.href = href;
            a.textContent = label;
            li.append(a);
          } else {
            li.textContent = label;
          }
          ul.append(li);
        });
      }
      if (!area && !body.length) return;
      cells.push([area, body.length ? body : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-programs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-portrait.js
  function cleanText3(el) {
    if (!el) return "";
    return el.textContent.replace(/\s+/g, " ").trim();
  }
  function buildCells(item, document) {
    const cells = [];
    const src = item.querySelector(".c-testimony__primary-image img, img");
    if (src && src.getAttribute("src")) {
      const img = document.createElement("img");
      img.src = src.getAttribute("src");
      img.alt = src.getAttribute("alt") || cleanText3(item.querySelector(".c-testimony__author")).replace(/,$/, "");
      cells.push([img]);
    }
    const quote = [...item.querySelectorAll("blockquote p")].map((p) => cleanText3(p)).filter(Boolean).map((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      return p;
    });
    if (!quote.length) {
      const text = cleanText3(item.querySelector("blockquote"));
      if (text) {
        const p = document.createElement("p");
        p.textContent = text;
        quote.push(p);
      }
    }
    if (quote.length) cells.push([quote]);
    const author = cleanText3(item.querySelector(".c-testimony__author, figcaption strong"));
    const role = cleanText3(item.querySelector(".c-testimony__author-position"));
    if (author || role) {
      const p = document.createElement("p");
      if (author) {
        const strong = document.createElement("strong");
        strong.textContent = author;
        p.append(strong);
      }
      if (role) p.append(`${author ? " " : ""}${role}`);
      cells.push([p]);
    }
    return cells;
  }
  function parse3(element, { document, params }) {
    let items = [...element.querySelectorAll(".c-testimony")];
    if (!items.length) items = [element];
    const blocks = items.map((item) => buildCells(item, document)).filter((cells) => cells.length).map((cells) => WebImporter.Blocks.createBlock(document, { name: "quote-portrait", cells }));
    const block = blocks.shift() || WebImporter.Blocks.createBlock(document, { name: "quote-portrait", cells: [] });
    element.replaceWith(block);
    if (blocks.length) block.after(...blocks);
  }

  // tools/importer/parsers/cards-icon-feature.js
  var KNOWN_ICONS = {
    "docencia 100% online": "professor",
    "clases en directo": "screen",
    "mentor - unir": "mentor"
  };
  function cleanText4(el) {
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
  var LANDING_ICONS = {
    "aprendes con contenidos actualizados": "spinner",
    "desarrollas destrezas profesionales": "lightbulb",
    "cuentas con 4.700 empresas con convenios de pr\xE1cticas": "briefcase"
  };
  function isLanding(element) {
    return element.classList.contains("m-card-block__cards") || !!element.querySelector(":scope > .m-card-block__card-item");
  }
  function landingIconName(item, text) {
    const span = item.querySelector('.icon[class*="icon-"]');
    if (span) {
      const cls = [...span.classList].find((c) => c.startsWith("icon-") && c !== "icon");
      if (cls) return cls.replace("icon-", "").toLowerCase();
    }
    const holder = item.hasAttribute("data-icon") ? item : item.querySelector("[data-icon]");
    if (holder) return holder.getAttribute("data-icon").replace(/^icon-/, "").toLowerCase();
    return LANDING_ICONS[text.toLowerCase()] || "";
  }
  function parseLanding(element, document) {
    const cells = [];
    let items = [...element.querySelectorAll(":scope > .m-card-block__card-item")];
    if (!items.length) items = [...element.querySelectorAll(".c-iconographic-card, article.c-card__content")];
    items.forEach((item) => {
      const body = [];
      const titleEl = item.querySelector(".c-card__title, h2, h3, h4");
      const title = cleanText4(titleEl);
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title;
        body.push(h3);
      }
      const textRoot = item.querySelector(".c-card__description-text") || item.querySelector(".c-card__text") || item;
      let paras = [...textRoot.querySelectorAll("p")].map(cleanText4).filter(Boolean);
      if (!paras.length && !title) paras = [cleanText4(textRoot)].filter(Boolean);
      paras.forEach((text) => {
        const p = document.createElement("p");
        p.textContent = text;
        body.push(p);
      });
      const icon = landingIconName(item, paras[0] || title || "");
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
  function parse4(element, { document, params }) {
    if (isLanding(element)) {
      parseLanding(element, document);
      return;
    }
    const cells = [];
    let items = [...element.querySelectorAll(":scope > .panel-icons__item")];
    if (!items.length) items = [...element.querySelectorAll("article")];
    items.forEach((item) => {
      const paragraphs = [...item.querySelectorAll(":scope > p, :scope > h2, :scope > h3, :scope > h4")];
      const titleEl = item.querySelector(".heading--h3, h2, h3, h4") || paragraphs[0];
      const title = cleanText4(titleEl);
      const body = [];
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title;
        body.push(h3);
      }
      paragraphs.filter((p) => p !== titleEl).forEach((p) => {
        const text = cleanText4(p);
        if (!text) return;
        const para2 = document.createElement("p");
        para2.textContent = text;
        body.push(para2);
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

  // tools/importer/parsers/columns-stat.js
  function cleanText5(el) {
    if (!el) return "";
    return el.textContent.replace(/\s+/g, " ").trim();
  }
  function para(document, text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }
  function parse5(element, { document, params }) {
    const cells = [];
    const left = element.querySelector(".c-highlighted-data__left");
    const textCell = [];
    if (left) {
      const title = cleanText5(left.querySelector(".c-highlighted-data__title, h2, h3"));
      if (title) {
        const h2 = document.createElement("h2");
        h2.textContent = title;
        textCell.push(h2);
      }
      left.querySelectorAll("p").forEach((p) => {
        const text = cleanText5(p);
        if (text) textCell.push(para(document, text));
      });
    }
    const right = element.querySelector(".c-highlighted-data__right");
    const statCell = [];
    if (right) {
      right.querySelectorAll(".c-highlighted-data__data, .c-highlighted-data__text").forEach((p) => {
        const text = cleanText5(p);
        if (text) statCell.push(para(document, text));
      });
    }
    if (textCell.length || statCell.length) {
      cells.push([textCell.length ? textCell : "", statCell.length ? statCell : ""]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-stat", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-recognition.js
  function parse6(element, { document, params }) {
    const cells = [];
    const cards = [...element.querySelectorAll("section.c-recognition-card")];
    cards.forEach((card) => {
      let imageCell = "";
      const src = card.querySelector(".cmp-teaser__image img, img");
      if (src && src.getAttribute("src")) {
        const img = document.createElement("img");
        img.src = src.getAttribute("src");
        img.alt = src.getAttribute("alt") || "";
        imageCell = img;
      }
      const description = card.querySelector(".cmp-teaser__description") || card.querySelector(".cmp-text-content");
      const body = [];
      if (description) {
        const blocks = [...description.querySelectorAll("h2, h3, h4, p")];
        if (blocks.length) {
          blocks.forEach((el) => {
            if (el.textContent.trim()) body.push(el);
          });
        } else if (description.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = description.textContent.replace(/\s+/g, " ").trim();
          body.push(p);
        }
      }
      if (!imageCell && !body.length) return;
      cells.push([imageCell, body.length ? body : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-recognition", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  function absUrl(url, document) {
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
  function imageFrom(scope, document) {
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
    img.src = absUrl(url, document);
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
  function isLanding2(element) {
    return element.classList.contains("c-sections__main") || !!element.querySelector(":scope > article > .c-sections__item");
  }
  function parseLanding2(element, document) {
    const cells = [];
    let items = [...element.querySelectorAll(":scope > article")];
    if (!items.length) items = [...element.querySelectorAll(".c-sections__item")];
    items.forEach((item) => {
      const imageScope = item.querySelector(".c-sections__item-image") || item;
      const img = imageFrom(imageScope, document);
      const body = [];
      const titleEl = item.querySelector(".c-sections__item-title, h2, h3, h4");
      const title = cleanText6(titleEl);
      if (title) {
        const href = linkHref(titleEl.querySelector("a") || item.querySelector(".c-sections__item-header a"));
        const h3 = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.href = absUrl(href, document);
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        body.push(h3);
      }
      const textRoot = item.querySelector(".c-sections__item-text");
      if (textRoot) {
        const paras = [...textRoot.querySelectorAll("p")];
        if (paras.length) {
          paras.forEach((p) => {
            if (!p.textContent.replace(/\u00a0/g, " ").trim()) return;
            body.push(p);
          });
        } else if (cleanText6(textRoot)) {
          const p = document.createElement("p");
          p.textContent = cleanText6(textRoot);
          body.push(p);
        }
      }
      if (!img && !body.length) return;
      cells.push([img || "", body.length ? body : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news", cells });
    element.replaceWith(block);
  }
  function parse7(element, { document, params }) {
    if (isLanding2(element)) {
      parseLanding2(element, document);
      return;
    }
    const cells = [];
    let items = [...element.querySelectorAll(":scope > .card__item")];
    if (!items.length) items = [...element.querySelectorAll("article.card__item, section.card__item")];
    items.forEach((item) => {
      const figure = item.querySelector(".card__figure, figure");
      const img = figure ? imageFrom(figure, document) : null;
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
        const href = linkHref(titleAnchor) || linkHref(figure && figure.querySelector("a"));
        const h3 = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.href = absUrl(href, document);
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
        const para2 = document.createElement("p");
        para2.textContent = text;
        body.push(para2);
      });
      if (!img && !body.length) return;
      cells.push([img || "", body.length ? body : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form.js
  var SKIP_IDS = ["prefix", "phone-area", "automatricula"];
  var TYPE_BY_ID = { email: "email", phone: "tel" };
  function cleanText7(el) {
    if (!el) return "";
    return el.textContent.replace(/\s+/g, " ").trim();
  }
  function isRequired(group) {
    return !!group.querySelector(".error-msg-required");
  }
  function inlineCopy(document, nodes) {
    const p = document.createElement("p");
    nodes.forEach((node) => {
      if (node.nodeType === 3) {
        p.append(node.textContent.replace(/\s+/g, " "));
      } else if (node.nodeType === 1 && node.tagName === "A") {
        const a = document.createElement("a");
        a.href = node.getAttribute("href") || "";
        a.textContent = cleanText7(node);
        p.append(a);
      } else if (node.nodeType === 1 && node.tagName !== "BR") {
        p.append(cleanText7(node));
      }
    });
    p.innerHTML = p.innerHTML.replace(/^\s+|\s+$/g, "").replace(/\s{2,}/g, " ");
    return p.textContent.trim() ? p : null;
  }
  function paragraphsFrom(document, el) {
    const out = [];
    let chunk = [];
    const flush = () => {
      const p = inlineCopy(document, chunk);
      if (p) out.push(p);
      chunk = [];
    };
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === 1 && node.tagName === "BR") flush();
      else chunk.push(node);
    });
    flush();
    return out;
  }
  function parse8(element, { document, params }) {
    const cells = [];
    const row = (label, type, options = "", required = false) => {
      cells.push([label, type, options, required ? "yes" : ""]);
    };
    const highlights = [...element.querySelectorAll(".c-accelerators__text")].map(cleanText7).filter(Boolean);
    if (highlights.length) {
      const ul = document.createElement("ul");
      highlights.forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        ul.append(li);
      });
      row(ul, "info");
    }
    const form = element.querySelector("form") || element;
    const heading = cleanText7(form.querySelector(".cmp-title__text, h1, h2, h3"));
    if (heading) row(heading, "heading");
    const groups = form.querySelectorAll(".c-form__select-group, .c-form__group, fieldset.checkbox__fieldset");
    groups.forEach((group) => {
      const select = group.querySelector("select");
      const input = group.querySelector("input");
      const control = select || input;
      if (!control) return;
      const id = control.getAttribute("id") || "";
      if (!id || SKIP_IDS.includes(id)) return;
      if (group.classList.contains("input-hidden")) return;
      if (id === "gdpr" || group.matches("fieldset")) {
        const text = group.querySelector(".checkbox__checkbox-text");
        const p = text ? inlineCopy(document, [...text.childNodes]) : null;
        if (p) row(p, "consent", "", true);
        return;
      }
      const label = cleanText7(group.querySelector(".form-label, label"));
      if (!label) return;
      const required = isRequired(group);
      if (select) {
        const options = [...select.querySelectorAll("option")].map(cleanText7).filter(Boolean);
        if (options.length) {
          const ul = document.createElement("ul");
          options.forEach((text) => {
            const li = document.createElement("li");
            li.textContent = text;
            ul.append(li);
          });
          row(label, "select", ul, required);
        } else {
          row(label, "text", "", required);
        }
        return;
      }
      const hint = cleanText7(group.querySelector(".error-msg-required"));
      row(label, TYPE_BY_ID[id] || "text", hint, required);
    });
    const policies = form.querySelector(".c-form__policies-label");
    if (policies) {
      const paragraphs = paragraphsFrom(document, policies);
      if (paragraphs.length) row(paragraphs, "info");
    }
    const submit = form.querySelector('#submitcontactform, .c-form__button button, button[type="submit"]');
    const submitLabel = cleanText7(submit);
    if (submitLabel) row(submitLabel, "submit");
    const block = WebImporter.Blocks.createBlock(document, { name: "form", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/landing-cleanup.js
  var SCENE7_HOST = /^https?:\/\/s7g10\.scene7\.com\//i;
  function normalizeScene7(src) {
    if (!src || !SCENE7_HOST.test(src)) return src;
    try {
      const url = new URL(src);
      const isImage = url.pathname.includes("/is/image/");
      const wid = url.searchParams.get("wid");
      const hei = url.searchParams.get("hei");
      url.search = "";
      if (isImage) {
        if (wid) url.searchParams.set("wid", wid);
        if (wid && hei) url.searchParams.set("hei", hei);
        url.searchParams.set("fmt", "png-alpha");
      }
      return url.toString();
    } catch (e) {
      return src;
    }
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "div.experiencefragment.header-component",
        "div.c-header.c-header--logo-title",
        "div.footerxf.experiencefragment",
        "#consent_blackbar",
        "div.c-sticky-buttons",
        "div.distributivecontactformmodalef.experiencefragment",
        "div.c-modal-contact-form",
        "div.c-modal-video"
      ]);
      [...element.querySelectorAll("picture source")].reverse().forEach((source) => {
        if (!source.getAttribute("srcset")) {
          source.replaceWith(...source.childNodes);
        }
      });
      element.querySelectorAll("img[src]").forEach((img) => {
        const src = img.getAttribute("src");
        const normalized = normalizeScene7(src);
        if (normalized !== src) img.setAttribute("src", normalized);
      });
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "link",
        'iframe[src=""]',
        ".js-loader"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (/^data-(cmp-|gtm|ga|track|analytics|datalayer)/i.test(attr.name) || /^on[a-z]+$/i.test(attr.name)) {
            el.removeAttribute(attr.name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/landing-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function moveSidebarFormToEnd(root) {
    const form = root.querySelector("div.l-sidebar div.c-form");
    if (!form) return;
    const mainGrid = root.querySelector("div.l-main div.aem-Grid--12") || root.querySelector("div.l-main");
    if (!mainGrid) return;
    const sidebar = form.closest("div.l-sidebar");
    mainGrid.append(sidebar || form);
  }
  function transform2(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || element;
    if (hookName === "beforeTransform") {
      const resolved = sections.map((section) => findSectionElement(element, section));
      moveSidebarFormToEnd(element);
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = resolved[i];
        if (!el) continue;
        const isFirst = resolved.slice(0, i).every((prev) => !prev);
        if (isFirst && !section.style) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (isFirst) hr.setAttribute("data-excat-first-section", "true");
        el.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (!marker) continue;
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        marker.after(metadata);
        if (marker.hasAttribute("data-excat-first-section")) marker.remove();
        else marker.removeAttribute(MARKER);
      }
    }
  }

  // tools/importer/import-landing.js
  var PAGE_TEMPLATE = {
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
        "name": "Tu postgrado donde, cuando y como t\xFA quieras",
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
        "name": "Te lo ponemos f\xE1cil",
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
        "name": "UNIR, la universidad en l\xEDnea n\xBA1 del mundo en espa\xF1ol",
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
        "name": "UNIR, entre la \xE9lite universitaria",
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
  var PAGE_PATHS = {
    "https://estudiar.unir.net/landings/es_es/edu_der_pol_seg_emp_art_hum_mba_com_ing_dis_sal_soc_mus_idi-gen-mas_exu_prg_cur-ofi_tpr-noa-estes-donde-estes-unir-sitio": "/landings/estudia-donde-estes"
  };
  var parsers = {
    "hero-gradient": parse,
    "accordion-programs": parse2,
    "quote-portrait": parse3,
    "cards-icon-feature": parse4,
    "columns-stat": parse5,
    "cards-recognition": parse6,
    "cards-news": parse7,
    "form": parse8
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
  var pageKey = (u) => {
    try {
      const { origin, pathname } = new URL(u);
      return `${origin}${pathname.replace(/\/$/, "")}`;
    } catch (e) {
      return u;
    }
  };
  function findBlocksOnPage(document, template, url) {
    const pageBlocks = [];
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
  var import_landing_default = {
    preprocess: (payload) => {
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
      const metaTable = [...main.querySelectorAll("table")].reverse().find((t) => {
        var _a;
        return /^metadata$/i.test((((_a = t.querySelector("th, td")) == null ? void 0 : _a.textContent) || "").trim());
      });
      if (metaTable) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>Template</td><td>${PAGE_TEMPLATE.name}</td>`;
        (metaTable.querySelector("tbody") || metaTable).append(row);
      }
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = PAGE_PATHS[pageKey(params.originalURL)] || new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_landing_exports);
})();
