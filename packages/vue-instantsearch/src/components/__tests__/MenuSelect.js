import { mount } from '../../../test/utils';
import MenuSelect from '../MenuSelect.vue';
import { __setState } from '../../mixins/widget';

jest.mock('../../mixins/widget');
jest.mock('../../mixins/panel');

const defaultState = {
  canRefine: true,
  items: [
    { label: 'Apple', value: 'Apple', isRefined: false, count: 50 },
    { label: 'Samsung', value: 'Samsung', isRefined: false, count: 20 },
    { label: 'Sony', value: 'Sony', isRefined: false, count: 15 },
  ],
};

const defaultProps = {
  attribute: 'brand',
};

it('accepts an attribute prop', () => {
  __setState({
    ...defaultState,
  });

  const props = {
    ...defaultProps,
  };

  const wrapper = mount(MenuSelect, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams.attribute).toBe('brand');
});

it('accepts a limit prop', () => {
  __setState({
    ...defaultState,
  });

  const props = {
    ...defaultProps,
    limit: 5,
  };

  const wrapper = mount(MenuSelect, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams.limit).toBe(5);
});

it('accepts a sortBy prop', () => {
  __setState({
    ...defaultState,
  });

  const props = {
    ...defaultProps,
    sortBy: ['name:desc'],
  };

  const wrapper = mount(MenuSelect, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams.sortBy).toEqual(['name:desc']);
});

it('accepts a transformItems prop', () => {
  __setState({
    ...defaultState,
  });

  const transformItems = () => {};

  const props = {
    ...defaultProps,
    transformItems,
  };

  const wrapper = mount(MenuSelect, {
    propsData: props,
  });

  expect(wrapper.vm.widgetParams.transformItems).toBe(transformItems);
});

describe('default render', () => {
  it('renders correctly', () => {
    __setState({
      ...defaultState,
    });

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(MenuSelect, {
      propsData: props,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with custom label', () => {
    __setState({
      ...defaultState,
    });

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(MenuSelect, {
      propsData: props,
      slots: {
        // tag is needed here for Vue Test Utils, even if it's invalid HTML
        defaultOption: '<span>None</span>',
      },
    });

    expect(wrapper.find('option').html()).toContain('None');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a selected value', () => {
    __setState({
      ...defaultState,
      items: [
        { label: 'Apple', value: 'Apple', isRefined: false, count: 50 },
        { label: 'Samsung', value: 'Samsung', isRefined: true, count: 20 },
        { label: 'Sony', value: 'Sony', isRefined: false, count: 15 },
      ],
    });

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(MenuSelect, {
      propsData: props,
    });

    const selected = wrapper.find('[value="Samsung"]');
    const options = wrapper.findAll('option:not([value="Samsung"])');

    expect(selected.element.selected).toBe(true);

    options.wrappers.forEach(option => {
      expect(option.element.selected).toBe(false);
    });
  });

  it('renders correctly without refinements', () => {
    __setState({
      ...defaultState,
      canRefine: false,
      items: [],
    });

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(MenuSelect, {
      propsData: props,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calls refine on select change', async () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const props = {
      ...defaultProps,
    };

    const wrapper = mount(MenuSelect, {
      propsData: props,
    });

    expect(refine).not.toHaveBeenCalled();

    const select = wrapper.find('select');

    // Simulate the change
    select.element.value = 'Apple';

    await select.trigger('change');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith('Apple');
  });
});

it('calls the Panel mixin with `canRefine`', async () => {
  __setState({ ...defaultState });

  const wrapper = mount(MenuSelect, {
    propsData: defaultProps,
  });

  const mapStateToCanRefine = () =>
    wrapper.vm.mapStateToCanRefine(wrapper.vm.state);

  expect(mapStateToCanRefine()).toBe(true);

  await wrapper.setData({
    state: {
      canRefine: false,
    },
  });

  expect(mapStateToCanRefine()).toBe(false);

  expect(wrapper.vm.mapStateToCanRefine({})).toBe(false);
});

it('exposes send-event method for insights middleware', async () => {
  const sendEvent = jest.fn();
  __setState({
    ...defaultState,
    sendEvent,
  });

  const wrapper = mount({
    components: { MenuSelect },
    data() {
      return { props: defaultProps };
    },
    template: `
      <MenuSelect v-bind="props">
        <template v-slot="{ sendEvent }">
          <div>
            <button @click="sendEvent()">Send Event</button>
          </div>
        </template>
      </MenuSelect>
    `,
  });

  await wrapper.find('button').trigger('click');
  expect(sendEvent).toHaveBeenCalledTimes(1);
});

describe('custom item slot', () => {
  it('renders correctly', () => {
    __setState({
      ...defaultState,
    });

    const wrapper = mount({
      components: { MenuSelect },
      data() {
        return { props: defaultProps };
      },
      template: `
        <MenuSelect v-bind="props">
          <template v-slot:item="{ item }">
            <span>
              {{ item.label }}
            </span>
          </template>
        </MenuSelect>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();

    expect(
      wrapper
        .findAll('option')
        .at(1)
        .html()
    ).toMatch(/<span>\s+Apple\s+<\/span>/);
  });
});

describe('custom default render', () => {
  const defaultSlot = `
    <template v-slot="{ items, canRefine, refine }">
      <select
        @change="refine($event.currentTarget.value)"
        :disabled="!canRefine"
      >
        <option value="">All</option>
        <option
          v-for="item in items"
          :key="item.value"
          :value="item.value"
          :selected="item.isRefined"
        >
          {{item.label}}
        </option>
      </select>
    </template>
  `;

  it('renders correctly', () => {
    __setState({
      ...defaultState,
    });

    const wrapper = mount({
      components: { MenuSelect },
      data() {
        return { props: defaultProps };
      },
      template: `
        <MenuSelect v-bind="props">
          ${defaultSlot}
        </MenuSelect>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders correctly with a selected value', () => {
    __setState({
      ...defaultState,
      items: [
        { label: 'Apple', value: 'Apple', isRefined: false, count: 50 },
        { label: 'Samsung', value: 'Samsung', isRefined: true, count: 20 },
        { label: 'Sony', value: 'Sony', isRefined: false, count: 15 },
      ],
    });

    const wrapper = mount({
      components: { MenuSelect },
      data() {
        return { props: defaultProps };
      },
      template: `
        <MenuSelect v-bind="props">
          ${defaultSlot}
        </MenuSelect>
      `,
    });

    const selected = wrapper.find('[value="Samsung"]');
    const options = wrapper.findAll('option:not([value="Samsung"])');

    expect(selected.element.selected).toBe(true);

    options.wrappers.forEach(option => {
      expect(option.element.selected).toBe(false);
    });
  });

  it('renders correctly without refinements', () => {
    __setState({
      ...defaultState,
      canRefine: false,
      items: [],
    });

    const wrapper = mount({
      components: { MenuSelect },
      data() {
        return { props: defaultProps };
      },
      template: `
        <MenuSelect v-bind="props">
          ${defaultSlot}
        </MenuSelect>
      `,
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calls refine on select change', async () => {
    const refine = jest.fn();

    __setState({
      ...defaultState,
      refine,
    });

    const wrapper = mount({
      components: { MenuSelect },
      data() {
        return { props: defaultProps };
      },
      template: `
        <MenuSelect v-bind="props">
          ${defaultSlot}
        </MenuSelect>
      `,
    });

    expect(refine).not.toHaveBeenCalled();

    const select = wrapper.find('select');

    // Simulate the change
    select.element.value = 'Apple';

    await select.trigger('change');

    expect(refine).toHaveBeenCalledTimes(1);
    expect(refine).toHaveBeenCalledWith('Apple');
  });
});
