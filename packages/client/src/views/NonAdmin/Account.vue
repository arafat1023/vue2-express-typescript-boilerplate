<template>
  <VCard
    class="pl-2"
  >
    <!-- Avatar and name -->
    <VCardTitle class="pb-0">
      <VRow v-if="!editingAvatar">
        <VCol
          class="mt-n3"
          style="flex-grow: 1"
        >
          <VAvatar
            size="60"
            color="backgroundLight"
          >
            <VImg
              v-if="userProfileImageSrc"
              :src="userProfileImageSrc"
              :alt="usernameAbbreviation"
            />
            <span
              v-else
              class="primary--text user-icon"
            >{{ usernameAbbreviation }}</span>
          </VAvatar>
        </VCol>
        <VCol
          class="ml-n2"
          style="flex-grow: 9"
        >
          <p class="primaryB--text user-fullname">
            {{ user.firstName }} {{ user.lastName || '' }}
          </p>
          <p class="secondaryB--text username mt-n3">
            {{ user.username }}
          </p>
        </VCol>
        <VCol
          class="text-right mt-n3"
          style="flex-grow: 2"
        >
          <VBtn
            text
            class="accent--text pa-0"
            style="font-weight: bold; font-size: 12px;"
            @click="onEditProfilePictureClick"
          >
            <VIcon size="12">
              mdi-pencil
            </VIcon>
            Edit
          </VBtn>
        </VCol>
      </VRow>
      <EditProfilePicture
        v-else
        @click="onEditProfilePictureClick"
      />
    </VCardTitle>

    <header class="mx-4 pt-5">
      Account Settings
    </header>
    <div class="settings-text secondaryB--text mx-4 mt-1">
      This is the personal information you use to access and manage your account.
    </div>

    <VSubheader class="mx-4 mt-8">
      Email address
    </VSubheader>
    <p class="mx-4 mt-2 other-text darkB--text">
      {{ user.username }}
    </p>

    <VDivider
      v-if="user.password"
      class="mx-4 mt-n6"
    />

    <VRow
      v-if="user.password"
      class="my-3 mx-1"
    >
      <VCol cols="6">
        <VSubheader>
          Password
        </VSubheader>
        <p class="mt-2 mb-5 other-text darkB--text">
          ************
        </p>
      </VCol>
      <VCol
        cols="6"
        class="text-right mt-n3"
      >
        <VBtn
          text
          class="accent--text pa-0"
          style="font-weight: 700; font-size: 12px;"
          @click="showChangePasswordDialog=true"
        >
          Change password
        </VBtn>
      </VCol>
    </VRow>

    <VDialog
      v-model="showChangePasswordDialog"
      width="366"
    >
      <ChangePassword
        :resetField="showChangePasswordDialog"
        @click="showChangePasswordDialog=false"
      />
    </VDialog>
  </VCard>
</template>

<script lang="ts">

import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import ChangePassword from '@/components/Account/ChangePassword.vue';
import EditProfilePicture from '@/components/Account/EditProfilePicture.vue';

export default Vue.extend({
  name: 'Account',
  components: {
    EditProfilePicture,
    ChangePassword,
  },
  data() {
    return {
      editingAvatar: false,
      showChangePasswordDialog: false,
      userProfileImageSrc: '',
    };
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['usernameAbbreviation']),
  },
  watch: {
    async user(newVal, oldVal) {
      if (newVal?.profileImage === oldVal?.profileImage) {
        return;
      }
      this.userProfileImageSrc = await this.$store.getters.userProfileImageSrc;
    },
  },
  methods: {
    onEditProfilePictureClick() {
      this.editingAvatar = !this.editingAvatar;
    },
  },
  async created() {
    this.userProfileImageSrc = await this.$store.getters.userProfileImageSrc;
  },
});
</script>

<style scoped>

.settings-text .other-text {
  font-style: normal;
  font-weight: normal;
}

.settings-text {
  font-size: 14px;
  line-height: 16px;
}

.other-text {
  font-size: 14px;
  line-height: 20px;
}

.user-fullname {
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
}
.username {
  font-size: 12px;
  line-height: 14px;
}

.user-icon {
  font-weight: 900;
  font-size: 25px;
  line-height: 30px;
}

::v-deep .v-label {
  font-size: 14px;
  line-height: 16px;
  color: var(--v-primaryB-base);
}

::v-deep .v-messages__message {
  color: var(--v-primary-base);
  margin-left: 8px;
}
</style>
