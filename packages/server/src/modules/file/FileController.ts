import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import { Request, Response, Router } from 'express';

import MediaFileService from './MediaFileService';
import { SiteError, sendErrorResponse } from '../../helpers';
import { errorLog } from '../../services/Logger';

const router = Router();

router.get('/*', getMediaFile);


export default router;
export { getMediaFile };

const specialFileTypes: string[] = [];

/**
 * handles GET /mediaFile/:fileName API calls
 */
async function getMediaFile(
  req: Request< unknown, unknown, unknown, { local?: string, url?: string }>,
  res: Response,
): Promise<void> {
  try {
    const fileName = req.path.substr(1);
    // filename are in format `{user-id}_{storageType}_{timestamps or random-number}_${file-info}`
    const storageType = fileName.split('_')[1];
    const isUrl = req.query.url === '1';

    const mediaFullPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'files',
      fileName,
    );
    const existFile = fs.existsSync(mediaFullPath);

    if (!existFile) {
      res.status(400).json({
        message: 'File Not Found.',
      });
    }
    res.sendFile(mediaFullPath);
  } catch (e) {
    sendErrorResponse(res, e);
  }
}
