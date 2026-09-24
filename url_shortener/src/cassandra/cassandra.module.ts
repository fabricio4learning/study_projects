import { Global, Module } from '@nestjs/common';
import {
  CASSANDRA_CLIENT,
  cassandraClientProvider,
} from './cassandra.provider';
import { Client } from 'cassandra-driver';

@Global()
@Module({
  providers: [
    cassandraClientProvider,
    {
      provide: 'CASSANDRA_SHUTDOWN',
      useFactory: (client: Client) => ({
        async onModuleDestroy() {
          await client.shutdown();
        },
      }),
      inject: [CASSANDRA_CLIENT],
    },
  ],
  exports: [CASSANDRA_CLIENT],
})
export class CassandraModule {}
