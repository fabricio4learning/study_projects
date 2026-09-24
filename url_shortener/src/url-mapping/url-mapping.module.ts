import { Module } from '@nestjs/common';
import { CassandraModule } from '../cassandra/cassandra.module';
import { UrlMappingRepository } from './url-mapping.repository';

@Module({
  imports: [CassandraModule],
  providers: [UrlMappingRepository],
  exports: [UrlMappingRepository],
})
export class UrlMappingModule {}
