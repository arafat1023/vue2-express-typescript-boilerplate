export interface AdditionalAuthInfo {
  referredCode?: string
  redirect?: string;
}
export interface FacebookUserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  token: string;
}

export interface FacebookLoginInfo extends FacebookUserInfo, AdditionalAuthInfo {
}
export interface GoogleLoginInfo extends AdditionalAuthInfo {
  code?: string;
  credential?: string;
}

export interface SignUpInfo extends AdditionalAuthInfo {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}
