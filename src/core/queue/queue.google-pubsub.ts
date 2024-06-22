import { Message, PubSub } from '@google-cloud/pubsub';
import { Event } from '../event/event';
import { Queue } from './queue';
import { PubSubOpts } from './queue.type';

/**
 * Concrete implementation of GCP's PubSub.
 *
 * @export
 * @class GooglePubSub
 * @extends {Queue}
 */
export class GooglePubSub extends Queue {
  /**
   * The pubsub topic to subscribe to.
   *
   * @private
   * @type {string}
   */
  private topic: string;

  /**
   * The subscription name for the topic.
   *
   * @private
   * @type {string}
   */
  private subscription: string;

  /**
   * The pubsub instance.
   *
   * @private
   * @type {PubSub}
   */
  private pubsub: PubSub;

  /**
   * Creates an instance of GooglePubSub.
   *
   * @param {PubSubOpts} opts
   */
  constructor(opts: PubSubOpts) {
    super();

    this.topic = opts.topic;
    this.subscription = opts.subscription;
    this.pubsub = new PubSub({
      keyFilename: opts.keyPath,
      projectId: opts.projectId,
    });
  }

  /**
   * @inheritdoc
   * @override
   */
  async publish(message: any) {
    const data = this.getData(message);

    return this.pubsub
      .topic(this.topic)
      .publishMessage({ data: Buffer.from(data) });
  }

  /**
   * @inheritdoc
   * @override
   */
  async consume(cb: Function = async (_: any) => {}) {
    const subscription = this.pubsub
      .topic(this.topic)
      .subscription(this.subscription);

    const handler = async (message: any) => {
      await cb(message);
      message.ack();
    };

    subscription.on('message', handler);

    return subscription;
  }

  /**
   * Prepare data to be published.
   * If the message is an instance of event,
   * we will call queueMessage() to get the payload.
   *
   * @private
   *
   * @returns {string}
   */
  getData(message: Event | any): string {
    const data = message instanceof Event
      ? message.queueMessage()
      : message;

    if (typeof data === 'object') {
      return JSON.stringify(data);
    }

    return data;
  }

  /**
   * Extract the "Body" from the pubsub message.
   *
   * @param {Message} message
   *
   * @returns {object | null}
   */
  getMessage(message: Message): object | null {
    try {
      if (!message?.data) {
        return null;
      }

      const body = JSON.parse(message.data.toString());

      if (typeof body !== 'object') {
        return null;
      }

      return body;
    } catch (e) {
      return null;
    }
  }
}
