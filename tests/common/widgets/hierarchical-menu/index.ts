import type { HierarchicalMenuWidget } from 'instantsearch.js/es/widgets/hierarchical-menu/hierarchical-menu';
import type { TestOptions, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';

type WidgetParams = Parameters<HierarchicalMenuWidget>[0];
export type HierarchicalMenuWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createHierarchicalMenuWidgetTests(
  setup: HierarchicalMenuWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('HierarchicalMenu widget common tests', () => {
    createOptimisticUiTests(setup, { act, skippedTests });
  });
}
