import { TimeStamp } from './util';

export interface NavigationChild {
  name: string;
  userOnly: boolean;
  url: string;
}

export interface Navigation extends Omit<NavigationChild, 'url'>, TimeStamp {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id: any;
  order: number;
  url?: string;
  children: NavigationChild[];
}
