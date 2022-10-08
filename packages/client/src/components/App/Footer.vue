<template>
  <VFooter
    app
    absolute
    padless
  >
    <VContainer
      fluid
      class="pa-0"
    >
      <VRow
        class="lighterOrange mx-0 px-0 footer-row"
      >
        <VCol
          cols="auto"
          class="mx-auto px-0"
        >
          <VBtn
            text
            color="white"
            class="pa-0"
            to="/privacy-policy"
          >
            Privacy
          </VBtn>
          <VBtn
            text
            color="white"
            class="pa-0"
            to="/terms-of-service"
          >
            Terms
          </VBtn>
        </VCol>
        <VSpacer />
        <VCol
          cols="auto"
          class="d-flex mx-auto align-center"
        >
          <VBtn
            small
            icon
            depressed
            target="_blank"
            href="https://www.instagram.com/site"
          >
            <img
              :src="require('@/assets/icons/instagram.svg')"
              alt="instagram-icon"
            >
          </VBtn>
          <VBtn
            small
            icon
            class="mx-4"
            color="primary"
            target="_blank"
            href="https://www.facebook.com/groups/site"
          >
            <img
              :src="require('@/assets/icons/facebook.svg')"
              alt="facebook-icon"
            >
          </VBtn>
          <VBtn
            small
            icon
            depressed
            target="_blank"
            href="https://www.youtube.com/channel/site"
          >
            <img
              :src="require('@/assets/icons/youtube.svg')"
              alt="youtube-icon"
            >
          </VBtn>
        </VCol>
      </VRow>
      <VRow class="bkLightRed justify-center">
        <div class="primaryB--text my-5 font-weight-bold">
          © {{ currentYear }} {{ appName }}, all rights reserved
        </div>
      </VRow>
    </VContainer>
  </VFooter>
</template>

<script lang="ts">

import Vue from 'vue';
import { CONFIG } from '@/helpers';

export default Vue.extend({
  name: 'Footer',
  data() {
    return {
      currentYear: new Date().getFullYear(),
      appName: CONFIG.appName,
    };
  },
});

</script>

<style scoped lang="scss">
@import "src/style/sass/variables";

.v-btn.v-size--default {
  font-size: 1em;
}

.footer-row {
  flex-direction: row;

  @media #{map-get($display-breakpoints, 'sm-and-down')} {
    flex-direction: column;
  }
}

</style>
