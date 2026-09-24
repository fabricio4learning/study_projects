import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { CassandraHealthIndicator } from './indicators/cassandra.health';
import { RedisHealthIndicator } from './indicators/redis.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private cassandraHealth: CassandraHealthIndicator,
    private redisHealth: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    try {
      return this.health.check([
        () => this.cassandraHealth.isHealthy(),
        () => this.redisHealth.isHealthy(),
      ]);
    } catch (error: unknown) {
      const details =
        error instanceof Object && error !== null && 'response' in error
          ? (error as any).response
          : {
              message: error instanceof Error ? error.message : 'Unknown error',
            };

      throw new ServiceUnavailableException({
        status: 'error',
        details,
      });
    }
  }
}
