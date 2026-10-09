/**
 * Verifies that every class defined in a component's SCSS appears in the playground.
 *
 * Each spec is rendered with its defaults, every preset, and every single control value
 * changed one at a time. The class names in that output are compared against the classes
 * compiled from the spec's `sources`. It also fails when a component partial has no page in the
 * manifest, and lists pages that have no playground spec yet.
 *
 * Deprecated state classes (see deprecated-states.mjs) are exempt from the coverage check and
 * produce a warning wherever a spec or demo page still renders them.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import deprecated from './deprecated-states.mjs';
import { definedClasses, importDemo, root, scssDir } from './lib.mjs';

const { default: specs } = await importDemo('js/playground/specs/index.js');
const { defaultState, normaliseOptions } = await importDemo('js/playground/lib.js');
const { default: manifest } = await importDemo('js/components/manifest.js');
const pages = manifest.flatMap(group => group.pages);

function renderedClasses(spec) {
  const base = defaultState(spec);
  const states = [base, ...(spec.presets || []).map(p => ({ ...base, ...p.state }))];

  for (const control of spec.controls) {
    const values = control.type === 'select'
      ? normaliseOptions(control.options).map(o => o.value)
      : control.type === 'toggle' ? [true, false] : [];
    for (const start of [base, ...states.slice(1)]) {
      for (const value of values) {
        states.push({ ...start, [control.key]: value });
      }
    }
  }

  const classes = new Set();
  for (const state of states) {
    for (const match of spec.render(state).matchAll(/class="([^"]*)"/g)) {
      match[1].split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
    }
  }
  return classes;
}

let failed = false;
const covered = new Set();
const warnings = [];

function warnDeprecated(where, classes) {
  for (const c of classes) {
    if (Object.hasOwn(deprecated, c)) {
      warnings.push(`⚠ ${where} renders deprecated .${c}; use ${deprecated[c]}`);
    }
  }
}

for (const spec of specs) {
  const rendered = renderedClasses(spec);
  const ignored = new Set([...(spec.ignore || []), ...Object.keys(deprecated)]);
  warnDeprecated(`spec "${spec.id}"`, rendered);
  for (const source of spec.sources) {
    covered.add(source);
    const missing = [...definedClasses(source)].filter(c => !rendered.has(c) && !ignored.has(c));
    if (missing.length) {
      failed = true;
      console.error(`✗ ${spec.name} (${source}) never renders: ${missing.map(c => `.${c}`).join(' ')}`);
    } else {
      console.log(`✓ ${spec.name} (${source})`);
    }
  }
}

const documented = new Set(pages.map(p => p.scss).filter(Boolean));
const undocumented = readdirSync(join(scssDir, 'components'))
  .map(f => `components/${f}`)
  .filter(f => !documented.has(f));
if (undocumented.length) {
  failed = true;
  console.error(`✗ No page in demo/js/components/manifest.js for: ${undocumented.join(' ')}`);
}

for (const page of pages.filter(p => p.spec && !specs.some(s => s.id === p.spec))) {
  failed = true;
  console.error(`✗ Page "${page.slug}" names spec "${page.spec}", which is not registered in specs/index.js`);
}

const pageFiles = [
  ...readdirSync(join(root, 'demo')).filter(f => f.endsWith('.html')),
  ...readdirSync(join(root, 'demo', 'components')).filter(f => f.endsWith('.html')).map(f => `components/${f}`),
];
for (const file of pageFiles) {
  const html = readFileSync(join(root, 'demo', file), 'utf8');
  const tokens = new Set(html.match(/[a-z][a-z0-9-]*(?:__[a-z0-9-]+)?--[a-z0-9-]+/g) || []);
  warnDeprecated(`demo/${file}`, tokens);
}

if (warnings.length) {
  console.warn(`\n${warnings.join('\n')}`);
}

const pending = pages.filter(p => p.scss?.startsWith('components/') && !covered.has(p.scss));
if (pending.length) {
  console.log(`\n${pending.length} component pages have no playground spec yet: ${pending.map(p => p.slug).join(', ')}`);
}

process.exitCode = failed ? 1 : 0;
