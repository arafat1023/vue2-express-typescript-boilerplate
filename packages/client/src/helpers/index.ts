import axios, { AxiosError } from 'axios';
import { getAppInfo } from 'utilities';
import CONSTANTS from './constants';
import Bus, { NOTIFICATION } from '@/bus';
import { baseServerUrl } from '@/configs/client.config.json';
import {
  SearchParams,
  User,
  Device,
} from '@/type';

export { default as CONSTANTS } from './constants';

export const {
  SERVER_PORT,
  CLIENT_PORT,
  IS_DEVELOPMENT,
  CONFIG,
} = getAppInfo();

const { protocol, hostname } = window.location;

export const ROUTE_API = '/api';

// for local testing, baseServerUrl = https://localhost:3000 can be set, if necessary
export const baseUrl = baseServerUrl || (IS_DEVELOPMENT
  ? `${protocol}//${hostname}:${SERVER_PORT}`
  : window.location.origin);

export const clientBaseUrl = IS_DEVELOPMENT
  ? `${protocol}//${hostname}:${CLIENT_PORT}`
  : window.location.origin;

export function isYouTubeUrl(url: string): boolean {
  return /https?:\/\/(www\.)?youtu\.?be/.test(url);
}

export function ordinalize(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function abbreviateName(user?: User): string {
  if (!user) {
    return '';
  }
  if (user?.lastName) {
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  }
  const userName = user?.firstName || user?.username || '';
  return userName.slice(0, 2).toUpperCase();
}

export function navbarIconColor(isDark: boolean, hover: boolean): string {
  if (isDark) {
    return hover ? 'white' : 'inactive2';
  }
  return hover ? 'black' : 'secondaryB';
}

export async function profileImageSrc(user?: User): Promise<string> {
  // if there is no profile image
  if (!user?.profileImage) {
    return '';
  }

  const { profileImage } = user;

  // if profileImage is stored in server
  if (!profileImage.startsWith('http')) {
    return `${baseUrl}${ROUTE_API}/mediaFile/${profileImage}?local=1`;
  }

  // if profile image is remote url

  const fbId = new URL(profileImage).searchParams.get('asid');

  // if profile image comes from fb
  if (fbId) {
    const response = await fetch(profileImage);
    // if current fb profile image is present return it
    if (response.status === 200) {
      return profileImage;
    }
    // returns default fb profile image
    return `https://graph.facebook.com/${fbId}/picture?type=normal`;
  }
  // if profileImage is remote url but not from fb
  return profileImage;
}

export async function getStorageFileSrc(url: string): Promise<string> {
  const sanitizationPrefix = `${baseUrl}${ROUTE_API}`;
  if (!url.startsWith(sanitizationPrefix)) {
    return url;
  }
  const route = url.replace(sanitizationPrefix, '');
  const response = await axios.get(`${route}?url=1`);
  return response.data.url;
}

export function durationTime(val: number): string {
  if (!val) {
    return '';
  }
  return val >= 3600
    ? new Date(val * 1000).toISOString().substr(11, 8)
    : new Date(val * 1000).toISOString().substr(14, 5);
}

export function handleAxiosError<T extends {
  message: string;
  errors?: Map<string, string> | Record<string, string | undefined>;
 }>(e: AxiosError<T>, showAdditionalError = false): void {
  console.error(e);
  if (e.isAxiosError && e.response?.data.message) {
    let errorMessages = '';
    const { message } = e.response.data;
    if (e.response.data.errors && showAdditionalError) {
      const { errors } = e.response.data;
      for (const key of Object.keys(errors)) {
        errorMessages += `, ${key}: `;
        if (errors instanceof Map) {
          errorMessages += errors.get(key);
        } else {
          errorMessages += errors[key];
        }
      }
    }

    Bus.emit(NOTIFICATION.ERROR, {
      message: message + errorMessages,
      permanent: true,
    });
  }
}

export function identifyDeviceType(): Device {
  let isMobile = false;
  if (
    /Android/i.test(navigator.userAgent)
    && /Mobile/i.test(navigator.userAgent)
  ) {
    isMobile = true;
  } else if (/webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
  } else if (window.innerWidth < 768) {
    isMobile = true;
  }

  const isTouchDevice = 'ontouchend' in document;
  const isChrome = /Chrome/i.test(navigator.userAgent) || /CriOS/i.test(navigator.userAgent);
  const isSafari = /Safari/i.test(navigator.userAgent) && !isChrome;
  const isFirefox = /Firefox/i.test(navigator.userAgent);
  const isMacintosh = /Macintosh/i.test(navigator.userAgent);
  const isMac = isMacintosh && !isTouchDevice;
  const isWindows = /Windows/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isAndroidTablet = /Android/i.test(navigator.userAgent)
      && !/Mobile/i.test(navigator.userAgent);
  const isLinux = /Linux/i.test(navigator.userAgent) && !isAndroid;
  const isIPad = /iPad/i.test(navigator.userAgent) || (isMacintosh && isTouchDevice);
  const isIPhone = /iPhone/i.test(navigator.userAgent);

  return {
    isMobile,
    isTouchDevice,
    isChrome,
    isSafari,
    isFirefox,
    isMac,
    isWindows,
    isAndroid,
    isLinux,
    isIPad,
    isIPhone,
    isAndroidTablet,
  };
}

export function download(text: string, filename: string): void {
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function copyToClipboard(text: string): void {
  const input: HTMLInputElement = window.document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.focus();
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}

export function getSearchParamsFromUrl(
  url: string,
): SearchParams {
  const { searchParams } = new URL(decodeURI(url), window.location.origin);

  const reference = searchParams.get('reference') || undefined;
  const redirect = searchParams.get('redirect') || undefined;

  return {
    reference, redirect,
  };
}

export async function redirectUserAfterLogin(
  user: User,
  redirectUrl = '',
): Promise<{ route: string }> {
  // if user is admin
  if (user.role === 'admin') {
    // if there is no `redirectUrl` or `redirectUrl` is not an admin url
    // route to default admin url
    if (!redirectUrl || !redirectUrl.startsWith('/admin')) {
      return { route: CONSTANTS.ROUTES.ADMIN_HOME };
    }
    return { route: redirectUrl };
  }

  const handleFirstLoginRedirect = () => {
    let route = CONSTANTS.ROUTES.MEMBER_HOME;
    if (redirectUrl) {
      route += `?redirect=${
        encodeURIComponent(redirectUrl)
      }`;
    }
    return { route };
  };

  if (user.isFirstLogin) {
    return handleFirstLoginRedirect();
  }

  // IF it is and student BUT
  // there is no `redirectUrl` OR `redirectUrl` is not an student url
  // THEN route to appropriate student url
  if (!redirectUrl || redirectUrl.startsWith('/admin')) {
    return { route: CONSTANTS.ROUTES.MEMBER_HOME };
  }

  // otherwise go to redirect url
  return { route: redirectUrl };
}
