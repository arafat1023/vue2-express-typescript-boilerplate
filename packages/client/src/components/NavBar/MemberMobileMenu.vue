<template>
  <VMenu
    attach="#app"
    left
    nudgeBottom="36px"
    light
    maxHeight="calc(100vh - 80px)"
  >
    <!-- Button -->
    <template #activator="{ on, attrs }">
      <VBtn
        small
        text
        fab
        width="32px"
        height="32px"
        class="mr-2 mt-1"
        style="min-width: 0;"
        v-bind="attrs"
        v-on="on"
      >
        <ProfileImage
          :user="user"
          size="32px"
        />
      </VBtn>
    </template>

    <!-- Menu items -->
    <VList class="expandable-menu px-2 py-2">
      <VListItem
        class="user-info"
      >
        <ProfileImage
          :user="user"
          class="mr-6"
        />
        <VListItemContent>
          <VListItemTitle>
            {{ user.firstName }} {{ user.lastName || '' }}
          </VListItemTitle>
          <VListItemSubtitle>
            {{ user.username }}
          </VListItemSubtitle>
        </VListItemContent>
      </VListItem>
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
          @click="onSignOutClick"
        />
      </VListItem>
    </VList>
  </VMenu>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import ProfileImage from '@/components/Helper/ProfileImage.vue';
import HeaderTextLinkButton, {
  HeaderTextLink,
  MEMBER_TEXT_LINKS,
} from '@/components/NavBar/HeaderTextLinkButton.vue';
import { User } from '@/type';

interface Computed {
  user: null | User;
  availableTextLinks: HeaderTextLink[];
}

interface Methods {
  onSignOutClick(): Promise<void>;
}

export default Vue.extend<unknown, Methods, Computed>({
  name: 'MemberMobileMenu',
  components: {
    HeaderTextLinkButton,
    ProfileImage,
  },
  computed: {
    ...mapState(['user']),
    availableTextLinks() {
      return MEMBER_TEXT_LINKS.filter((l) => !l.hidden && this.user);
    },
  },
  methods: {
    async onSignOutClick() {
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

.user-info{

  .v-list-item__title {
    font-weight: normal;
    font-size: 20px;
    line-height: 32px;
  }

  .v-list-item__subtitle {
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
  }
}

</style>
