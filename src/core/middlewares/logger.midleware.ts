import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  /**
   * THe logger
   *
   * @private
   */
  private logger = new Logger('HTTP');

  /**
   * Implement the middleware function
   *
   * @param {*} request
   * @param {*} response
   * @param {*} next
   */
  use(request: any, response: any, next: any): void {
    request.logger = this.logger;

    next();
  }
}
