<template>
  <VCard>
    <VCardText
      class="pt-8"
    >
      <form @submit.prevent="onSubmit">
        <p class="change-title primaryB--text">
          Update password
        </p>
        <p
          class="mt-n3 mb-8 change-text secondaryB--text"
          style="font-size: 12px;"
        >
          You'll get a message at your new email to verify the change.
        </p>

        <label class="change-label darkB--text">
          Current Password
          <Required />
        </label>
        <VTextField
          type="password"
          name="current-password"
          v-model="currentPassword"
          filled
          flat
          @blur="onCurrentPasswordUpdate"
          :errorMessages="errors.get('currentPassword')|| serverError"
        >
          <template #message="{ message }">
            <Error :message="message" />
          </template>
        </VTextField>

        <label class="change-label darkB--text">
          New Password
          <Required />
        </label>
        <VTextField
          name="new-password"
          v-model="newPassword"
          filled
          flat
          @blur="$v.newPassword.$touch()"
          :errorMessages="errors.get('newPassword')"
        >
          <template #message="{ message }">
            <Error :message="message" />
          </template>
        </VTextField>

        <VBtn
          width="315"
          height="40"
          class="submit my-8"
          color="primary"
          :disabled="isUpdating"
          :loading="isUpdating"
          @click="onSubmit"
        >
          Update
        </VBtn>
      </form>
    </VCardText>
  </VCard>
</template>

<script lang="ts">
import axios, { AxiosError } from 'axios';
import Vue from 'vue';
import { required } from 'vuelidate/lib/validators';
import { handleAxiosError } from '@/helpers';

type Fields = 'currentPassword' | 'newPassword';
type Errors = Map<Fields, string>;

export default Vue.extend({
  name: 'ChangePassword',
  props: {
    resetField: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      serverError: '',
      isUpdating: false,
    };
  },
  validations: {
    currentPassword: { required },
    newPassword: { required },
  },
  watch: {
    resetField(newVal) {
      if (newVal) {
        this.reset();
      }
    },
  },
  computed: {
    errors(): Errors {
      const errors = new Map<Fields, string>();

      const { currentPassword, newPassword } = this.$v;
      if (currentPassword.$dirty && !currentPassword.required) {
        errors.set('currentPassword', 'Current Password is required');
      }
      if (newPassword.$dirty && !newPassword.required) {
        errors.set('newPassword', 'New Password is required');
      }

      return errors;
    },
  },
  methods: {
    onCurrentPasswordUpdate() {
      this.$v.currentPassword.$touch();
      this.serverError = '';
    },
    reset() {
      this.currentPassword = '';
      this.newPassword = '';
      this.serverError = '';
      this.$v.currentPassword.$reset();
      this.$v.newPassword.$reset();
    },
    resetAndShowSettings() {
      this.reset();
      this.$emit('click');
    },
    async onSubmit() {
      this.$v.$touch();
      if (this.$v.$anyError) {
        return;
      }

      try {
        this.isUpdating = true;

        const updateObj = {
          currentPassword: this.currentPassword.trim(),
          newPassword: this.newPassword.trim(),
        };
        await axios.put('/auth/password', updateObj);
        this.resetAndShowSettings();
      } catch (e) {
        if (e.isAxiosError) {
          this.serverError = (e as AxiosError).response?.data.message;
        } else {
          handleAxiosError(e);
        }
      } finally {
        this.isUpdating = false;
      }
    },
  },
});
</script>

<style scoped lang="scss">

.change-title {
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
}
.change-text {
  line-height: 16px;
}

.change-label {
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
}

::v-deep .theme--light.v-text-field--filled > .v-input__control > .v-input__slot {
  background-color: var(--v-backgroundLight-base);
  margin-bottom: 0;
  min-height: 49px;
  border-radius: 4px;
}

.submit {
  font-weight:bold;
  font-size: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.v-card {
  border-radius: 4px !important;
}

</style>
