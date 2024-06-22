/**
 * Base event class.
 *
 * The purpose of this class is to be solely
 * a Data Transfer Object between consuming classes
 * like a Queue service. Please do not perform complex
 * operations here like calling db or external APIs.
 *
 * @export
 * @class Event
 */
export class Event {
  /**
   * The event data.
   *
   * @type {*}
   */
  public data: any;

  /**
   * The name of the event.
   *
   * @readonly
   */
  get event() {
    return this.constructor.name;
  }

  /**
   * Creates an instance of Event.
   *
   * @param {any} data
   */
  constructor(data: any) {
    this.setData(data);
  }

  /**
   * Set the event data.
   *
   * @param {any} data
   *
   * @returns {this}
   */
  setData(data: any): this {
    if (!data) {
      throw new Error('The event must accept data on creation.');
    }

    this.data = data;

    return this;
  }

  /**
   * Convert the current event to a queue message payload.
   * This method needs to be implemented by concrete classes
   * that will use Queue service like GooglePubSub.
   *
   * @returns {any}
   */
  queueMessage(): any {
    throw new Error('"queueMessage" method is not implemented.');
  }
}
