/**
 * @jest-environment jsdom
 */
import * as suites from '@instantsearch/tests/widgets';
import { act, render } from '@testing-library/react';
import React from 'react';

import {
  InstantSearch,
  RefinementList,
  HierarchicalMenu,
  Breadcrumb,
  Menu,
  Pagination,
  InfiniteHits,
  SearchBox,
  useInstantSearch,
  Hits,
  Index,
  RangeInput,
} from '..';

import type { Hit } from 'instantsearch.js';
import type { SendEventForHits } from 'instantsearch.js/es/lib/utils';

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;
type TestSetups = {
  [key in keyof TestSuites]: Parameters<TestSuites[key]>[0];
};

const setups: TestSetups = {
  createRefinementListWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <RefinementList {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createHierarchicalMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <HierarchicalMenu {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createBreadcrumbWidgetTests({ instantSearchOptions, widgetParams }) {
    const { transformItems, ...hierarchicalWidgetParams } = widgetParams;

    render(
      <InstantSearch {...instantSearchOptions}>
        <Breadcrumb {...widgetParams} />
        <HierarchicalMenu {...hierarchicalWidgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <Menu {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createPaginationWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <Pagination {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createInfiniteHitsWidgetTests({ instantSearchOptions, widgetParams }) {
    function MainHit({
      hit,
      sendEvent,
    }: {
      hit: Hit;
      sendEvent: SendEventForHits;
    }) {
      return (
        <div data-testid={`main-hits-top-level-${hit.__position}`}>
          {hit.objectID}
          <button
            data-testid={`main-hits-convert-${hit.__position}`}
            onClick={() => sendEvent('conversion', hit, 'Converted')}
          >
            convert
          </button>
          <button
            data-testid={`main-hits-click-${hit.__position}`}
            onClick={() => sendEvent('click', hit, 'Clicked')}
          >
            click
          </button>
        </div>
      );
    }

    function NestedHit({
      hit,
      sendEvent,
    }: {
      hit: Hit;
      sendEvent: SendEventForHits;
    }) {
      return (
        <div data-testid={`nested-hits-${hit.__position}`}>
          {hit.objectID}
          <button
            data-testid={`nested-hits-click-${hit.__position}`}
            onClick={() => sendEvent('click', hit, 'Clicked nested')}
          >
            click
          </button>
        </div>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <SearchBox />
        <InfiniteHits id="main-hits" hitComponent={MainHit} {...widgetParams} />
        <Index indexName="nested">
          <InfiniteHits id="nested-hits" hitComponent={NestedHit} />
        </Index>
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createHitsWidgetTests({ instantSearchOptions, widgetParams }) {
    function MainHit({
      hit,
      sendEvent,
    }: {
      hit: Hit;
      sendEvent: SendEventForHits;
    }) {
      return (
        <div data-testid={`main-hits-top-level-${hit.__position}`}>
          {hit.objectID}
          <button
            data-testid={`main-hits-convert-${hit.__position}`}
            onClick={() => sendEvent('conversion', hit, 'Converted')}
          >
            convert
          </button>
          <button
            data-testid={`main-hits-click-${hit.__position}`}
            onClick={() => sendEvent('click', hit, 'Clicked')}
          >
            click
          </button>
        </div>
      );
    }

    function NestedHit({
      hit,
      sendEvent,
    }: {
      hit: Hit;
      sendEvent: SendEventForHits;
    }) {
      return (
        <div data-testid={`nested-hits-${hit.__position}`}>
          {hit.objectID}
          <button
            data-testid={`nested-hits-click-${hit.__position}`}
            onClick={() => sendEvent('click', hit, 'Clicked nested')}
          >
            click
          </button>
        </div>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <SearchBox />
        <Hits id="main-hits" hitComponent={MainHit} {...widgetParams} />
        <Index indexName="nested">
          <Hits id="nested-hits" hitComponent={NestedHit} />
        </Index>
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createRangeInputWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <RangeInput {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createInstantSearchWidgetTests({ instantSearchOptions }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <GlobalErrorSwallower />
      </InstantSearch>
    );

    return {
      algoliaAgents: [
        `instantsearch.js (${
          require('../../../instantsearch.js/package.json').version
        })`,
        `react-instantsearch (${
          require('../../../react-instantsearch-hooks/package.json').version
        })`,
        `react (${require('react').version})`,
      ],
    };
  },
};

/**
 * prevent rethrowing InstantSearch errors, so tests can be asserted.
 * IRL this isn't needed, as the error doesn't stop execution.
 */
function GlobalErrorSwallower() {
  useInstantSearch({ catchError: true });

  return null;
}

describe('Common widget tests (React InstantSearch)', () => {
  test('has all the tests', () => {
    expect(Object.keys(setups).sort()).toEqual(Object.keys(testSuites).sort());
  });

  Object.keys(testSuites).forEach((testName) => {
    // @ts-ignore (typescript is only referentially typed)
    // https://github.com/microsoft/TypeScript/issues/38520
    testSuites[testName](setups[testName], act);
  });
});
