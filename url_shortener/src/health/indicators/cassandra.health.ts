import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  HealthIndicatorResult,
  HealthCheck,
} from '@nestjs/terminus';
import { Client } from 'cassandra-driver';
import { Inject } from '@nestjs/common';
import { CASSANDRA_CLIENT } from '../../cassandra/cassandra.provider';

@Injectable()
export class CassandraHealthIndicator {
  constructor(
    @Inject(CASSANDRA_CLIENT)
    private cassandraClient: Client,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('cassandra');

    try {
      await this.cassandraClient.execute('SELECT now() FROM system.local');

      return indicator.up();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return indicator.down({ message });
    }
  }
}
