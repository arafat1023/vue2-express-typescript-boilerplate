import SettingsSetter from './SiteSettings';
import { suppressQueue } from '../../configs/server.config.json';

if (!suppressQueue) {
  // eslint-disable-next-line no-console
  new SettingsSetter().run().catch(console.error);
}
