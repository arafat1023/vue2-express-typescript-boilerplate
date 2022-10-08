<template>
  <VContainer>
    <div class="legal-page-content px-3 mb-30">
      <h1>Terms of Service</h1>

      <p>
        Agreement between User and <a :href="siteUrl">{{ siteUrl }}</a>
      </p>

      <h2>Privacy</h2>
    </div>
  </VContainer>
</template>

<script lang="ts">

import Vue from 'vue';
import { CONFIG } from '@/helpers';

export default Vue.extend({
  name: 'TermsOfService',
  data() {
    return {
      appName: CONFIG.appName,
      siteUrl: CONFIG.siteUrl,
      siteMail: CONFIG.siteMail,
    };
  },
});
</script>

<style scoped lang="scss">

.legal-page-content {
  margin-top: 35px;

  font-size: 16px;
  color: var(--v-secondaryB-base);
  line-height: 1.2;

  h1,
  h2 {
    margin: 1.25em 0;

    font-size: inherit;
    font-weight: bold;
    color: var(--v-primaryB-base);
  }

  a {
    color: var(--v-primaryB-base);
    font-weight: bold;
  }
}

</style>
