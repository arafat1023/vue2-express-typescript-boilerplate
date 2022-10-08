import SettingsModel from './SettingsModel';

export default class SessionService {
  static getSettings = SettingsModel.getSettings;

  static setSettings = SettingsModel.setSettings;

  static on = SettingsModel.on;
}
