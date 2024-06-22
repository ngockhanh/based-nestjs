import { Mailable } from './mail.mailable';

export interface IMailer {
  info(params: object): Promise<any>;
  send(message: object | Mailable, callback?: Function | null): Promise<any>;
}

export const Mailer = Symbol('IMailer');
