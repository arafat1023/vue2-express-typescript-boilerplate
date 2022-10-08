<template>
  <VContainer
    class="mt-7"
    id="auth"
    fluid
  >
    <SiteLogo />

    <VRow
      justify="center"
      align="center"
    >
      <VCol :style="{maxWidth: width, flexBasis: width}">
        <div id="activation-body-text">
          <Header class="primaryB--text">
            Please activate your account
          </Header>

          <p class="mt-4 primaryB--text">
            An activation link has been sent to your  email inbox.
          </p>

          <div class="my-4 primaryB--text">
            Did not get the email?
            <RouterLink to="/auth/signup">
              Try again
            </RouterLink>
          </div>
        </div>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script lang="ts">
import Vue from 'vue';
import SiteLogo from '@/components/NavBar/SiteLogo.vue';

export default Vue.extend({
  name: 'VerifyEmail',
  components: {
    SiteLogo,
  },
  data() {
    return {
      // TODO: this whole functionality needs to be (re)implemented,
      // passing the email address from previous view to this one
      givenEmailAddress: 'example@website.net',
    };
  },
  computed: {
    isMobile(): boolean {
      return this.$vuetify.breakpoint.mobile;
    },
    width(): string {
      return this.isMobile ? '100%' : '540px';
    },
  },
  mounted() {
    this.givenEmailAddress = this.$route.params.emailAddress || '';
  },
});
</script>

<style scoped lang="scss">

#activation-body-text {
  font-size: 16px;

  a {
    text-decoration: underline;
    color: var(--v-primaryB-base);
  }
}

</style>
