import timeout, { TimeoutError } from 'p-timeout';
import { caching, StoreConfig } from 'cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { RedisConfig } from '../../../configs/redis.config';
import { isEmpty } from '../../core.helpers';
import { RedisException } from './redis-exception';
import { ICache } from '../cache.interface';

type RedisClientOptions = StoreConfig & {
  password?: string,
};

type RememberOpts = {
  resultProperty: string,
};

export class Redis implements ICache {
  /**
   * The cache prefix.
   *
   * @private
   * @type {string}
   */
  private prefix: string;

  /**
   * Cache manager options
   *
   * @private
   * @type {RedisConfig}
   */
  private options: RedisConfig;

  /**
   * Cache manager redis store does not
   * export client type xd.
   *
   * @type {*}
   */
  private client: any;

  /**
   * Flag for determining closed connection.
   *
   * @private
   * @type {boolean}
   */
  private closed: boolean;

  /**
   * Creates an instance of Redis.
   *
   * @param {string} prefix
   * @param {RedisConfig} options
   */
  constructor(prefix: string, options: RedisConfig) {
    this.prefix = prefix || '';
    this.options = options;
    this.closed = true;
  }

  /** @inheritdoc */
  getClient() {
    return this.client;
  }

  /**
   * Create cache client.
   *
   * @return {Promise<any>}
   */
  async initialize(): Promise<any> {
    const { options } = this;
    const config = <RedisClientOptions>{
      socket: {
        host: options.host,
        port: options.port,
      },
      db: options.db,
    };

    if (options.password) {
      config.password = options.password;
    }

    const store = await redisStore(config) as any;
    const cache = await caching(store);

    this.closed = false;

    const client = cache.store.getClient();

    client.on('error', (error: any) => {
      const { code } = error;

      if (code === 'ECONNREFUSED' || code === 'NR_CLOSED') {
        client.quit();
        this.closed = true;
      }
    });

    this.client = cache;

    return cache;
  }

  /** @inheritdoc */
  isClosed() {
    return Boolean(this.closed);
  }

  /** @inheritdoc */
  getPrefix(): string {
    return this.prefix;
  }

  /** @inheritdoc */
  setPrefix(prefix: string = ''): this {
    this.prefix = prefix;

    return this;
  }

  /** @inheritdoc */
  get(key: string): Promise<any> {
    return this.call(this
      .getClient()
      .get(this.getPrefix() + key));
  }

  /** @inheritdoc */
  async getMany(...keys: string[]): Promise<any[]> {
    const keysWithPrefix = keys.map((key) => this.getPrefix() + key);

    return this.call(
      this.getClient().store.mget(...keysWithPrefix),
    );
  }

  /** @inheritdoc */
  async put(key: string, value: any, ttl: number | null = null): Promise<any> {
    const result = await this.call(
      this
        .getClient()
        .set(this.getPrefix() + key, value, { ttl }),
    );

    return result === 'OK';
  }

  /** @inheritdoc */
  async putMany(sets: any[], ttl: number | null = null): Promise<boolean> {
    const values = this.setPrefixForPutMany(sets);

    const result = await this.call(
      this.getClient().store.mset(...values, { ttl }),
    );

    return result === 'OK' || 'OK' in (result as object);
  }

  /** @inheritdoc */
  async forget(...keys: string[]): Promise<boolean> {
    const rows = await this.call(
      this.getClient().store.mdel(...keys),
    );

    return rows > 0;
  }

  /** @inheritdoc */
  async forgetByPattern(pattern = '*'): Promise<boolean> {
    const keys = await this.call(
      this.getClient().store.keys(pattern),
    );

    if (!keys || keys.length === 0) {
      return true;
    }

    return this.call(this.forget(...keys));
  }

  /** @inheritdoc */
  async remember<T>(
    key: string,
    ttl: number | null,
    callback: () => Promise<T>,
    opts: RememberOpts = { resultProperty: 'data' },
  ): Promise<any> {
    const value = await this.call(this.get(key));

    if (value === undefined || value === null) {
      const result = await callback();
      const { resultProperty } = opts;

      const data = typeof result === 'object' && resultProperty
        ? result[resultProperty] || result
        : result;

      if (!isEmpty(data)) {
        await this.call(this.put(key, result, ttl));
      }

      return result;
    }

    return value;
  }

  /** @inheritdoc */
  async rememberForever<T>(key: string, callback: () => Promise<T>): Promise<any> {
    return this.remember(key, null, callback);
  }

  /** @inheritdoc */
  async flush(): Promise<boolean> {
    const result = await this.call(this.getClient().reset());

    return result === 'OK';
  }

  /** @inheritdoc */
  async quit(): Promise<boolean> {
    const response = await this.call(
      this.getClient()
        .store
        .getClient()
        .quit(),
    );

    return response === 'OK';
  }

  /**
   * Enclose the redis call with promise that timesout.
   *
   * @private
   * @template T
   * @param {PromiseLike<T>} fn
   * @return {*}
   */
  private async call<T>(fn: PromiseLike<T>): Promise<any> {
    const redisTimeout = this.options.timeout;

    try {
      const data = await timeout(fn, {
        milliseconds: redisTimeout
      });

      return data;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new RedisException(`Redis timed out after ${redisTimeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Set prefix for the keys.
   *
   * @private
   * @param {any[]} [sets=[]]
   *
   * @returns {Array<any>}
   */
  private setPrefixForPutMany(sets: any[] = []): Array<any> {
    const newSet = [];

    for (let i = 0; i < sets.length; i += 2) {
      const key = this.getPrefix() + sets[i];
      const value = sets[i + 1];

      newSet.push(...[key, value]);
    }

    return newSet;
  }
}
