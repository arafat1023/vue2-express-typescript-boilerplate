export * from './logs';
export * from './settings';
export * from './user';
export * from './navigation';
export * from './util';

export type Sort<Entity> = {
  [K in keyof Entity]?: 1 | -1;
};

export type Projection<Entity> = (keyof Entity)[] | {
  [K in keyof Entity]: 1 | -1;
};

export type ProjectKeys<Keys extends string> = Keys[] | {
  [K in Keys]: 1 | -1;
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
