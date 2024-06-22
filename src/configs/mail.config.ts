import * as path from 'path';

export const TEMPLATE_PATH = path.resolve(__dirname, '../../templates/mails');

export default () => {
  const domains = process.env.EMAIL_DOMAINS || '';
  const sender = process.env.MAIL_SENDER || '';
  const [senderEmail, senderName] = sender.split(':');

  return {
    from: {
      name: senderName || '',
      email: senderEmail || 'Internal Portal',
    },
    mailchimp: {
      apiKey: process.env.MAILCHIMP_API_KEY,
      account: process.env.MAILCHIMP_ACCOUNT,
    },
    domains: domains ? domains.split(',') : [],
  };
};
