import { Null } from './queue.null';
import { GooglePubSub } from './queue.google-pubsub';
import { QueueOpts } from './queue.type';
import { Queue } from './queue';

/**
 * Factory class for queue.
 * This will generate a concrete implementation of queue
 * based from the given "driver" from QUEUE_DRIVER env.
 *
 * @export
 * @class Factory
 */
export class Factory {
  /**
   * Create a Queue instance. Defaults to
   * Null queue if driveris unsupported.
   *
   * @static
   * @param {string} driver null|pubsub
   * @param {QueueOpts} [opts={}]
   */
  static create(driver: string, opts: QueueOpts = {}) {
    const Class = this.getClass(driver);

    return new Class(opts);
  }

  /**
   * Queue class gettern.
   *
   * @static
   * @private
   * @param {string} driver
   *
   * @return {{ new(opts: QueueOpts): Queue }}
   */
  static getClass(driver: string): { new(opts: QueueOpts): Queue } {
    const drivers = {
      pubsub: GooglePubSub,
      null: Null,
    };

    return drivers[driver] ?? Null;
  }
}
