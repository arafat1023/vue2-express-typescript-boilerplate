import { Request, Response, Router } from 'express';
import { MongoClient } from 'mongodb';
import {
  AuthorizationError,
  sendErrorResponse,
} from '../../helpers';
import { genDbHost } from '../../services/Logger';

const router = Router();

router.get('/info', getInfoLogs);

export default router;

const url = genDbHost('logs');
const mongoClient = new MongoClient(url, {
  connectTimeoutMS: 60 * 1000,
});
mongoClient.connect().then(() => {
  // eslint-disable-next-line no-console
  console.info("Connected to database: 'logs'");
});

async function getInfoLogs(req: Request, res: Response) {
  try {
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError();
    }

    const logs = mongoClient.db('logs');
    await logs.command({ ping: 1 });

    const conditions: Record<string, unknown> = {
      'meta.from': new RegExp(req.query.from as string, 'i'),
    };

    const infoLogs = logs.collection('info');
    const result = await infoLogs.aggregate()
      .match(conditions)
      .project({
        message: 1,
        timestamp: 1,
        from: '$meta.from',
      }).toArray();

    res.json({
      infoLogs: result,
    });
  } catch (e) {
    sendErrorResponse(res, e);
  }
}
