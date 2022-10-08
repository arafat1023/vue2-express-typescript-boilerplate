<template>
  <div>
    <label>
      {{ field }}
      <Required v-if="required" />
    </label>
    <VTextField
      filled
      flat
      :value="value"
      :autofocus="autofocus"
      :errorMessages="error"
      @blur="$emit('blur')"
      @input="$emit('input', $event)"
    >
      <template #message="{ message }">
        <Error :message="message" />
      </template>
    </VTextField>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TextInput',
  props: {
    error: {
      type: String,
      default: '',
    },
    field: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
<style scoped lang="scss">

label {
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: var(--v-darkB-base);
}
</style>
