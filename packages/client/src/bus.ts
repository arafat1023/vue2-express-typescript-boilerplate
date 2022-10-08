import mitt from 'mitt';

// eslint-disable-next-line no-shadow
export enum NOTIFICATION {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  MUTE = 'MUTE',
  UNMUTE = 'UNMUTE',
}

interface NotificationEvent {
  message: string;
  showNotification?: boolean;
  showHomeLink?: boolean;
  permanent?: boolean;
}

type Handler = (event: NotificationEvent) => void;

interface Emitter {
  emit(type: NOTIFICATION, event: NotificationEvent): void;

  emit(type: NOTIFICATION): void;

  on(type: NOTIFICATION, handler: Handler): void;
}

const Bus: Emitter = mitt();

export default Bus;
