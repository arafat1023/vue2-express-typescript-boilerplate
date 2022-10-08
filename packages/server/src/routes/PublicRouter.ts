import { Router } from 'express';
import * as FileController from '../modules/file/FileController';

const router = Router();

router.get('/*', FileController.getMediaFile);

export default router;
