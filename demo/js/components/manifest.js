/**
 * Every component page under demo/components/, grouped for navigation.
 *
 * `scss` names the partial the page documents; the playground check uses it to make sure
 * every component partial has a page. `spec` is set when the page has a live playground.
 */
export default [
  {
    group: 'Foundations',
    pages: [
      { slug: 'typography', name: 'Typography', description: 'Text styles and hierarchy.', scss: '_base.scss' },
    ],
  },
  {
    group: 'Actions',
    pages: [
      { slug: 'actionbar', name: 'Action Bar', description: 'A segmented bar standing for one record, with a reorder handle, title, switches, dropdowns and actions.', scss: 'components/_actionbar.scss', spec: 'actionbar' },
      { slug: 'button', name: 'Button', description: 'Triggers an action. Works on <button> and <a> elements.', scss: 'components/_button.scss', spec: 'button' },
      { slug: 'dropdown', name: 'Dropdown', description: 'Contextual menus and actions.', scss: 'components/_dropdown.scss', spec: 'dropdown' },
      { slug: 'command', name: 'Command', description: 'Command palette (⌘K style) for quick actions.', scss: 'components/_command.scss', spec: 'command' },
    ],
  },
  {
    group: 'Forms',
    pages: [
      { slug: 'input', name: 'Input', description: 'Text inputs, textareas, selects, checkboxes, radios and switches.', scss: 'components/_input.scss', spec: 'input' },
      { slug: 'datetime', name: 'Datetime Picker', description: 'Date and time selection using the <p-datetime> web component from parallelogram-js.' },
      { slug: 'form-layout', name: 'Form Layout', description: 'Form sections, rows, and enhanced fields.', scss: 'components/_form-layout.scss', spec: 'form-layout' },
      { slug: 'toolbar', name: 'Toolbar', description: 'Search input with filters and actions.', scss: 'components/_toolbar.scss', spec: 'toolbar' },
    ],
  },
  {
    group: 'Data display',
    pages: [
      { slug: 'accordion', name: 'Accordion', description: 'Expandable content sections.', scss: 'components/_accordion.scss', spec: 'accordion' },
      { slug: 'avatar', name: 'Avatar', description: 'User profile images with fallbacks.', scss: 'components/_avatar.scss', spec: 'avatar' },
      { slug: 'badge', name: 'Badge', description: 'Small status labels, counts and removable tags.', scss: 'components/_badge.scss', spec: 'badge' },
      { slug: 'chart', name: 'Chart', description: 'Line, area, bar and stacked bar charts drawn from a data table.', scss: 'components/_chart.scss', spec: 'chart' },
      { slug: 'card', name: 'Card', description: 'Container for grouped content with optional header, image and footer.', scss: 'components/_card.scss', spec: 'card' },
      { slug: 'data-list', name: 'Data List', description: 'Key-value pair displays for record details.', scss: 'components/_data-list.scss', spec: 'data-list' },
      { slug: 'empty', name: 'Empty State', description: 'Placeholder content for empty views.', scss: 'components/_empty.scss', spec: 'empty' },
      { slug: 'progress', name: 'Progress', description: 'Progress indicators and loading states.', scss: 'components/_progress.scss', spec: 'progress' },
      { slug: 'separator', name: 'Separator', description: 'Visual dividers for content sections.', scss: 'components/_separator.scss', spec: 'separator' },
      { slug: 'skeleton', name: 'Skeleton', description: 'Loading placeholder states.', scss: 'components/_skeleton.scss', spec: 'skeleton' },
      { slug: 'stat', name: 'Stat', description: 'Statistics and metric cards.', scss: 'components/_stat.scss', spec: 'stat' },
      { slug: 'table', name: 'Table', description: 'Data display in rows and columns.', scss: 'components/_table.scss', spec: 'table' },
      { slug: 'timeline', name: 'Timeline', description: 'Activity feeds and event history.', scss: 'components/_timeline.scss', spec: 'timeline' },
    ],
  },
  {
    group: 'Feedback',
    pages: [
      { slug: 'alert', name: 'Alert', description: 'Inline notification messages. Use the banner form for full-bleed page messages.', scss: 'components/_alert.scss', spec: 'alert' },
      { slug: 'banner', name: 'Banner', description: 'Full-width notification banners.', scss: 'components/_banner.scss', spec: 'banner' },
      { slug: 'toast', name: 'Toast', description: 'Temporary notification messages.', scss: 'components/_toast.scss', spec: 'toast' },
      { slug: 'tooltip', name: 'Tooltip', description: 'Hover hints and contextual information.', scss: 'components/_tooltip.scss', spec: 'tooltip' },
    ],
  },
  {
    group: 'Overlays',
    pages: [
      { slug: 'modal', name: 'Modal', description: 'Dialog overlays for focused interactions, using the <p-modal> web component from parallelogram-js.', scss: 'components/_modal.scss', spec: 'modal' },
      { slug: 'sheet', name: 'Sheet', description: 'Slide-out panels from screen edges.', scss: 'components/_sheet.scss', spec: 'sheet' },
    ],
  },
  {
    group: 'Navigation & layout',
    pages: [
      { slug: 'breadcrumb', name: 'Breadcrumb', description: 'Navigation path indicator.', scss: 'components/_breadcrumb.scss', spec: 'breadcrumb' },
      { slug: 'pagination', name: 'Pagination', description: 'Page navigation controls.', scss: 'components/_pagination.scss', spec: 'pagination' },
      { slug: 'tabs', name: 'Tabs', description: 'Tabbed navigation for content sections.', scss: 'components/_tabs.scss', spec: 'tabs' },
      { slug: 'navbar', name: 'Navbar', description: 'Top navigation bar with brand, search and actions.', scss: 'components/_navbar.scss', spec: 'navbar' },
      { slug: 'sidebar', name: 'Sidebar', description: 'Collapsible side navigation.', scss: 'components/_sidebar.scss', spec: 'sidebar' },
      { slug: 'dashboard', name: 'Dashboard Layout', description: 'Application shell combining sidebar, header and content.', scss: 'components/_dashboard.scss', spec: 'dashboard' },
    ],
  },
];
