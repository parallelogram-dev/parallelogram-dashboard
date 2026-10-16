/**
 * Parallelogram Dashboard
 *
 * Progressive enhancement for the dashboard components: markup works without JS and is
 * enhanced by init(). State lives in native and ARIA attributes (aria-expanded, aria-selected,
 * hidden, open); the stylesheet reads those, so no state classes are toggled here.
 */

import { Accordion } from './behaviours/accordion.js';
import { Collapsible } from './behaviours/collapsible.js';
import { Submenu } from './behaviours/submenu.js';
import { Tabs } from './behaviours/tabs.js';
import { SegmentedControl } from './behaviours/segmented-control.js';
import { Toggle } from './behaviours/toggle.js';
import { Expandable } from './behaviours/expandable.js';
import { TableColumns } from './behaviours/table-columns.js';
import { TableSort } from './behaviours/table-sort.js';
import { TableReorder } from './behaviours/table-reorder.js';
import { TablePaste } from './behaviours/table-paste.js';
import { PublishSchedule } from './behaviours/publish-schedule.js';
import { UnsavedGuard } from './behaviours/unsaved-guard.js';
import { EditableTable } from './behaviours/editable-table.js';
import { Chart } from './behaviours/chart.js';
import { OverflowActions } from './behaviours/overflow-actions.js';
import { ActionBar } from './behaviours/action-bar.js';
import { ActionBarList } from './behaviours/action-bar-list.js';
import { SearchClear } from './behaviours/search-clear.js';
import { ToastManager } from './behaviours/toast-manager.js';
import { loadParallelogramJs } from './core-loader.js';

export {
  Accordion,
  Collapsible,
  Submenu,
  Tabs,
  SegmentedControl,
  Toggle,
  Expandable,
  TableColumns,
  TableSort,
  TableReorder,
  TablePaste,
  PublishSchedule,
  UnsavedGuard,
  EditableTable,
  Chart,
  OverflowActions,
  ActionBar,
  ActionBarList,
  SearchClear,
  ToastManager,
};
export { loadParallelogramJs } from './core-loader.js';
export { polyfillDialogCommands } from './polyfills/dialog-commands.js';

/**
 * Enhance every interactive component inside root.
 *
 * Safe to call repeatedly on freshly rendered markup, e.g. from the playground preview.
 */
export function init(root = document) {
  loadParallelogramJs(root);

  return {
    // Action bars and overflow actions run first so the "more" menus they create get their toggle behaviour
    actionbar: ActionBar.enhanceAll('.actionbar', root),
    overflowActions: OverflowActions.enhanceAll('[data-overflow-actions]', root),
    actionbarList: ActionBarList.enhanceAll('.actionbar__list', root),
    accordion: Accordion.enhanceAll('[data-accordion]', root),
    collapsible: Collapsible.enhanceAll('.collapsible', root),
    submenu: Submenu.enhanceAll('.dropdown__submenu', root),
    tabs: Tabs.enhanceAll('[data-tabs]', root),
    segmentedControl: SegmentedControl.enhanceAll('.segmented-control', root),
    toggle: Toggle.enhanceAll('[data-toggle]', root),
    editableTable: EditableTable.enhanceAll('.table--editable', root),
    publishSchedule: PublishSchedule.enhanceAll('[data-publish-schedule]', root),
    unsavedGuard: UnsavedGuard.enhanceAll('[data-unsaved-guard]', root),
    expandable: Expandable.enhanceAll('[data-expandable]', root),
    tableColumns: TableColumns.enhanceAll('[data-table-columns]', root),
    tableSort: TableSort.enhanceAll('[data-table-sort]', root),
    tableReorder: TableReorder.enhanceAll('[data-table-reorder]', root),
    tablePaste: TablePaste.enhanceAll('[data-table-paste]', root),
    chart: Chart.enhanceAll('[data-chart]', root),
  };
}
