<template>
  <VAppBar
    app
    absolute
    elevation="0"
    class="px-md-6"
    style="background-color: transparent; z-index: 2;"
  >
    <template v-if="isMobile">
      <div
        v-if="availableNavigations.length"
        style="min-width:96px;"
      >
        <NavigationMobileMenu />
      </div>

      <VSpacer />

      <VAppBarNavIcon
        class="rounded mx-0"
      >
        <RouterLink to="/">
          <img
            :src="require('@/assets//site-assets/logo-with-name.png')"
            alt="logo-with-name"
            :height="isMobile ? '32px' : '40px'"
          >
        </RouterLink>
      </VAppBarNavIcon>
    </template>
    <template v-else>
      <VAppBarNavIcon
        class="rounded ml-0 mr-10"
      >
        <RouterLink to="/">
          <img
            :src="require('@/assets/site-assets/logo-with-name.png')"
            alt="logo-with-name"
            :height="isMobile ? '32px' : '40px'"
          >
        </RouterLink>
      </VAppBarNavIcon>
      <div
        class="d-flex"
        v-if="availableNavigations.length"
      >
        <NavigationMenu
          v-for="navigation of availableNavigations"
          :key="navigation._id"
          :navigation="navigation"
        />
      </div>
    </template>

    <VSpacer />

    <template
      v-if="isMobile"
    >
      <div
        v-if="user"
      >
        <MemberMobileMenu />
      </div>

      <VBtn
        v-else
        text
        class="mx-0 px-0"
        to="/auth/login"
      >
        Sign in
      </VBtn>
    </template>

    <template v-else>
      <template
        v-if="user"
      >
        <MemberMenu :congested="true" />
      </template>
      <VBtn
        v-else
        class="mx-0"
        color="primary"
        width="80px"
        height="40px"
        depressed
        to="/auth/login"
      >
        Sign in
      </VBtn>
    </template>
  </VAppBar>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import MemberMenu from '@/components/NavBar/MemberMenu.vue';
import MemberMobileMenu from '@/components/NavBar/MemberMobileMenu.vue';
import NavigationMenu from '@/components/NavBar/NavigationMenu.vue';
import NavigationMobileMenu from '@/components/NavBar/NavigationMobileMenu.vue';
import { User, Navigation } from '@/type';

interface Computed {
  isMobile: boolean;
  user: null | User;
  navigations: Navigation[];
  availableNavigations: Navigation[];
}

export default Vue.extend<unknown, unknown, Computed>({
  name: 'Header',
  components: {
    MemberMenu,
    MemberMobileMenu,
    NavigationMenu,
    NavigationMobileMenu,
  },
  computed: {
    ...mapState(['user', 'navigations']),
    ...mapGetters(['availableNavigations']),
    isMobile() {
      return this.$vuetify.breakpoint.mobile;
    },
  },
});

</script>

<style scoped lang="scss">
.v-app-bar__nav-icon {
  width: auto !important;
}

// Text buttons, maybe including auth buttons
.v-btn.v-btn--text {
  font-size: 16px;
  font-weight: 400;
  line-height: 19px;
}

// Button-style buttons (solid-color BG)
.v-btn.v-size--default.primary {
  margin-left: 14px;
  margin-right: 30px;;

  font-size: 14px;
  font-weight: 700;
}
.navigation-btn {
  border-radius: 0;
  &::v-deep .v-btn__content {
    color: var(--v-primaryB-base);
  }
}
.no-active {
    border-bottom: 2px solid var(--v-primary-base);
}
.v-btn--active.no-active::before {
  opacity: 0 !important;

}

</style>
