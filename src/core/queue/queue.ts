/**
 * Abstract class for Queue implementations.
 *
 * @export
 * @abstract
 * @class Queue
 */
export abstract class Queue {
  /**
   * The name of the queue class.
   *
   * @readonly
   */
  get name() {
    return this.constructor.name;
  }

  /**
   * Publish a message to the queue.
   *
   * @abstract
   * @param {any} message
   *
   * @returns {Promise<any>}
   */
  abstract publish(message: any):Promise<any>;

  /**
   * Consume a message from the queue.
   *
   * @abstract
   * @param {...any} args
   * @return {*}  {Promise<any>}
   */
  abstract consume(...args: any): Promise<any>;

  /**
   * Get the message body.
   * Implementing classes can override this.
   *
   * @param {any} message
   *
   * @returns {*}
   */
  getMessage(message: any): any {
    return message;
  }
}
