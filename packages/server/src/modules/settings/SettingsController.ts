import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Request, Response, Router } from 'express';
import { pick } from 'lodash';
import { UpdateSettingsDto } from 'dto';
import SettingsModel from './SettingsModel';
import SettingsService from './SettingsService';
import { sendErrorResponse, AuthorizationError } from '../../helpers';

const router = Router();

router.post('/', setSettings);
router.get('/', getSettings);

export default router;

async function setSettings(req: Request, res: Response) {
  try {
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('Role needs to be admin');
    }

    const payload = plainToClass(UpdateSettingsDto, req.body);
    await validateOrReject(payload);

    const {
      siteIsActive,
    } = payload;

    const settings = await SettingsModel.setSettings({
      _id: undefined,
      siteIsActive,
      updatedBy: req.user?._id,
    });

    res.status(201)
      .json({ settings });
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

async function getSettings(req: Request, res: Response) {
  try {
    const settings = await SettingsService.getSettings();
    if (req.user?.role === 'admin') {
      res.json({ settings });
    } else {
      const userSettings = pick(settings, [
        'siteIsActive',
      ]);
      res.json({
        settings: userSettings,
      });
    }
  } catch (e) {
    sendErrorResponse(res, e);
  }
}
