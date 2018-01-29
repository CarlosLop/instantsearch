import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('Menu', module)
  .addDecorator(previewWrapper)
  .add('default', () => ({
    template: '<ais-menu attributeName="materials"></ais-menu>',
  }))
  .add('limit the facet values', () => ({
    template: '<ais-menu attributeName="materials" :limit="3"></ais-menu>',
  }))
  .add('custom rendering', () => ({
    template: `<ais-menu attributeName="materials" :limit="3">
      <h3 slot="header">Materials</h3>
      <hr slot="footer" />
    </ais-menu>`,
  }));
