<template>
  <VBtn
    absolute
    top
    left
    text
    to="/"
    height="48px"
    class="mb-2"
  >
    <img
      :src="require('@/assets/site-assets/logo-with-name.png')"
      alt="logo-with-name"
      height="48px"
    >
  </VBtn>
</template>

<script lang="ts">

export default {
  name: 'AbsoluteSiteLogo',
};
</script>

<style scoped lang="scss">
.v-btn--absolute.v-btn--left, .v-btn--fixed.v-btn--left {
  left: 24px;
}

.v-btn--absolute.v-btn--top, .v-btn--fixed.v-btn--top {
  top: 12px;
}
</style>
