import { HttpException, HttpExceptionOptions } from '@nestjs/common';

export class ApiException extends HttpException {
  /**
   * The error code that can be used by FE.
   *
   * @private
   * @type {string}
   */
  private code: string;

  /**
   *  Creates an instance of ApiException.
   *
   * @param {string | Record<string, any>} message
   * @param {number} status
   * @param {string} code
   * @param {HttpExceptionOptions} [options]
   */
  constructor(
    message: string | Record<string, any>,
    status: number,
    code: string,
    options?: HttpExceptionOptions,
  ) {
    super(message, status, options);

    this.code = code;
  }

  getCode(): string {
    return this.code;
  }
}
