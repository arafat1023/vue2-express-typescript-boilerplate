<template>
  <VDialog
    :value="value"
    persistent
    overlayColor="primaryB"
    overlayOpacity=".8"
    width="75%"
  >
    <VCard>
      <VCardTitle
        class="ma-0 pa-0"
      >
        <VBtn
          icon
          color="primaryB"
          large
          class="ml-auto mr-2"
          @click="$emit('close')"
        >
          <VIcon>
            mdi-close
          </VIcon>
        </VBtn>
      </VCardTitle>
      <template
        v-if="videoUrl"
      >
        <VCardText class="text-center">
          <video
            :src="videoUrl"
            type="video/mp4"
            class="mt-2 rounded"
            style="width: 100%; height: calc(100vh - 250px); cursor: pointer;"
            ref="video"
            preload="auto"
            crossorigin="anonymous"
            autoplay
            muted
            controls
          />
        </VCardText>
        <VCardActions class="mx-2">
          <div class="d-flex justify-space-around align-center fill-width">
            <Title v-if="title">
              {{ title }}
            </Title>
            <VBtn
              color="inactive2"
              outlined
              height="40px"
              class="px-6"
              :href="videoUrl"
            >
              <VIcon
                color="primary"
                size="20px"
              >
                mdi-download
              </VIcon>
              <Subtitle class="secondaryB--text">
                Download
              </Subtitle>
            </VBtn>
          </div>
        </VCardActions>
      </template>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'VideoPopup',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
});
</script>
