/**
 * Scheduled publishing for a record.
 *
 * Inside [data-publish-schedule], the status radios (name="status" with values draft, active and
 * archived) and two optional dates decide what the record shows as: a [data-publish-at] field for
 * when it goes live and a [data-expire-at] field for when it comes down. Each date is switched on
 * by a .segmented-control with data-publish-toggle="#fieldId", whose item marked data-later
 * shows the field; on the other item ("Now", "Never") the field is hidden and disabled, so it
 * isn't submitted but keeps its value.
 *
 * The area gets data-publish-state: "draft", "scheduled" (active, going live later), "live",
 * "expired" (active, past its take-down date) or "archived". Elements marked
 * data-publish-show="scheduled live" only show in the states listed, and [data-publish-date] and
 * [data-expire-date] elements show the dates in words. The area fires "publish:change" with
 * { state, publishAt, expireAt } when the state or a date changes.
 */
export class PublishSchedule {
  static elements = new WeakSet();

  static format = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

  mount(area) {
    if (PublishSchedule.elements.has(area)) return;
    PublishSchedule.elements.add(area);

    const toggles = [...area.querySelectorAll('[data-publish-toggle]')];
    const fieldFor = toggle => area.querySelector(toggle.dataset.publishToggle);
    const setLater = (toggle, later) => {
      const field = fieldFor(toggle);
      toggle.querySelectorAll('.segmented-control__item').forEach((item) => {
        item.setAttribute('aria-checked', String(item.hasAttribute('data-later') === later));
      });
      if (!field) return;
      field.hidden = !later;
      field.toggleAttribute('disabled', !later);
    };

    // Start on "Later" wherever a date is already set
    toggles.forEach(toggle => setLater(toggle, !!fieldFor(toggle)?.getAttribute('value')));

    let last = '';
    const update = () => {
      const detail = PublishSchedule.state(area);
      area.dataset.publishState = detail.state;
      area.querySelectorAll('[data-publish-date]').forEach((el) => { el.textContent = detail.publishAt ? PublishSchedule.format.format(detail.publishAt) : ''; });
      area.querySelectorAll('[data-expire-date]').forEach((el) => { el.textContent = detail.expireAt ? PublishSchedule.format.format(detail.expireAt) : ''; });
      const key = `${detail.state}|${detail.publishAt}|${detail.expireAt}`;
      if (key !== last) {
        last = key;
        area.dispatchEvent(new CustomEvent('publish:change', { detail }));
      }
    };

    area.addEventListener('segmented-control:change', (e) => {
      const toggle = toggles.find(t => t.contains(e.target));
      if (!toggle) return;
      setLater(toggle, e.detail.item.hasAttribute('data-later'));
      // Let the unsaved-changes guard and anything else watching fields know
      fieldFor(toggle)?.dispatchEvent(new Event('change', { bubbles: true }));
      if (e.detail.item.hasAttribute('data-later')) fieldFor(toggle)?.focus();
    });
    area.addEventListener('change', update);
    area.addEventListener('input', update);
    update();
    // Custom date fields may load after this runs
    customElements.whenDefined?.('p-datetime').then(update);
  }

  /** What a record shows as, from its status and dates, at a given time. */
  static state(area, now = Date.now()) {
    const status = area.querySelector('input[name="status"]:checked')?.value || 'draft';
    const date = (selector) => {
      const field = area.querySelector(selector);
      const value = field && !field.hasAttribute('disabled') ? (field.value ?? field.getAttribute('value')) : '';
      const time = value ? new Date(value) : null;
      return time && !Number.isNaN(time.getTime()) ? time : null;
    };
    const publishAt = date('[data-publish-at]');
    const expireAt = date('[data-expire-at]');
    let state = status === 'active' ? 'live' : status;
    if (status === 'active' && expireAt && expireAt.getTime() <= now) state = 'expired';
    else if (status === 'active' && publishAt && publishAt.getTime() > now) state = 'scheduled';
    return { state, publishAt, expireAt };
  }

  static enhanceAll(selector = '[data-publish-schedule]', root = document) {
    const instance = new PublishSchedule();
    root.querySelectorAll(selector).forEach(el => instance.mount(el));
    return instance;
  }
}
