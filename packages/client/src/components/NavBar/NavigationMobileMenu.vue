<template>
  <VMenu
    attach="#app"
    nudgeBottom="44px"
    maxHeight="calc(100vh - 80px)"
    light
    contentClass="navigation-menu"
    :closeOnContentClick="false"
  >
    <!-- Button -->
    <template #activator="{ on, attrs, value }">
      <VBtn
        small
        text
        icon
        class="ml-1 mt-1"
        style="min-width: 0;"
        v-bind="attrs"
        v-on="on"
      >
        <VIcon
          size="18"
          :color="$vuetify.theme.dark ? 'white': 'primaryB'"
        >
          {{ value ? 'mdi-close' : 'mdi-menu' }}
        </VIcon>
      </VBtn>
    </template>

    <VList>
      <template
        v-for="navigation of availableNavigations"
      >
        <VListGroup
          v-if="navigation.children.length"
          :key="navigation._id"
          noAction
        >
          <template #activator>
            <VListItemContent>
              <VListItemTitle v-text="navigation.name" />
            </VListItemContent>
          </template>

          <VListItem
            v-for="(child, childIndex) of navigation.children"
            :key="`${child.name}_${childIndex}`"
          >
            <VListItemContent>
              <VListItemTitle
                style="cursor:pointer;"
                v-text="child.name"
                @click="onNavigationChildClick(child)"
              />
            </VListItemContent>
          </VListItem>
        </VListGroup>
        <VListItem
          v-else
          :key="navigation._id"
        >
          <VListItemTitle
            style="cursor:pointer;"
            v-text="navigation.name"
            @click="onNavigationClick(navigation)"
          />
        </VListItem>
      </template>
    </VList>
  </VMenu>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import { clientBaseUrl } from '@/helpers';
import {
  Navigation,
  User,
  NavigationChild,
} from '@/type';

interface Computed {
  user: null | User;
  navigations: Navigation[];
  availableNavigations: Navigation[];
}
interface Methods {
  onNavigationChildClick(child: NavigationChild): void;

  onNavigationClick(navigation: Navigation): void;
}

export default Vue.extend<unknown, Methods, Computed>({
  name: 'NavigationMobileMenu',
  computed: {
    ...mapState(['user', 'navigations']),
    ...mapGetters(['availableNavigations']),
  },
  methods: {
    onNavigationChildClick(child: NavigationChild) {
      if (child.url.startsWith(clientBaseUrl)) {
        const route = child.url.replace(clientBaseUrl, '') || '/';
        this.$router.push(route);
        return;
      }
      window.open(child.url, '_blank');
    },

    onNavigationClick(navigation: Navigation) {
      if (!navigation.url) {
        return;
      }
      if (navigation.url.startsWith(clientBaseUrl)) {
        const route = navigation.url.replace(clientBaseUrl, '') || '/';
        this.$router.push(route);
        return;
      }
      window.open(navigation.url, '_blank');
    },
  },
});

</script>

<style scoped lang="scss">
.navigation-menu {
  min-width: 100vw !important;
  left: 0 !important;
  border-radius: 0;
}
</style>
