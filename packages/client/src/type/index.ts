import { User, Navigation } from 'types';

export * from 'types';
export * from './auth';

export interface Menu {
  name: string;
  url: string;
  children?: Menu[];
}

export interface Dialog {
  show: boolean;
}

type Sidebar = Dialog;

export interface Device {
  isMobile: boolean;
  isTouchDevice: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isIPad: boolean;
  isIPhone: boolean;
  isAndroid: boolean;
  isAndroidTablet: boolean;
}

export interface RootState {
  user?: User;
  token: string;
  device: Device,
  isBootstrapped: boolean;
  prevRoutePath: string;
  navigations: Navigation[];
  sidebars: Record<string, Sidebar>;
  dialogs: Record<string, Dialog>;
}

export interface SearchParams {
  reference?: string;
  redirect?: string;
}

export type DropzoneInputReason = 'file-added' | 'canceled' | 'removed-file';

export type DropzoneChangeReason = 'success' | 'error';

export interface DropzoneHandlers {
  onDropzoneInput(dropzoneId: string, file: null | File, reason: DropzoneInputReason): void;
  onDropzoneChange(dropzoneId: string, fileName: string, reason: DropzoneChangeReason): void;
}
