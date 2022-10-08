<template>
  <VContainer
    fluid
    class="pa-0 ma-0 pb-6"
  >
    <form @submit.prevent="onSubmit">
      <VRow>
        <VCol
          cols="12"
          class="text-center my-0 py-0"
        >
          <VAvatar
            class="ma-0 pa-0"
            size="100"
            color="backgroundLight"
          >
            <VImg
              v-if="imagePreviewSrc"
              :src="imagePreviewSrc"
              :alt="usernameAbbreviation"
            />
            <span
              v-else
              class="primary--text user-icon"
            >{{ usernameAbbreviation }}</span>
          </VAvatar>

          <VBtn
            icon
            height="24"
            width="24"
            elevation="0"
            class="ml-n5 mb-n12"
            @click="onPickProfileImage"
          >
            <VIcon
              color="accent"
              size="18"
            >
              mdi-camera-plus
            </VIcon>
          </VBtn>
          <VBtn
            v-if="profileImageFile"
            icon
            height="24"
            width="24"
            elevation="0"
            class="ml-n6 mt-n15"
            @click="profileImageFile = null"
          >
            <VIcon
              color="red"
              size="18"
            >
              mdi-close-circle
            </VIcon>
          </VBtn>

          <VTooltip
            top
            color="accent"
            v-if="showDeleteProfileImage"
          >
            <template #activator="{ on }">
              <VBtn
                small
                v-on="on"
                class="ml-6"
                color="primary"
                @click="onDeleteProfileImage"
              >
                Delete
              </VBtn>
            </template>
            Delete profile picture & save
          </VTooltip>

          <VFileInput
            v-show="false"
            v-model="profileImageFile"
            filled
            flat
            validateOnBlur
            ref="profileImageInput"
            accept="image/*"
          />
        </VCol>
      </VRow>
      <VRow class="mt-8">
        <VCol
          cols="6"
          class="py-0"
        >
          <VTextField
            :label="errors.get('firstName') || 'First Name'"
            v-model="firstName"
            filled
            flat
            hideDetails
            height="48px"
            @blur="$v.firstName.$touch()"
            :error="!!errors.get('firstName')"
          />
        </VCol>
        <VCol
          cols="6"
          class="py-0"
        >
          <VTextField
            :label="errors.get('lastName') || 'Last Name'"
            v-model="lastName"
            filled
            flat
            hideDetails
            height="48px"
            color="red"
            :error="!!errors.get('lastName')"
          />
        </VCol>
      </VRow>
      <VRow
        class="mx-0 mb-n1"
        style="margin-top: 40px;"
      >
        <VSpacer />
        <VBtn
          outlined
          width="150"
          height="40"
          depressed
          elevation="0"
          class="mr-4 secondaryB--text cancel"
          @click="resetAndShowProfile"
        >
          Cancel
        </VBtn>
        <VBtn
          width="150"
          height="40"
          class="submit"
          color="primary"
          depressed
          :disabled="isSaving"
          :loading="isSaving"
          @click="onSubmit"
        >
          Save
        </VBtn>
      </VRow>
    </form>
  </VContainer>
</template>

<script lang="ts">
import axios, { AxiosRequestConfig } from 'axios';
import Vue from 'vue';
import { required } from 'vuelidate/lib/validators';
import { mapState, mapGetters } from 'vuex';
import { handleAxiosError } from '@/helpers';
import { User } from '@/type';

type Errors = Map<keyof User, string>;

export default Vue.extend({
  name: 'EditProfilePicture',
  data() {
    return {
      firstName: '',
      lastName: '',
      imagePreviewSrc: '',
      userProfileImageSrc: '',
      profileImageFile: null as null | File,
      uploadProgress: 0,
      isSaving: false,
      deleteProfileImage: false,
    };
  },
  validations: {
    firstName: { required },
    lastName: { required },
  },
  watch: {
    profileImageFile() {
      if (!this.profileImageFile) {
        this.imagePreviewSrc = this.deleteProfileImage ? '' : this.userProfileImageSrc;
        return;
      }
      this.deleteProfileImage = false;
      const reader = new FileReader();

      reader.onload = (e) => {
        this.imagePreviewSrc = e.target?.result?.toString() as string;
      };

      reader.readAsDataURL(this.profileImageFile); // convert to base64 string
    },
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['usernameAbbreviation']),
    errors(): Errors {
      const errors = new Map<keyof User, string>();
      const { firstName, lastName } = this.$v;
      if (firstName.$dirty && !firstName.required) {
        errors.set('firstName', 'First name is required');
      }
      if (lastName.$dirty && !lastName.required) {
        errors.set('lastName', 'Last name is required');
      }
      return errors;
    },
    showDeleteProfileImage(): boolean {
      if (!this.user.profileImage || !this.imagePreviewSrc) {
        return false;
      }
      return !this.user.profileImage.startsWith('http');
    },
  },
  methods: {
    onPickProfileImage() {
      const profileImageInput = this.$refs.profileImageInput as Vue;
      const input = profileImageInput.$refs.input as HTMLElement;
      input.click();
    },
    onDeleteProfileImage() {
      this.deleteProfileImage = true;
      this.profileImageFile = null;
      this.imagePreviewSrc = '';
    },
    async resetAndShowProfile() {
      await this.reset();
      this.$emit('click');
    },
    async onSubmit() {
      this.$v.$touch();
      if (this.$v.$anyError) {
        return;
      }

      try {
        this.isSaving = true;
        const formData = new FormData();

        formData.append('firstName', this.firstName.trim());
        formData.append('lastName', this.lastName.trim());

        if (this.profileImageFile) {
          const imageName = `${this.user._id}_profile-image_${Date.now()}`;
          formData.append('profileImage', imageName);
          formData.append('profileImageFile', this.profileImageFile, imageName);
          formData.append('previousProfileImage', this.user.profileImage);
        } else if (this.deleteProfileImage) {
          formData.append('profileImage', '');
          formData.append('previousProfileImage', this.user.profileImage);
        }

        const config: AxiosRequestConfig = {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e: ProgressEvent) => {
            this.uploadProgress = (e.loaded / e.total) * 100;
          },
        };

        // save user profile
        const saveProfileResponse = await axios.put('/users', formData, config);
        const { user } = saveProfileResponse.data;
        const {
          firstName,
          lastName,
          profileImage,
        } = user;
        const newUserData = {
          ...this.user,
          firstName,
          lastName,
          profileImage: this.profileImageFile || this.deleteProfileImage ? profileImage : this.user.profileImage,
        };
        this.$store.state.user = newUserData;

        await this.resetAndShowProfile();
      } catch (e) {
        handleAxiosError(e);
      } finally {
        this.uploadProgress = 0;
        this.isSaving = false;
      }
    },
    async reset() {
      this.userProfileImageSrc = await this.$store.getters.userProfileImageSrc;
      this.firstName = this.user.firstName;
      this.lastName = this.user.lastName || '';
      this.imagePreviewSrc = this.userProfileImageSrc;
    },
  },
  async created() {
    await this.reset();
  },
});
</script>

<style scoped lang="scss">
.v-avatar {
  margin-top: 38px;
}

.user-icon {
  font-style: normal;
  font-weight: 900;
  font-size: 30px;
  line-height: 36px;
}

.submit {
  font-weight:bold;
  font-size: 16px;
  border-radius: 8px;
}

.cancel {
  font-size: 16px; border-radius: 8px;
  border-color: var(--v-lightGrey-base);
}

.v-input::v-deep {
  &.error--text .v-input__slot {
    border: 1px solid var(--v-lighterOrange-base);
  }

  .v-label {
    color: var(--v-secondaryB-base);
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    top: 12px;

    &.error--text {
      color: var(--v-primary-base);
    }
  }

  .v-input__append-inner {
    margin-top: 10px;

    .v-icon.error--text {
      color: rgba(0, 0, 0, 0.54) !important;
    }
  }
}

::v-deep .theme--light.v-text-field--filled > .v-input__control > .v-input__slot {
  background-color: var(--v-backgroundLight-base);
  margin-bottom: 0;
  min-height: 48px;
}

</style>
