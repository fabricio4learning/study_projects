import { Provider } from '@nestjs/common';
import { Client } from 'cassandra-driver';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.schema';

export const CASSANDRA_CLIENT = 'CASSANDRA_CLIENT';

export const cassandraClientProvider: Provider = {
  provide: CASSANDRA_CLIENT,
  useFactory: (configService: ConfigService<Env, true>): Client => {
    const client = new Client({
      contactPoints: [configService.get('CASSANDRA_HOST', { infer: true })],
      localDataCenter: 'datacenter1',
      keyspace: configService.get('CASSANDRA_KEYSPACE', { infer: true }),
    });

    return client;
  },
  inject: [ConfigService],
};
