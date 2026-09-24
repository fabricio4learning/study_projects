import { Module } from '@nestjs/common';
import { redisClientProvider, REDIS_CLIENT } from './redis.provider';
import Redis from 'ioredis';

@Module({
  providers: [
    redisClientProvider,
    {
      provide: 'REDIS_SHUTDOWN',
      useFactory: (redis: Redis) => ({
        async onModuleDestroy() {
          await redis.quit();
        },
      }),
      inject: [REDIS_CLIENT],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
