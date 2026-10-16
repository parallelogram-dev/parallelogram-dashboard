/**
 * Cuts a release: npm run release -- <patch|minor|major|x.y.z>
 *
 * Refuses unless the working tree is clean, the branch is main and CHANGELOG.md has entries under
 * [Unreleased]. Then it builds, runs the playground check, sets the version in package.json and
 * package-lock.json, moves the Unreleased entries under the new version and today's date (with a
 * fresh empty Unreleased section and updated compare links), commits and tags vX.Y.Z. Pushing is
 * left to you, so the commit can be checked first: git push --follow-tags
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './lib.mjs';

const REPO = 'https://github.com/parallelogram-dev/parallelogram-dashboard';

const run = (cmd, args, options = {}) => execFileSync(cmd, args, { cwd: root, encoding: 'utf8', ...options });
const fail = (message) => {
  console.error(`release: ${message}`);
  process.exit(1);
};

const bump = process.argv[2];
if (!bump) fail('give patch, minor, major or a version such as 0.2.0');

if (run('git', ['status', '--porcelain']).trim()) fail('the working tree has uncommitted changes');
if (run('git', ['branch', '--show-current']).trim() !== 'main') fail('releases are cut from main');

const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);
const next = {
  major: `${major + 1}.0.0`,
  minor: `${major}.${minor + 1}.0`,
  patch: `${major}.${minor}.${patch + 1}`,
}[bump] ?? bump;
if (!/^\d+\.\d+\.\d+$/.test(next)) fail(`"${bump}" is not patch, minor, major or a version`);
if (run('git', ['tag', '--list', `v${next}`]).trim()) fail(`v${next} is already tagged`);

const changelogPath = join(root, 'CHANGELOG.md');
const changelog = readFileSync(changelogPath, 'utf8');
const unreleased = changelog.match(/^## \[Unreleased\]\n([\s\S]*?)(?=^## \[)/m);
if (!unreleased || !unreleased[1].trim()) fail('add the release notes under ## [Unreleased] in CHANGELOG.md first');

console.log(`Building and checking ${pkg.version} -> ${next}`);
run('npm', ['run', 'build'], { stdio: 'inherit' });
run('node', ['scripts/playground-check.mjs'], { stdio: 'inherit' });
if (run('git', ['status', '--porcelain']).trim()) fail('the build changed committed files; commit them on main, then release');

pkg.version = next;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
run('npm', ['install', '--package-lock-only', '--ignore-scripts'], { stdio: 'inherit' });

const today = new Date().toISOString().slice(0, 10);
const previous = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m)?.[1];
const released = changelog
  .replace(/^## \[Unreleased\]\n/m, `## [Unreleased]\n\n## [${next}] - ${today}\n`)
  .replace(/^\[Unreleased\]: .*$/m, [
    `[Unreleased]: ${REPO}/compare/v${next}...HEAD`,
    previous ? `[${next}]: ${REPO}/compare/v${previous}...v${next}` : `[${next}]: ${REPO}/releases/tag/v${next}`,
  ].join('\n'));
writeFileSync(changelogPath, released);

run('git', ['add', 'package.json', 'package-lock.json', 'CHANGELOG.md']);
run('git', ['commit', '-m', `Release v${next}`]);
run('git', ['tag', '-a', `v${next}`, '-m', `v${next}`]);
console.log(`Tagged v${next}. Check the commit, then: git push --follow-tags`);
