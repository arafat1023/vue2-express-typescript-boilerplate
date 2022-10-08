<template>
  <Fragment>
    <div class="text-center">
      <!--suppress HtmlUnknownTarget -->
      <video
        v-if="promoVideoPreviewSrc"
        :src="promoVideoPreviewSrc"
        :type="promoContentType"
        class="elevation-6 pa-3 my-8"
        style="width: 75%; min-height: 100px; border: 1px dashed black;"
        ref="promoVideoPreview"
        preload="auto"
        crossorigin="anonymous"
        @durationchange="onPreviewPromoVideoDurationChange"
      />
    </div>

    <div>
      <label>
        {{ title }}
        <Required
          v-show="isPromoRequired"
        />
      </label>
      <Dropzone
        v-if="!resetDropzone"
        :submitCalled="submitCalled"
        :dropzoneId="id"
        fileType="video"
        storageType="video"
        acceptedFiles=".mov,video/*"
        :warningText="warningText"
        @input="onDropzoneInput"
        @change="onDropzoneChange"
      />
    </div>
  </Fragment>
</template>
<script lang="ts">
import { lookup } from 'mime-types';
import Vue from 'vue';
import { Fragment } from 'vue-fragment';
import Dropzone from '@/components/Helper/Dropzone.vue';
import { getStorageFileSrc } from '@/helpers';
import { DropzoneChangeReason, DropzoneInputReason } from '@/type';

export default Vue.extend({
  name: 'UploadVideo',
  components: { Dropzone, Fragment },
  props: {
    title: {
      type: String,
      default: 'Video Teaser',
    },
    id: {
      type: String,
      default: 'promoVideoUrl',
    },
    isPromoRequired: {
      type: Boolean,
      required: true,
    },
    promoVideoUrl: {
      type: String,
      required: true,
    },
    promoDuration: {
      type: Number,
      required: true,
    },
    resetDropzone: {
      type: Boolean,
      required: true,
    },
    submitCalled: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      promoVideoPreviewSrc: this.promoVideoUrl,
      promoVideoFile: null as null | File,
      warningText: '',
    };
  },
  computed: {
    promoContentType(): string {
      const filename = this.promoVideoUrl.startsWith('http')
        ? new URL(this.promoVideoUrl).pathname : this.promoVideoUrl;
      return lookup(filename) || 'video/mp4';
    },
  },
  watch: {
    promoVideoUrl: {
      immediate: true,
      async handler() {
        if (!this.promoVideoUrl || this.promoVideoUrl.startsWith('http')) {
          this.promoVideoPreviewSrc = await getStorageFileSrc(this.promoVideoUrl);
        }
        this.setWarningText();
      },
    },
    isPromoRequired() {
      this.setWarningText();
    },
    promoVideoFile() {
      this.$emit('update:promoDuration', 0);
      if (!this.promoVideoFile) {
        this.promoVideoPreviewSrc = '';
        return;
      }

      this.promoVideoPreviewSrc = URL.createObjectURL(this.promoVideoFile);
      const promoVideoPreview = this.$refs.promoVideoPreview as HTMLVideoElement;
      promoVideoPreview?.load();
    },
    warningText: {
      immediate: true,
      handler() {
        this.$emit('warning', this.warningText);
      },
    },
  },
  methods: {
    setWarningText() {
      if (this.promoVideoUrl) {
        const previewPromoVideo = this.$refs.promoVideoPreview as HTMLVideoElement;
        if (!previewPromoVideo) {
          this.warningText = `${this.title} preview is not ready`;
          return;
        }
        if (!previewPromoVideo.duration) {
          this.warningText = `${this.title} duration is ${previewPromoVideo.duration}`;
          return;
        }
      }
      this.warningText = this.isPromoRequired && !this.promoVideoUrl ? `${this.title} is required` : '';
    },
    onDropzoneInput(dropzoneId: string, file: null | File, reason: DropzoneInputReason) {
      this.promoVideoFile = file;
      this.$emit('input', dropzoneId, file, reason);
    },
    onDropzoneChange(dropzoneId: string, fileName: string, reason: DropzoneChangeReason) {
      this.$emit('change', dropzoneId, fileName, reason);
    },
    onPreviewPromoVideoDurationChange() {
      const previewPromoVideo = this.$refs.promoVideoPreview as HTMLVideoElement;
      // most of the videos have a black screen as the first frame
      // advance the video a bit
      // so that initial black screen is not shown
      previewPromoVideo.currentTime = previewPromoVideo.duration * 0.05;
      this.$emit('update:promoDuration', previewPromoVideo.duration);
      this.setWarningText();
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
