import {
  Document,
  model,
  UpdateQuery,
} from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  PartialBy,
  ServerUser,
  User,
  Role,
} from 'types';
import UserSchema from './UserSchema';
import { SiteError } from '../../helpers';

export interface UserDocument extends ServerUser, Document<string> {
  verificationToken?: string;
}

export class UserError extends SiteError {
}

type UserWithoutId = Omit<ServerUser, '_id'> & { verificationToken: string };
export type CreateUserData = PartialBy<UserWithoutId, 'isVerified' | 'role'>;
export default class UserModel {
  static readonly BaseModel = model<UserDocument>('users', UserSchema);

  static readonly SALT_ROUNDS = 10;

  static async createUser(createUserData: CreateUserData): Promise<ServerUser> {
    const {
      firstName,
      lastName,
      username,
      password,
      role = 'non-admin',
      referralCode,
      referredCode,
      profileImage,
      socialLogins,
      verificationToken,
      isFirstLogin,
      isVerified = false,
    } = createUserData;

    if (isVerified && role !== 'admin' && !socialLogins?.length) {
      throw new UserError('`isVerified` can be true initially for admins or social-login only');
    }
    const hashedPassword = password ? await bcrypt.hash(password, UserModel.SALT_ROUNDS) : '';

    const user = await UserModel.BaseModel.create({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      role,
      referralCode,
      referredCode,
      profileImage,
      socialLogins,
      verificationToken,
      isVerified,
      isFirstLogin,
    });

    return user.toObject();
  }

  static castUser(
    user: ServerUser,
  ): User {
    return {
      ...user,
      _id: user._id as string,
      password: !!user.password,
    };
  }

  private static castUserOrNull(
    user: ServerUser | null,
  ): User | null {
    if (!user) {
      return null;
    }

    return UserModel.castUser(user);
  }

  /**
   * Get a single user, currently supports only search by username
   */
  static async getServerUser(
    condition: Partial<Omit<ServerUser, 'password'>>,
    projection?: (keyof ServerUser)[],
  ): Promise<ServerUser | null> {
    const cursor = UserModel.BaseModel.findOne(condition);
    if (projection) {
      cursor.select(projection);
    }
    return cursor.lean().exec();
  }

  /**
   * Get a single user, by any param
   */
  static async getUserByAnyParam(
    condition: Partial<Omit<User, 'password'>>,
    projection?: (keyof User)[],
  ): Promise<User | null> {
    const cursor = UserModel.BaseModel.findOne(condition);
    if (projection) {
      cursor.select(projection);
    }
    const user = await cursor.lean().exec();
    return UserModel.castUserOrNull(user);
  }

  static async getAllUsersOfRole(
    role: Role,
    projection?: (keyof User)[],
  ): Promise<User[]> {
    const cursor = UserModel.BaseModel.find({ role });
    if (projection) {
      cursor.select(projection);
    }
    const users = await cursor.lean().exec();
    return users.map(UserModel.castUser);
  }

  static async getUsersByUsernames(
    usernames: string[],
    projection?: (keyof User)[],
  ): Promise<User[]> {
    const cursor = UserModel.BaseModel.find({ username: { $in: usernames } });
    if (projection) {
      cursor.select(projection);
    }
    const users = await cursor
      .lean()
      .exec();
    return users.map(UserModel.castUser);
  }

  static async getUserById(
    id: string,
    projection: (keyof User)[],
  ): Promise<User | null>;

  static async getUserById(
    id: string,
    projection: (keyof User)[],
    forceReturnPassword: false,
  ): Promise<User | null>;

  static async getUserById(
    id: string,
    projection: (keyof ServerUser)[],
  ): Promise<ServerUser | null>;

  static async getUserById(
    id: string,
    projection: (keyof ServerUser)[],
    forceReturnPassword: true,
  ): Promise<ServerUser | null>;

  static async getUserById(
    id: string,
    projection: (keyof User)[] | (keyof ServerUser)[] = [],
    forceReturnPassword = false,
  ): Promise<User | ServerUser | null> {
    const cursor = UserModel.BaseModel.findOne({ _id: id });
    if (projection.length) {
      cursor.select(projection);
    }
    const user = await cursor.lean()
      .exec();
    if (!user) {
      return null;
    }
    if (forceReturnPassword) {
      return user as ServerUser;
    }
    return UserModel.castUser(user);
  }

  /**
   * get corresponding list of users by a list of ids
   */
  static async getUsersByIds(
    ids: string[],
    projection: (keyof User)[],
  ): Promise<User[]> {
    const cursor = UserModel.BaseModel.find({ _id: { $in: ids } });
    if (projection) {
      cursor.select(projection);
    }
    const users = await cursor.lean().exec();
    return users.map(UserModel.castUser);
  }

  static async getUserByVerificationToken(verificationToken: string): Promise<User | null> {
    const user = await UserModel.BaseModel.findOne({ verificationToken }).lean().exec();
    return UserModel.castUserOrNull(user);
  }

  static async updateUserById(
    id: string,
    updateObj: Omit<UpdateQuery<UserDocument>, 'password'>,
    forceReturnPassword = false,
  ): Promise<User | null> {
    const cursor = UserModel.BaseModel.findByIdAndUpdate(id, updateObj, { new: true });
    if (!forceReturnPassword) {
      cursor.select({ password: 0 });
    }
    const user = await cursor.lean().exec();

    return UserModel.castUserOrNull(user);
  }

  static async updatePassword(
    id: string,
    hashedPassword: string,
    removePasswordToken = false,
  ): Promise<User | null> {
    const updateQuery: UpdateQuery<UserDocument> = {
      $set: {
        password: hashedPassword,
        ...(removePasswordToken && {
          resetPasswordToken: '',
          // if the user has reset the password using email,
          // then it also verifies the email.
          isVerified: true,
        }),
      },
    };
    const updatedUser = await UserModel.BaseModel.findByIdAndUpdate(id, updateQuery)
      .lean()
      .exec();

    return UserModel.castUserOrNull(updatedUser);
  }

  static async updatePasswordResetToken(
    id: string,
    resetPasswordToken: string,
  ): Promise<User | null> {
    const updatedUser = await UserModel.BaseModel.findByIdAndUpdate(id, { resetPasswordToken })
      .lean()
      .exec();

    return UserModel.castUserOrNull(updatedUser);
  }

  static async setAsVerified(userId: string): Promise<void> {
    await UserModel.BaseModel.updateOne({ _id: userId }, {
      isVerified: true,
      verificationToken: undefined,
    }).lean().exec();
  }

  static async getUsers(): Promise<User[]> {
    const users = await UserModel.BaseModel.find({})
      .select({ password: 0 })
      .sort({ createdAT: -1 })
      .lean()
      .exec();
    return users.map((u) => UserModel.castUser(u));
  }
}
