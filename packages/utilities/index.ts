import { config as dotEnvConfig } from 'dotenv';
import path from 'path';
import utilitiesConfig from './configs/utilities.config.json';

dotEnvConfig({
  path: path.join(
    __dirname,
    '..',
    '..',
    '.env',
  ),
});

export {
  default as INFOS,
  Info,
} from './test';

interface APPInfo {
  IS_DEVELOPMENT: boolean;
  SERVER_PORT: number;
  CLIENT_PORT: number;
  SERVER_HOST?: string;
  ROUTE_API: string;
  CONFIG: typeof utilitiesConfig;
}

export function getAppInfo(): APPInfo {
  const DEV_ENV = 'development';
  // eslint-disable-next-line
  const PROD_ENV = 'production';
  const IS_DEVELOPMENT = process.env.NODE_ENV === DEV_ENV;

  // eslint-disable-next-line no-nested-ternary
  let SERVER_PORT = IS_DEVELOPMENT ? utilitiesConfig.devPort : utilitiesConfig.prodPort;

  SERVER_PORT = parseInt(SERVER_PORT.toString(), 10);

  const SERVER_HOST = process.env.PORT ? '0.0.0.0' : process.env.HOST || undefined;

  const appInfo = {
    IS_DEVELOPMENT,
    SERVER_PORT,
    CLIENT_PORT: 8080,
    SERVER_HOST,
    ROUTE_API: '/api',
    CONFIG: utilitiesConfig,
  };

  return appInfo;
}
