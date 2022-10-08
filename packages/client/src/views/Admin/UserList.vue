<template>
  <VContainer fluid>
    <VRow
      justify="center"
      align="center"
    >
      <VCol>
        <VCard>
          <VCardTitle class="align-end">
            <div class="display-1 primary--text">
              Users
            </div>
            <VSpacer />
            <VTextField
              v-model="search"
              appendIcon="mdi-magnify"
              label="Search"
              hideDetails
            />
            <VTooltip top>
              <template #activator="{ on }">
                <VBtn
                  icon
                  color="green darken-1"
                  v-on="on"
                  @click="exportCsv"
                >
                  <VIcon class="mt-1">
                    mdi-table-arrow-right
                  </VIcon>
                </VBtn>
              </template>
              <span>Export To CSV</span>
            </VTooltip>
          </VCardTitle>
          <VDataTable
            :headers="headers"
            :items="report"
            itemKey="userId"
            :customSort="customSort"
            :loading="isLoading"
            :search="search"
            sortBy="registrationDate"
            sortDesc
            mustSort
            showExpand
          >
            {{ /* eslint-disable vue/valid-v-slot */ }}
            <template #item.registrationDate="{value}">
              {{ formatDate(value) }}
            </template>
            <template #item.socialLogins="{value}">
              <img
                v-if="value.includes('Google')"
                :src="require('@/assets/socials/google-logo.png')"
                alt="google-logo"
              >
              <div
                v-if="value.includes('Facebook')"
                class="rounded d-inline-block"
                style="background-color: #1877F2; height: 30px; width: 30px"
              >
                <img
                  :src="require('@/assets/socials/fb-logo.png')"
                  alt="fb-logo"
                >
              </div>

              <span v-if="!value">
                N/A
              </span>
            </template>
          </VDataTable>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script lang="ts">
import axios from 'axios';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { parse } from 'json2csv';
import { startCase } from 'lodash';
import Vue from 'vue';
import { download } from '@/helpers';
import { User } from '@/type';

dayjs.extend(localizedFormat);

interface Methods {
  startCase: typeof startCase;

  formatDate(date: string): string;

  customSort(items: ReportElement[], index: ReportKeys[], isDesc: boolean[]): ReportElement[];

  exportCsv(): void;
}

type ReportKeys =
  | 'registrationDate'
  | 'userId'
  | 'socialLogins'
  | 'referralCode'
  | 'referredCode'
  | 'email'
  | 'firstName'
  | 'lastName';

interface Data {
  users: User[];
  headers: { text: string; value: ReportKeys }[];
  isLoading: boolean;
  search: string;
}

type ReportElement = {
  [K in ReportKeys]: string;
};

interface Computed {
  report: ReportElement[];
}

export default Vue.extend<Data, Methods, Computed>({
  name: 'UserList',
  data() {
    return {
      users: [],
      isLoading: false,
      search: '',
      headers: [
        { text: 'Registration Date', value: 'registrationDate' },
        { text: 'User ID', value: 'userId' },
        { text: 'Social Logins', value: 'socialLogins' },
        { text: 'Referral Code', value: 'referralCode' },
        { text: 'Referred Code', value: 'referredCode' },
        { text: 'Email', value: 'email' },
        { text: 'First Name', value: 'firstName' },
        { text: 'Last Name', value: 'lastName' },
      ],
    };
  },
  computed: {
    report(): ReportElement[] {
      return this.users.map((user): ReportElement => {
        const {
          createdAt,
          _id: userId,
          socialLogins,
          referralCode,
          referredCode,
          username: email,
          firstName,
          lastName,
        } = user;

        return {
          registrationDate: createdAt || 'N/A',
          socialLogins: (socialLogins?.map((login) => login.name) || []).join(),
          referralCode,
          referredCode: referredCode || 'N/A',
          userId,
          email,
          firstName,
          lastName,
        };
      });
    },
  },
  methods: {
    startCase,
    formatDate(date: string): string {
      return dayjs(date).format('LL');
    },
    customSort(items, index, isDesc) {
      if (index.length) {
        const key = index[0] as ReportKeys;
        const sortedItems: ReportElement[] = items.sort((a, b) => {
          const valA = a[key] as string;
          const valB = b[key] as string;
          if (key === 'registrationDate') {
            const dateA = new Date(valA).getTime() || 0 as number;
            const dateB = new Date(valB).getTime() || 0 as number;
            if (isDesc[0]) {
              return dateB - dateA;
            }
            return dateA - dateB;
          }
          if (isDesc[0]) {
            return valB.localeCompare(valA);
          }
          return valA.localeCompare(valB);
        });
        return sortedItems;
      }

      return this.report;
    },
    exportCsv() {
      const fields = this.headers.map((header) => header.text);
      const csvData = this.report.map((el) => {
        const keyValuePairs = this.headers.map((header) => [header.text, el[header.value as ReportKeys]]);
        return Object.fromEntries(keyValuePairs);
      });
      const csv = parse(csvData, { fields });
      download(csv, 'Users.csv');
    },
  },
  async created() {
    this.isLoading = true;
    const userResponse = await axios.get<{ users: User[] }>('/users');
    this.users = userResponse.data.users;
    this.isLoading = false;
  },
});
</script>

<style scoped lang="scss">
  .spacer {
    flex-grow: 2 !important;
  }
</style>
