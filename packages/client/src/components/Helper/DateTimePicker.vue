<template>
  <VRow justify="space-around">
    <VDatePicker
      v-model="date"
      color="green lighten-1"
      :allowedDates="allowedDates"
    />
    <VTimePicker
      ampmInTitle
      v-model="time"
      format="24hr"
    />
  </VRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

export default Vue.extend({
  name: 'DateTimePicker',
  props: {
    value: {
      type: Date as PropType<Date>,
      required: true,
    },
    maxDate: {
      type: Date as PropType<Date>,
      default() {
        return new Date(3000, 1);
      },
    },
    minDate: {
      type: Date as PropType<Date>,
      default() {
        return yesterday;
      },
    },
  },
  data() {
    return {
      date: this.value.toISOString()
        .substr(0, 10),
      time: this.value.toISOString()
        .substr(11, 5),
    };
  },
  computed: {
    selectedDateTime(): Date {
      const selectedDateTime = new Date(`${this.date}T${this.time}:00.000Z`);
      return selectedDateTime;
    },
  },
  watch: {
    dateTime() {
      this.date = this.value.toISOString()
        .substr(0, 10);
      this.time = this.value.toISOString()
        .substr(11, 5);
    },
    selectedDateTime() {
      this.$emit('input', this.selectedDateTime);
    },
  },
  methods: {
    allowedDates(dateStr: string) {
      return new Date(dateStr).getTime() > new Date(this.minDate).getTime()
        && new Date(dateStr).getTime() < this.maxDate.getTime();
    },
  },
});
</script>

<style scoped lang="scss">
::v-deep {
  .v-picker--time .v-picker__title {
    padding: 8px;
  }

  .v-time-picker-clock__container {
    padding: 10px 24px 0;
  }
}
</style>
