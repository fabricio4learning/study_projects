import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.schema';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisClientProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (configService: ConfigService<Env, true>): Redis => {
    const redis = new Redis({
      host: configService.get('REDIS_HOST', { infer: true }),
      port: configService.get('REDIS_PORT', { infer: true }),
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    redis.on('connect', () => {
      console.log('✅ Redis conectado');
    });

    return redis;
  },
  inject: [ConfigService],
};
