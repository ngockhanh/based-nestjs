import { Global, Module } from '@nestjs/common';
import cacheConfig from '@/configs/cache.config';
import { CacheService } from './cache.service';
import { Redis } from './client/redis.client';
import { CacheController } from './cache.controller';

@Global()
@Module({
  providers: [
    {
      provide: CacheService,
      useFactory: async () => new CacheService(cacheConfig()),
    },
    {
      provide: Redis,
      useFactory: async () => {
        const { prefix, clients } = cacheConfig();
        const redis = new Redis(prefix, clients.redis);

        await redis.initialize();

        return redis;
      },
    },
  ],
  controllers: [CacheController],
  exports: [CacheService, Redis],
})
export class CacheModule {}
