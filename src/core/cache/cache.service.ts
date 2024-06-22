import * as crypto from 'crypto';
import { CacheConfig } from '../../configs/cache.config';
import { ICache } from './cache.interface';
import { Null } from './client/null.client';
import { Redis } from './client/redis.client';

type CacheDrivers = {
  null: typeof Null;
  redis: typeof Redis;
};

export const TTL = {
  TEN_MINUTES: 60 * 10,
  THIRTY_MINUTES: 60 * 30,
  ONE_HOUR: 60 * 60,
  HALF_DAY: 60 * 60 * 12,
  ONE_DAY: 60 * 60 * 24,
  TWO_DAYS: 60 * 60 * 24 * 2,
  ONE_WEEK: 60 * 60 * 24 * 7,
};

export class CacheService {
  /**
   * The cache configs.
   *
   * @private
   * @type {CacheConfig}
   */
  private config: CacheConfig;

  /**
   * Available cache drivers.
   *
   * @type {CacheDrivers}
   */
  readonly drivers: CacheDrivers;

  /**
   * Created cache clients.
   *
   * @private
   * @type {CacheDrivers }
   */
  private createdClients: CacheDrivers | {};

  /**
   * The current cache client.
   *
   * @private
   * @type {ICache}
   */
  private client: ICache;

  /**
   * Creates an instance of CacheService.
   *
   * @param {CacheConfig} config
   */
  constructor(config: CacheConfig) {
    this.config = config;

    this.drivers = {
      null: Null,
      redis: Redis,
    };

    this.createdClients = {};
  }

  /**
   * Attempt to get a cache of a created client,
   * otherwise instantiate a new one.
   *
   * @private
   * @param {string} driver
   *
   * @return {ICache}
   */
  async getInstance(driver: string): Promise<ICache> {
    let instance = this.createdClients[driver];

    if (!instance) {
      const { prefix, clients } = this.config;
      const Client = this.drivers[driver];

      instance = new Client(prefix, clients[driver]);

      await (instance as ICache).initialize();

      this.createdClients[driver] = instance;
    }

    return instance;
  }

  /**
   * Client getter. This method will return
   * the current client instance if it's not closed.
   * Else, it will default to the Null client.
   *
   * Deleting the closed client will attempt to create a new
   * one with open connection, e.g. Redis.
   *
   * @return {ICache}
   */
  async getClient(): Promise<ICache> {
    let { driver } = this.config;

    if (!this.drivers[driver]) {
      driver = 'null';
    }

    if (!this.client) {
      this.client = await this.getInstance(driver);
    }

    if (this.client.isClosed()) {
      this.client = null;
      delete this.createdClients[driver];

      return this.getInstance('null');
    }

    return this.client;
  }

  /**
   * Set the current cache client.
   *
   * @param {ICache|null} client
   *
   * @return {this}
   */
  setClient(client: ICache | null): this {
    this.client = client;

    return this;
  }

  /**
   * Generate a cache key from a given source.
   *
   * @param {*} [source='']
   *
   * @return {string}
   */
  generateKey(source: any = ''): string {
    return crypto.createHash('md5').update(JSON.stringify(source)).digest('hex');
  }

  /**
   * Prefix getter.
   *
   * @return {Promise<string>}
   */
  async getPrefix(): Promise<string> {
    return (await this.getClient()).getPrefix();
  }

  /**
   * Prefix getter.
   *
   * @param {string} prefix
   *
   * @return {Promise<ICache>}
   */
  async setPrefix(prefix: string): Promise<ICache> {
    return (await this.getClient()).setPrefix(prefix);
  }

  /**
   * Get a cached value based from the key provided.
   *
   * @param {string} key
   *
   * @return {Promise<any>}
   */
  async get(key: string): Promise<any> {
    return (await this.getClient()).get(key);
  }

  /**
   * Put a value in the cache.
   *
   * @param {string} key
   * @param {any} value
   * @param {number | null} ttl
   *
   * @return {Promise<boolean>}
   */
  async put(key: string, value: any, ttl: number | null = null): Promise<boolean> {
    return (await this.getClient()).put(key, value, ttl);
  }

  /**
   * Get multiple cache records.
   *
   * @param {...string[]} keys
   *
   * @return {Promise<any[]>}
   */
  async getMany(...keys: string[]): Promise<any[]> {
    return (await this.getClient()).getMany(...keys);
  }

  /**
   * Multiple cache put.
   *
   * @param {any[]} sets
   * @param {(number | null)} [ttl=null]
   *
   * @return {Promise<boolean>}
   */
  async putMany(sets: any[], ttl: (number | null) = null): Promise<boolean> {
    return (await this.getClient()).putMany(sets, ttl);
  }

  /**
   * Delete a cache.
   *
   * @param {...string[]} keys
   *
   * @return {Promise<boolean>}
   */
  async forget(...keys: string[]): Promise<boolean> {
    return (await this.getClient()).forget(...keys);
  }

  /**
   * Delete cache values by pattern.
   *
   * @param {string} [pattern='*']
   *
   * @return {Promise<boolean>}
   */
  async forgetByPattern(pattern: string): Promise<boolean> {
    return (await this.getClient()).forgetByPattern(pattern);
  }

  /**
   * Attempt to get an existing record from cache.
   * If it does not exist, the callback will be executed
   * and the result will be stored in the cache.
   *
   * @param {string} key
   * @param {number} ttl
   * @param {() => Promise<T>} callback
   *
   * @return {Promise<any>}
   */
  async remember<T>(key: string, ttl: number | null, callback: () => Promise<T>): Promise<T> {
    try {
      const client = await this.getClient();
      const result = await client.remember(key, ttl, callback);

      return result;
    } catch (error) {
      if (!this.client || this.client.isClosed()) {
        return callback();
      }

      throw error;
    }
  }

  /**
   * Like @remember() except it remembers forever <3
   *
   * @param {string} key
   * @param {() => Promise<T>} callback
   *
   * @return {Promise<any>}
   */
  async rememberForever<T>(key: string, callback: () => Promise<T>): Promise<any> {
    return this.remember(key, null, callback);
  }

  /**
   * Flush the cache db.
   *
   * @return {Promise<boolean>}
   */
  async flush(): Promise<boolean> {
    return (await this.getClient()).flush();
  }

  /**
   * Quit the cache client.
   *
   * @return {Promise<boolean>}
   */
  async quit(): Promise<boolean> {
    return (await this.getClient()).flush();
  }
}
