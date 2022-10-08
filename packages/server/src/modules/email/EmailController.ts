import { Request, Response, Router } from 'express';
import { AuthorizationError, sendErrorResponse } from '../../helpers';
import * as EmailService from './EmailService';

const router = Router();

router.get('/mailing-lists', getMailingLists);
router.get('/mailing-list/members/:address', getMailingListMembers);
router.get('/templates', getTemplates);
router.get('/template/:name', getTemplateByName);
router.post('/bulk-emails', sendBulkEmails);

export default router;

async function getMailingLists(req: Request, res: Response) {
  try {
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('User needs to be an admin');
    }

    const mailingLists = await EmailService.getMailingLists();
    res.status(200).json(mailingLists);
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

async function getMailingListMembers(req: Request, res: Response) {
  try {
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('User needs to be an admin');
    }
    const mailingListAddress = req.params.address;
    const mailingListMembers = await EmailService.getMailingListMembers(mailingListAddress);
    res.status(200).json(mailingListMembers);
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

async function getTemplates(req: Request, res: Response) {
  try {
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('User needs to be an admin');
    }
    const templates = await EmailService.getTemplates();
    res.status(200).json(templates);
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

async function getTemplateByName(req: Request, res: Response) {
  try {
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('User needs to be an admin');
    }
    const templateName = req.params.name;
    const template = await EmailService.getTemplateByName(templateName);
    res.status(200).json(template);
  } catch (e) {
    sendErrorResponse(res, e);
  }
}

async function sendBulkEmails(req: Request, res: Response) {
  try {
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('User needs to be an admin');
    }
    const {
      mailingList, subject, template, vars,
    } = req.body;
    EmailService.sendMail({
      email: mailingList, subject, template, vars,
    });

    res.status(200).json({
      message: 'Sending bulk email started',
    });
  } catch (e) {
    sendErrorResponse(res, e);
  }
}
