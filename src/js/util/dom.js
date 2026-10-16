let generatedId = 0;

/**
 * Give an element an id if it has none, so ARIA relationships can point at it.
 */
export function ensureId(element, prefix) {
  if (!element.id) {
    generatedId += 1;
    element.id = `${prefix}-${generatedId}`;
  }
  return element.id;
}

export function isDisabled(element) {
  return element.disabled || element.getAttribute('aria-disabled') === 'true';
}

/**
 * Point a disclosure button at the region it controls and make sure it never submits a form.
 */
export function linkTrigger(trigger, region) {
  if (!trigger.hasAttribute('type')) trigger.type = 'button';
  if (!trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');
  if (region) trigger.setAttribute('aria-controls', ensureId(region, 'disclosure'));
}

/** Text made safe to put inside HTML markup or a quoted attribute. */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
