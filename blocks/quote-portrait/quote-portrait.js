import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  let picture = null;
  const textCells = [];

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !picture) {
        picture = pic;
        pic.remove();
      }
      if (cell.textContent.trim()) textCells.push(cell);
    });
  });

  const figure = document.createElement('figure');
  figure.className = 'quote-portrait-body';

  // With 2+ text cells the last one is the attribution; a single cell is the quotation.
  let attributionCell = null;
  if (textCells.length > 1) attributionCell = textCells.pop();

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'quote-portrait-quotation';
  textCells.forEach((cell) => blockquote.append(...cell.childNodes));
  if (blockquote.childNodes.length) figure.append(blockquote);

  if (attributionCell) {
    const caption = document.createElement('figcaption');
    caption.className = 'quote-portrait-attribution';
    caption.append(...attributionCell.childNodes);
    // wrap the role text that follows the bold name ("estudiante de UNIR") so it can be styled
    const name = caption.querySelector('strong');
    if (name) {
      const roleNodes = [];
      let node = name.nextSibling;
      while (node) {
        roleNodes.push(node);
        node = node.nextSibling;
      }
      const roleText = roleNodes.map((n) => n.textContent).join('').trim();
      if (roleText) {
        const role = document.createElement('span');
        role.className = 'quote-portrait-role';
        role.append(...roleNodes);
        if (role.firstChild.nodeType === Node.TEXT_NODE) {
          role.firstChild.textContent = role.firstChild.textContent.trimStart();
        }
        name.after(' ', role);
      }
    }
    figure.append(caption);
  }

  block.replaceChildren();
  if (picture) {
    const media = document.createElement('div');
    media.className = 'quote-portrait-image';
    const img = picture.querySelector('img');
    const url = img ? new URL(img.src, window.location.href) : null;
    if (img && url.origin === window.location.origin && !/\.svg$/i.test(url.pathname)) {
      media.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]));
    } else {
      media.append(picture);
    }
    block.append(media);
    block.classList.add('has-image');
  }
  block.append(figure);
}
