<template>
  <VContainer
    fluid
    id="landing-page-container"
    class="py-3 px-md-10 align-self-start mb-30"
  >
    Landing page
  </VContainer>
</template>

<script lang="ts">

import Vue from 'vue';

export default Vue.extend({
  name: 'LandingPage',
});
</script>

<style scoped lang="scss">

#landing-page-container::v-deep .footer {

  @media screen and (orientation: portrait) {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
  }
}

</style>
