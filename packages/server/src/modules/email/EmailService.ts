import Mailgun from 'mailgun-js';
import { User } from 'types';
import { getAppInfo } from 'utilities';
import * as Logger from '../../services/Logger';
import { EmailError } from '../../helpers';
import {
  mailgunApiKey,
  mailgunDomain,
  mailingList,
} from '../../configs/server.config.json';

const { siteMail, appName } = getAppInfo().CONFIG;

type SendMailParams = {
  email: string;
  ccList?: string[];
  subject?: string;
  body?: string;
  template?: string;
  vars?: Record<string, unknown>
}

function sendMail({
  email,
  ccList = [],
  subject = '',
  body,
  template,
  vars,
}: SendMailParams): void {
  /** @type {Mailgun.Mailgun} */
  const mailgun = Mailgun({ apiKey: mailgunApiKey, domain: mailgunDomain });
  /** @type {Mailgun.messages.SendData & {template: string}} */

  let data: Mailgun.messages.SendTemplateData | Mailgun.messages.SendData = {
    // `siteMail` should be a valid email
    from: `${appName} Team <${siteMail}>`,
    to: email,
    cc: ccList,
    subject,
    html: body,
  };

  if (template) {
    data = {
      ...data,
      template,
    };
    if (vars) {
      data['h:X-Mailgun-Variables'] = JSON.stringify(vars);
    }
  }

  mailgun.messages().send(data).catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e.statusCode, e.message);
    Logger.logEmail(`Error in sending email with status code: ${
      e.statusCode} and message: ${e.message}`);
  });
}

/**
 * adds user to mailing list
 */
function addToMailingList(user: User): void {
  if (!mailingList) {
    return;
  }
  const members = [{
    name: `${user.firstName} ${user.lastName}`,
    address: user.username,
    subscribed: true,
  }];
  const mailgun = Mailgun({ apiKey: mailgunApiKey, domain: mailgunDomain });
  mailgun.lists(mailingList).members().add({ members }).catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e.statusCode, e.message);
    Logger.logEmail(`Error in adding email in mailing list. status code: ${
      e.statusCode} and message: ${e.message}`);
  });
}

/**
 * get mailing lists
 */
async function getMailingLists(): Promise<Record<string, unknown>[]> {
  const mailgun = Mailgun({ apiKey: mailgunApiKey, domain: mailgunDomain });

  try {
    const response = await mailgun.get('/lists');
    return response;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e.statusCode, e.message);
    Logger.logEmail(`Error in getting mailing list. status code: ${
      e.statusCode} and message: ${e.message}`);
    throw new EmailError(e.statusCode, e.message);
  }
}

/**
 * get mailing list members
 */
async function getMailingListMembers(
  mailingListAddress: string,
): Promise<Record<string, unknown>[]> {
  const mailgun = Mailgun({ apiKey: mailgunApiKey, domain: mailgunDomain });
  try {
    const response = await mailgun.get(`/lists/${mailingListAddress}/members`);
    return response;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e.statusCode, e.message);
    Logger.logEmail(`Error in getting mailing list. status code: ${
      e.statusCode} and message: ${e.message}`);
    throw new EmailError(e.statusCode, e.message);
  }
}

/**
 * get templates
 */
async function getTemplates(): Promise<Record<string, unknown>[]> {
  const mailgun = Mailgun({ apiKey: mailgunApiKey, domain: mailgunDomain });

  try {
    const response = await mailgun.get(`/${mailgunDomain}/templates`, { limit: 100 });
    return response;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e.statusCode, e.message);
    Logger.logEmail(`Error in getting templates. status code: ${
      e.statusCode} and message: ${e.message}`);
    throw new EmailError(e.statusCode, e.message);
  }
}

/**
 * get template by name
 */
async function getTemplateByName(templateName: string): Promise<Record<string, unknown>> {
  const mailgun = Mailgun({ apiKey: mailgunApiKey, domain: mailgunDomain });

  try {
    const response = await mailgun.get(`/${
      mailgunDomain}/templates/${templateName}`, { active: 'yes' });
    return response;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e.statusCode, e.message);
    Logger.logEmail(`Error in getting template by name. status code: ${
      e.statusCode} and message: ${e.message}`);
    throw new EmailError(e.statusCode, e.message);
  }
}

export {
  sendMail,
  addToMailingList,
  getMailingLists,
  getMailingListMembers,
  getTemplates,
  getTemplateByName,
};
