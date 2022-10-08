<template>
  <VDialog
    v-model="showDialogData"
    :width="width"
    clasa="pa-0 ma-0"
    @input="onCancelClick"
    light
  >
    <VCard>
      <VCardTitle>
        <Header class="primaryB--text">
          {{ confirmationText }}
        </Header>
      </VCardTitle>
      <VCardActions class="mx-4 mt-5">
        <VSpacer />
        <VBtn
          color="primary"
          depressed
          height="32px"
          width="120px"
          @click.stop="onCancelClick"
        >
          <Subtitle>Cancel</Subtitle>
        </VBtn>
        <VBtn
          color="secondary"
          depressed
          outlined
          height="32px"
          width="120px"
          @click.stop="onConfirmClick"
        >
          <Subtitle class="primaryB--text">
            Confirm
          </Subtitle>
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script lang="ts">

import Vue from 'vue';

export default Vue.extend({
  name: 'ConfirmationDialog',
  props: {
    confirmationText: {
      type: String,
      required: true,
    },
    showDialog: {
      type: Boolean,
      required: true,
    },
    width: {
      type: String,
      default: '410px',
    },
  },
  data() {
    return {
      showDialogData: this.showDialog,
    };
  },
  watch: {
    showDialog(newVal) {
      this.showDialogData = newVal;
    },
  },
  methods: {
    onConfirmClick() {
      this.$emit('click:confirm');
    },
    onCancelClick() {
      this.$emit('click:cancel');
    },
  },
});

</script>
