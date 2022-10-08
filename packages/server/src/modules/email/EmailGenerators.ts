import { User } from 'types';
import { sendMail } from './EmailService';

/**
 * sends account email verification email
 */
function sendAccountEmail(user: User, verificationUrl: string): void {
  const vars = {
    personName: user.firstName,
    activateAccountLink: verificationUrl,
  };

  const body = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
  </head>
  <body style="margin:10px;">
    <h1>Hello ${vars.personName}</h1>
    <p style="margin-top:10px;">
    Here is your activation <a href="${vars.activateAccountLink}">Link</a>
    </p>
  </body>
  </html>`;

  sendMail({
    email: user.username,
    ccList: [],
    subject: 'Welcome to site.com',
    body,
    // template: 'activate-your-account',
    vars,
  });
}

/**
 * sends account email verification email
 */
function sendResetPasswordEmail(
  user: Pick<User, 'firstName' | 'username'>,
  resetPasswordUrl: string,
  expiry: number,
): void {
  const vars = {
    personName: user.firstName,
    resetPasswordLink: resetPasswordUrl,
    expiry,
  };

  const body = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
  </head>
  <body style="margin:10px;">
    <h1>Hello ${vars.personName}</h1>
    <p style="margin-top:10px;">
    Here is your reset password <a href="${vars.resetPasswordLink}">Link</a>
    </p>
    <p style="margin-top:10px;">
    It will expire in ${expiry} hours.
    </p>
  </body>
  </html>`;

  sendMail({
    email: user.username,
    ccList: [],
    subject: 'Reset your password',
    body,
    // template: 'reset-your-password',
    vars,
  });
}

export {
  sendAccountEmail,
  sendResetPasswordEmail,
};
