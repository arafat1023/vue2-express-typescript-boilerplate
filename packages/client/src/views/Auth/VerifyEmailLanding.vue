<template>
  <VContainer
    fluid
    style="height: calc(100vh - 64px - 270px); padding: 80px 70px 0"
  >
    <template
      v-if="verifiedEmail"
    >
      <div class="page-message-area">
        <h1 class="primaryB--text">
          Your account has been activated.
        </h1>

        <p class="mt-4 secondaryB--text">
          You can log in now.
        </p>

        <div class="mt-7 mb-7">
          <RouterLink
            :to="loginRoute"
            class="accent--text"
          >
            Log in
          </RouterLink>
        </div>
      </div>
    </template>

    <template
      v-else
    >
      <div class="page-message-area">
        <h1 class="primaryB--text">
          Your account has not been activated.
        </h1>

        <p class="mt-4 secondaryB--text">
          {{ message }}
        </p>
      </div>
    </template>
  </VContainer>
</template>

<script lang="ts">
import axios, { AxiosError } from 'axios';
import Vue from 'vue';
import { handleAxiosError } from '@/helpers';

interface Data {
  token: string;
  message: string;
  verifiedEmail: boolean;
}
interface Computed {
  loginRoute: string;
}

interface Methods {
  sendForVerification(): Promise<void>;
  goToLogin(): void;
}

export default Vue.extend<Data, Methods, Computed>({
  name: 'VerifyEmailLanding',
  data() {
    return {
      token: '',
      message: '',
      verifiedEmail: false,
    };
  },
  computed: {
    loginRoute() {
      const redirectUrl = this.$route.query.redirect as string | undefined;
      if (redirectUrl) {
        return redirectUrl;
      }

      return '/auth/login';
    },
  },
  methods: {
    /**
     * verify email from backend
     */
    async sendForVerification() {
      try {
        const resetResponse = await axios.delete(`/auth/verification-token/${this.token}`);
        this.message = resetResponse.data.message;
        this.verifiedEmail = true;
      } catch (e) {
        if (e.isAxiosError) {
          this.message = (e as AxiosError).response?.data.message;
        } else {
          handleAxiosError(e);
        }
      }
    },
    goToLogin() {
      this.$router.push('/auth/login');
    },
  },
  created() {
    const { token } = this.$route.params;
    if (token) {
      this.token = token.toString();
      this.sendForVerification();
    }
  },
});
</script>

<style scoped lang="scss">

.page-message-area {
  font-size: 14px;

  h1 {
    font-size: 18px;
  }

  a {
    font-weight: bold;
    text-decoration: none;

    &:hover,
    &:focus,
    &:active {
      text-decoration: underline;
    }
  }
}

</style>
