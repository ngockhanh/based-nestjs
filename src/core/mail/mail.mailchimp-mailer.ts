import type {
  ApiClient,
  MessagesMessage,
  MessagesMessageByIdRequest,
} from '@mailchimp/mailchimp_transactional';
import { IMailer } from './mail.interface';
import { Mailable } from './mail.mailable';

/**
 * Mailer implementation using Mailchimp API.
 *
 * @export
 * @class MailchimpMailer
 * @implements {IMailer}
 */
export class MailchimpMailer implements IMailer {
  /**
   * Creates an instance of MailchimpMailer.
   *
   * @param {ApiClient} mailer
   */
  constructor(private readonly mailer: ApiClient) {}

  /** @inheritdoc */
  async info(params: MessagesMessageByIdRequest) {
    return new Promise((resolve, reject) => {
      this.mailer.messages
        .info(params)
        .then((response) => resolve(response))
        .catch((error) => reject(error));
    });
  }

  /** @inheritdoc */
  async send(message: Mailable | MessagesMessage, callback: Function | null = null) {
    if (message instanceof Mailable) {
      return this.sendMessage(message.build(), callback);
    }

    return this.sendMessage(message, callback);
  }

  /**
   * Send the message and call the callback if provided.
   *
   * @private
   * @param {MessagesMessage} message
   * @param {Function|null} [callback=null]
   *
   * @returns {Promise<any>}
   */
  private async sendMessage(
    message: MessagesMessage,
    callback: Function | null = null,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mailer.messages
        .send({ message })
        .then((response) => {
          if (callback && typeof callback === 'function') {
            return callback(response);
          }

          return response;
        })
        .then((response) => resolve(response))
        .catch((error) => reject(error));
    });
  }
}
