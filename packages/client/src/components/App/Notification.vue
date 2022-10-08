<template>
  <VSnackbar
    v-model="showNotification"
    color="white"
    light
    top
    multiLine
    style="top: 84px"
    :timeout="notificationTimeout"
  >
    <div
      class="d-flex justify-start align-center"
      :class="{'mr-n4': notificationTimeout === -1}"
    >
      <VIcon
        v-if="notificationType === 'SUCCESS'"
        color="accent"
        class="mr-1"
      >
        mdi-check-circle-outline
      </VIcon>
      <VIcon
        v-else
        color="primary"
        class="mr-1"
      >
        mdi-exclamation
      </VIcon>
      <span style="max-width: 300px;">{{ notification }}</span>
    </div>
    <template
      #action="{ attrs }"
      v-if="showHomeLink || notificationTimeout === -1"
    >
      <a
        v-if="showHomeLink"
        role="button"
        @click="goHome"
      >
        Home
      </a>
      <VBtn
        v-else
        color="primary"
        icon
        small
        class="px-1"
        v-bind="attrs"
        @click="showNotification = false"
      >
        <VIcon>mdi-close</VIcon>
      </VBtn>
    </template>
  </VSnackbar>
</template>
<script lang="ts">
import Vue from 'vue';
import Bus, { NOTIFICATION } from '@/bus';

interface Data {
  notification: string;
  notificationType: string;
  showNotification: boolean;
  notificationTimeout: number;
  showHomeLink: boolean;
}

interface Methods {
  goHome(): Promise<void>;
}

export default Vue.extend<Data, Methods, unknown>({
  name: 'Notification',
  data() {
    return {
      notification: '',
      notificationType: '',
      showNotification: false,
      notificationTimeout: 5000,
      showHomeLink: false,
    };
  },
  created() {
    Bus.on(NOTIFICATION.SUCCESS, (e) => {
      this.notification = e.message;
      this.notificationType = NOTIFICATION.SUCCESS;
      this.showNotification = true;
      this.notificationTimeout = 5000;
    });

    Bus.on(NOTIFICATION.ERROR, (e) => {
      this.notification = e.message;
      this.notificationType = NOTIFICATION.ERROR;
      this.showNotification = true;
      this.showHomeLink = !!e.showHomeLink;
      this.notificationTimeout = e.permanent ? -1 : 5000;
    });
  },
  methods: {
    async goHome() {
      this.showNotification = false;
      await this.$router.push('/');
      window.location.reload();
    },
  },
});
</script>

<style scoped lang="scss">
.v-snack {
  padding-top: 0px !important;
  font-size: 14px;
  line-height: 22px;

  &::v-deep {
    .v-snack__wrapper {
      min-width: initial;
      max-width: initial;

      .v-snack__content {
        flex-direction: column;
        padding: 8px;
        min-height: initial;
      }
    }
  }
}
</style>
