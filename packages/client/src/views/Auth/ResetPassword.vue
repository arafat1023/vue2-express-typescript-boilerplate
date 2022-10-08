<template>
  <VContainer
    fluid
    style="height: calc(100vh - 64px - 270px); padding: 80px 70px 0"
  >
    <template v-if="!submitResponse">
      <template v-if="userId && token">
        <VForm
          id="reset-verify"
          ref="verify-form"
          lazyValidation
          v-model="isValid"
          @submit.prevent="submitVerify"
        >
          <VTextField
            label="Password"
            v-model="password"
            filled
            flat
            validateOnBlur
            :appendIcon="hidePassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append="togglePasswordField"
            :type="hidePassword ? 'password' : 'text'"
            :rules="rules.password"
          >
            <template #message="{ message }">
              <Error :message="message" />
            </template>
          </VTextField>
          <VBtn
            large
            color="primary"
            type="submit"
            depressed
            form="reset-verify"
          >
            Reset
          </VBtn>
        </VForm>
      </template>

      <template v-if="!userId && !token">
        <h3>Recover my password</h3>
        <div class="description--text secondaryB--text mt-2 mb-4">
          Enter your email address to reset password, we will send an reset link to your email address.
        </div>
        <VForm
          id="reset-request"
          ref="request-form"
          lazyValidation
          v-model="isValid"
          @submit.prevent="submitRequest"
        >
          <VTextField
            label="Email Address"
            autofocus
            v-model="username"
            filled
            flat
            height="48px"
            :rules="rules.username"
            :errorMessages="errors.username"
          >
            <template #message="{ message }">
              <Error :message="message" />
            </template>
          </VTextField>
        </VForm>

        <VRow class="mx-0 mt-3">
          <VBtn
            type="submit"
            large
            color="primary"
            class="white--text font-weight-bold"
            depressed
            form="reset-request"
            style="font-size: 16px;"
          >
            Send
          </VBtn>
          <VBtn
            class="ml-sm-8 font-weight-bold"
            large
            color="transparent"
            style="font-size: 16px;"
            :elevation="0"
            @click="$router.go(-1)"
          >
            Cancel
          </VBtn>
          <VSpacer />
        </VRow>
      </template>
    </template>

    <div
      v-else
      class="mx-n9"
    >
      <div
        style="font-size: 18px; line-height: 22px;"
        class="primaryB--text"
      >
        {{ submitResponse }}
      </div>
      <div class="mt-12">
        <a
          v-if="!passwordResetVerified"
          class="accent--text font-weight-bold"
          style="font-size: 18px; line-height: 22px;"
          @click="resendEmail"
        >
          Did not get an email?
        </a>
      </div>
      <div class="mt-10">
        <a
          class="accent--text font-weight-bold"
          style="font-size: 18px; line-height: 22px;"
          v-text="'Try login again'"
          @click="tryLoginAgain"
        />
      </div>
    </div>
  </VContainer>
</template>

<script lang="ts">
import axios from 'axios';
import Vue from 'vue';

interface Data {
  userId: string;
  token: string;
  password: string;
  hidePassword: boolean;
  submitResponse: string;
  passwordResetVerified: boolean;
  username: string;
  isValid: boolean;
  errors: Record<string, string>;
  rules: Record<string, ((v: string) => boolean | string)[]>;
}

interface Methods {
  submitRequest(): Promise<void>;

  submitVerify(): Promise<void>;

  resendEmail(): Promise<void>;

  tryLoginAgain(): Promise<void>;

  togglePasswordField(): void;
}

export default Vue.extend<Data, Methods, unknown>({
  name: 'ResetPassword',
  data() {
    return {
      userId: '',
      token: '',
      password: '',
      hidePassword: true,
      submitResponse: '',
      passwordResetVerified: false,
      username: '',
      isValid: true,
      errors: {
        username: '',
      },
      rules: {
        username: [
          (v: string) => {
            if (!v) {
              return 'Email is required';
            }
            const validEmailPattern = new RegExp(['^(([^<>()[\\]\\.,;:\\s@\\"]+(\\.[^<>(),[\\]\\.,;:\\s@\\"]+)*)',
              '|(\\".+\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.',
              '[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+',
              '[a-zA-Z]{2,}))$'].join(''));

            if (validEmailPattern.test(v)) {
              return true;
            }
            return 'Valid Email is required';
          },
        ],
        password: [
          (v) => {
            if (!v) {
              return 'Password is required';
            }
            return true;
          },
        ],
      },
    };
  },
  methods: {
    /**
     * user data submit request for password recovery
     */
    async submitRequest() {
      try {
        const isValid = (this.$refs['request-form'] as HTMLFormElement).validate();
        if (!isValid) {
          return;
        }
        this.errors = { username: '' };

        const response = await axios.post('/auth/reset-password-token', { username: this.username });

        this.submitResponse = response.data.message;
      } catch (e) {
        this.errors = e.response.data.errors;
      }
    },
    /**
     * user data submit verify url & password recovery
     */
    async submitVerify() {
      try {
        const isValid = (this.$refs['verify-form'] as HTMLFormElement).validate();
        if (!isValid) {
          return;
        }
        this.errors = { password: '', confirmPassword: '' };

        const verifyResetPasswordDto = {
          userId: this.userId,
          token: this.token,
          password: this.password,
        };
        const resetResponse = await axios.put('/auth/reset-password-token', verifyResetPasswordDto);

        this.submitResponse = resetResponse.data.message;
        this.passwordResetVerified = true;
      } catch (e) {
        this.submitResponse = e.response.data.message;
        this.passwordResetVerified = false;
      }
    },
    async resendEmail() {
      this.submitResponse = '';
    },
    async tryLoginAgain() {
      await this.$router.push('/auth/login');
    },

    togglePasswordField() {
      this.hidePassword = !this.hidePassword;
    },
  },
  created() {
    const userId = this.$route.params.id;
    const { token } = this.$route.query;

    if (userId && token) {
      this.userId = userId;
      this.token = token.toString();
    }
  },
});
</script>

<style scoped lang="scss">
.description--text {
  font-size: 14px;
  line-height: 18px;
  font-weight: 400;
}
</style>
