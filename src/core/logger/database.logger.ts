import { Logger as TypeOrmLogger } from 'typeorm';
import { Logger as NestLogger } from '@nestjs/common';

export class DatabaseLogger implements TypeOrmLogger {
  /**
   * The logger instance.
   *
   * @private
   */
  private readonly logger = new NestLogger('SQL');

  /**
   * Log query implementation.
   *
   * @param {string} query
   * @param {any[]} [parameters]
   */
  logQuery(query: string, parameters?: any[]) {
    this.logger.log(`${query} -- Parameters: ${this.stringifyParameters(parameters)}`);
  }

  /**
   * Log query error implementation.
   *
   * @param {string} error
   * @param {string} query
   * @param {any[]} [parameters]
   */
  logQueryError(error: string, query: string, parameters?: any[]) {
    this.logger.error(
      `${query} -- Parameters: ${this.stringifyParameters(parameters)} -- ${error}`,
    );
  }

  /**
   * Log slow query implementation.
   *
   * @param {number} time
   * @param {string} query
   * @param {any[]} [parameters]
   */
  logQuerySlow(time: number, query: string, parameters?: any[]) {
    this.logger.warn(
      `Time: ${time} -- Parameters: ${this.stringifyParameters(parameters)} -- ${query}`,
    );
  }

  /**
   * Log schema build implementation.
   *
   * @param {string} message
   */
  logSchemaBuild(message: string) {
    this.logger.log(message);
  }

  /**
   * Log migration implementation.
   *
   * @param {string} message
   */
  logMigration(message: string) {
    this.logger.log(message);
  }

  /**
   * Raw logging implementation.
   *
   * @param {('log' | 'info' | 'warn')} level
   * @param {*} message
   */
  log(level: 'log' | 'info' | 'warn', message: any) {
    switch (level) {
      case 'log':
      case 'info':
        this.logger.log(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
      default:
        this.logger.error(message);
    }
  }

  /**
   * Convert the params to string.
   *
   * @private
   * @param {unknown[]} [parameters]
   *
   * @return {string}
   */
  private stringifyParameters(parameters?: unknown[]): string {
    try {
      return JSON.stringify(parameters) || '';
    } catch {
      return '';
    }
  }
}
