<template>
  <VContainer
    fluid
    class="backgroundLight"
    :class="isMobile ? 'pt-2 px-0': 'pt-8'"
  >
    <RouterView
      class="user"
      :class="{
        'user-mobile mx-0': isMobile,
        'mx-auto user-desktop': !isMobile
      }"
    />
  </VContainer>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'User',
  computed: {
    isMobile(): boolean {
      return this.$vuetify.breakpoint.mobile;
    },
  },
});
</script>

<style scoped lang="scss">

.container {
  height: 100%;
}

.user {
  min-height: 450px;
}

.user-mobile {
  box-shadow: none !important;
}

.user-desktop {
  width: 500px;
}
</style>
