import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { CassandraModule } from '../cassandra/cassandra.module';
import { RedisModule } from '../redis/redis.module';
import { CassandraHealthIndicator } from './indicators/cassandra.health';
import { RedisHealthIndicator } from './indicators/redis.health';

@Module({
  imports: [TerminusModule, CassandraModule, RedisModule],
  providers: [CassandraHealthIndicator, RedisHealthIndicator],
  controllers: [HealthController],
  exports: [CassandraHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
