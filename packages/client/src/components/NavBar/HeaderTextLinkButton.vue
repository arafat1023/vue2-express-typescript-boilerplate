<template>
  <VBtn
    text
    :block="block"
    depressed
    :ripple="false"
    class="primaryB--text"
    height="50px"
    :to="route"
    :target="url ? '_blank' : undefined"
    :href="url"
    @click="$emit( event || 'click')"
  >
    <div class="d-flex align-center">
      {{ name }}
    </div>
  </VBtn>
</template>

<script lang="ts">
import Vue from 'vue';

export interface HeaderTextLink {
  name: string;
  route?: string;
  url?: string;
  event?: string;
  userOnly?: boolean;
  hidden?: boolean;
  isMobile?: boolean;
}

export const MEMBER_TEXT_LINKS: HeaderTextLink[] = [
  { name: 'Account', route: '/user/account' },
];

interface Props extends HeaderTextLink {
  block?: boolean;
}

export default Vue.extend<unknown, unknown, unknown, Props>({
  name: 'HeaderTextLinkButton',
  props: {
    name: {
      type: String,
      required: true,
    },
    route: {
      type: String,
      required: false,
      default: '',
    },
    url: {
      type: String,
      required: false,
      default: '',
    },
    block: {
      type: Boolean,
      required: false,
    },
    event: {
      type: String,
      default: '',
    },
  },
});
</script>

<style scoped lang="scss">
  // multiple classes needed in selector due to competition with others
  // from the theme
  .v-application .v-btn:active,
  .v-application .v-btn--active {
    color: var(--v-primary-base) !important;
  }

  // Was in a previous design, at least;
  // background rectangle color of red for highlighted buttons.
  // Currently hidden by the .v-btn::before rule.
  .highlighted::before {
    background-color: var(--v-primary-base);
  }

</style>
