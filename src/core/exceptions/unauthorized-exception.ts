import { HttpExceptionOptions, HttpStatus } from '@nestjs/common';
import { ApiException } from './api-exception';

export class UnauthorizedException extends ApiException {
  /**
   *  Creates an instance of UnauthorizedException.
   *
   * @param {string} message
   * @param {string} code
   * @param {HttpExceptionOptions} [options]
   */
  constructor(message: string, code: string, options?: HttpExceptionOptions) {
    super(message, HttpStatus.UNAUTHORIZED, code, options);
  }
}
