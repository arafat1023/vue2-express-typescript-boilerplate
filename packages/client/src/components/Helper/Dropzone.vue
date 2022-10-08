<template>
  <div class="my-5">
    <VueDropzone
      ref="myVueDropzone"
      :id="dropzoneId"
      :options="dropOptions"
      :includeStyling="useCustomSlot"
      :useCustomSlot="useCustomSlot"
      :awss3="awss3"
      @vdropzone-file-added="onFileAdded"
      @vdropzone-success="onSuccess"
      @vdropzone-error="onError"
      @vdropzone-canceled="onCanceled"
      @vdropzone-removed-file="onRemovedFile"
      @vdropzone-sending="onSending"
    >
      <div class="mt-n6">
        <p class="custom-title secondaryB--text pt-3">
          {{ dropText }}
        </p>
        <p class="my-2 custom-title secondaryB--text">
          Or
        </p>
        <VBtn
          color="accent"
          depressed
          class="white--text"
        >
          Select a file
        </VBtn>
      </div>
    </VueDropzone>
    <label
      v-show="warningText"
      class="primary--text"
      style="font-size:14px;"
    >
      <VIcon
        size="12"
        class="mr-3 primary--text"
      >
        mdi-window-close
      </VIcon>
      {{ warningText }}
    </label>
  </div>
</template>

<script>
import axios from 'axios';
import Vue from 'vue';
import VueDropzone from 'vue2-dropzone';
import { mapState } from 'vuex';
import { baseUrl, ROUTE_API, handleAxiosError } from '@/helpers';
import 'vue2-dropzone/dist/vue2Dropzone.min.css';

const getTemplate = () => `
<div class="vue-dropzone dropzone dz-clickable">
  <div class="dz-preview dz-file-preview ma-0"
    style="width:96px; height: 120px; background-color: #606060;"
  >
    <div class="dz-progress" style="z-index: 1; height:7px;border-radius: 0;animation:none;">
      <span class="dz-upload" style="background: #FE4642;" data-dz-uploadprogress></span>
    </div>
    <div class="dz-error-message"><span data-dz-errormessage></span></div>
    <div class="dz-success-mark"><i class="fa fa-check"></i></div>
    <div class="dz-error-mark"><i class="fa fa-close"></i></div>
  </div>
</div>
`;

export default Vue.extend({
  name: 'Dropzone',
  components: {
    VueDropzone,
  },
  props: {
    submitCalled: {
      type: Boolean,
      required: true,
    },
    dropzoneId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    storageType: {
      type: String,
      required: true,
      validator(value) {
        return ['video', 'media'].includes(value);
      },
    },
    dropText: {
      type: String,
      default() {
        return 'Drag and drop video files to upload';
      },
    },
    acceptedFiles: {
      type: String,
      required: true,
    },
    maxFilesize: {
      type: Number,
      default() {
        return 10240; // MB
      },
    },
    warningText: {
      type: String,
      default() {
        return '';
      },
    },
  },
  computed: {
    ...mapState(['user']),
    fileName() {
      return `${this.user._id}_${this.storageType}_${Date.now()}_${this.dropzoneId}`;
    },
    dropOptions() {
      const dropOptions = {
        previewTemplate: getTemplate(),
        url: this.url,
        addRemoveLinks: true,
        thumbnailWidth: 200,
        maxFiles: 1,
        timeout: 10 * 60 * 1000,
        dictCancelUploadConfirmation: 'Do you want to cancel?',
        dictRemoveFileConfirmation: 'Do you want to remove?',
        params: {},
        headers: { 'Access-Control-Allow-Origin': '*' },
        maxFilesize: this.maxFilesize,
        acceptedFiles: this.acceptedFiles,
        renameFile() {
          return this.fileName;
        },
      };

      return dropOptions;
    },
    awss3() {
      const payload = {
        fileName: this.fileName,
        fileType: this.fileType,
        storageType: this.storageType,
      };

      return {
        signingURL: (f) => `${baseUrl}${ROUTE_API}/mediaFile/storage-signed-url?contentType=${f.type}`,
        headers: {},
        params: payload,
        sendFileToServer: false,
        withCredentials: false,
      };
    },
  },
  data: () => ({
    useCustomSlot: true,
    url: `${baseUrl}${ROUTE_API}/mediaFile`,
  }),
  methods: {
    onSending() {
      const { dropzoneElement } = this.$refs.myVueDropzone.$refs;
      const removeItem = dropzoneElement.children[0].children[1];
      removeItem.style.cursor = 'pointer';
      removeItem.style.paddingLeft = '25%';
      removeItem.style.textTransform = 'uppercase';
    },
    onFileAdded(file) {
      this.$emit('input', this.dropzoneId, file, 'file-added');
      this.useCustomSlot = false;
    },
    onSuccess() {
      this.$emit('change', this.dropzoneId, this.fileName, 'success');
    },
    onError(err) {
      console.error('onError', err);
      this.$emit('change', this.dropzoneId, '', 'error');
    },
    onCanceled() {
      this.$emit('input', this.dropzoneId, null, 'canceled');
      this.useCustomSlot = true;
    },
    async onRemovedFile() {
      this.$emit('input', this.dropzoneId, null, 'removed-file');
      this.useCustomSlot = true;

      if (!this.submitCalled) {
        try {
          await axios.delete(`/mediaFile/${this.fileName}?fileType=${this.fileType}`);
        } catch (e) {
          handleAxiosError(e);
        }
      }
    },
  },
});
</script>
<style scoped lang="scss">

.custom-title {
  font-size: 16px;
  line-height: 19px;
}

.dropzone {
  max-height: 120px;
  min-height: 120px;
  border: none;
  border-radius: 4px;
  background: #F4F8FB;
  padding: 0;
}

.vue-dropzone> .dz-remove {
  position: absolute;
  z-index: 30;
  color: #fff;
  margin-left: 15px;
  padding: 10px;
  top: inherit;
  bottom: 15px;
  border: 2px #fff solid;
  text-decoration: none;
  text-transform: uppercase;
  font-size: .8rem;
  font-weight: 800;
  letter-spacing: 1.1px;
  opacity: 0;
}
</style>
