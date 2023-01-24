import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import type { HierarchicalMenuSetup } from '.';
import type { Act } from '../../common';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/dom';

export function createOptimisticUiTests(
  setup: HierarchicalMenuSetup,
  act: Act
) {
  describe('optimistic UI', () => {
    test('checks the clicked refinement immediately regardless of network latency', async () => {
      const delay = 100;
      const margin = 10;
      const attributes = ['brand'];
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(() =>
                  createSingleSearchResponse({
                    facets: {
                      [attributes[0]]: {
                        Samsung: 100,
                        Apple: 200,
                      },
                    },
                  })
                )
              );
            }),
          }),
        },
        widgetParams: { attributes },
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // Initial state, before interaction
      {
        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item')
        ).toHaveLength(2);
        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item--selected')
        ).toHaveLength(0);
      }

      // Select a refinement
      {
        const firstItem = screen.getByRole('link', {
          name: 'Apple 200',
        });
        await act(async () => {
          userEvent.click(firstItem);
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        // @TODO: menu doesn't have any accessible way to determine if an item is selected, so we use the class name (https://github.com/algolia/instantsearch/issues/5187)
        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-HierarchicalMenu-item--selected a')
        ).toEqual(
          screen.getByRole('link', {
            name: 'Apple 200',
          })
        );
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
        });

        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-HierarchicalMenu-item--selected a')
        ).toEqual(
          screen.getByRole('link', {
            name: 'Apple 200',
          })
        );
      }

      // Unselect a refinement
      {
        const firstItem = screen.getByRole('link', {
          name: 'Apple 200',
        });
        await act(async () => {
          userEvent.click(firstItem);
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item--selected')
        ).toHaveLength(0);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
          await wait(0);
        });

        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item--selected')
        ).toHaveLength(0);
      }
    });

    test('reverts back to previous state on error', async () => {
      const delay = 100;
      const margin = 10;
      const attributes = ['brand'];
      let errors = false;
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              if (errors) {
                throw new Error('Network error!');
              }
              return createMultiSearchResponse(
                ...requests.map(() =>
                  createSingleSearchResponse({
                    facets: {
                      [attributes[0]]: {
                        Samsung: 100,
                        Apple: 200,
                      },
                    },
                  })
                )
              );
            }),
          }),
        },
        widgetParams: { attributes },
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // Initial state, before interaction
      {
        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item')
        ).toHaveLength(2);
        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item--selected')
        ).toHaveLength(0);
      }

      // start erroring
      errors = true;

      // Select a refinement
      {
        const firstItem = screen.getByRole('link', {
          name: 'Apple 200',
        });
        await act(async () => {
          firstItem.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-HierarchicalMenu-item--selected a')
        ).toEqual(
          screen.getByRole('link', {
            name: 'Apple 200',
          })
        );
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
          await wait(0);
        });

        // refinement has reverted back to previous state
        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item--selected')
        ).toHaveLength(0);
      }

      // stop erroring
      errors = false;

      // Select the refinement again
      {
        const firstItem = screen.getByRole('link', {
          name: 'Apple 200',
        });
        await act(async () => {
          firstItem.click();
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-HierarchicalMenu-item--selected a')
        ).toEqual(
          screen.getByRole('link', {
            name: 'Apple 200',
          })
        );
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
          await wait(0);
        });

        // refinement is consistent with clicks again
        expect(
          document.querySelectorAll('.ais-HierarchicalMenu-item--selected')
        ).toHaveLength(1);
        expect(
          document.querySelector('.ais-HierarchicalMenu-item--selected a')
        ).toEqual(
          screen.getByRole('link', {
            name: 'Apple 200',
          })
        );
      }
    });
  });
}
