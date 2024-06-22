import { HttpExceptionOptions, HttpStatus } from '@nestjs/common';
import { ApiException } from './api-exception';

export class ForbiddenException extends ApiException {
  /**
   *  Creates an instance of ForbiddenException.
   *
   * @param {string} message
   * @param {string} code
   * @param {HttpExceptionOptions} [options]
   */
  constructor(message: string, code: string, options?: HttpExceptionOptions) {
    super(message, HttpStatus.FORBIDDEN, code, options);
  }
}
