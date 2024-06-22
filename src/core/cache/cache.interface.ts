export interface ICache {
  /**
   * Create underlying cache client.
   *
   * @param {*} [opts]
   *
   * @return {Promise<any>}
   * @memberof ICache
   */
  initialize(opts?: any): Promise<any>

  /**
   * Client getter.
   *
   * @return {any}
   * @memberof ICache
   */
  getClient(): any;

  /**
   * Determine if the flag _closed is true.
   *
   * @return {boolean}
   * @memberof ICache
   */
  isClosed(): boolean;

  /**
   * Prefix getter.
   *
   * @return {string}
   * @memberof ICache
   */
  getPrefix(): string;

  /**
   * Prefix getter.
   *
   * @param {string} prefix
   *
   * @return {this}
   * @memberof ICache
   */
  setPrefix(prefix: string): this;

  /**
   * Get a cached value based from the key provided.
   *
   * @param {string} key
   *
   * @return {Promise<any>}
   * @memberof ICache
   */
  get(key: string): Promise<any>;

  /**
   * Put a value in the cache.
   *
   * @param {string} key
   * @param {any} value
   * @param {number | null} ttl
   *
   * @return {Promise<boolean>}
   * @memberof ICache
   */
  put(key: string, value: any, ttl: number | null): Promise<boolean>;

  /**
   * Get values of array of keys provided.
   *
   * @param {...string[]} keys
   *
   * @return {Promise<any[]>}
   * @memberof ICache
   */
  getMany(...keys: string[]): Promise<any[]>;

  /**
   * Put sets of values to cache.
   *
   * @param {Array<any>} sets
   * @param {(number | null)} ttl
   *
   * @return {Promise<boolean>}
   * @memberof ICache
   */
  putMany(sets: Array<any>, ttl: number | null): Promise<boolean>;

  /**
   * Delete a cache.
   *
   * @param {string[]} keys
   *
   * @return {Promise<boolean>}
   * @memberof ICache
   */
  forget(...keys: string[]): Promise<boolean>;

  /**
   * Delete cachees by pattern.
   *
   * @param {string} pattern
   *
   * @return {Promise<boolean>}
   * @memberof ICache
   */
  forgetByPattern(pattern: string): Promise<boolean>;

  /**
   * Attempt to get an existing record from cache.
   * If it does not exist, the callback will be executed
   * and the result will be stored in the cache.
   *
   * @param {string} key
   * @param {number | null} ttl
   * @param {() => Promise<T>} callback
   * @param {Record<string, any>} opts
   *
   * @return {Promise<any>}
   * @memberof ICache
   */
  remember<T>(
    key: string,
    ttl: number | null,
    callback: () => Promise<T>,
    opts?: Record<string, any>,
  ): Promise<T>;

  /**
   * Like @remember() except it remembers forever <3
   *
   * @param {string} key
   * @param {() => Promise<T>} callback
   *
   * @return {Promise<any>}
   * @memberof ICache
   */
  rememberForever<T>(key: string, callback: () => Promise<T>): Promise<any>;

  /**
   * Flush the cache db.
   *
   * @return {Promise<boolean>}
   * @memberof ICache
   */
  flush(): Promise<boolean>;

  /**
   * Quit the cache db.
   *
   * @return {boolean}
   * @memberof ICache
   */
  quit(): Promise<boolean>;
}
