/**
 * Base listener class.
 *
 * @export
 * @class Listener
 */
export abstract class EventListener {
  /**
   * The event handler.
   *
   * @param {any} data
   *
   * @returns {Promise<any>}
   */
  abstract handle(data: any): Promise<any>;
}
