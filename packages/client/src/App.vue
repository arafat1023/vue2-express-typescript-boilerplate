<!--
 - Ankur Mursalin
 - encryptioner.github.io
 - December 08, 2021
 -->

<template>
  <VApp>
    <Header v-if="showDefaultHeader" />

    <VMain>
      <Notification />

      <GoogleOneTap />

      <RouterView />
    </VMain>

    <Footer v-if="showDefaultFooter" />
  </VApp>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { User } from '@/type';

interface Computed {
  user: User;
  showDefaultHeader: boolean;
  showDefaultFooter: boolean;
}

let storageEventHandler: (e: StorageEvent) => void;

export default Vue.extend<unknown, unknown, Computed>({
  name: 'App',
  components: {
    Notification: () => import(/* webpackChunkName: "Notification" */
      '@/components/App/Notification.vue'
    ),
    Footer: () => import(/* webpackChunkName: "Footer" */
      '@/components/App/Footer.vue'
    ),
    Header: () => import(/* webpackChunkName: "Header" */
      '@/components/NavBar/Header.vue'
    ),
    GoogleOneTap: () => import(/* webpackChunkName: "GoogleOneTap" */
      '@/components/App/GoogleOneTap.vue'
    ),
  },
  computed: {
    ...mapState(['user']),
    showDefaultHeader(): boolean {
      const { fullPath } = this.$route;
      return !fullPath.startsWith('/auth')
        && !fullPath.startsWith('/admin');
    },
    showDefaultFooter(): boolean {
      const { fullPath } = this.$route;
      return this.showDefaultHeader
      && !fullPath.startsWith('/user');
    },

  },
  created() {
    storageEventHandler = (e: StorageEvent) => {
      if (e.key === 'token') {
        // local storage token changed
        console.log(`Key Changed: ${e.key}`);
        window.sessionStorage.removeItem('token');
        window.sessionStorage.removeItem('user');
        window.location.reload();
      }
    };

    window.addEventListener('storage', storageEventHandler);
  },

  beforeDestroy() {
    window.removeEventListener('storage', storageEventHandler);
  },
});
</script>
