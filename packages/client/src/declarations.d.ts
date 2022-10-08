declare module '*.png' {
  const str = '';
  export = str;
}

declare module '*.svg' {
  const str = '';
  export = str;
}

declare module 'vue-fragment' {
  import { PluginFunction, VueConstructor } from 'vue';

  const Fragment: VueConstructor;
  const Plugin: PluginFunction<Record<string, unknown>>;

  export { Fragment, Plugin };
}
