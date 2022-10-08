<template>
  <div
    v-if="shouldShow"
    class="text-center"
  >
    <VProgressCircular
      indeterminate
      color="primary"
      size="64"
    />
  </div>
</template>

<script lang="ts">

import Vue from 'vue';

export default Vue.extend({
  name: 'ProgressCircular',
  props: {
    shouldShow: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
