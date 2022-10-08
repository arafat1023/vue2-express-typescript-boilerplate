<template>
  <VAvatar
    :size="size"
    :class="{bordered: bordered || !profileImage}"
    :style="{ '--color': $vuetify.theme.themes.light[color] }"
  >
    <VImg
      v-if="profileImage"
      :src="profileImage"
    />
    <Title
      v-else
      class="primary--text"
      :class="{ fontSm }"
    >
      {{ abbreviatedName }}
    </Title>
  </VAvatar>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';
import SITE_LOGO from '@/assets/site-assets/logo-with-name.png';
import { abbreviateName, profileImageSrc } from '@/helpers';
import { User } from '@/type';

export default Vue.extend({
  name: 'ProfileImage',
  props: {
    user: {
      type: Object as PropType<User>,
      required: true,
    },
    size: {
      type: String,
      default: '40px',
    },
    fontSm: {
      type: Boolean,
      default: false,
    },
    bordered: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: 'primary',
    },
  },
  data() {
    return {
      profileImage: '',
    };
  },
  computed: {
    abbreviatedName(): string {
      return abbreviateName(this.user);
    },
  },
  watch: {
    async user() {
      await this.setProfileImage();
    },
  },
  async created() {
    await this.setProfileImage();
  },
  methods: {
    async setProfileImage() {
      if (!this.user) {
        return;
      }
      if (this.user.role === 'admin') {
        this.profileImage = SITE_LOGO;
      } else {
        this.profileImage = await profileImageSrc(this.user as User);
      }
    },
  },
});
</script>
<style scoped lang="scss">
.fontSm {
  font-size: 12px;
}

.bordered {
  border: 2px solid var(--color);
}
</style>
