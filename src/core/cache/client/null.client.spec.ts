import { Null } from './null.client';

describe('Null Test', () => {
  const cache = new Null();

  it('initializes cache', async () => {
    const response = await cache.initialize();

    expect(response).toBeNull();
  });

  it('flushes cache', async () => {
    const response = await cache.flush();

    expect(response).toBeTrue();
  });

  it('quits the underlying client', async () => {
    const toQuit = new Null();

    const response = await toQuit.quit();

    expect(response).toBeTrue();
  });

  it('always return false when calling isClosed()', () => {
    expect(cache.isClosed()).toBeFalse();
  });

  it('returns false when storing value always', async () => {
    const response = await cache.put('key', 'value');

    expect(response).toBeFalse();
  });

  it('returns false when storing multiple values', async () => {
    const response = await cache.putMany(['key', 'value', 'key2', 'value2']);

    expect(response).toBeFalse();
  });

  it('returns null when getting a cached value', async () => {
    const response = await cache.get('key');

    expect(response).toBeNull();
  });

  it('returns null when getting a multiple cached value', async () => {
    const response = await cache.getMany('key', 'key2');

    expect(response).toBeNull();
  });

  it('does nothing when setting prefix', () => {
    expect(cache.setPrefix('lel')).toEqual(cache);
  });

  it('returns an empty string when getting prefix', () => {
    expect(cache.getPrefix()).toBe('');
  });

  describe('remember()', () => {
    it('just execute the callback and resolve the result', async () => {
      const payload = { please: 'remember me!' };

      const response = await cache.remember('remember-me', 20, async () => payload);

      expect(response).toEqual(payload);
    });

    it('just executes a promise callback', async () => {
      const payload = { please: 'remember me!' };
      const promise = new Promise((resolve) => {
        resolve(payload);
      });

      const response = await cache.remember('remember-me', 20, () => promise);

      expect(response).toEqual(payload);
    });

    it('executes the callback when remembering forevah!', async () => {
      const payload = { please: 'remember forevah!' };

      const response = await cache.rememberForever('forever', async () => payload);

      expect(response).toEqual(payload);
    });
  });

  it('returns true always when forgetting a cached value', async () => {
    const response = await cache.forget('i-dont-exist');

    expect(response).toBeTrue();
  });

  it('returns true always when forgetting a cached value by pattern', async () => {
    const response = await cache.forgetByPattern('idontexist*');

    expect(response).toBeTrue();
  });
});
