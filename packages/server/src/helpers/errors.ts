// eslint-disable-next-line max-classes-per-file
export class SiteError extends Error {
  constructor(
    message: string,
    public readonly errors?: Map<string, string> | Record<string, string | undefined>,
  ) {
    super(message);
  }
}

export class EmailError extends SiteError {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class AuthorizationError extends Error {
  name: 'AuthorizationError';
}

export class NotFoundError extends Error {
  constructor() {
    super('');
    this.name = 'NotFoundError';
  }
}
