import { HttpExceptionOptions, HttpStatus } from '@nestjs/common';
import { ApiException } from './api-exception';

export class BadRequestException extends ApiException {
  /**
   *  Creates an instance of BadRequestException.
   *
   * @param {string} message
   * @param {string} code
   * @param {HttpExceptionOptions} [options]
   */
  constructor(message: string, code: string, options?: HttpExceptionOptions) {
    super(message, HttpStatus.BAD_REQUEST, code, options);
  }
}
