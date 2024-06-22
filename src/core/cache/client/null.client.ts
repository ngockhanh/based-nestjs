import { ICache } from '../cache.interface';

export class Null implements ICache {
  /** @inheritdoc */
  initialize(): Promise<any> {
    return null;
  }

  /** @inheritdoc */
  getClient() {
    return null;
  }

  /** @inheritdoc */
  isClosed() {
    return false;
  }

  /** @inheritdoc */
  getPrefix() {
    return '';
  }

  /** @inheritdoc */
  setPrefix(_prefix: string) {
    return this;
  }

  /** @inheritdoc */
  get(_key: string) {
    return Promise.resolve(null);
  }

  /** @inheritdoc */
  put(_key: string, _value: any, _ttl = null) {
    return Promise.resolve(false);
  }

  /** @inheritdoc */
  getMany(..._keys: string[]) {
    return Promise.resolve(null);
  }

  /** @inheritdoc */
  putMany(_sets: Array<any>, _ttl = null) {
    return Promise.resolve(false);
  }

  /** @inheritdoc */
  forget(..._keys: string[]) {
    return Promise.resolve(true);
  }

  /** @inheritdoc */
  forgetByPattern(_pattern: string) {
    return Promise.resolve(true);
  }

  /** @inheritdoc */
  remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<any> {
    return Promise.resolve(callback());
  }

  /** @inheritdoc */
  rememberForever<T>(key: string, callback: () => Promise<T>): Promise<any> {
    return this.remember(key, null, callback);
  }

  /** @inheritdoc */
  flush() {
    return Promise.resolve(true);
  }

  /** @inheritdoc */
  quit() {
    return Promise.resolve(true);
  }
}
