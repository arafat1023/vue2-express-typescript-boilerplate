import { EventEmitter } from 'events';
import { model, Document } from 'mongoose';
import { Settings } from 'types';
import SettingsSchema from './SettingsSchema';

interface SettingsDocument extends Settings, Document<string> {

}

const emitter = new EventEmitter();

const defaultSettings: Settings = {
  _id: 'default-settings',
  siteIsActive: true,
  updatedBy: 'default-settings',
};

export default class SettingsModel {
  static readonly BaseModel = model<SettingsDocument>('settings', SettingsSchema);

  static async setSettings(
    settings: Settings,
  ): Promise<Settings> {
    await SettingsModel.BaseModel.deleteMany({});

    const createdSettings = await SettingsModel.BaseModel.create(settings);

    const leanedSettings = createdSettings.toObject();
    emitter.emit('update', leanedSettings);
    return leanedSettings;
  }

  static on(eventName: 'update', handler: (settings: Settings) => void): void {
    emitter.on(eventName, handler);
  }

  static async getSettings(): Promise<Settings> {
    const settings = await SettingsModel.BaseModel.findOne().lean().exec();
    if (!settings) {
      return defaultSettings;
    }
    return { ...defaultSettings, ...settings };
  }
}
