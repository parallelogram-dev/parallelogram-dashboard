const WEB_COMPONENTS = {
  'p-modal': () => import('@parallelogram-js/core/components/PModal.js'),
  'p-datetime': () => import('@parallelogram-js/core/components/PDatetime.js'),
};

/**
 * Load the @parallelogram-js/core pieces that markup inside root relies on.
 *
 * Each piece is a literal dynamic import, so a bundler splits it into its own chunk and nothing
 * is fetched when a page does not use these components.
 */
export async function loadParallelogramJs(root) {
  const loads = Object.entries(WEB_COMPONENTS)
    .filter(([tag]) => root.querySelector(tag) && !customElements.get(tag))
    .map(([, load]) => load());

  if (root.querySelector('[data-modal][data-modal-target]')) {
    loads.push(import('@parallelogram-js/core/components/Modal.js').then(({ default: Modal }) => Modal.enhanceAll()));
  }

  try {
    await Promise.all(loads);
  } catch (error) {
    console.error('Could not load @parallelogram-js/core, which <p-modal>, <p-datetime> and [data-modal] need.', error);
  }
}
