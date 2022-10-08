<template>
  <VContainer class="mx-5 fluid align-self-start">
    <div class="display-1 mt-3 my-12 primary--text">
      Settings
    </div>
    <!-- Confirmation Popup -->
    <ConfirmationDialog
      :showDialog="isConfirming"
      :confirmationText="`Are you sure you want to save this settings?`"
      @click:confirm="onSaveSettings"
      @click:cancel="isConfirming = false"
    />
    <!-- Confirmation Popup End-->

    <VForm
      :disabled="!actionPerforming"
      @submit.prevent="onSaveClick"
    >
      <div class="d-flex">
        <label>
          Set site is active or not
          <Required />
        </label>
        <VSwitch
          class="data-field"
          v-model="siteIsActive"
          filled
          flat
          @blur="$v.siteIsActive.$touch()"
          :errorMessages="errors.get('siteIsActive')"
        >
          <template #message="{ message }">
            <Error :message="message" />
          </template>
        </VSwitch>
      </div>

      <VBtn
        type="submit"
        class="d-flex mx-auto mt-6"
        width="137px"
        height="40px"
        color="primary"
      >
        Save
      </VBtn>
    </VForm>
  </VContainer>
</template>

<script lang="ts">
import axios from 'axios';
import Vue from 'vue';
import { required } from 'vuelidate/lib/validators';
import Bus, { NOTIFICATION } from '@/bus';
import ConfirmationDialog from '@/components/Helper/ConfirmationDialog.vue';
import { handleAxiosError, CONFIG } from '@/helpers';
import { Settings } from '@/type';

type Fields = Exclude<keyof Settings, '_id'>;
type Errors = Map<Fields, string>;

export default Vue.extend({
  name: 'MutateSettings',
  components: {
    ConfirmationDialog,
  },
  data() {
    return {
      isConfirming: false,
      actionPerforming: false,

      siteIsActive: true,
    };
  },
  validations: {
    siteIsActive: { required },
  },
  computed: {
    errors(): Errors {
      const errors = new Map<Fields, string>();

      const {
        siteIsActive,
      } = this.$v;

      if (siteIsActive.$dirty && !siteIsActive.required) {
        errors.set('siteIsActive', `${CONFIG.appName} Activity is required`);
      }

      return errors;
    },
  },
  methods: {
    onSaveClick() {
      this.$v.$touch();
      if (this.$v.$anyError) {
        return;
      }
      this.isConfirming = true;
    },
    async onSaveSettings() {
      this.isConfirming = false;
      this.actionPerforming = true;
      try {
        const settings = {
          siteIsActive: this.siteIsActive,
        };

        await axios.post<{ settings: Settings }>('/settings', settings);

        Bus.emit(NOTIFICATION.SUCCESS, {
          message: 'Successfully updated settings.',
        });
      } catch (e) {
        handleAxiosError(e);
      }
      this.actionPerforming = true;
    },
  },
  async created() {
    try {
      const settingsResponse = await axios.get<{ settings: Settings }>('/settings');
      const { settings } = settingsResponse.data;
      this.siteIsActive = settings.siteIsActive;
      this.actionPerforming = true;
    } catch (e) {
      handleAxiosError(e);
    }
  },
});
</script>

<style scoped lang="scss">
label {
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: var(--v-darkB-base);
  flex: 0 0 33%;
  text-align: right;
  padding-right: 24px;
  padding-top: 24px;
}

.v-btn {
  font-weight: bold;
  font-size: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.data-field {
  flex: 0 0 33%;
}

</style>
