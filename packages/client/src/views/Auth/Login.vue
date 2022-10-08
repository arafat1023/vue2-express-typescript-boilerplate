<template>
  <VForm
    id="login-form"
    @submit.prevent="submit"
  >
    <VRow
      justify="center"
      align="center"
      class="mb-10 mx-0"
    >
      <slot />

      <VSlideYTransition>
        <VCol
          v-if="enabled"
          cols="9"
          class="px-0"
        >
          <VTextField
            :label="errors.get('username') || serverError || 'Email Address'"
            v-model="username"
            filled
            flat
            hideDetails
            color="secondaryB"
            height="48px"
            autofocus
            @blur="onUsernameUpdate"
            :error="!!(errors.get('username') || serverError)"
          />

          <VTextField
            :label="errors.get('password') || 'Password'"
            v-model="password"
            filled
            flat
            hideDetails
            color="secondaryB"
            height="48px"
            :appendIcon="hidePassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append="togglePasswordField"
            :type="hidePassword ? 'password' : 'text'"
            @blur="onPasswordUpdate"
            :error="!!errors.get('password')"
          />

          <VRow class="mx-0">
            <VCol
              cols="12"
              class="text-right pt-0 pb-0"
            >
              <RouterLink
                class="accent--text forget"
                v-text="'Forget Password?'"
                to="/auth/reset"
              />
            </VCol>
          </VRow>

          <VBtn
            type="submit"
            large
            block
            depressed
            color="primary"
            form="login-form"
            height="48px"
            class="mt-4"
          >
            <span class="title">
              Log in
            </span>
          </VBtn>
        </VCol>
      </VSlideYTransition>

      <div
        class="mt-7 mb-6"
        style="max-width: 100%;flex: 0 0 100%"
      >
        <VDivider />
      </div>

      <div class="text-center title">
        New to {{ appName }}?
        <a
          role="button"
          @click="goToSignUp"
        >
          Sign Up
        </a>
      </div>
    </VRow>
  </VForm>
</template>

<script lang="ts">
import axios, { AxiosError } from 'axios';
import { User } from 'types';
import Vue from 'vue';
import { required } from 'vuelidate/lib/validators';
import { CONFIG } from '@/helpers';

type Fields = 'username' | 'password';
type Errors = Map<Fields, string>;

export default Vue.extend({
  name: 'Login',
  props: {
    enabled: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      appName: CONFIG.appName,
      hidePassword: true,
      username: '',
      password: '',
      serverError: '',
    };
  },
  validations: {
    username: { required },
    password: { required },
  },
  computed: {
    errors(): Errors {
      const errors = new Map<Fields, string>();

      const { username, password } = this.$v;
      if (username.$dirty && !username.required) {
        errors.set('username', 'Email is required');
      }
      if (password.$dirty && !password.required) {
        errors.set('password', 'Password is required');
      }

      return errors;
    },
  },

  methods: {
    togglePasswordField() {
      this.hidePassword = !this.hidePassword;
    },
    async goToSignUp() {
      await this.$router.push({
        path: '/auth/signup',
        query: this.$route.query,
      });
    },
    onUsernameUpdate() {
      if (this.username) {
        this.$v.username.$touch();
        this.serverError = '';
      }
    },
    onPasswordUpdate() {
      this.$v.username.$touch();
      this.$v.password.$touch();
    },
    async submit() {
      this.$v.$touch();
      if (this.$v.$anyError) {
        return;
      }

      try {
        const loginResponse = await axios.post<{ user: User; token: string }>('/auth/login', {
          username: this.username,
          password: this.password,
        });
        const { user, token } = loginResponse.data;

        this.$emit('auth', { user, token });
      } catch (e) {
        if (e.isAxiosError) {
          this.serverError = (e as AxiosError).response?.data.message;
        } else {
          console.error(e);
        }
      }
    },
  },
});
</script>

<style scoped lang="scss">

.v-divider {
  border: 1px solid #DADCE0;
}

.v-input::v-deep {
  &.error--text .v-input__slot {
    border: 1px solid var(--v-lighterOrange-base);
  }

  .v-label {
    color: var(--v-secondaryB-base);
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    top: 12px;

    &.error--text {
      color: var(--v-primary-base);
    }
  }

  .v-input__slot {
    min-height: 48px !important;
  }

  .v-input__append-inner {
    margin-top: 10px;

    .v-icon.error--text {
      color: rgba(0, 0, 0, 0.54) !important;
    }
  }
}

.forget {
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;

  &::v-deep .v-label {
    color: var(--v-primaryB-base);
    top: -2px;
  }
}

</style>
