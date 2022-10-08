<template>
  <h3>
    <slot />
  </h3>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'Subtitle',
});
</script>

<style scoped lang="scss">
h3 {
  font-weight: 700;
  font-size: 14px;
  line-height: 17px;
}
</style>
