import axios, { AxiosError } from 'axios';
import Vue from 'vue';
import Vuelidate from 'vuelidate';
import App from '@/App.vue';
import {
  baseUrl,
  ROUTE_API,
} from '@/helpers';
import { UtilityComponents, UtilityCommands } from '@/plugins/utility';
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import store from '@/store';
import '@/style/sass/main.scss';

Vue.config.productionTip = false;
Vue.config.errorHandler = (err, vm, info) => {
  console.error(`Error in ${info}:`, err);
  let { username } = { ...store.state.user };
  username = username || 'NA';
  const data = {
    message: `[${username}] ${err.message}`,
    info,
    stack: err.stack,
  };
  axios.post('/errors', data)
    .catch(console.error);
};

axios.defaults.baseURL = `${baseUrl}${ROUTE_API}`;

axios.interceptors.response.use(undefined, async (error) => {
  const errResponse = (error as AxiosError).response;

  if (errResponse?.status === 401 && errResponse?.data === 'Unauthorized') {
    await store.dispatch('logout');
    if (router.currentRoute.fullPath !== '/') {
      await router.push('/');
    }
  }

  return Promise.reject(error);
});

Vue.use(Vuelidate);
Vue.use(UtilityComponents);

const app = new Vue({
  store,
  router,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');

Vue.use(UtilityCommands, {
  app,
  store,
});
