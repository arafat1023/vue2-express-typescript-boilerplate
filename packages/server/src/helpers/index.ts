import express from 'express';
import { Error as MongooseError, PopulateOptions } from 'mongoose';
import { ValidationError } from 'class-validator';
import { User as BaseUser } from 'types';
import { getAppInfo } from 'utilities';
import { errorLog } from '../services/Logger';
import {
  AuthorizationError,
  SiteError,
  EmailError,
  NotFoundError,
} from './errors';
import {
  baseServerUrl,
  baseClientUrl,
} from '../configs/server.config.json';

export * from 'utilities';
export * from './errors';

const { SERVER_PORT, CLIENT_PORT, IS_DEVELOPMENT } = getAppInfo();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends BaseUser {
    }
  }
}

export function sendErrorResponse(
  response: express.Response,
  error: SiteError | MongooseError | ValidationError[],
): void {
  if (error instanceof Array) {
    for (const errorElement of error) {
      errorLog(new Error(errorElement.toString()), response.req?.user);
    }
  } else {
    errorLog(error, response.req?.user);
  }
  if (error instanceof EmailError) {
    response.status(error.statusCode)
      .json({
        success: false,
        message: error.message,
      });
    return;
  }

  if (error instanceof SiteError) {
    if (response.statusCode === 200) {
      response.status(400);
    }
    response.json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  if (Array.isArray(error) && error[0] instanceof ValidationError) {
    const message = 'Validation failed';
    const errors: Record<string, string> = {};
    for (const errorEntry of error) {
      if (!errorEntry.constraints) {
        continue;
      }
      [errors[errorEntry.property]] = Object.values(errorEntry.constraints);
    }

    response.status(400)
      .json({
        message,
        errors,
      });

    return;
  }

  if (error instanceof MongooseError.ValidationError) {
    response.status(400)
      .json({
        success: false,
        message: error.message,
      });
    return;
  }

  if (error instanceof MongooseError.CastError) {
    response.status(400)
      .json({
        success: false,
        message: `Invalid value '${error.value}' for field '${error.path}'`,
        type: error.kind,
      });
    return;
  }

  if (error instanceof AuthorizationError) {
    response.sendStatus(403);
    return;
  }

  if (error instanceof NotFoundError) {
    response.sendStatus(404);
    return;
  }

  response.status(500)
    .json({ success: false });
}

/**
 * generate the base URL of the website
 */
export function genBaseUrl(req: express.Request): string {
  if (baseServerUrl) {
    return baseServerUrl;
  }
  const baseUrl = `${req.protocol}://${req.hostname}${
    IS_DEVELOPMENT ? `:${SERVER_PORT}` : ''
  }`;
  return baseUrl;
}

/**
 * generate the base URL of the website
 */
export function genBaseClientUrl(req: express.Request): string {
  if (baseClientUrl) {
    return baseClientUrl;
  }
  const baseUrl = `${req.protocol}://${
    req.hostname
  }${IS_DEVELOPMENT ? `:${CLIENT_PORT}` : ''}`;
  return baseUrl;
}

export function isYouTubeUrl(url: string): boolean {
  return /https?:\/\/(www\.)?youtu\.?be/.test(url);
}

/**
 * converts 'billing.customer.user' to {
 *   path: 'billing',
 *   populate: {
 *     path: 'customer',
 *     populate: {
 *       path: 'user',
 *     },
 *   },
 * }
 * @param {string} populateString in structure `billing.customer.user`
 * @returns {Object}
 */
export function buildPopulateObject(populateString: string): PopulateOptions | undefined {
  const populateObject = {} as PopulateOptions;
  let recursivePopulate = populateObject;
  for (const populateElement of populateString.split('.')) {
    recursivePopulate.populate = {} as PopulateOptions;
    recursivePopulate = recursivePopulate.populate;
    recursivePopulate.path = populateElement;
    if (['user'].includes(populateElement)) {
      recursivePopulate.select = DEFAULT_USER_PROJECTION_FIELDS;
    }
  }

  return populateObject.populate as PopulateOptions;
}

export function getSymmetricalDifference(arrA: string[], arrB: string[]): string[] {
  const strArrA = arrA.map((x) => x.toString());
  const strArrB = arrB.map((x) => x.toString());

  const symmetricalDifference = strArrA
    .filter((x) => !strArrB.includes(x))
    .concat(strArrB.filter((x) => !strArrA.includes(x)));
  return symmetricalDifference;
}

export function getChangeOfArray(
  existingArr: string[],
  updatedArr: string[],
): { removed: string[]; added: string[] } {
  const existing = existingArr.map((x) => x.toString());
  const updated = updatedArr.map((x) => x.toString());

  const removed = existing.filter((x) => !updated.includes(x));
  const added = updated.filter((x) => !existing.includes(x));

  return { removed, added };
}

export const DEFAULT_USER_PROJECTION_FIELDS = [
  'firstName',
  'lastName',
  'username',
  'role',
  'profileImage',
] as const;
