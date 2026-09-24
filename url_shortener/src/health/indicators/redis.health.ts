import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import Redis from 'ioredis';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../../redis/redis.provider';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    @Inject(REDIS_CLIENT)
    private redisClient: Redis,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('redis');

    try {
      const result = await this.redisClient.ping();

      if (result === 'PONG') {
        return indicator.up();
      }

      return indicator.down({
        message: `Unexpected response: ${result}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return indicator.down({ message });
    }
  }
}
