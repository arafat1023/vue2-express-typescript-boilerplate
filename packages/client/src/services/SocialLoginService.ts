import { OAuth2Client } from 'google-auth-library';
import {
  getSearchParamsFromUrl,
  CONFIG,
} from '@/helpers';
import store from '@/store';
import { FacebookUserInfo, GoogleLoginInfo } from '@/type';

 type FBPicture = { data: { url: string } };
 type FBUserInfoKeys = 'id' | 'first_name' | 'middle_name' | 'last_name' | 'email';
 type FBUserInfo = Record<FBUserInfoKeys, string> & Record<'picture', FBPicture>;

 declare global {
   interface Window {
     fbAsyncInit(): void;
   }

   // eslint-disable-next-line @typescript-eslint/no-namespace
   namespace FB {
     type LoginStatus = 'connected' | 'not_authorized' | 'unknown';

     type AuthResponse = {
       accessToken: string;
       // eslint-disable-next-line camelcase
       data_access_expiration_time: number;
       expiresIn: number;
       grantedScopes?: string;
       graphDomain: string;
       signedRequest: string;
       userID: string;
     };

     interface Response {
       status: LoginStatus;
       authResponse: AuthResponse;
     }

     export function init(options: Record<string, unknown>): void;

     type ResponseCallback = (response: Response) => void;

     export function getLoginStatus(callback: ResponseCallback): void;

     interface LoginOptions {
       scope: string;
       // eslint-disable-next-line camelcase
       return_scopes?: boolean;
     }

     export function login(callback: ResponseCallback, options?: LoginOptions): void;

     export function getAuthResponse(): AuthResponse | null;

     export function api(
       path: string,
       params: Record<string, unknown>,
       callback: (value: FBUserInfo) => void,
     ): void;

     // eslint-disable-next-line @typescript-eslint/no-namespace
     namespace AppEvents {
       export function logPageView(): void;
     }
   }
 }

let oAuth2Client: OAuth2Client;

function getOAuth2Client() {
  if (!oAuth2Client) {
    const redirectUrl = `${window.location.origin}/login/google`;
    oAuth2Client = new OAuth2Client(
      CONFIG.googleAuth2ClientId,
      undefined,
      redirectUrl,
    );
  }
  return oAuth2Client;
}

export default class SocialLoginService {
   static isFacebookInitialized = false;

   /**
    * @param {string} redirectUrl should not be encoded
    */
   static openGoogleConsentScreen(redirectUrl: string | null): void {
     let state = 'google';
     if (redirectUrl) {
       state += `|${encodeURI(redirectUrl)}`;
     }
     const authorizeUrl = getOAuth2Client().generateAuthUrl({
       access_type: 'offline',
       scope: [
         'https://www.googleapis.com/auth/userinfo.email',
         'https://www.googleapis.com/auth/userinfo.profile',
       ],
       state,
     });
     window.open(authorizeUrl, '_self');
   }

   static async verifyGoogleLogin(): Promise<{ isLoggedIn: boolean; redirectUrl?: string }> {
     const searchParams = new URLSearchParams(window.location.search);
     if (!searchParams.has('code')) {
       return { isLoggedIn: false };
     }

     const redirectUrl = searchParams.get('state')?.split('|')[1] || '';

     const code = searchParams.get('code') as string;

     return SocialLoginService.performGoogleLogin(redirectUrl, { code });
   }

   static async performGoogleLogin(redirectUrl: string, {
     code, credential,
   }: GoogleLoginInfo): Promise<{ isLoggedIn: boolean; redirectUrl?: string }> {
     const { reference } = getSearchParamsFromUrl(redirectUrl);

     try {
       await store.dispatch('googleLogin', {
         code,
         referredCode: reference,
         credential,
       });
       return { isLoggedIn: true, redirectUrl };
     } catch (e) {
       console.error(e);
       return { isLoggedIn: false, redirectUrl };
     }
   }

   static initFacebook(): Promise<void> {
     return new Promise<void>((resolve) => {
       window.fbAsyncInit = function fbAsyncInit() {
         FB.init({
           appId: CONFIG.facebookAppId,
           cookie: true,
           xfbml: true,
           version: 'v8.0',
         });

         FB.AppEvents.logPageView();

         SocialLoginService.isFacebookInitialized = true;
         resolve();
       };

       (function loadFacebookSdk(d, s, id) {
         const fjs = d.getElementsByTagName(s)[0] as HTMLScriptElement;
         if (d.getElementById(id)) {
           return;
         }
         const js = d.createElement(s) as HTMLScriptElement;
         js.id = id;
         js.src = 'https://connect.facebook.net/en_US/sdk.js';
         fjs.parentNode?.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
     });
   }

   static getFacebookLoginStatus(): Promise<unknown> {
     return new Promise((resolve) => FB.getLoginStatus(resolve));
   }

   static async performFacebookLogin(onAuthenticationComplete?: () => void): Promise<boolean> {
     if (!SocialLoginService.isFacebookInitialized) {
       throw new Error('FB JS not initialized');
     }

     let loginResponse: FB.Response = await new Promise((resolve) => FB.getLoginStatus(resolve));

     if (loginResponse.status !== 'connected') {
       loginResponse = await new Promise((resolve) => FB.login(resolve, {
         scope: 'public_profile,email',
         return_scopes: true,
       }));
     }

     if (loginResponse.status !== 'connected') {
       return false;
     }

     if (onAuthenticationComplete) {
       onAuthenticationComplete();
     }

     try {
       const facebookUserInfo = await SocialLoginService.getFacebookUserInfo();
       const searchParams = new URLSearchParams(window.location.search);
       const redirectUrl = searchParams.get('redirect') || '';

       const { reference } = getSearchParamsFromUrl(redirectUrl);

       await store.dispatch('fbLogin', {
         ...facebookUserInfo,
         referredCode: reference,
       });
       return true;
     } catch (e) {
       console.error(e);
       return false;
     }
   }

   static async getFacebookUserInfo():Promise<FacebookUserInfo> {
     // https://stackoverflow.com/questions/8605703
     const latestAuthResponse = FB.getAuthResponse();
     if (!latestAuthResponse) {
       throw new Error('User not logged in');
     }

     const userInfo: FBUserInfo = await new Promise<FBUserInfo>((resolve) => {
       const params = {
         fields: 'id,first_name,middle_name,last_name,email,picture.width(512).height(512)',
       };
       FB.api(`/${latestAuthResponse.userID}`, params, resolve);
     });

     const facebookUserInfo: FacebookUserInfo = {
       token: latestAuthResponse.accessToken,
       id: userInfo.id as string,
       email: userInfo.email as string,
       firstName: `${userInfo.first_name}${userInfo.middle_name ? ` ${userInfo.middle_name}` : ''}`,
       lastName: userInfo.last_name as string,
       profileImage: (userInfo.picture as FBPicture)?.data.url,
     };

     return facebookUserInfo;
   }
}
