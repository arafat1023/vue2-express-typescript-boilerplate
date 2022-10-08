<template>
  <VContainer
    id="auth"
    fluid
    class="align-self-start"
  >
    <SiteLogo />

    <VRow
      v-show="performingFacebookLogin"
      justify="center"
    >
      <header class="primary--text">
        Now entering your personal chat studio...
      </header>
    </VRow>
    <VRow
      v-show="!performingFacebookLogin"
      justify="center"
      align="center"
    >
      <div :style="{ maxWidth: width, flexBasis: width }">
        <template>
          <VImg
            :src="require('@/assets/site-assets/logo-with-name.png')"
            maxWidth="540px"
            :aspectRatio="540 / 250"
          />
          <VCol
            cols="12"
            class="bkLightRed rounded"
          >
            <Header>
              {{ actionText }}
            </Header>
          </VCol>
        </template>

        <RouterView
          :enabled="showEmailLogin"
          @auth="onAuthentication"
        >
          <VRow
            justify="center"
            align="center"
            class="mt-7 mx-0"
          >
            <VCol
              cols="9"
              class="px-0"
            >
              <VBtn
                class="mb-4"
                block
                depressed
                color="#1877F2"
                height="48px"
                @click="facebookLogin"
              >
                <img
                  :src="require('@/assets/socials/fb-logo.png')"
                  alt="fb-logo"
                >
                <div class="social-btn-text white--text">
                  Continue With Facebook
                </div>
              </VBtn>

              <VBtn
                block
                outlined
                color="lightGrey"
                height="48px"
                @click="googleLogin"
              >
                <img
                  :src="require('@/assets/socials/google-logo.png')"
                  alt="google-logo"
                >
                <div class="social-btn-text">
                  Continue With Google
                </div>
              </VBtn>

              <VBtn
                v-if="!showEmailLogin"
                block
                outlined
                color="lightGrey"
                class="mt-4"
                height="48px"
                @click="showEmailLogin = true"
              >
                <VIcon color="primaryB">
                  mdi-email-outline
                </VIcon>
                <div class="social-btn-text">
                  Continue with Email
                </div>
              </VBtn>
            </VCol>
          </VRow>
        </RouterView>
      </div>
    </VRow>
  </VContainer>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import Bus, { NOTIFICATION } from '@/bus';
import SiteLogo from '@/components/NavBar/SiteLogo.vue';
import {
  redirectUserAfterLogin,
  handleAxiosError,
} from '@/helpers';
import SocialLoginService from '@/services/SocialLoginService';
import { User } from '@/type';

interface Data {
  showEmailLogin: boolean;
  performingFacebookLogin: boolean;
}

interface AuthInfo {
  user: User;
  token: string;
}

interface Methods {

  onAuthentication({ user, token }: AuthInfo): Promise<void>;

  googleLogin(): Promise<void>;

  facebookLogin(): Promise<void>;

  _redirectAccordingToRole(): Promise<void>;
}

interface Computed {
  redirectUrl: string;
  actionText: string;
  user?: User;
  isMobile: boolean;
  width: string;
}

export default Vue.extend<Data, Methods, Computed>({
  name: 'Auth',
  components: {
    SiteLogo,
  },
  data() {
    return {
      showEmailLogin: false,
      performingFacebookLogin: false,
    };
  },
  computed: {
    ...mapState(['user']),
    redirectUrl() {
      return (this.$route.query.redirect || '') as string;
    },
    actionText() {
      const { path } = this.$route;
      if (path === '/auth/login') {
        return 'Log in';
      }
      if (path === '/auth/signup') {
        return 'Sign up';
      }
      if (path === '/auth/verify') {
        return 'Verify';
      }
      if (path.startsWith('/auth/reset')) {
        return 'Reset';
      }
      return 'Verify Email';
    },
    isMobile() {
      return this.$vuetify.breakpoint.mobile;
    },
    width() {
      return this.isMobile ? '100%' : '540px';
    },

  },
  created() {
    SocialLoginService.initFacebook();
  },
  methods: {
    async onAuthentication({ user, token }: AuthInfo) {
      await this.$store.dispatch('login', { user, token });
      await this._redirectAccordingToRole();
    },

    async googleLogin() {
      SocialLoginService.openGoogleConsentScreen(this.redirectUrl);
    },

    async facebookLogin() {
      const isLoggedIn = await SocialLoginService.performFacebookLogin(() => {
        this.performingFacebookLogin = true;
      });
      if (isLoggedIn) {
        await this._redirectAccordingToRole();
      } else {
        this.performingFacebookLogin = false;
        Bus.emit(NOTIFICATION.ERROR, {
          message: 'Login with facebook failed',
        });
      }
    },

    async _redirectAccordingToRole() {
      if (!this.user) {
        console.error('Cannot perform redirection while user is not set');
        return;
      }
      try {
        // redirect according to role
        const redirection = await redirectUserAfterLogin(this.user, this.redirectUrl);
        await this.$router.push(redirection.route);
      } catch (e) {
        handleAxiosError(e);
      }
    },
  },
});
</script>

<style scoped lang="scss">
.container {
  margin-top: 60px;
}

.v-image {
  border-radius: 20px;
}

::v-deep {
  .v-btn {
    border-radius: 8px;
  }

  a {
    text-decoration: none;
  }
}

::v-deep .v-divider {
  border: 1px solid #DADCE0;
}

.or {
  font-weight: bold;
  font-size: 16px;
}

.social-login-text {
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 20px;
  margin: auto;
}

.social-btn-text {
  flex-grow: 1;
  font-size: 16px;
  line-height: 20px;
  font-weight: bold;
  color: black;
}
</style>
