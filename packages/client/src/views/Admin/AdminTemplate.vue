<template>
  <VContainer
    fluid
    class="pa-0 fill-height"
  >
    <VNavigationDrawer
      v-model="drawer"
      app
      clipped
      width="250"
    >
      <Sidebar />
    </VNavigationDrawer>

    <AdminNavBar
      :isDrawerOpen.sync="drawer"
    />
    <RouterView />
  </VContainer>
</template>

<script lang="ts">
import Vue from 'vue';
import AdminNavBar from '@/components/App/AdminNavBar.vue';
import Sidebar from '@/components/App/AdminSidebar.vue';

interface Data {
  drawer: boolean;
}

export default Vue.extend<Data, unknown, unknown>({
  name: 'AdminTemplate',
  components: {
    AdminNavBar,
    Sidebar,
  },
  data() {
    return {
      drawer: true,
    };
  },
});
</script>

<style scoped>

</style>
