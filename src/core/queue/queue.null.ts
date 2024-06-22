import { Queue } from './queue';

/**
 * Null queue driver. This implementation
 * is mainly for development purpose and testing
 * if there is no need to publish/consume queue messages.
 *
 * @export
 * @class Null
 * @extends {Queue}
 */
export class Null extends Queue {
  /**
   * The name of the queue class.
   *
   * @readonly
   */
  get name() {
    return null;
  }

  /**
   * @inheritdoc
   * @override
   */
  async publish(message: any) {
    return message;
  }

  /**
   * @inheritdoc
   * @override
   */
  async consume(..._args: any) {
    return null;
  }
}
