/**
 * Text-only list of area links. One row per area; the row's cells are merged,
 * so an author can put the link in either cell or leave an empty image cell.
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim()) return;
    const li = document.createElement('li');
    li.className = 'cards-area-links-item';
    [...row.children].forEach((cell) => {
      if (cell.textContent.trim()) li.append(...cell.childNodes);
    });
    // drop stray pictures: this variant is text-only by design
    li.querySelectorAll('picture').forEach((picture) => {
      const parent = picture.parentElement;
      picture.remove();
      if (parent !== li && !parent.textContent.trim()) parent.remove();
    });
    const link = li.querySelector('a[href]');
    if (link) link.classList.add('cards-area-links-link');
    list.append(li);
  });
  block.replaceChildren(list);
}
