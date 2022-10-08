<template>
  <div>
    <VMenu
      v-if="navigation.children.length"
      attach="#app"
      nudgeBottom="60px"
      light
      maxHeight="calc(100vh - 80px)"
    >
      <!-- Button -->
      <template #activator="{ on, attrs, value }">
        <VBtn
          text
          height="60px"
          color="transparent"
          class="navigation-btn-dark"
          style="min-width: 0;"
          v-bind="attrs"
          v-on="on"
          :to="route"
          :target="url ? '_blank' : undefined"
          :href="url"
          :style="value && 'border-bottom: 2px solid #FE4642;'"
        >
          {{ navigation.name }}
        </VBtn>
      </template>

      <!-- Menu items -->
      <VList
        class="px-2 py-2"
      >
        <VListItem
          v-for="(child) in navigation.children"
          :key="child.name"
        >
          <HeaderTextLinkButton
            :name="child.name"
            :url="getUrl(child)"
            :route="getRoute(child)"
            block
          />
        </VListItem>
      </VList>
    </VMenu>
    <VBtn
      v-else
      text
      activeClass="nav-active"
      height="60px"
      color="transparent"
      class="navigation-btn-dark"
      style="min-width: 0;"
      :to="route"
      :target="url ? '_blank' : undefined"
      :href="url"
    >
      {{ navigation.name }}
    </VBtn>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import HeaderTextLinkButton from '@/components/NavBar/HeaderTextLinkButton.vue';
import { clientBaseUrl } from '@/helpers';
import {
  Navigation,
  NavigationChild,
} from '@/type';

export default Vue.extend({
  name: 'NavigationMenu',
  components: {
    HeaderTextLinkButton,
  },
  props: {
    navigation: {
      type: Object as PropType<Navigation>,
      required: true,
    },
  },
  computed: {
    route(): string | undefined {
      if (!this.navigation.url) {
        return undefined;
      }
      if (this.navigation.url.startsWith(clientBaseUrl)) {
        const route = this.navigation.url.replace(clientBaseUrl, '') || '/';
        return route;
      }
      return undefined;
    },
    url(): string | undefined {
      if (!this.navigation.url || this.route) {
        return undefined;
      }
      return this.navigation.url;
    },
  },
  methods: {
    getUrl(child: NavigationChild): string | undefined {
      const url = child.url.startsWith(clientBaseUrl)
        ? undefined : child.url;
      return url;
    },
    getRoute(child: NavigationChild): string | undefined {
      const route = child.url.startsWith(clientBaseUrl)
        ? child.url.replace(clientBaseUrl, '') || '/'
        : undefined;
      return route;
    },
  },
});

</script>

<style scoped lang="scss">

.v-btn.v-btn--text {
  font-size: 16px;
  font-weight: 400;
  line-height: 19px;
}

.navigation-btn-white {
  border-radius: 0;
  &::v-deep .v-btn__content {
    color: white;
  }
}

.navigation-btn-dark {
  border-radius: 0;
  &::v-deep .v-btn__content {
    color: var(--v-primaryB-base);
  }
}
.v-list-item {
  padding: 0;

  min-height: 0;

  .v-btn {
    padding-right: 1.5em;
    padding-left: 0.5em;
    min-width: 200px !important;

    &:active,
    &.v-btn--active {
      font-weight: bold;
    }
  }

  &::v-deep .v-btn__content {
    display: block;
  }
}

.nav-active {
  border-bottom: 2px solid var(--v-primary-base);
  border-radius: 0;
}

.v-btn--active.nav-active::before {
  opacity: 0 !important;
}

</style>
