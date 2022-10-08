import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { EditUserDto } from 'dto';
import { Request, Response, Router } from 'express';
import { User, ServerUser } from 'types';
import UserService from './UserService';
import UserModel from './UserModel';
import {
  AuthorizationError,
  sendErrorResponse,
  NotFoundError,
} from '../../helpers';

const router = Router();

router.get('/', getUsers);
router.get('/this', getLoggedInUser);
router.put('/', updateUser);

export default router;

async function getUsers(
  req: Request<unknown, unknown, unknown, { id?: string; username?: string, fields?: string }>,
  res: Response<{ users?: Partial<User>[], user?: ServerUser }>,
) {
  try {
    if (typeof req.query.id === 'string') {
      // this control-flow will only be used to load users
      // to render corresponding profile-image
      const users = await UserModel.getUsersByIds(
        req.query.id.split(','),
        ['firstName', 'lastName', 'username', 'profileImage'],
      );

      res.json({ users });
      return;
    }

    if (req.user?.role !== 'admin') {
      throw new AuthorizationError();
    }

    const projection = req.query.fields?.split(',') as (keyof User)[] | undefined;
    if (req.query.username) {
      // in query string `+` gets replaced with `space`
      // as our username may have `+` in it, replacing `space` with `+`
      const username = req.query.username.trim().split(' ').join('+');

      const user = await UserModel.getServerUser({ username }, projection);
      if (!user) {
        throw new NotFoundError();
      }
      res.json({ user });
      return;
    }

    const users = await UserModel.getUsers();
    res.json({ users });
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

async function getLoggedInUser(req: Request, res: Response) {
  try {
    const user = await UserModel.getUserById(req.user?._id as string, []);
    res.json({ user });
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

/**
 * handles PUT /users/ API call
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<void>}
 */
async function updateUser(req: Request, res: Response) {
  try {
    const payload = plainToClass(EditUserDto, req.body);
    await validateOrReject(payload, { forbidUnknownValues: true });
    let profileImageFile: Express.Multer.File | undefined;
    if (req.files) {
      profileImageFile = (req.files as Express.Multer.File[])
        .find((file) => file.fieldname === 'profileImageFile');
    }
    const updatedUser = await UserService.updateUserById(
      req.user?._id as string,
      payload,
      profileImageFile,
    );

    res.json({
      user: updatedUser,
      message: 'Successfully updated user profile.',
    });
  } catch (e) {
    sendErrorResponse(res, e);
  }
}
