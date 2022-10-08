import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { User } from 'types';

class BaseSignupDto {
  @IsOptional()
  @IsString()
  referredCode?: string;

  @IsOptional()
  redirect?: string;
}

export class LoginResponseDto {
  @IsObject()
  user: User;

  @MinLength(1)
  token: string;
}

export class SignupDto extends BaseSignupDto {
  @MinLength(1)
  firstName: string;

  @IsString()
  lastName: string;

  @MinLength(1)
  username: string;

  @MinLength(1)
  password: string;
}

export class VerifyResetPasswordDto {
  @MinLength(1)
  userId: string;

  @MinLength(1)
  token: string;

  @MinLength(1)
  password: string;
}

export class GoogleOAuth2Dto extends BaseSignupDto {
  @MinLength(1)
  code: string;
}

export class GoogleOneTapDto extends BaseSignupDto {
  @MinLength(1)
  credential: string;
}

export class FacebookLoginDto extends BaseSignupDto {
  @MinLength(1)
  token: string;

  @MinLength(1)
  id: string;

  @MinLength(1)
  email: string;

  @MinLength(1)
  firstName: string;

  @MinLength(1)
  lastName: string;

  @MinLength(1)
  profileImage: string;
}

export class EditUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  previousProfileImage?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsBoolean()
  isFirstLogin?: boolean;
}

export class UpdatePasswordDto {
  @MinLength(1)
  currentPassword: string;

  @MinLength(1)
  newPassword: string;
}
