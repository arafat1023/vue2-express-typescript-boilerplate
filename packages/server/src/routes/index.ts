/* eslint-disable no-unused-labels,no-labels */
import {
  Request,
  Response,
  NextFunction,
  Router,
} from 'express';
import passport from 'passport';
import { logRequest } from '../services/Logger';
import UserController from '../modules/user/UserController';
import SettingsController from '../modules/settings/SettingsController';
import EmailController from '../modules/email/EmailController';
import LogController from '../modules/log/LogController';
import PublicRouter from './PublicRouter';
import AuthController from '../modules/auth/AuthController';
import FileController from '../modules/file/FileController';
import ErrorController from '../modules/error/ErrorController';

const coreRouter = Router();

export default coreRouter;

/**
 * @function
 * @returns {function(req, res, next): void}
 */
const authenticateJwt = passport.authenticate.bind(passport, 'jwt', { session: false });
const authenticateJwtAndAnonymous = passport.authenticate.bind(
  passport,
  ['jwt', 'anonymous'],
  { session: false },
);

async function attachUtility(req: Request, res: Response, next: NextFunction) {
  logRequest(req, res);
  if (req.url === '/robots.txt' || req.url.indexOf('robots.txt') >= 0) {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  } else {
    next();
  }
}

WITH_JWT_AUTHENTICATION: {
  coreRouter.use(
    '/users',
    authenticateJwt(),
    attachUtility,
    UserController,
  );
  coreRouter.use(
    '/settings',
    authenticateJwt(),
    attachUtility,
    SettingsController,
  );
  coreRouter.use(
    '/emails',
    authenticateJwt(),
    attachUtility,
    EmailController,
  );
  coreRouter.use(
    '/logs',
    authenticateJwt(),
    attachUtility,
    LogController,
  );
}

WITH_JWT_AND_ANONYMOUS_AUTHENTICATION: {
  coreRouter.use(
    '/public',
    authenticateJwtAndAnonymous(),
    attachUtility,
    PublicRouter,
  );

  coreRouter.use(
    '/auth',
    authenticateJwtAndAnonymous(),
    attachUtility,
    AuthController,
  );
  coreRouter.use(
    '/mediaFile',
    authenticateJwtAndAnonymous(),
    attachUtility,
    FileController,
  );
}

WITHOUT_AUTHENTICATION: {
  /**
   * TODO: implement request throttling to prevent HTTP flood attack
   * @see https://www.npmjs.com/package/express-rate-limit
   */
  coreRouter.use(
    '/errors',
    attachUtility,
    ErrorController,
  );
}
