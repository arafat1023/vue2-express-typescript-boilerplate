<template>
  <VMenu
    offsetY
    left
    light
    maxHeight="calc(100vh - 80px)"
    :closeOnContentClick="false"
  >
    <template #activator="{ on: menuOn, attrs }">
      <VTooltip
        bottom
        color="accent"
      >
        <template #activator="{ on: tooltipOn }">
          <VBtn
            small
            text
            fab
            :class="{'ml-3': !congested}"
            class="mr-2"
            style="min-width: 0;"
            v-bind="attrs"
            v-on="{ ...menuOn, ...tooltipOn }"
          >
            <ProfileImage
              :user="user"
            />
          </VBtn>
        </template>
        {{ name }}
      </VTooltip>
    </template>

    <VList class="expandable-menu px-2 py-2">
      <VListItem
        v-for="(item) in availableTextLinks"
        :key="item.name"
      >
        <HeaderTextLinkButton
          :name="item.name"
          :route="item.route"
          :url="item.url"
          :event="item.event"
          block
        />
      </VListItem>
      <VListItem>
        <HeaderTextLinkButton
          name="Sign out"
          block
          @click="logout"
        />
      </VListItem>
    </VList>
  </VMenu>
</template>
<script lang="ts">
import { startCase } from 'lodash';
import Vue from 'vue';
import { mapState } from 'vuex';
import ProfileImage from '@/components/Helper/ProfileImage.vue';
import HeaderTextLinkButton, {
  HeaderTextLink,
  MEMBER_TEXT_LINKS,
} from '@/components/NavBar/HeaderTextLinkButton.vue';
import { User } from '@/type';

interface Methods {
  logout(): Promise<void>;
}

interface Computed {
  user?: User;
  name: string;
  availableTextLinks: HeaderTextLink[];
}

interface Props {
  congested: boolean;
}

export default Vue.extend<unknown, Methods, Computed, Props>({
  name: 'MemberMenu',
  components: {
    HeaderTextLinkButton,
    ProfileImage,
  },
  props: {
    congested: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(['user']),
    name() {
      if (!this.user) {
        return '';
      }
      return startCase(`${this.user.firstName} ${this.user.lastName || ''}`);
    },
    availableTextLinks() {
      return MEMBER_TEXT_LINKS.filter((l) => !l.hidden && !l.isMobile);
    },
  },
  methods: {
    async logout() {
      await this.$store.dispatch('logout');
      if (this.$router.currentRoute.path !== '/') {
        await this.$router.push('/');
      }
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

.expandable-menu .v-list-item {
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

.user-icon {
  font-weight: 900;
  font-size: 16px;
  line-height: 16px;
}

</style>
