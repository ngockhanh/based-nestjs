import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export abstract class BaseHttpService {
  /**
   * The logger.
   *
   * @protected
   * @type {Logger}
   */
  protected logger: Logger;

  /**
   * Creates an instance of BaseHttpService.
   *
   * @param {HttpService} http
   */
  constructor(
    protected readonly http: HttpService,
  ) {
    this.logger = new Logger(this?.constructor?.name || 'BaseHttpService');
  }

  /**
   * Generic request handler.
   *
   * @protected
   * @param {string} url
   * @param {string} method
   * @param {AxiosRequestConfig} [opts={}]
   *
   * @return {Promise<any>}
   */
  public async request(
    url: string,
    method: string,
    opts: AxiosRequestConfig = {},
  ): Promise<any> {
    const { data } = await lastValueFrom(this.http.request({
      url,
      method,
      ...opts,
    }));

    return data;
  }
}
