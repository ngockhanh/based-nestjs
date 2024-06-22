import { HttpExceptionOptions, HttpStatus } from '@nestjs/common';
import { ApiException } from './api-exception';

export class ValidationException extends ApiException {
  /**
   * The validation errors.
   *
   * @type {object}
   */
  protected errors: object;

  /**
   *  Creates an instance of ValidationException.
   *
   * @param {object} errors
   * @param {string} [code='validation_error']
   * @param {HttpExceptionOptions} [options]
   */
  constructor(
    errors: object,
    code: string = 'validation_error',
    options?: HttpExceptionOptions,
  ) {
    super(errors, HttpStatus.BAD_REQUEST, code, options);
  }
}
