/* eslint-disable no-console */
import {
  createLogger,
  format,
  Logger,
  transports,
} from 'winston';
import TransportStream from 'winston-transport';
import DailyRotateFile from 'winston-daily-rotate-file';
import { MongoDB } from 'winston-mongodb';
import chalk from 'chalk';
import path from 'path';
import { EventEmitter } from 'events';
import onFinished from 'on-finished';
import { Request, Response } from 'express';
import { User } from 'types';
import { Socket } from 'net';
import { IncomingMessage, OutgoingMessage } from 'http';
import { dbServer, suppressApiLogging } from '../configs/server.config.json';

function genDbHost(dbName: string): string {
  if (dbServer && dbServer.startsWith('mongodb+srv:')) {
    // const uri = "mongodb+srv://USERNAME:PASSWORD@CLUSTER_NAME.*****.mongodb.net/DATABASE_NAME
    const uri = `${dbServer}/${dbName}`;
    return uri;
  }
  return `mongodb://${dbServer || 'localhost'}/${dbName}`;
}

const {
  combine,
  timestamp,
  prettyPrint,
  metadata,
} = format;

// As multiple loggers are created from same `newTransport` method,
// the MaxListenersExceedWarning is triggered.
// To suppress the warning, the default value (11) is increased to
// 14 as there are 14 logger instance is created.
// The warning can be reproduced by just lowering the value from anything lower than 14
EventEmitter.defaultMaxListeners = 16;

/**
 * @param {string} name Log file `name` is same as the `name` of the transport
 * @param {string} level
 * @returns {Transports}
 */
function newFileTransport({ name, level }: { name: string; level: string }) {
  return new DailyRotateFile({
    level,
    json: false,
    dirname: 'logs/%DATE%',
    filename: path.join(
      __dirname,
      '..',
      '..',
      'logs',
      `${name}.log`,
    ),
    maxFiles: 10,
    maxSize: 1024000,
    format: combine(
      timestamp(),
      prettyPrint(),
    ),
  });
}

type NewLoggerParams = {
  name: string;
  level: string;
  useConsole?: boolean;
  useDb?: boolean;
  cappedSize?: number;
  exitOnError?: boolean | ((err: Error) => void);
}

declare module 'winston-mongodb' {
  export interface MongoDBConnectionOptions {
    format: Logger['format'];
  }
}

/**
 * Creates a new logger with given config
 * @param {string} name Log file `name` is same as the `name` of the transport
 * @param {string} level
 * @param useConsole
 * @param {boolean} [useDb]
 * @param {number} [cappedSize] if the value is truthy then logs are stored
 *        in a capped collection with given size.
 *        Has no effect if `useDb` is falsy.
 * @param {boolean | Function} [exitOnError]
 * @returns {Logger}
 */
function newLogger({
  name,
  level,
  useConsole = false,
  useDb = false,
  cappedSize,
  exitOnError = false,
}: NewLoggerParams) {
  const transportList: TransportStream[] = [
    newFileTransport({ name, level }),
  ];

  if (useConsole) {
    const consoleTransport = new transports.Console({
      level,
    });
    transportList.push(consoleTransport);
  }

  // Do not attach mongodb-transport while testing
  if (useDb && !('JEST_WORKER_ID' in process.env)) {
    const mongoDBTransport = new MongoDB({
      level,
      db: genDbHost('logs'),
      options: {
        useUnifiedTopology: true,
        connectTimeoutMS: 60 * 1000,
      },
      collection: name,
      name: `db#${name}`,
      ...(
        cappedSize ? {
          capped: true,
          cappedSize,
        } : null
      ),
      format: combine(
        timestamp(),
        metadata(),
      ),
    });
    transportList.push(mongoDBTransport);
  }
  const log = createLogger({
    exitOnError,
    transports: transportList,
  });
  return log;
}

const loggerXhr = newLogger({ exitOnError: false, name: 'xhr', level: 'debug' });
const fileLogger = newLogger({ exitOnError: false, name: 'files', level: 'debug' });
const FrontendLogger = newLogger({
  exitOnError: false, useDb: true, name: 'frontend', level: 'error',
});
const QueueLogger = newLogger({
  exitOnError: false, useDb: true, name: 'queue', level: 'debug',
});
const ScriptLogger = newLogger({
  exitOnError: false, useDb: true, name: 'script', level: 'debug',
});
const loggerConsole = newLogger({ exitOnError: false, name: 'console', level: 'info' });
const loggerEmail = newLogger({ exitOnError: false, name: 'email_text', level: 'info' });
const loggerError = newLogger({ exitOnError: logErrorInConsole, name: 'error', level: 'error' });

function logErrorInConsole(err: Error) { // shows the error detail in console.
  console.error(err.stack);
  return false;
}

loggerError.exceptions.handle(
  new transports.DailyRotateFile({
    level: 'error',
    dirname: 'logs/%DATE%',
    format: combine(
      timestamp(),
      prettyPrint(),
    ),

    maxFiles: 15,
    handleExceptions: true,
    filename: path.join(
      __dirname,
      '..',
      '..',
      'logs',
      'unhandledExceptions.log',
    ),
    json: false,
  }),
);

/**
 * Takes a logger and its level then returns logger with corresponding log level
 */
function exportLogger(loggerName: Logger, level: string) {
  return function log(...args: unknown[]) {
    let allTexts = '';

    args.forEach((arg) => {
      allTexts = `${allTexts + arg} `;
    });

    switch (level) {
      case ('info'):
        loggerName.info(allTexts);
        break;
      case ('debug'):
        loggerName.debug(allTexts);
        break;
      case ('error'):
        loggerName.error(allTexts);
        break;
      case ('warn'):
        loggerName.warn(allTexts);
        break;
      default:
        loggerName.info(allTexts);
        break;
    }
    console.log(allTexts);
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line no-shadow
    interface Response {
      socket: Socket;
    }
  }
}

/**
 * attach an event handler that will log the response once it's finished
 * @private
 */
function _logReqRes(
  response: Response,
  requestDetails: string,
  bodyData: Record<string, unknown>,
) {
  const ping = Date.now();

  const backup = response.socket?.write;
  let code;
  let message: string;

  function newWriter(
    this: Socket,
    buffer: Uint8Array | string,
    cb?: (err?: Error) => void
  ): boolean;
  function newWriter(
    this: Socket,
    str: Uint8Array | string,
    encoding?: BufferEncoding,
    cb?: (err?: Error) => void
  ): boolean;

  function newWriter(
    this: Socket,
    str: Uint8Array | string,
    encoding?: BufferEncoding | ((err?: Error) => void),
    cb?: (err?: Error) => void,
  ): boolean {
    if (typeof str === 'string') {
      if (str.startsWith('HTTP')) {
        const header = str.substring(0, str.indexOf('\n'));
        [, code] = header.split(' ');
        code = Number.parseInt(code, 10);
      }
    } else if (str instanceof Buffer) {
      message = str.toString();
      try {
        message = JSON.parse(message);
      } catch (e) {
        // it is a text response
      }
    }

    return !!backup?.apply(this, [str, encoding as BufferEncoding | undefined, cb]);
  }

  if (response.socket) {
    response.socket.write = newWriter;
  }

  onFinished(response as IncomingMessage | OutgoingMessage, (err) => {
    const pong = Date.now();
    const elapsed = (pong - ping) / 1000;
    loggerXhr.debug(requestDetails, {
      request: bodyData,
      statusCode: response.statusCode,
      elapsed: `${elapsed.toFixed(2)}s`,
      response: message,
    });
    if (err) {
      errorLog(err);
    }
  });
}

/**
 * log all request
 */
function logRequest(request: Request, response: Response): void {
  if (request.user && !suppressApiLogging) {
    console.log(chalk.blue('user:', request.user.username));
  }
  const ipAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  let userName = 'GUEST';
  if (request.user?.username) {
    userName = request.user.username;
  }
  const requestInfo = `[${userName}: ${ipAddress}] ${request.method}: ${request.originalUrl}`;
  if (request.baseUrl.startsWith('/api')) {
    if (request.baseUrl.endsWith('/mediaFile')) {
      fileLogger.debug(requestInfo);
    } else {
      const requestData = {
        body: {
          ...request.body,
          password: undefined,
        },
        params: {
          ...request.params,
        },
        query: {
          ...request.query,
        },
      };
      _logReqRes(response, requestInfo, requestData);
    }
  }
}

/**
 * logs errors
 * @param error
 * @param user
 * @param extraInfo
 */
function errorLog(error: Error, user?: User, extraInfo?: unknown): void {
  let allTexts = '';
  if (user) {
    allTexts += `[${user._id}-${user.username}]`;
  }
  if (extraInfo) {
    allTexts += ` - ${extraInfo}`;
  }
  allTexts += ` - Error: ${error.stack ? error.stack : error}`;
  loggerError.error(allTexts);
  console.log(allTexts);
}

const log = exportLogger(loggerConsole, 'info');
const logEmail = exportLogger(loggerEmail, 'info');
export {
  QueueLogger,
  FrontendLogger,
  ScriptLogger,
  genDbHost,
  logRequest,
  errorLog,
  log,
  logEmail,
};
