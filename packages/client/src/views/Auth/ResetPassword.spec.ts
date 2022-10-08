import { createLocalVue, mount, Wrapper } from '@vue/test-utils';
import '@testing-library/jest-dom';
import axios from 'axios';
import { mocked } from 'ts-jest/utils';
import Vue from 'vue';
import Vuetify from 'vuetify';
import Vuex, { Store } from 'vuex';
import router from '@/router';
import { RootState } from '@/type';
import ResetPassword from '@/views/Auth/ResetPassword.vue';

jest.mock('axios');
const mockedPost = mocked(axios.post, true);

const localVue = createLocalVue();
Vue.use(Vuex);
Vue.use(Vuetify);

type PartialRootState = Pick<RootState, 'dialogs'>;

describe('ResetPassword', () => {
  let store: Store<PartialRootState>;
  let vuetify: Vuetify;
  let wrapper: Wrapper<Vue>;

  beforeEach(() => {
    const rootState: PartialRootState = {
      dialogs: {
        confirm: {
          show: false,
        },
      },
    };

    store = new Store<PartialRootState>({ state: rootState });
    vuetify = new Vuetify();
  });

  afterAll(() => {
    wrapper.destroy();
  });

  it('should match with elements of request-form', async () => {
    const responseMessage = 'An account recovery link has been sent to your email inbox';
    mockedPost.mockResolvedValue({ data: { message: responseMessage } });
    wrapper = mount(ResetPassword, {
      localVue,
      store,
      vuetify,
      router,
    });

    const form = wrapper.findComponent({
      ref: 'request-form',
    });
    expect(form.element.children).toHaveLength(1);
    await wrapper.vm.$nextTick(); // in this tick, UI is updated
  });
});
