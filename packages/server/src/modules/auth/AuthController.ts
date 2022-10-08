import bcrypt from 'bcryptjs';
import { plainToClass, Transform } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import {
  SignupDto,
  GoogleOAuth2Dto,
  GoogleOneTapDto,
  VerifyResetPasswordDto,
  FacebookLoginDto,
  LoginResponseDto,
  UpdatePasswordDto,
} from 'dto';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { pick } from 'lodash';
import { SocialLogin, ServerUser, User } from 'types';
import { getAppInfo } from 'utilities';
import UserService from '../user/UserService';
import {
  SiteError,
  genBaseClientUrl,
  NotFoundError,
  sendErrorResponse,
} from '../../helpers';
import {
  facebookAppSecret,
  googleAuth2ClientSecret,
  jwtSecret,
  resetPasswordDuration,
} from '../../configs/server.config.json';
import { sendAccountEmail, sendResetPasswordEmail } from '../email/EmailGenerators';

const { googleAuth2ClientId, facebookAppId } = getAppInfo().CONFIG;

const router = express.Router();

router.get('/username/:username', getUserByUsername);
router.post('/signup', signup);
router.post('/login', login);
router.post('/login/google/oauth2', loginViaGoogleOAuth2);
router.post('/login/google/one-tap', loginViaGoogleOneTap);
router.post('/login/fb', loginViaFacebook);
router.post('/reset-password-token', requestResetPassword);
router.put('/password', updatePassword);
router.put('/reset-password-token', verifyResetPassword);
router.delete('/verification-token/:token', verifyEmail);

export default router;

class AuthError extends SiteError {
}

async function getUserByUsername(
  req: Request<{ username: string }>,
  res: Response<{ user: Pick<User, '_id'> }>,
) {
  try {
    const { username } = req.params;
    const user: Pick<User, '_id'> | null = await UserService.getUserByAnyParam(
      { username },
      ['_id'],
    );

    if (!user) {
      throw new NotFoundError();
    }
    res.json({ user });
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

/**
 * Handles signup requests & after successful signup user login
 */
async function signup(
  req: Request,
  res: Response,
) {
  try {
    class TransformCreateUser extends SignupDto {
      @Transform(({ value }) => value.toLowerCase().trim())
      username: string;
    }

    const payload = plainToClass(TransformCreateUser, req.body);
    await validateOrReject(payload);

    const userExists = await UserService.getServerUser({ username: payload.username });

    if (userExists) {
      const usernameError = 'Already has user with given username';
      sendErrorResponse(res, new AuthError(usernameError, { username: usernameError }));
      return;
    }

    // TODO: have to take it from config
    const verificationToken = jwt.sign(
      { username: payload.username },
      jwtSecret,
      { expiresIn: '7d' },
    );
    const user = await UserService.createUser({
      ...payload,
      isFirstLogin: true,
      verificationToken,
      isVerified: false,
    });

    let url = `${genBaseClientUrl(req)}/verify-email/${verificationToken}`;

    if (payload.redirect) {
      url += `?redirect=${encodeURIComponent(payload.redirect)}`;
    }
    sendAccountEmail(user, url);
    res.sendStatus(201);
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

async function verifyEmail(req: Request<{ token: string }>, res: Response<{ message: string }>) {
  try {
    const { token } = req.params;
    try {
      jwt.verify(token, jwtSecret);
      const user = await UserService.getUserByVerificationToken(token);
      if (user) {
        await UserService.setAsVerified(user._id);
        res.json({ message: 'Your email address is verified successfully. You can login now' });
        return;
      }
      throw new AuthError('Invalid token');
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        throw new AuthError('The verification token has been expired! Please try to signup again');
      }
      throw new AuthError('Invalid request');
    }
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

/**
 * Handles login requests
 */
async function login(
  req: Request<never, LoginResponseDto, { username: string, password: string }>,
  res: Response<LoginResponseDto>,
) {
  try {
    const { username, password } = req.body;
    const email = username.toLowerCase().trim();
    const user = await UserService.getServerUser({ username: email });

    if (!user) {
      sendErrorResponse(res, new AuthError('No user with given username'));
      return;
    }

    // if user.isVerified is undefined, we will allow login
    if (user.isVerified === false) {
      const verificationError = `You haven\'t verified your email yet. 
        Please verify it first to login.`;
      sendErrorResponse(res, new AuthError(verificationError));
      return;
    }

    if (!user.password) {
      const socialLoginNames = user.socialLogins?.map((social) => social.name).join(' & ') || '';
      const socialLoginError = `This email is used for ${socialLoginNames} login`;
      sendErrorResponse(res, new AuthError(socialLoginError));
      return;
    }

    const matched = await bcrypt.compare(password, user.password);
    if (matched) {
      const clientUser = _getClientUser(user);
      const token = _genLoginToken(clientUser);
      res.json({ user: clientUser, token });
      return;
    }

    const passwordError = 'Username and password does not match';
    sendErrorResponse(res, new AuthError(passwordError));
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

async function loginViaGoogleOAuth2(req: Request, res: Response<LoginResponseDto>) {
  try {
    const payload = plainToClass(GoogleOAuth2Dto, req.body);
    await validateOrReject(payload);
    const {
      code, referredCode,
    } = payload;

    const oAuth2Client = new OAuth2Client(
      googleAuth2ClientId,
      googleAuth2ClientSecret,
      `${genBaseClientUrl(req)}/login/google`,
    );

    const { tokens } = await oAuth2Client.getToken(code);

    oAuth2Client.setCredentials(tokens);
    const { id_token: idToken } = tokens;

    type GooglePerson = {
      names: {
        givenName: string;
        familyName: string;
      }[];
      emailAddresses: {
        value: string;
      }[];
      photos: {
        url: string;
      }[];
    }

    // Make a simple request to the People API using our pre-authenticated client.
    // The `request()` method
    // takes an GaxiosOptions object.  Visit https://github.com/JustinBeckwith/gaxios.
    // Enable People Service Permission:
    // https://console.developers.google.com/apis/library/people.googleapis.com

    // eslint-disable-next-line max-len
    const url = 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos';
    const { data: userInfo } = await oAuth2Client.request<GooglePerson>({ url });

    const email = userInfo.emailAddresses[0].value;
    const firstName = userInfo.names[0].givenName;
    const lastName = userInfo.names[0].familyName;
    const profileImage = userInfo.photos[0].url;

    const { user, token } = await _handleGoogleLogin(
      referredCode,
      idToken as string,
      email,
      firstName,
      lastName,
      profileImage,
      userInfo,
    );

    res.status(201);
    res.json({ user, token });
  } catch (e) {
    if (e.response?.data?.error === 'invalid_grant') {
      // eslint-disable-next-line no-console
      console.error(e.response.data);
      sendErrorResponse(res, new AuthError('Authorization code already used'));
      return;
    }
    sendErrorResponse(res, e);
  }
}

async function loginViaGoogleOneTap(req: Request, res: Response<LoginResponseDto>) {
  try {
    const payload = plainToClass(GoogleOneTapDto, req.body);
    await validateOrReject(payload);
    const {
      credential, referredCode,
    } = payload;

    type OneTapUser = {
      email: string;
      // eslint-disable-next-line camelcase
      given_name: string;
      // eslint-disable-next-line camelcase
      family_name: string;
      picture: string;
    }
    const decodedData = jwt.decode(credential) as OneTapUser;
    const {
      email,
      given_name: firstName,
      family_name: lastName,
      picture: profileImage,
    } = decodedData;

    const { user, token } = await _handleGoogleLogin(
      referredCode,
      credential,
      email,
      firstName,
      lastName,
      profileImage,
      decodedData,
    );

    res.status(201);
    res.json({ user, token });
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

async function loginViaFacebook(req: Request, res: Response<LoginResponseDto>) {
  try {
    const payload = plainToClass(FacebookLoginDto, req.body);
    await validateOrReject(payload);
    const {
      token: fbToken,
      id,
      email,
      firstName,
      lastName,
      profileImage,
      referredCode,
    } = payload;

    const url = `https://graph.facebook.com/debug_token?input_token=${
      fbToken}&access_token=${facebookAppId}|${facebookAppSecret}`;
    const response = await axios.get(url);
    const { data } = response.data;
    if (data.error) {
      // eslint-disable-next-line no-console
      console.log(data.error);
      throw new AuthError('Invalid Token', new Map().set('token', 'Invalid Token'));
    }

    if (data.user_id !== id) {
      const message = 'User ID and token does not match';
      throw new AuthError(message, new Map().set('token', message));
    }

    const serverUser = await UserService.getServerUser({ username: email });
    const socialLoginData: SocialLogin = {
      name: 'Facebook',
      token: fbToken,
      meta: {
        token: fbToken, id, email, firstName, lastName, profileImage,
      },
    };

    let user: User;
    if (!serverUser) {
      user = await UserService.createUser({
        firstName,
        lastName,
        username: email,
        referredCode,
        profileImage,
        socialLogins: [socialLoginData],
        isVerified: true,
        isFirstLogin: true,
        password: '',
        verificationToken: '',
      });
    } else {
      const socialLogins = serverUser.socialLogins || [];
      const facebookIndex = socialLogins.findIndex((s) => s.name === 'Facebook');
      if (facebookIndex === -1) {
        socialLogins.push(socialLoginData);
      } else {
        socialLogins[facebookIndex] = socialLoginData;
      }

      // if profileImage is not present or it is a http url, update it
      const updateProfileImage = !serverUser.profileImage
      || serverUser.profileImage.startsWith('http');

      const updateObj = {
        firstName,
        lastName,
        socialLogins,
        ...(updateProfileImage && { profileImage }),
      };
      user = (await UserService.updateUserById(serverUser._id as string, updateObj)) as User;
    }
    const socialUser = {
      ...user,
      firstName: user.firstName || user.username,
      profileImage,
      socialLoginType: 'Facebook',
    };

    const token = _genLoginToken(socialUser);
    res.status(201);
    res.json({ user: socialUser, token });
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

/**
 * Handles resetPassword request
 */
async function requestResetPassword(
  req: Request<never, { message: string }, { username: string }>,
  res: Response,
) {
  try {
    const { username } = req.body;
    const email = username.toLowerCase().trim();

    const user = await UserService.getUserByAnyParam(
      { username: email },
      ['_id', 'firstName', 'username'],
    );
    if (!user) {
      const usernameError = 'No user with given username';
      sendErrorResponse(res, new AuthError(usernameError, { username: usernameError }));
      return;
    }

    const token = jwt.sign({ _id: user._id }, jwtSecret, { expiresIn: resetPasswordDuration });
    const url = `${genBaseClientUrl(req)}/auth/reset/${user._id}?token=${token}`;

    await UserService.setPasswordResetToken(user._id, token);
    try {
      sendResetPasswordEmail(user, url, parseInt(resetPasswordDuration, 10));
      res.json({ message: 'An account recovery link has been sent to your email inbox' });
    } catch (e) {
      await UserService.setPasswordResetToken(user._id, '');
      sendErrorResponse(res, e);
    }
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

async function updatePassword(req: Request, res: Response<{ user: User; message: string }>) {
  try {
    const payload = plainToClass(UpdatePasswordDto, req.body);
    await validateOrReject(payload, { forbidUnknownValues: true });

    const updatedUser = await UserService.updatePassword(
      req.user?._id as string,
      payload.currentPassword,
      payload.newPassword,
    );

    if (!updatedUser) {
      throw new NotFoundError();
    }

    res.json({
      user: updatedUser,
      message: 'Successfully updated password',
    });
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

/**
 * Handles resetPassword verification
 */
async function verifyResetPassword(
  req: Request<never, { message: string; resetToken?: string }, { userId: string }>,
  res: Response,
) {
  let resetToken;
  try {
    const payload = plainToClass(VerifyResetPasswordDto, req.body);
    await validateOrReject(payload);
    const { userId, token, password } = payload;

    try {
      resetToken = jwt.verify(token, jwtSecret);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      if (e instanceof jwt.TokenExpiredError) {
        throw new AuthError('The reset password url has expired');
      }
      throw new AuthError('Invalid reset password URL');
    }

    const user = await UserService.getServerUser({ _id: userId }, ['resetPasswordToken']);

    if (!user) {
      throw new AuthError('No user present for this reset password url');
    }

    if (!user.resetPasswordToken) {
      throw new AuthError('Reset password is not requested for this user');
    }

    if (token === user.resetPasswordToken) {
      await UserService.updatePasswordByToken(user._id as string, password);

      res.json({
        resetToken,
        message: 'Successfully reset password',
      });
      return;
    }
    throw new AuthError('Invalid reset password URL');
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

async function _handleGoogleLogin(
  referredCode: string | undefined,
  idToken: string,
  email: string,
  firstName: string,
  lastName: string,
  profileImage: string,
  meta: Record<string, unknown>,
) {
  const serverUser = await UserService.getServerUser({ username: email });
  const socialLoginData: SocialLogin = {
    name: 'Google',
    token: idToken,
    meta,
  };

  let user: User;
  if (!serverUser) {
    user = await UserService.createUser({
      firstName,
      lastName,
      username: email,
      referredCode,
      profileImage,
      socialLogins: [socialLoginData],
      isVerified: true,
      isFirstLogin: true,
      password: '',
      verificationToken: '',
    });
  } else {
    const socialLogins = serverUser.socialLogins || [];
    const googleIndex = socialLogins.findIndex((s) => s.name === 'Google');
    if (googleIndex === -1) {
      socialLogins.push(socialLoginData);
    } else {
      socialLogins[googleIndex] = socialLoginData;
    }

    // if profileImage is not present or it is a http url, update it
    const updateProfileImage = !serverUser.profileImage
    || serverUser.profileImage.startsWith('http');

    const updateObj = {
      firstName,
      lastName,
      socialLogins,
      ...(updateProfileImage && { profileImage }),
    };
    user = (await UserService.updateUserById(serverUser._id as string, updateObj)) as User;
  }

  const socialUser = {
    ...user,
    firstName: user.firstName || user.username,
    profileImage,
    socialLoginType: 'Google',
  };
  const token = _genLoginToken(socialUser);

  return { user: socialUser, token };
}

function _getClientUser(user: ServerUser): User {
  const {
    resetPasswordToken,
    verificationToken,
    isVerified,
    _id,
    ...clientUser
  } = user;

  return {
    ...clientUser,
    _id: _id as string,
    password: true,
    firstName: user.firstName || user.username,
  };
}

function _genLoginToken(clientUser: User): string {
  const payload = { ...pick(clientUser, '_id', 'username') };
  return jwt.sign(payload, jwtSecret, { expiresIn: '30d' });
}
