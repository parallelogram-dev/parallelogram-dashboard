/**
 * Generates LLM-friendly references for the demo site (https://llmstxt.org):
 *
 * - demo/llms.txt         index of components with usage rules
 * - demo/llms/<slug>.md   one file per component: classes, modifiers and example markup
 * - demo/llms-full.txt    every component file concatenated
 *
 * Links are absolute, based on SITE_URL (defaults to the GitHub Pages address).
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { definedClasses, formatHtml, importDemo, root } from './lib.mjs';

const SITE = (process.env.SITE_URL || 'https://parallelogram-dev.github.io/parallelogram-dashboard').replace(/\/$/, '');
const demo = join(root, 'demo');

const { default: manifest } = await importDemo('js/components/manifest.js');
const { default: specs } = await importDemo('js/playground/specs/index.js');
const { defaultState } = await importDemo('js/playground/lib.js');

const RULES = `## How to use the library

- Load one stylesheet: \`${SITE}/css/parallelogram-dashboard.css\`. There is no build step and no framework.
- Classes follow BEM: \`block\`, \`block__element\`, \`block--modifier\`. A modifier always goes on the same element as its base class, e.g. \`class="btn btn--outline btn--sm"\`. Never use a modifier on its own.
- Only use the class names listed for each component; anything else is not styled.
- Dark mode: set \`data-theme="dark"\` on \`<html>\`. Colours come from CSS custom properties such as \`--bg\`, \`--fg\`, \`--primary\` and \`--border\`.
- Icons are inline SVGs with \`class="icon"\` (Tabler icon paths), plus an element class such as \`btn__icon\` where one exists.
- Interactive behaviour is optional progressive enhancement: \`data-accordion\`, \`data-tabs\` and \`data-toggle\` attributes are handled by \`${SITE}/js/main.js\`; \`<p-modal>\` and \`<p-datetime>\` are web components from \`@parallelogram-js/core\`.
- Classes starting with \`demo-\` in examples are page scaffolding for the demo site, not part of the library.`;

function classTable(classes) {
  const bases = classes.filter(c => !c.includes('--'));
  const rows = new Map(bases.map(b => [b, []]));
  for (const cls of classes.filter(c => c.includes('--'))) {
    const base = cls.slice(0, cls.indexOf('--'));
    if (!rows.has(base)) {
      rows.set(base, []);
    }
    rows.get(base).push(cls);
  }
  const lines = [...rows].map(([base, mods]) => `| \`${base}\` | ${mods.map(m => `\`${m}\``).join(' ') || '–'} |`);
  return ['| Class | Modifiers |', '|---|---|', ...lines].join('\n');
}

function staticExamples(slug) {
  const html = readFileSync(join(demo, 'components', `${slug}.html`), 'utf8');
  const match = html.match(/<h2 id="examples-heading"[^>]*>Examples<\/h2>\n([\s\S]*?)\n\s*<\/section>\s*<nav class="docs__pager"/);
  if (!match) {
    return '';
  }
  const lines = match[1].split('\n');
  const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  return lines.map(l => l.slice(indent)).join('\n').trim();
}

function componentMarkdown(group, page) {
  const parts = [
    `# ${page.name}`,
    `> ${page.description}`,
    `Part of Parallelogram Dashboard, a BEM CSS component library (${group.group}). Live page: ${SITE}/components/${page.slug}.html`,
  ];

  if (page.scss) {
    parts.push('## Classes', classTable(definedClasses(page.scss)));
  }

  const spec = specs.find(s => s.id === page.spec);
  if (spec) {
    const base = defaultState(spec);
    const presets = [...(spec.presets || [])];
    if (!presets.some(p => Object.keys(p.state).length === 0)) {
      presets.unshift({ name: 'Default', state: {} });
    }
    parts.push('## Examples');
    for (const preset of presets) {
      parts.push(`### ${preset.name}`, '```html\n' + formatHtml(spec.render({ ...base, ...preset.state })) + '\n```');
    }
  }

  const examples = staticExamples(page.slug);
  if (examples) {
    parts.push(spec ? '## More examples' : '## Examples', '```html\n' + examples + '\n```');
  }

  return parts.join('\n\n') + '\n';
}

rmSync(join(demo, 'llms'), { recursive: true, force: true });
mkdirSync(join(demo, 'llms'));

const full = [];
const index = [
  '# Parallelogram Dashboard',
  '> A BEM-style CSS dashboard component library inspired by shadcn/ui: plain HTML and one stylesheet, with optional vanilla JavaScript for interactive components.',
  RULES,
];

for (const group of manifest) {
  index.push(`## ${group.group}`);
  index.push(group.pages.map(p => `- [${p.name}](${SITE}/llms/${p.slug}.md): ${p.description}`).join('\n'));
  for (const page of group.pages) {
    const md = componentMarkdown(group, page);
    writeFileSync(join(demo, 'llms', `${page.slug}.md`), md);
    full.push(md);
  }
}

index.push('## Optional', `- [Full reference](${SITE}/llms-full.txt): every component's classes and examples in one file`);

writeFileSync(join(demo, 'llms.txt'), index.join('\n\n') + '\n');
writeFileSync(join(demo, 'llms-full.txt'), ['# Parallelogram Dashboard: full reference', RULES, ...full].join('\n\n'));

console.log(`Wrote llms.txt, llms-full.txt and ${full.length} component files to demo/`);
