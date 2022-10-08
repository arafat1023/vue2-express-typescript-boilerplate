<template>
  <VForm
    id="signup-form"
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
          class="mt-4"
        >
          <VTextField
            :label="errors.firstName || 'First Name'"
            v-model="firstName"
            filled
            flat
            hideDetails
            color="secondaryB"
            height="48px"
            @blur="$v.firstName.$touch()"
            :error="!!errors.firstName"
          />

          <VTextField
            :label="errors.lastName || 'Last Name'"
            v-model="lastName"
            filled
            flat
            hideDetails
            color="secondaryB"
            height="48px"
            @blur="$v.lastName.$touch()"
            :error="!!errors.lastName"
          />
          <VTextField
            :label="errors.username || 'Email Address'"
            v-model="username"
            filled
            flat
            hideDetails
            color="secondaryB"
            height="48px"
            @blur="$v.username.$touch()"
            :error="!!errors.username"
          />

          <VTextField
            :label="errors.password || 'Password'"
            v-model="password"
            filled
            flat
            hideDetails
            color="secondaryB"
            height="48px"
            :appendIcon="hidePassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append="togglePasswordField"
            :type="hidePassword ? 'password' : 'text'"
            @blur="$v.password.$touch()"
            :error="!!errors.password"
          />

          <VBtn
            type="submit"
            large
            block
            depressed
            color="primary"
            form="signup-form"
            height="48px"
            class="mt-4"
          >
            <span class="title">
              Sign Up
            </span>
          </VBtn>
        </VCol>
      </VSlideYTransition>
      <VCol
        cols="12"
        class="mt-3"
      >
        <VDivider />
      </VCol>

      <VCol
        cols="9"
        class="px-0 text-center notify secondaryB--text"
      >
        To create your account, Google or Facebook will share your name, email address
        and profile picture with {{ appName }}. By signing up, you accept {{ appName }}'s
        <RouterLink
          role="button"
          class="accent--text"
          to="/terms-of-service"
        >
          Terms of use
        </RouterLink>
        and
        <RouterLink
          role="button"
          class="accent--text"
          to="/privacy-policy"
        >
          Privacy policy.
        </RouterLink>
      </VCol>

      <div class="mt-3 text-center title">
        Have an account already?
        <a
          role="button"
          @click="goToLogin"
        >
          Log in
        </a>
      </div>
    </VRow>
  </VForm>
</template>

<script lang="ts">
import axios from 'axios';
import Vue from 'vue';
import { required, email } from 'vuelidate/lib/validators';
import {
  getSearchParamsFromUrl,
  handleAxiosError,
  CONFIG,
} from '@/helpers';
import { User, SignUpInfo } from '@/type';

type Fields = 'firstName' | 'lastName' | 'username' | 'password';
type Errors = Record<Fields, string>;

export default Vue.extend({
  name: 'SignUp',
  props: {
    enabled: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      appName: CONFIG.appName,
      hidePassword: false,
      firstName: '',
      lastName: '',
      username: '',
      password: '',
    };
  },
  validations: {
    firstName: { required },
    lastName: { required },
    username: {
      required,
      email,
      async unique(value) {
        if (!value) {
          return true;
        }
        try {
          await axios.get(`/auth/username/${value}`);
          return false;
        } catch (e) {
          if (e.isAxiosError) {
            // if no user is found with this name, it's good to go
            return e.response.status === 404;
          }
          return true;
        }
      },
    },
    password: { required },
  },
  computed: {
    errors(): Errors {
      const errors = {} as Errors;

      const {
        firstName, lastName, username, password,
      } = this.$v;

      if (firstName.$dirty && !firstName.required) {
        errors.firstName = 'First Name is required';
      }
      if (lastName.$dirty && !lastName.required) {
        errors.lastName = 'Last Name is required';
      }

      if (username.$dirty) {
        if (!username.required) {
          errors.username = 'Email is required';
        } else if (!username.email) {
          errors.username = 'Email should be a valid email';
        } else if (!username.unique) {
          errors.username = 'This email is already taken';
        }
      }
      if (password.$dirty && !password.required) {
        errors.password = 'Password is required';
      }

      return errors;
    },
  },

  methods: {
    togglePasswordField() {
      this.hidePassword = !this.hidePassword;
    },
    async goToLogin() {
      await this.$router.push({
        path: '/auth/login',
        query: this.$route.query,
      });
    },
    async submit() {
      this.$v.$touch();
      if (this.$v.$anyError) {
        return;
      }

      const redirectUrl = this.$route.query.redirect as string | undefined;

      const { reference } = getSearchParamsFromUrl(redirectUrl || '');

      try {
        const signupPayload: SignUpInfo = {
          firstName: this.firstName,
          lastName: this.lastName,
          username: this.username,
          password: this.password,
          referredCode: reference,
          redirect: redirectUrl || undefined,
        };
        await axios.post<{ user: User }>('/auth/signup', signupPayload);
        await this.$router.push({ path: '/auth/verify', params: { emailAddress: this.username } });
      } catch (e) {
        handleAxiosError(e);
      }
    },
  },
});
</script>

<style scoped lang="scss">

#other-options-prompt {
  font-size: 14px;

  cursor: pointer;
}

.notify {
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
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
</style>
