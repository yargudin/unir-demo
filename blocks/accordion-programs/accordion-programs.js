export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const label = cells[0];
    if (!label || (!label.textContent.trim() && cells.length < 2)) {
      row.remove();
      return;
    }

    const summary = document.createElement('summary');
    summary.className = 'accordion-programs-item-label';
    // title cell may hold a heading or plain text
    const heading = label.querySelector('h1, h2, h3, h4, h5, h6, p');
    if (heading && label.children.length === 1) summary.append(...heading.childNodes);
    else summary.append(...label.childNodes);

    const body = document.createElement('div');
    body.className = 'accordion-programs-item-body';
    cells.slice(1).forEach((cell) => body.append(...cell.childNodes));

    // program link lists: mark links that sit alone in a paragraph or list item
    body.querySelectorAll('a').forEach((a) => {
      const parent = a.parentElement;
      if (parent && (parent.tagName === 'LI' || parent.tagName === 'P')) {
        parent.classList.add('accordion-programs-link');
      }
    });

    const details = document.createElement('details');
    details.className = 'accordion-programs-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
