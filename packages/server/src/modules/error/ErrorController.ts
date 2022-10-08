import {
  Request,
  Response,
  Router,
} from 'express';
import { FrontendLogger } from '../../services/Logger';

/**
 * Log an error from front-end
 */
function logError(request: Request, response: Response) {
  FrontendLogger.error(request.body);
  response.sendStatus(201);
}

const router = Router();

router.post('/', logError);

export default router;
