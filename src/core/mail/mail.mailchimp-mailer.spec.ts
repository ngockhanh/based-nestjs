import type { ApiClient, MessagesMessage } from '@mailchimp/mailchimp_transactional';
import { MailchimpMailer } from './mail.mailchimp-mailer';
import { Mailable } from './mail.mailable';

class StubMailable extends Mailable {
  public build() {
    throw new Error('Method not implemented.');
  }
}

describe('Mailer tests', () => {
  const client = <ApiClient><unknown>{
    messages: {
      info: jest.fn(),
      send: jest.fn(),
    },
  };

  const mailer = new MailchimpMailer(client);

  describe('send()', () => {
    const expectedResponse = [
      {
        email: 'user@example.com',
        status: 'sent',
        reject_reason: 'hard-bounce',
        _id: 'string',
      },
    ];

    beforeEach(() => {
      (client.messages.send as jest.Mock).mockResolvedValue(expectedResponse);
    });

    it('sends an instance of Mailable message', async () => {
      const mailable = new StubMailable();
      mailable.build = () => ({ html: '<h1>message</h1>' });

      const response = await mailer.send(mailable);

      expect(response).toEqual(expectedResponse);

      expect(client.messages.send).toBeCalledTimes(1);
      expect(client.messages.send).toBeCalledWith(
        expect.objectContaining({
          message: expect.objectContaining({
            html: expect.stringMatching(/message/),
          }),
        }),
      );
    });

    it('sends a mail message', async () => {
      const response = await mailer.send(<MessagesMessage>{ html: '<h1>message</h1>' });

      expect(response).toEqual(expectedResponse);

      expect(client.messages.send).toBeCalledTimes(1);
      expect(client.messages.send).toBeCalledWith(
        expect.objectContaining({
          message: expect.objectContaining({
            html: expect.stringMatching(/message/),
          }),
        }),
      );
    });

    it('sends a mail message with a callback', async () => {
      const callback = () => 'hello!';

      const response = await mailer.send(<MessagesMessage>{ html: '<h1>message</h1>' }, callback);

      expect(response).toBe('hello!');

      expect(client.messages.send).toBeCalledTimes(1);
      expect(client.messages.send).toBeCalledWith(
        expect.objectContaining({
          message: expect.objectContaining({
            html: expect.stringMatching(/message/),
          }),
        }),
      );
    });

    it('sends a mail message with a promise callback', async () => {
      const callback = async () => 'hello!';

      const response = await mailer.send(<MessagesMessage>{ html: '<h1>message</h1>' }, callback);

      expect(response).toBe('hello!');

      expect(client.messages.send).toBeCalledTimes(1);
      expect(client.messages.send).toBeCalledWith(
        expect.objectContaining({
          message: expect.objectContaining({
            html: expect.stringMatching(/message/),
          }),
        }),
      );
    });

    it('sends a mail message and passes response to the callback', async () => {
      const callback = (response: any) => response[0];

      const response = await mailer.send(<MessagesMessage>{ html: '<h1>message</h1>' }, callback);

      expect(response).toBe(expectedResponse[0]);

      expect(client.messages.send).toBeCalledTimes(1);
      expect(client.messages.send).toBeCalledWith(
        expect.objectContaining({
          message: expect.objectContaining({
            html: expect.stringMatching(/message/),
          }),
        }),
      );
    });
  });
});
