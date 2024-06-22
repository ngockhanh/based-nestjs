import {
  HttpException,
  Injectable,
  ValidationError,
  ValidationPipeOptions,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { ValidationException } from '../exceptions/validation-exception';

@Injectable()
export class ValidationPipe extends NestValidationPipe {
  /**
   * Creates an instance of ValidationPipe.
   *
   * @override
   * @param {ValidationPipeOptions} options
   */
  constructor(options: ValidationPipeOptions) {
    super(options);

    this.exceptionFactory = this.customExceptionFactory;
  }

  /**
   * This method overrides how the exception is thrown.
   *
   * @private
   * @param {ValidationError[]} errors
   *
   * @return {HttpException}
   */
  private customExceptionFactory(errors: ValidationError[]): HttpException {
    return new ValidationException(this.buildErrors(errors));
  }

  /**
   * Custom mapping of the error messages.
   *
   * @private
   * @param {ValidationError[]} errors
   *
   * @return {object}
   */
  private buildErrors(errors: ValidationError[], key: string = ''): object {
    const result = {};
    let propKey = key;

    for (let i = 0; i < errors.length; i += 1) {
      const { property, constraints, children } = errors[i];
      propKey = key ? `${key}.${property}` : property;

      if (!result[propKey]) {
        result[propKey] = [];
      }

      if (children && children.length > 0) {
        result[propKey].push(this.buildErrors(children, propKey));
      }

      if (constraints && Object.keys(constraints).length > 0) {
        const messages = Object.entries(constraints);

        for (let j = 0; j < messages.length; j += 1) {
          const [, message] = messages[j];

          result[propKey].push(message);
        }
      }
    }

    return result;
  }
}
