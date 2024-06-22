import { Redis } from '@/core/cache/client/redis.client';
import { Injectable } from '@nestjs/common';

type UserToken = {
  userId: string;
  value: any;
  expiration?: number;
};

@Injectable()
export class InvalidTokenRepository {
  /**
   * The key prefix for the tokens.
   *
   * @private
   * @type {string}
   */
  private readonly prefix: string = 'auth_token_';

  /**
   * Creates an instance of InvalidTokenRepository.
   *
   * @param {Redis} store
   */
  constructor(private readonly store: Redis) {}

  /**
   * Delete all tokens.
   *
   * @returns {Promise<boolean>}
   */
  async deleteAll(): Promise<boolean> {
    return this.store.forgetByPattern(`*${this.prefix}*`);
  }

  /**
   * Get the token for the user id.
   *
   * @param {string} userId
   * @param {string} token
   *
   * @returns {Promise<string | null>}
   */
  async get(userId: string, token: string): Promise<string | null> {
    const key = this.getKey(userId, token);

    return this.store.get(key);
  }

  /**
   * Create many invalid tokens.
   *
   * @param {Array<UserToken} [payloads=[]]
   *
   * @returns {Promise<boolean>}
   */
  async createMany(payloads: Array<UserToken> = []): Promise<boolean> {
    const sets = [];

    for (let i = 0; i < payloads.length; i += 1) {
      const { userId, value, expiration } = payloads[i];

      sets.push(this.store.put(
        this.getKey(userId, value),
        value,
        expiration,
      ));
    }

    await Promise.all(sets);

    return true;
  }

  /**
   * Generic key used for getting/saving tokens.
   *
   * @param {string} userId
   * @param {string} token
   *
   * @returns {string}
   */
  getKey(userId: string, token: string): string {
    return `${this.prefix}_${userId}_${token}`;
  }
}
