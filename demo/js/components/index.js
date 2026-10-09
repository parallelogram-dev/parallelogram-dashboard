import manifest from './manifest.js';
import { bindThemeToggle } from './theme.js';
import { escape } from '../playground/lib.js';

document.querySelector('[data-gallery]').innerHTML = manifest.map(group => `
  <section class="docs__gallerygroup" aria-label="${escape(group.group)}">
    <h2 class="docs__h2">${escape(group.group)}</h2>
    <div class="docs__gallery">
      ${group.pages.map(page => `
        <a class="card card--interactive docs__gallerycard" href="components/${page.slug}.html">
          <div class="card__header">
            <h3 class="card__title">${escape(page.name)}${page.spec ? '<span class="badge badge--secondary badge--sm">Playground</span>' : ''}</h3>
            <p class="card__description">${escape(page.description)}</p>
          </div>
        </a>`).join('')}
    </div>
  </section>`).join('');

bindThemeToggle(document.querySelector('[data-theme-toggle]'));
