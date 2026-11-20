let instance = 0;

/**
 * Resolves the listing path for the selected type, area and official status.
 * Order: type within area > type (per official status) > area > fallback.
 * @param {HTMLFormElement} form The course finder form
 * @returns {string} Root-relative listing path
 */
export function resolveListing(form) {
  const typeOption = form.elements.type?.selectedOptions[0];
  const area = form.elements.area?.value || '';
  const official = form.elements.official?.value || '';
  const type = typeOption?.value ? typeOption.dataset : null;

  if (type && area && type.areaPath) return `/${area}/${type.areaPath}/`;
  if (type) {
    const officialKey = official ? `path${official.charAt(0).toUpperCase()}${official.slice(1)}` : '';
    const path = (officialKey && type[officialKey]) || type.path;
    if (path) return `/${path}/`;
  }
  if (area) return `/${area}/`;
  return form.dataset.fallback || '/';
}

/**
 * Decorates the course finder widget.
 * Optional widget link params: `base` (origin to prefix listing paths with,
 * e.g. ?base=https://www.unir.net while listing pages are not migrated).
 * @param {Element} widget The widget block element
 */
export default function decorate(widget) {
  const form = widget.querySelector('.course-finder-form');
  if (!form) return;
  instance += 1;

  // unique label/select ids so several finders can share a page
  form.querySelectorAll('.course-finder-select').forEach((select) => {
    const id = `course-finder-${instance}-${select.dataset.id || select.name}`;
    select.id = id;
    const label = form.querySelector(`.course-finder-label[data-for="${select.dataset.id}"]`);
    if (label) label.htmlFor = id;
  });

  let base = '';
  if (widget.dataset.base) {
    try {
      base = new URL(widget.dataset.base).origin;
    } catch (e) {
      base = '';
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    window.location.assign(`${base}${resolveListing(form)}`);
  });
}
