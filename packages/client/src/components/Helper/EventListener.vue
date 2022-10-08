<script lang="ts">

import Vue, { VNode } from 'vue';

let handler: (e: Event) => void;
export default Vue.extend({
  name: 'EventListener',
  render(h): VNode {
    return h(undefined);
  },
  props: {
    event: {
      type: String,
      required: true,
    },
  },
  methods: {
    returnEventAndHandler() {
      const { event } = this;
      return { event, handler };
    },
  },
  mounted() {
    handler = (e: Event) => {
      this.$emit('fired', e);
    };
    const { event } = this;
    window.addEventListener(event, handler);
  },
  beforeDestroy() {
    const { event } = this;
    window.removeEventListener(event, handler);
  },
});
</script>
