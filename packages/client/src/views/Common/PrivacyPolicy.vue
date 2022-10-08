<template>
  <VContainer>
    <div class="legal-page-content px-3 px-md-10 mb-30">
      <h1>Privacy Policy</h1>

      <p>
        Email Address:<br>
        <strong><a :href="`mailto:${siteMail}`">{{ siteMail }}</a></strong>
      </p>
    </div>
  </VContainer>
</template>

<script lang="ts">

import Vue from 'vue';
import { CONFIG } from '@/helpers';

export default Vue.extend({
  name: 'PrivacyPolicy',
  data() {
    return {
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
