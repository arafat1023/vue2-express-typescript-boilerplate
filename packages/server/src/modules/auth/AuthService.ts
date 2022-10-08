import { Handler } from 'express';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import passport from 'passport';
import UserService from '../user/UserService';
import { jwtSecret } from '../../configs/server.config.json';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

passport.use('jwt', new JwtStrategy(options, ((jwtPayload, done) => {
  UserService
    .getUserByAnyParam({ username: jwtPayload.username })
    .then((user) => {
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    })
    .catch(done);
})));

passport.use('anonymous', new AnonymousStrategy());

const passportMiddleware = passport.initialize();

function getAuthenticator(): Handler {
  return passportMiddleware;
}

// eslint-disable-next-line import/prefer-default-export
export { getAuthenticator };
