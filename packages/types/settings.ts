import { User } from './user';

export interface Settings {
  _id?: string;
  siteIsActive: boolean;
  updatedBy: string | User;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SettingsJobCode = 'switch-site-is-active';

export type SettingsJobResponse = Settings | undefined;
