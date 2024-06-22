/**
 * Template Mailable class.
 *
 * @export
 * @abstract
 * @class Mailable
 */
export abstract class Mailable {
  /**
   * The extending classes will be the concrete
   * implementation that will build the message.
   *
   * @returns {any}
   */
  public abstract build(): any;
}
