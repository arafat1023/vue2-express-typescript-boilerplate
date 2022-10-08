<template>
  <VAppBar
    app
    clippedLeft
  >
    <VAppBarNavIcon
      @click="updateDrawer"
    />
    <VToolbarTitle>
      <RouterLink
        to="/"
        :class="dark ? 'white--text' : 'dark--text'"
        style="text-decoration: none;"
      >
        {{ appName }}
      </RouterLink>
    </VToolbarTitle>
    <VSpacer />
    <VMenu offsetY>
      <template #activator="{ on }">
        <VBtn v-on="on">
          {{ username }}
          <VIcon large>
            mdi-account
          </VIcon>
        </VBtn>
      </template>
      <VList>
        <VListItem>
          <VBtn
            text
            @click="logout"
          >
            Logout
          </VBtn>
        </VListItem>
      </VList>
    </VMenu>
  </VAppBar>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { CONFIG } from '@/helpers';

export default Vue.extend({
  name: 'AdminNavBar',
  data() {
    return {
      appName: CONFIG.appName,
    };
  },
  props: {
    isDrawerOpen: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapState(['user']),
    username() {
      return this.user?.username || '';
    },
    dark() {
      return this.$vuetify.theme.dark;
    },
  },
  methods: {
    async logout() {
      await this.$store.dispatch('logout');
      await this.$router.push('/');
    },
    updateDrawer() {
      this.$emit('update:isDrawerOpen', !this.isDrawerOpen);
    },
  },
});
</script>
