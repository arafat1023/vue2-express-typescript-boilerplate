<template>
  <div>
    <!-- textInputField slot -->
    <slot name="textInputField">
      <div
        class="textarea-wrapper"
        :class="{dark: isDark, outlined}"
      >
        <textarea
          class="emoji-textarea fill-width pa-2 mt-1"
          ref="text"
          aria-label="Emoji Text Area"
          :value="value"
          @input="$emit('input', $event.target.value)"
          @keypress="$emit('keypress', $event)"
          v-position
          :data-position="textCursorPosition"
          :placeholder="placeholder"
          :autofocus="autofocus"
          :rows="rows"
          @blur="$emit('blur')"
        />

        <slot name="textarea-after" />
      </div>
      <Error
        v-if="errorMessage"
        class="v-messages error--text"
        :message="errorMessage"
      />
    </slot>
    <div class="d-flex justify-end align-center">
      <slot name="emoji-picker-before" />
      <VMenu
        v-bind="emojiMenuProps"
        absolute
        offsetY
        :closeOnContentClick="false"
      >
        <template #activator="{on, attrs}">
          <VBtn
            icon
            small
            v-bind="attrs"
            v-on="on"
          >
            <VImg
              height="20px"
              contain
              :src="require(`@/assets/icons/emoji-icon-${isDark ? 'dark': 'light'}.svg`)"
            />
          </VBtn>
        </template>

        <VEmojiPicker
          @select="selectEmoji"
        />
      </VMenu>
      <slot name="emoji-picker-after" />
    </div>
  </div>
</template>

<script lang="ts">
import { VEmojiPicker } from 'v-emoji-picker';
import Vue, { PropType } from 'vue';

export interface IEmoji {
  data: string;
  category: string;
  aliases: string[];
}

export default Vue.extend({
  name: 'TextWithEmojiInput',
  components: {
    VEmojiPicker,
  },
  props: {
    isDark: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    rows: {
      type: Number,
      default: 4,
    },
    value: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    emojiMenuProps: {
      type: Object as PropType<Record<string, unknown>>,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      textCursorPosition: NaN,
    };
  },
  mounted() {
    if (this.value) {
      this.updateTextCursorPosition();
    }
  },
  methods: {
    updateTextCursorPosition() {
      const textArea = this.$refs.text as HTMLTextAreaElement;
      this.textCursorPosition = textArea.selectionStart;
    },
    selectEmoji(emoji: IEmoji) {
      const textArea = this.$refs.text as HTMLTextAreaElement;
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      this.$emit('input', `${this.value.substring(0, start)}${emoji.data}${this.value.substring(end)}`);
      this.textCursorPosition = start;

      // clicking on the emoji will cause the text-area to lose focus.
      // As a result, the caret position will be changes to 0.
      // Restore the focus so that the caret position sustains.
      textArea.focus();
    },
  },
  directives: {
    /**
     * Setting the value of a text-input programmatically, which vue JS does internally,
     * removes the caret position.
     * Thus, before updating the value, we are storing current caret position in `textCursorPosition`.
     * This directive will be called after every update to the element on which it is applied.
     * However, directives does not have access to `this` context.
     * Therefore, we are using data-* property to access last known position.
     */
    position: {
      update(el) {
        if (!(el instanceof HTMLTextAreaElement)) {
          throw new Error('`position` directive can be only applied to `HTMLTextAreaElement`');
        }

        if (el.dataset.position === 'NaN') {
          return;
        }

        // JS uses 16 bit chars, but emojis are 32 bit.
        const position = Number(el.dataset.position) + 2;
        el.setSelectionRange(position, position);
        // eslint-disable-next-line no-param-reassign
        el.dataset.position = 'NaN';
      },
    },
  },
});
</script>

<style lang="scss" scoped>
.emoji-textarea {
  font-family: Lato, Twemoji, NotomojiColor, Notomoji, EmojiOne Color, Symbola, Noto,
  Segoe UI Emoji, OpenSansEmoji, monospace;
  font-size: 16px;
  line-height: 19px;
  resize: none;
  border-radius: 4px;
  outline: none;
}

.textarea-wrapper {
  border: 1px solid #F4F8FB;
  box-sizing: border-box;
  border-radius: 8px;
  background: #F4F8FB;

  &.outlined {
    border-color: rgba(0, 0, 0, 0.15);
  }

  &.dark {
    background: #2C2C2C;
    color: var(--v-unselectedGrey-base);
  }
}
</style>
