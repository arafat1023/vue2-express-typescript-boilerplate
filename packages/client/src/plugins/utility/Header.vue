<template>
  <h1
    :class="`${color}--text`"
  >
    <slot />
  </h1>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'Header',
  props: {
    color: {
      type: String,
      default: 'primaryB',
    },
  },
});
</script>

<style scoped lang="scss">
@import "~vuetify/src/styles/settings";

h1 {
  font-size: 18px;
  line-height: 22px;
  font-weight: 700;
  word-break: initial;

  @media #{map-get($display-breakpoints, 'sm-and-down')} {
    & {
      font-size: 16px;
      line-height: 20px;
    }
  }
}
</style>
