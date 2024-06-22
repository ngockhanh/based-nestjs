import { EventEmitter } from 'events';
import { Message } from '@google-cloud/pubsub';
import { Event } from '@/core/event/event';
import { GooglePubSub } from './queue.google-pubsub';

const mockTopic = jest.fn();
const mockConstructor = jest.fn();

jest.mock('@google-cloud/pubsub', () => ({
  PubSub: jest.fn().mockImplementation((opts) => {
    // mock the constructor call so we
    // can assert the opts that was passed.
    mockConstructor(opts);

    return {
      topic: mockTopic,
    };
  }),
}));

class FakeEvent extends Event {}

describe('GooglePubSub Queue class tests', () => {
  let queue: GooglePubSub;
  const opts = {
    topic: 'a-very-useless-topic',
    keyPath: 'path/to/the/key',
    projectId: 'project-a',
    subscription: 'rms-sub',
  };

  const stubTopic = {
    publishMessage: jest.fn(),
    subscription: jest.fn(),
  };

  beforeEach(() => {
    mockTopic.mockReturnValue(stubTopic);

    queue = new GooglePubSub(opts);
  });

  it('has a name', () => {
    expect(queue.name).toEqual('GooglePubSub');
  });

  it('accepts the path to the keyfile and project id', () => {
    expect(mockConstructor).toBeCalledTimes(1);
    expect(mockConstructor).toBeCalledWith({
      keyFilename: opts.keyPath,
      projectId: opts.projectId,
    });
  });

  describe('publish()', () => {
    const event = new FakeEvent({});

    it('publishes message to google pubsub topic', async () => {
      await queue.publish('test');

      expect(mockTopic).toBeCalledTimes(1);
      expect(mockTopic).toBeCalledWith(opts.topic);
      expect(stubTopic.publishMessage).toBeCalledTimes(1);
      expect(stubTopic.publishMessage).toBeCalledWith({
        data: Buffer.from('test'),
      });
    });

    it('stringifies message if it is an object', async () => {
      const message = { an: 'object' };
      await queue.publish(message);

      expect(mockTopic).toBeCalledTimes(1);
      expect(mockTopic).toBeCalledWith(opts.topic);
      expect(stubTopic.publishMessage).toBeCalledTimes(1);
      expect(stubTopic.publishMessage).toBeCalledWith({
        data: Buffer.from(JSON.stringify(message)),
      });
    });

    it('stringifies message if it is an array', async () => {
      const message = ['an', 'array'];
      await queue.publish(message);

      expect(mockTopic).toBeCalledTimes(1);
      expect(mockTopic).toBeCalledWith(opts.topic);
      expect(stubTopic.publishMessage).toBeCalledTimes(1);
      expect(stubTopic.publishMessage).toBeCalledWith({
        data: Buffer.from(JSON.stringify(message)),
      });
    });

    it('publishes an event payload if an instance of Event was given', async () => {
      event.queueMessage = () => 'some-data';

      await queue.publish(event);

      expect(mockTopic).toBeCalledTimes(1);
      expect(mockTopic).toBeCalledWith(opts.topic);
      expect(stubTopic.publishMessage).toBeCalledTimes(1);
      expect(stubTopic.publishMessage).toBeCalledWith({
        data: Buffer.from('some-data'),
      });
    });

    it('stringifies event payload if it is an object', async () => {
      const message = { an: 'object' };
      event.queueMessage = () => message;

      await queue.publish(event);

      expect(mockTopic).toBeCalledTimes(1);
      expect(mockTopic).toBeCalledWith(opts.topic);
      expect(stubTopic.publishMessage).toBeCalledTimes(1);
      expect(stubTopic.publishMessage).toBeCalledWith({
        data: Buffer.from(JSON.stringify(message)),
      });
    });

    it('stringifies event payload if it is an array', async () => {
      const message = [1, 2];
      event.queueMessage = () => message;

      await queue.publish(event);

      expect(mockTopic).toBeCalledTimes(1);
      expect(mockTopic).toBeCalledWith(opts.topic);
      expect(stubTopic.publishMessage).toBeCalledTimes(1);
      expect(stubTopic.publishMessage).toBeCalledWith({
        data: Buffer.from(JSON.stringify(message)),
      });
    });
  });

  describe('consume()', () => {
    const subscription = new EventEmitter();

    beforeEach(() => {
      stubTopic.subscription.mockReturnValue(subscription);
    });

    it('consumes and acknowledges a message without handler', async () => {
      const callback = jest.fn();
      const message = {
        data: {},
        ack: jest.fn(),
      };

      const fn = async (queueMessage: Message) => {
        callback(queueMessage);
      };

      const consumer = await queue.consume(fn);

      await consumer.emit('message', message);

      expect(mockTopic).toBeCalledTimes(1);
      expect(mockTopic).toBeCalledWith(opts.topic);
      expect(stubTopic.subscription).toBeCalledTimes(1);
      expect(stubTopic.subscription).toBeCalledWith(opts.subscription);

      expect(message.ack).toBeCalledTimes(1);
      expect(message.ack).toBeCalledWith();

      expect(callback).toBeCalledTimes(1);
      expect(callback).toBeCalledWith(message);
    });
  });

  describe('getMessage()', () => {
    it('returns null if message does not have data', () => {
      expect(queue.getMessage(<any>{})).toBeNull();
      expect(queue.getMessage(<any>'')).toBeNull();
      expect(queue.getMessage(<any>null)).toBeNull();
      expect(queue.getMessage(<any>[])).toBeNull();
    });

    it('returns null if data is not a stringified object', () => {
      const message = <Message>{ data: Buffer.from(JSON.stringify('an-invalid-string')) };
      expect(queue.getMessage(message)).toBeNull();
    });

    it('returns null if data can not be parsed object', () => {
      const message = <Message>{ data: Buffer.from('an-invalid-string') };
      expect(queue.getMessage(message)).toBeNull();
    });

    it('returns a valid stringified object', () => {
      const data = { one: 1 };
      const buffer = Buffer.from(JSON.stringify(data));

      expect(queue.getMessage(<Message>{ data: buffer })).toEqual(data);
      expect(queue.getMessage(<Message>{ data: Buffer.from(JSON.stringify(data)) })).toEqual(data);
    });
  });
});
