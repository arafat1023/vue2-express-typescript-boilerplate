import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import {
  abbreviateName,
  profileImageSrc,
  identifyDeviceType,
  handleAxiosError,
  clientBaseUrl,
  IS_DEVELOPMENT,
} from '@/helpers';
import {
  FacebookLoginInfo,
  GoogleLoginInfo,
  RootState,
  Settings,
  User,
} from '@/type';

Vue.use(Vuex);

async function getLoggedInUser(token: string): Promise<User | undefined> {
  try {
    const resp = await axios.get('/users/this', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return resp.data.user;
  } catch (e) {
    handleAxiosError(e);
    return undefined;
  }
}

const dummyNavigations = [
  {
    _id: '0',
    userOnly: false,
    order: 0,
    name: 'User',
    children: [
      { userOnly: true, name: 'Account', url: `${clientBaseUrl}/user/account` },
      { userOnly: false, name: 'Home', url: `${clientBaseUrl}` },
      { userOnly: false, name: 'Youtube', url: 'https://www.youtube.com' },
    ],
  }, {
    _id: '1',
    userOnly: false,
    order: 1,
    name: 'Site',
    children: [
      { userOnly: false, name: 'Privacy policy', url: `${clientBaseUrl}/privacy-policy` },
      { userOnly: false, name: 'Terms of service', url: `${clientBaseUrl}/terms-of-service` },
    ],
  },
  {
    _id: '0',
    userOnly: false,
    order: 2,
    name: 'Home',
    url: `${clientBaseUrl}`,
    children: [],
  },
];

export default new Vuex.Store<RootState>({
  state: {
    user: undefined,
    token: '',

    device: {
      isMobile: false,
      // iPad pro will not be identified as mobile device,
      // but it is a touch device
      isTouchDevice: false,
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      isMac: false,
      isWindows: false,
      isLinux: false,
      isIPad: false,
      isIPhone: false,
      isAndroidTablet: false,
      isAndroid: false,
    },
    isBootstrapped: false,
    prevRoutePath: '',
    navigations: dummyNavigations,
    sidebars: {
      messaging: {
        show: false,
      },
    },
    dialogs: {
      confirm: {
        show: false,
      },
    },
  },
  getters: {
    usernameAbbreviation(state): string {
      const { user } = state;
      return abbreviateName(user);
    },
    async userProfileImageSrc(state): Promise<string> {
      const { user } = state;
      const profileImage = await profileImageSrc(user);
      return profileImage;
    },
    availableNavigations(state) {
      return state.navigations
        .filter((nv) => (state.user ? true : !nv.userOnly))
        .map((nv) => {
          const children = nv.children.filter((child) => (state.user ? true : !child.userOnly));
          return {
            ...nv,
            children,
          };
        })
        .sort((nv) => nv.order);
    },
  },

  mutations: {
    /**
     * This mutation should not be called directly.
     * Instead it is called via the login actions with proper side-effects.
     */
    setAuthInfo(state, {
      user,
      token,
    }) {
      state.user = user;
      state.token = token;

      if (window.localStorage.getItem('TABBED_REMEMBER_ME')) {
        window.sessionStorage.setItem('token', token);
      } else {
        window.localStorage.setItem('token', token);
      }
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      if (IS_DEVELOPMENT) {
        window.document.title = `Site ${user ? ` | ${user.firstName}` : ''}`;
      }
    },
  },

  actions: {
    async init({ state, dispatch }, { prevRoutePath }) {
      state.prevRoutePath = prevRoutePath;
      if (state.isBootstrapped) {
        return;
      }

      await dispatch('localLogin');

      const device = identifyDeviceType();
      state.device = device;
      state.isBootstrapped = true;
    },
    async loadBackendState({ dispatch }) {
      if (this.state.user?.role === 'non-admin') {
        await Promise.all([
          dispatch('loadSettings'),
        ]);
      }
    },
    async login({
      commit,
      dispatch,
    }, { token }) {
      const user = await getLoggedInUser(token);

      commit('setAuthInfo', {
        user,
        token,
      });
      await dispatch('loadBackendState');
    },
    async localLogin({
      commit,
      dispatch,
    }) {
      const tabbedRememberMe = window.localStorage.getItem('TABBED_REMEMBER_ME');
      const token = tabbedRememberMe ? window.sessionStorage.getItem('token') : window.localStorage.getItem('token');
      if (!token) {
        return;
      }

      const user = await getLoggedInUser(token);

      commit('setAuthInfo', {
        token,
        user,
      });
      await dispatch('loadBackendState');
    },
    async loadSettings() {
      await axios.get<{settings: Settings}>('/settings');
    },
    async googleLogin({ commit, dispatch }, {
      code,
      credential,
      referredCode,
    }: GoogleLoginInfo) {
      let response;
      type LoginResponse = {
        user: User;
        token: string;
      }
      if (credential) {
        response = await axios.post<LoginResponse>(
          '/auth/login/google/one-tap',
          {
            credential,
            referredCode,
          },
        );
      } else {
        response = await axios.post<LoginResponse>(
          '/auth/login/google/oauth2',
          {
            code,
            referredCode,
          },
        );
      }

      commit('setAuthInfo', { ...response.data });
      await dispatch('loadBackendState');
    },
    async fbLogin({ commit, dispatch }, {
      token,
      id,
      email,
      firstName,
      lastName,
      profileImage,
      referredCode,
    }: FacebookLoginInfo) {
      const response = await axios.post<{ token: string; user: User }>('/auth/login/fb', {
        token,
        id,
        email,
        firstName,
        lastName,
        profileImage,
        referredCode,
      });
      commit('setAuthInfo', { ...response.data });
      await dispatch('loadBackendState');
    },
    async refreshUser({ state }) {
      const user = await getLoggedInUser(state.token);
      state.user = user;
    },
    logout({ commit }) {
      commit('setAuthInfo', {
        user: undefined,
        token: '',
      });
    },
  },
});
