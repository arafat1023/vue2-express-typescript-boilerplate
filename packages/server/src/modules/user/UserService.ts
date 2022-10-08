import * as bcrypt from 'bcryptjs';
import {
  ServerUser,
  User,
} from 'types';
import type { EditUserDto } from 'dto';
import UserModel, {
  CreateUserData,
  UserError,
} from './UserModel';
import UniqueCodeService from '../uniqueCode/UniqueCodeService';
import MediaFileService from '../file/MediaFileService';
import { adminPassword } from '../../configs/server.config.json';

export default class UserService {
  static readonly defaultProjection: (keyof User)[] = [
    'firstName',
    'lastName',
    'username',
    'role',
    'profileImage',
    'referralCode',
  ];

  static getUsersByUsernames = UserModel.getUsersByUsernames;

  static getAllUsersOfRole = UserModel.getAllUsersOfRole;

  static getServerUser = UserModel.getServerUser;

  static getUserByVerificationToken = UserModel.getUserByVerificationToken;

  static setAsVerified = UserModel.setAsVerified;

  static async createUser(
    userData: Omit<CreateUserData, 'referralCode'> & { verificationToken: string },
  ): Promise<User> {
    const referralCode = await UniqueCodeService.getForUser();

    const user = await UserModel.createUser({ ...userData, referralCode });

    return UserModel.castUser(user);
  }

  static async createAdminUser(): Promise<
  (Omit<ServerUser, 'password'> & {password: boolean}) | null
  > {
    const username = 'admin';
    const adminUser = await UserModel.getServerUser({ username });

    if (!adminUser) {
      const referralCode = await UniqueCodeService.getForUser();
      const user = await UserModel.createUser({
        username,
        firstName: username,
        lastName: username,
        password: adminPassword,
        referralCode,
        role: 'admin',
        verificationToken: '',
        isVerified: true,
      });
      return {
        ...user,
        password: !!user.password,
      };
    }
    const adminHashedPassword = await bcrypt.hash(
      adminPassword,
      UserModel.SALT_ROUNDS,
    );
    await UserModel.updatePassword(adminUser._id as string, adminHashedPassword);

    return null;
  }

  static async getAdminUser(): Promise<Pick<User, '_id'> | null> {
    const user = await UserModel.getUserByAnyParam({ username: 'admin' }, ['_id']);
    return user;
  }

  static async setPasswordResetToken(id: string, token: string): Promise<User | null> {
    const user = UserModel.updatePasswordResetToken(id, token);
    return user;
  }

  static async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<User | null> {
    const user = await UserModel.getUserById(userId, ['password'], true);
    if (!user) {
      return null;
    }
    const matched = await bcrypt.compare(currentPassword, user.password);

    // if password match
    if (matched) {
      const hashedPassword = await bcrypt.hash(
        newPassword,
        UserModel.SALT_ROUNDS,
      );

      const updatedUser = await UserModel.updatePassword(userId, hashedPassword);
      return updatedUser;
    }
    throw new UserError('Please enter correct password');
  }

  static async updatePasswordByToken(id: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(
      password,
      UserModel.SALT_ROUNDS,
    );

    await UserModel.updatePassword(id, hashedPassword, true);
  }

  static async updateUserById(
    userId: string,
    userDto: EditUserDto,
    profileImageFile?: Express.Multer.File,
  ): Promise<User | null> {
    const updatedUser = await UserModel.updateUserById(
      userId,
      {
        ...userDto,
        ...(userDto.profileImage !== undefined && { profileImage: userDto.profileImage }),
      },
    );

    if (userDto.previousProfileImage
      && !userDto.previousProfileImage.startsWith('http')
    ) {
      await MediaFileService.removeMediaFile(userDto.previousProfileImage);
    }

    return updatedUser;
  }

  static async getUserById(
    id: string,
    projection = UserService.defaultProjection,
  ): Promise<User | null> {
    const user = await UserModel.getUserById(id, projection);
    return user;
  }

  static async getUsersByIds(
    ids: string[],
    projection = UserService.defaultProjection,
  ): Promise<User[]> {
    const users = await UserModel.getUsersByIds(ids, projection);
    return users;
  }

  static async getUserByAnyParam(
    condition: Partial<ServerUser>,
    projection = UserService.defaultProjection,
  ): Promise<User | null> {
    const user = await UserModel.getUserByAnyParam(condition, projection);
    return user;
  }
}
