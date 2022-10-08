<script lang="ts">
import Vue, { VNode } from 'vue';
import { mapState } from 'vuex';
import Bus, { NOTIFICATION } from '@/bus';
import {
  redirectUserAfterLogin,
  handleAxiosError,
  CONFIG,
} from '@/helpers';
import SocialLoginService from '@/services/SocialLoginService';
import { User } from '@/type';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    onGoogleLibraryLoad(): void;
  }
}

interface Computed {
  user: User;
  token: string;
}

interface Method {
  showOneTapCredentialDiv(): void;
  handleOnetapResponse(oneTapResponse: OneTapResponse): Promise<void>;
}

interface OneTapResponse {
  credential: string;
  // eslint-disable-next-line camelcase
  select_by: string;
  // eslint-disable-next-line camelcase
  client_id: string;
}

export default Vue.extend<unknown, Method, Computed>({
  name: 'GoogleOneTap',
  render(h): VNode {
    return h(undefined);
  },
  computed: {
    ...mapState(['user', 'token']),
  },
  watch: {
    token() {
      this.showOneTapCredentialDiv();
    },
  },
  methods: {
    showOneTapCredentialDiv() {
      const oneTapCredentialDiv = document.getElementById('credential_picker_container') as HTMLDivElement;
      const oneTapCredentialIframe = document.getElementById('credential_picker_iframe') as HTMLIFrameElement;

      if (!oneTapCredentialDiv && !oneTapCredentialIframe) {
        return;
      }
      if (this.token) {
        if (oneTapCredentialDiv) {
          oneTapCredentialDiv.style.display = 'none';
        }
        if (oneTapCredentialIframe) {
          oneTapCredentialIframe.style.opacity = '0';
          oneTapCredentialIframe.style.top = '-5000px';
        }
        return;
      }
      if (oneTapCredentialIframe) {
        oneTapCredentialIframe.style.opacity = '';
        oneTapCredentialIframe.style.top = '';
        return;
      }
      oneTapCredentialDiv.style.top = '60px';
      oneTapCredentialDiv.style.display = '';
    },
    async handleOnetapResponse(oneTapResponse: OneTapResponse) {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get('redirect') || '';
        const { credential } = oneTapResponse;

        const { isLoggedIn } = await SocialLoginService.performGoogleLogin(redirectUrl, { credential });

        if (!isLoggedIn) {
          Bus.emit(NOTIFICATION.ERROR, {
            message: 'Login with google failed',
          });
          return;
        }

        // redirect according to role
        const redirection = await redirectUserAfterLogin(this.user, redirectUrl);
        await this.$router.push(redirection.route);
      } catch (e) {
        handleAxiosError(e);
      }
    },
  },
  async created() {
    // reference: https://developers.google.com/identity/one-tap/web/reference/js-reference
    window.onGoogleLibraryLoad = () => {
      window.google.accounts.id.initialize({
        client_id: CONFIG.googleAuth2ClientId,
        cancel_on_tap_outside: false,
        callback: this.handleOnetapResponse,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isDisplayed()) {
          this.showOneTapCredentialDiv();
        }

        if (notification.isNotDisplayed()) {
          console.log('google one tap not displayed reason: ', notification.getNotDisplayedReason());
        }
      });
    };
  },
});
</script>
