import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import { UserVuetifyPreset } from 'vuetify/types/services/presets.d';
import { VuetifyThemeVariant } from 'vuetify/types/services/theme.d';

Vue.use(Vuetify);

const themeVariant: Partial<VuetifyThemeVariant> = {
  primary: '#FE4642',
  secondary: '#9AA0A6',
  dark: '#333333',
  accent: '#641BEB',
  lighterOrange: '#FF6B68',
  lightOrange: '#FCAE7C',
  midOrange: '#FC673E',
  primaryB: '#1C0101',
  secondaryB: '#606060',
  darkB: '#3C4043',
  gray3: '#828282',
  backgroundLight: '#FBF9FF',
  unselectedGrey: '#B6B6B6',
  lightGrey: '#E0E0E0',
  bkLightRed: '#FDF8F8',
};

const opts: Partial<UserVuetifyPreset> = {
  theme: {
    themes: {
      light: themeVariant,
      dark: themeVariant,
    },
    options: {
      customProperties: true,
    },
  },
  breakpoint: {
    mobileBreakpoint: 'sm',
  },
};

export default new Vuetify(opts);
