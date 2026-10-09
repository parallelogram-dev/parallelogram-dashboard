/**
 * Shared helpers for the build scripts: loading the demo's ES modules and reading class names
 * out of compiled SCSS.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const scssDir = join(root, 'scss');

export async function importDemo(path) {
  return import(pathToFileURL(join(root, 'demo', path)));
}

/** Class names that a SCSS file defines once compiled, in source order. */
export function definedClasses(source) {
  const { css } = sass.compile(join(scssDir, source), { loadPaths: [scssDir] });
  const selectors = css.replace(/\{[^{}]*\}/g, '\n').replace(/@[^{\n]+/g, '');
  return [...new Set([...selectors.matchAll(/\.(-?[a-z_][a-z0-9_-]*)/gi)].map(m => m[1]))];
}

const VOID = new Set(['area', 'br', 'col', 'embed', 'hr', 'img', 'input', 'source', 'track', 'wbr']);
const BLOCK = new Set([
  'article', 'aside', 'div', 'footer', 'form', 'header', 'li', 'main', 'nav', 'ol', 'section',
  'select', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul',
]);

/**
 * Indent an HTML fragment without a DOM: block elements go on their own lines, everything
 * else (text, inline elements, whole <svg> icons) stays on the line of its parent.
 */
export function formatHtml(html) {
  const tokens = html.match(/<svg\b[\s\S]*?<\/svg>|<[^>]+>|[^<]+/g) || [];
  const lines = [];
  let depth = 0;
  let line = '';

  const flush = () => {
    if (line.trim()) {
      lines.push('  '.repeat(depth) + line.trim());
    }
    line = '';
  };

  for (const token of tokens) {
    const tag = token.match(/^<\/?([a-z0-9-]+)/i)?.[1]?.toLowerCase();
    const closing = token.startsWith('</');
    if (!tag || !BLOCK.has(tag) || token.startsWith('<svg')) {
      line += token.replace(/\s+/g, ' ');
      continue;
    }
    flush();
    if (closing) {
      depth = Math.max(0, depth - 1);
      lines.push('  '.repeat(depth) + token);
    } else {
      lines.push('  '.repeat(depth) + token);
      if (!VOID.has(tag)) {
        depth++;
      }
    }
  }
  flush();

  // Collapse "<li>\n  text\n</li>" back onto one line when short
  return lines.join('\n').replace(/^( *)(<(li|td|th|option)\b[^>]*>)\n +([^\n<][^\n]*|<[^\n]*)\n +(<\/\3>)$/gm, (m, pad, open, t, body, close) => {
    const single = `${pad}${open}${body}${close}`;
    return single.length <= 110 ? single : m;
  });
}
