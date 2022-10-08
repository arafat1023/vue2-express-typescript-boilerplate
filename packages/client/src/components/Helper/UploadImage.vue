<template>
  <Fragment>
    <div class="text-center my-12">
      <!--suppress HtmlUnknownTarget -->
      <img
        v-show="imagePreviewSrc"
        :src="imagePreviewSrc"
        :alt="title"
        style="width: 75%; min-height: 100px; border: 1px dashed black;"
        class="elevation-6 pa-3"
        ref="imagePreview"
      >
    </div>
    <Dropzone
      v-if="!resetDropzone"
      :submitCalled="submitCalled"
      :dropzoneId="id"
      acceptedFiles="image/*"
      fileType="image"
      storageType="media"
      dropText="Drag and drop image to upload"
      :warningText="warningText"
      @input="onDropzoneInput"
      @change="onDropzoneChange"
    />
  </Fragment>
</template>

<script lang="ts">
import Vue from 'vue';
import { Fragment } from 'vue-fragment';
import Dropzone from '@/components/Helper/Dropzone.vue';

export default Vue.extend({
  name: 'UploadImage',
  components: { Dropzone, Fragment },
  props: {
    title: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    isRequired: {
      type: Boolean,
      required: true,
    },
    initialImageUrl: {
      type: String,
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
      imagePreviewSrc: this.initialImageUrl,
      imageFile: null as null | File,
      imageFileName: '',
      warningText: '',
    };
  },
  watch: {
    isRequired() {
      this.setWarningText();
    },
    initialImageUrl() {
      this.imagePreviewSrc = this.initialImageUrl;
    },
    imagePreviewSrc: {
      immediate: true,
      async handler() {
        this.setWarningText();
      },
    },
    warningText: {
      immediate: true,
      handler() {
        this.$emit('warning', this.warningText);
      },
    },
    imageFile() {
      if (!this.imageFile) {
        this.imagePreviewSrc = '';
        this.imageFileName = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewSrc = e.target?.result?.toString() as string;
      };
      reader.readAsDataURL(this.imageFile);
    },
    imageFileName() {
      this.setWarningText();
      this.$emit('change', this.imageFileName);
    },
  },
  methods: {
    setWarningText() {
      if (this.imageFile && !this.imageFileName) {
        this.warningText = `${this.title} is uploading`;
        return;
      }
      if (!this.isRequired) {
        this.warningText = '';
        return;
      }
      if (!this.imagePreviewSrc) {
        this.warningText = `${this.title} is required`;
        return;
      }
      this.warningText = this.imageFileName || this.initialImageUrl ? '' : `${this.title} is required`;
    },
    onDropzoneInput(dropzoneId: string, file: null | File) {
      this.imageFile = file;
    },
    onDropzoneChange(dropzoneId: string, fileName: string) {
      this.imageFileName = fileName;
    },
  },
});
</script>
