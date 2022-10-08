<template>
  <VBtn
    absolute
    top
    left
    text
    to="/"
    depressed
    class="pa-0 ma-0"
  >
    <img
      :src="require('@/assets/site-assets/logo-with-name.png')"
      alt="logo-with-name"
      height="40px"
    >
  </VBtn>
</template>

<script lang="ts">

export default {
  name: 'SiteLogo',
};
</script>

<style scoped lang="scss">
  .site-title {
    font-size: 24px;
    margin-left: 12px;
    font-style: italic;
  }
</style>
