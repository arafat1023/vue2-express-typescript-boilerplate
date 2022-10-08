<template>
  <h2>
    <slot />
  </h2>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'Title',
});
</script>

<style scoped lang="scss">
h2 {
  font-size: 16px;
  line-height: 20px;
  font-weight: 700;
  word-break: initial;
}
</style>
