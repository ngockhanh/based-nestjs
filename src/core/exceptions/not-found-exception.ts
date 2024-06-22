import { HttpExceptionOptions, HttpStatus } from '@nestjs/common';
import { ApiException } from './api-exception';

export class NotFoundException extends ApiException {
  /**
   *  Creates an instance of InternalServerException.
   *
   * @param {string} message
   * @param {string} code
   * @param {HttpExceptionOptions} [options]
   */
  constructor(message: string, code: string, options?: HttpExceptionOptions) {
    super(message, HttpStatus.NOT_FOUND, code, options);
  }
}
