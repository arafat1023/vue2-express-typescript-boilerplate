import { Job } from 'bullmq';
import { SettingsJobCode, SettingsJobResponse } from 'types';
import SettingsService from '../../../modules/settings/SettingsService';
import UserService from '../../../modules/user/UserService';
import { QueueLogger } from '../../Logger';

export default async function setSettings(
  job: Job<null, SettingsJobResponse, SettingsJobCode>,
): Promise<SettingsJobResponse> {
  switch (job.name) {
    case 'switch-site-is-active':
      return switchSiteIsActive();
    default:
      QueueLogger.error('Invalid job name:', job);
      return undefined;
  }
}

async function switchSiteIsActive(): Promise<SettingsJobResponse> {
  const adminUser = await UserService.getAdminUser();

  if (!adminUser) {
    return undefined;
  }
  const userId = adminUser._id;

  const settings = await SettingsService.getSettings();
  const updatedSettings = await SettingsService.setSettings({
    _id: undefined,
    siteIsActive: !settings.siteIsActive,
    updatedBy: userId,
  });

  return updatedSettings;
}
