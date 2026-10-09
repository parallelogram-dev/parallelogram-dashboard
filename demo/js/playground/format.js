/**
 * Pretty-print an HTML fragment for the code panel.
 *
 * Elements whose content is short and inline stay on one line; SVG icons are kept intact.
 */

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const INLINE = new Set(['a', 'abbr', 'b', 'button', 'code', 'em', 'i', 'kbd', 'label', 'option', 'small', 'span', 'strong', 'svg']);
const MAX_LINE = 100;
const INDENT = '  ';

function escapeText(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function openTag(el) {
  const attrs = [...el.attributes].map(a => (a.value === '' ? ` ${a.name}` : ` ${a.name}="${a.value.replace(/"/g, '&quot;')}"`));
  return `<${el.localName}${attrs.join('')}>`;
}

function inline(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeText(node.textContent.replace(/\s+/g, ' '));
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }
  if (node.namespaceURI === 'http://www.w3.org/2000/svg') {
    return node.outerHTML;
  }
  const tag = node.localName;
  if (VOID.has(tag)) {
    return openTag(node);
  }
  return `${openTag(node)}${[...node.childNodes].map(inline).join('')}</${tag}>`;
}

function isInlineContent(el) {
  return [...el.childNodes].every(n => n.nodeType !== Node.ELEMENT_NODE || INLINE.has(n.localName));
}

function block(node, depth) {
  const pad = INDENT.repeat(depth);
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim();
    return text ? [`${pad}${escapeText(text)}`] : [];
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const single = inline(node);
  if (node.localName === 'svg' || VOID.has(node.localName) || (isInlineContent(node) && pad.length + single.length <= MAX_LINE)) {
    return [`${pad}${single}`];
  }

  return [
    `${pad}${openTag(node)}`,
    ...[...node.childNodes].flatMap(child => block(child, depth + 1)),
    `${pad}</${node.localName}>`,
  ];
}

export function formatHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return [...template.content.childNodes].flatMap(n => block(n, 0)).join('\n');
}
