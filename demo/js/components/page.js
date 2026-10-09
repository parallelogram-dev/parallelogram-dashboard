import manifest from './manifest.js';
import specs from '../playground/specs/index.js';
import { mountPlayground } from '../playground/widget.js';
import { bindThemeToggle } from './theme.js';
import { escape } from '../playground/lib.js';
import { formatHtml } from '../playground/format.js';

const slug = document.body.dataset.component;
const pages = manifest.flatMap(group => group.pages);
const index = pages.findIndex(p => p.slug === slug);

function renderNav(nav) {
  const current = pages[index]?.name ?? 'Components';
  nav.innerHTML = `
    <button type="button" class="btn btn--outline btn--sm btn--full docs__navtoggle" aria-expanded="false" aria-controls="docs-navbody" data-nav-toggle>
      Components: ${escape(current)}
    </button>
    <div class="docs__navbody" id="docs-navbody">
    <input type="search" class="input input--sm" placeholder="Filter components…" aria-label="Filter components" data-nav-filter>
    ${manifest.map(group => `
      <div class="docs__navgroup" data-nav-group>
        <p class="docs__navheading">${escape(group.group)}</p>
        <ul class="docs__navlist">
          ${group.pages.map(p => `<li><a class="docs__navlink" href="${p.slug}.html"${p.slug === slug ? ' aria-current="page"' : ''}>${escape(p.name)}</a></li>`).join('')}
        </ul>
      </div>`).join('')}
    </div>
  `;

  const toggle = nav.querySelector('[data-nav-toggle]');
  toggle.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') !== 'true'));
  });

  nav.querySelector('[data-nav-filter]').addEventListener('input', event => {
    const term = event.target.value.trim().toLowerCase();
    nav.querySelectorAll('[data-nav-group]').forEach(group => {
      let visible = 0;
      group.querySelectorAll('li').forEach(li => {
        li.hidden = !li.textContent.toLowerCase().includes(term);
        visible += li.hidden ? 0 : 1;
      });
      group.hidden = visible === 0;
    });
  });
}

function renderPager(pager) {
  const prev = pages[index - 1];
  const next = pages[index + 1];
  pager.innerHTML = [
    prev ? `<a class="btn btn--outline" href="${prev.slug}.html" rel="prev">← ${escape(prev.name)}</a>` : '<span></span>',
    next ? `<a class="btn btn--outline" href="${next.slug}.html" rel="next">${escape(next.name)} →</a>` : '',
  ].join('');
}

renderNav(document.querySelector('[data-component-nav]'));
renderPager(document.querySelector('[data-pager]'));
bindThemeToggle(document.querySelector('[data-theme-toggle]'));

/**
 * "Copy for LLM" puts this component's generated Markdown reference (classes, modifiers,
 * examples) on the clipboard, plus the current playground markup when there is one.
 *
 * The reference is fetched up front because clipboard writes must happen during the click.
 */
function addLlmCopy(intro) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--outline btn--sm docs__llm';
  button.textContent = 'Copy for LLM';
  button.disabled = true;
  intro.append(button);

  let reference = '';
  fetch(`../llms/${slug}.md`)
    .then(response => (response.ok ? response.text() : Promise.reject(new Error(String(response.status)))))
    .then(text => {
      reference = text;
      button.disabled = false;
    })
    .catch(() => {
      button.title = 'Reference not built yet. Run npm run build.';
    });

  button.addEventListener('click', async () => {
    const markup = document.querySelector('.pw [data-code]')?.textContent;
    const fence = '```';
    const text = markup
      ? `${reference}\n## Current playground markup\n\n${fence}html\n${markup}\n${fence}\n`
      : reference;
    try {
      await navigator.clipboard.writeText(text);
      window.toast?.success(`Copied the ${pages[index].name} reference for your LLM`, { duration: 2500 });
    } catch {
      window.toast?.error('Copy failed. Open the reference from llms.txt instead.');
    }
  });
}

addLlmCopy(document.querySelector('.docs__intro'));

/**
 * Give every static example an "HTML" disclosure with its formatted markup and a copy button.
 *
 * An example is the element after each .demo-label, or each top-level block when a page has no
 * labels. Markup is captured before main.js enhances the page, so it carries no runtime
 * attributes, and demo-* layout classes are stripped because they are not part of the library.
 */
function addExampleCode(section) {
  if (!section) {
    return;
  }
  const labels = [...section.querySelectorAll('.demo-label')];
  const examples = labels.length
    ? labels.map(label => label.nextElementSibling).filter(Boolean)
    : [...section.children].filter(el => !el.matches('h2, p, .docs__code'));

  for (const example of examples) {
    const clone = example.cloneNode(true);
    for (const el of [clone, ...clone.querySelectorAll('[class]')]) {
      const kept = [...el.classList].filter(c => !c.startsWith('demo-') && !/^(spacer|constrain|layout)--?/.test(c));
      if (kept.length) {
        el.setAttribute('class', kept.join(' '));
      } else {
        el.removeAttribute('class');
      }
    }
    const code = formatHtml(clone.outerHTML);

    const details = document.createElement('details');
    details.className = 'docs__code';
    details.innerHTML = `<summary class="docs__codesummary">HTML</summary>
      <div class="docs__codebody">
        <button type="button" class="btn btn--ghost btn--sm docs__codecopy">Copy</button>
        <pre class="docs__pre"><code></code></pre>
      </div>`;
    details.querySelector('code').textContent = code;
    details.querySelector('.docs__codecopy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
        window.toast?.success('Markup copied to clipboard', { duration: 2000 });
      } catch {
        window.toast?.error('Copy failed. Select the code and copy it manually.');
      }
    });
    example.after(details);
  }
}

addExampleCode(document.querySelector('[aria-labelledby="examples-heading"]'));

const playground = document.querySelector('[data-playground]');
const spec = specs.find(s => s.id === pages[index]?.spec);
if (playground && spec) {
  mountPlayground(playground, spec);
}
