/**
 * Prepares a style comparison against an earlier release: npm run compare -- <tag or ref>
 *
 * Copies that ref's compiled library and demo stylesheets into demo/compare/ (git-ignored).
 * demo/compare.html then loads each chosen page with the current CSS and with these, and lists
 * every element whose computed styles differ. Only the CSS comes from the ref; the pages' markup
 * is today's, so the comparison shows what the stylesheet change alone does.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './lib.mjs';

const ref = process.argv[2];
if (!ref) {
  console.error('compare: give a tag or ref to compare with, such as v0.1.0');
  process.exit(1);
}

const show = path => execFileSync('git', ['show', `${ref}:${path}`], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const out = join(root, 'demo', 'compare');
mkdirSync(out, { recursive: true });

try {
  writeFileSync(join(out, 'baseline.css'), show('demo/css/parallelogram-dashboard.css'));
  writeFileSync(join(out, 'baseline-demo.css'), show('demo/css/demo.css'));
} catch {
  console.error(`compare: couldn't read the stylesheets at "${ref}"`);
  process.exit(1);
}
writeFileSync(join(out, 'baseline.json'), `${JSON.stringify({ ref, prepared: new Date().toISOString() }, null, 2)}\n`);

console.log(`Baseline is ${ref}. Run npm run serve and open http://localhost:8080/compare.html`);
