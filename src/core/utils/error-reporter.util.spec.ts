import * as Sentry from '@sentry/node';
import { SentryConfig } from '@/configs/sentry.config';
import { HttpStatus } from '@nestjs/common';
import { ErrorReporterUtil } from './error-reporter.util';

jest.mock('@sentry/node');

describe('ErrorReporterUtil', () => {
  const defaultConfig = {
    dsn: 'some-dsn',
  } as SentryConfig;

  it('Inits a reporter', () => {
    (new ErrorReporterUtil(defaultConfig)).init();

    expect(Sentry.init).toHaveBeenCalledOnce();
  });

  it('Captures an Exception', () => {
    const exception = new Error('Something went wrong!');
    const url = 'https://www.example.com';
    const tags = {
      app: 'INP Backend',
      status: HttpStatus.BAD_REQUEST,
      url,
    };

    (new ErrorReporterUtil(defaultConfig)).captureException(exception, tags);

    expect(Sentry.captureException).toHaveBeenCalledOnce();

    expect(Sentry.captureException).toHaveBeenCalledWith(exception, {
      tags: {
        app: 'INP Backend',
        status: HttpStatus.BAD_REQUEST,
        url,
      },
    });
  });

  it('Should return boolean for active', () => {
    const config = {
      dsn: ' ',
    } as SentryConfig;
    let errorReporter = new ErrorReporterUtil(config);

    expect(errorReporter.isActive()).toBeFalse();

    errorReporter = new ErrorReporterUtil(defaultConfig);

    expect(errorReporter.isActive()).toBeTrue();
  });
});
