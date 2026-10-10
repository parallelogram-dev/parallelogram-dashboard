/**
 * Registers every playground spec in demo/js/playground/specs/.
 *
 * Rewrites specs/index.js from the spec files on disk, sets `spec` on the matching manifest
 * entries, and adds a Playground section to any component page that lacks one. Safe to re-run.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './lib.mjs';

const specsDir = join(root, 'demo/js/playground/specs');
const files = readdirSync(specsDir).filter(f => f.endsWith('.js') && f !== 'index.js').sort();
const ids = [];

for (const file of files) {
  const source = readFileSync(join(specsDir, file), 'utf8');
  const id = source.match(/^\s*id:\s*'([^']+)'/m)?.[1];
  if (!id) throw new Error(`${file} has no id`);
  ids.push({ id, file, binding: id.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) });
}

writeFileSync(join(specsDir, 'index.js'), [
  ...ids.map(s => `import ${s.binding} from './${s.file}';`),
  '',
  `export default [${ids.map(s => s.binding).join(', ')}];`,
  '',
].join('\n'));

const manifestPath = join(root, 'demo/js/components/manifest.js');
let manifest = readFileSync(manifestPath, 'utf8');
for (const { id } of ids) {
  const entry = new RegExp(`(\\{ slug: '${id}',[^}]*?)(, spec: '[^']*')?( \\})`);
  if (!entry.test(manifest)) throw new Error(`No manifest entry for ${id}`);
  manifest = manifest.replace(entry, `$1, spec: '${id}'$3`);
}
writeFileSync(manifestPath, manifest);

const playground = `      <section class="docs__section" aria-labelledby="playground-heading">
        <h2 id="playground-heading" class="docs__h2">Playground</h2>
        <div data-playground></div>
      </section>

`;
for (const { id } of ids) {
  const pagePath = join(root, 'demo/components', `${id}.html`);
  const page = readFileSync(pagePath, 'utf8');
  if (page.includes('data-playground')) continue;
  const at = page.indexOf('      <section class="docs__section" aria-labelledby="examples-heading">');
  if (at < 0) throw new Error(`No examples section in ${id}.html`);
  writeFileSync(pagePath, page.slice(0, at) + playground + page.slice(at));
}

console.log(`Registered ${ids.length} specs: ${ids.map(s => s.id).join(', ')}`);
