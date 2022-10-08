/* eslint-disable vue/one-component-per-file */
import { kebabCase } from 'lodash';
import { PluginObject } from 'vue';
import { Store } from 'vuex';
import Header from './Header.vue';
import Subtitle from './Subtitle.vue';
import Title from './Title.vue';

type ActionBuffer = [string, Record<string, unknown>, Record<string, unknown>];
declare global {
  interface Window {
    vuex: { state: Record<string, unknown> };
    buffer: ActionBuffer;
  }
}
type DummyDevtoolType = Store<Record<string, unknown>> & { _devtoolHook?: { _buffer: ActionBuffer } };

export const UtilityComponents: PluginObject<never> = {
  install(Vue) {
    Vue.component('Required', {
      render(h) {
        return h('span', { class: 'primary--text' }, '*');
      },
    });

    Vue.component('Error', {
      props: {
        message: {
          type: String,
          required: true,
        },
      },
      render(this, h) {
        return h('span', [
          h('span', { staticClass: 'sign' }, ['✕']),
          h('span', { staticClass: 'text' }, [this.message]),
        ]);
      },
    });

    Vue.component('Header', Header);
    Vue.component('Title', Title);
    Vue.component('Subtitle', Subtitle);
  },
};

export const UtilityCommands: PluginObject<{ app: Vue; store: Store<Record<string, unknown>> }> = {
  install(Vue, options) {
    if (!options) {
      throw new Error();
    }

    const {
      app,
      store,
    } = options;

    Object.defineProperty(window, 'vuex', {
      get() {
        return {
          state: store.state,
          getters: store.getters,
          buffer: (store as DummyDevtoolType)._devtoolHook?._buffer,
        };
      },
    });

    Object.defineProperty(window, 'jsonVuex', {
      get() {
        return JSON.stringify(window.vuex);
      },
    });

    Object.defineProperty(window, 'user', {
      get(): string {
        return window.sessionStorage.getItem('user') || '';
      },
    });

    Object.defineProperty(window, 'state', {
      get: () => getStateRecursively(app),
    });

    function getStateRecursively(vue: Vue): Record<string, unknown> {
      const state: Record<string, unknown> = getStateOfComponent(vue);
      for (const child of vue.$children) {
        const name = child.$options.name as string;
        state[name] = { ...getStateRecursively(child) };
      }

      return state;
    }

    Object.defineProperty(window, 'getStateOf', {
      value(componentName: string) {
        const componentNameKb = kebabCase(componentName);
        const states: { [x: string]: unknown }[] = [];

        function getComponentStatesRecursively(vue: Vue) {
          const { name } = vue.$options;
          if (componentNameKb === kebabCase(name)) {
            const state = getStateOfComponent(vue);
            states.push(state);
          }

          for (const child of vue.$children) {
            getComponentStatesRecursively(child);
          }
        }

        getComponentStatesRecursively(app);

        return states;
      },
    });

    function getStateOfComponent(vue: Vue) {
      const computed: Record<string, unknown> = {};
      const computedWatchers = vue.$options.computed;
      if (computedWatchers) {
        const computedKeys = Object.keys(computedWatchers);
        for (const computedKey of computedKeys) {
          computed[computedKey] = vue[computedKey as keyof Vue];
        }
      }

      const state = {
        el: vue.$el,
        props: { ...vue.$props },
        data: { ...vue.$data },
        computed,
      };
      return state;
    }
  },
};
