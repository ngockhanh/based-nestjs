import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import sentryConfig from '@/configs/sentry.config';
import { ApiException } from './api-exception';
import { isDev } from '../core.helpers';
import { ErrorReporterUtil } from '../utils/error-reporter.util';

type ExceptionResponse = {
  message: string | object,
  statusCode: number,
  code: string | null,
  stack?: string,
};

@Catch()
export class ApiExceptionsFilter implements ExceptionFilter {
  /**
   * Creates an instance of ApiExceptionsFilter.
   *
   * @param {HttpAdapterHost} httpAdapterHost
   */
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  /**
   * Exception catch implementation.
   *
   * @param {*} exception
   * @param {ArgumentsHost} host
   */
  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const { logger } = ctx.getRequest();

    const responseBody = <ExceptionResponse>{
      message: exception?.message || 'Error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: null,
    };

    if (isDev()) {
      responseBody.stack = exception?.stack;
    }

    if (exception instanceof HttpException) {
      responseBody.statusCode = exception.getStatus();
      responseBody.message = this.extractError(exception);
    }

    if (exception instanceof ApiException) {
      responseBody.code = exception.getCode();
    }

    if (logger) {
      logger.error(responseBody);
    }

    const url = ctx.getRequest()?.url;
    if (responseBody.code || responseBody.statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      new ErrorReporterUtil(sentryConfig()).captureException(exception, {
        status: responseBody.statusCode,
        url,
      });
    }

    httpAdapter.reply(
      ctx.getResponse(),
      { error: responseBody },
      responseBody.statusCode,
    );
  }

  /**
   * If .errors is present, this means the exception
   * came from validation. In such case, we will
   * return all the object errors as "error.message".
   *
   * @private
   * @param {*} exception
   *
   * @return {object|string}
   */
  private extractError(exception: any): object | string {
    const response = exception.getResponse();

    if (response?.errors) {
      return response.errors;
    }

    if (response?.message) {
      return response.message;
    }

    return response;
  }
}
