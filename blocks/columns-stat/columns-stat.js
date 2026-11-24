const STAT_RE = /^[+\-~<>≈]?\s*[\d.,]+\s*(%|\+|k|m|mil)?\+?$/i;

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-stat-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // A column whose first non-empty element is a short number-like value is the stat column.
      const first = [...col.children].find((el) => el.textContent.trim());
      if (first && STAT_RE.test(first.textContent.trim())) {
        col.classList.add('columns-stat-figure');
        first.classList.add('columns-stat-value');
      } else {
        col.classList.add('columns-stat-text');
      }
    });
  });
}
