import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { UrlMappingRepository } from '../src/url-mapping/url-mapping.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { CassandraModule } from '../src/cassandra/cassandra.module';
import { UrlMapping } from '../src/url-mapping/url-mapping.types';
import { UrlMappingModule } from '../src/url-mapping/url-mapping.module';
import { AppModule } from '../src/app.module';

describe('UrlMappingRepository (e2e)', () => {
  let app: INestApplication<App>;
  let urlRepository: UrlMappingRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, CassandraModule, UrlMappingModule],
      providers: [UrlMappingRepository],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    urlRepository =
      moduleFixture.get<UrlMappingRepository>(UrlMappingRepository);
  });

  afterAll(() => {
    app.close();
  });

  describe('save() and findByShortCode()', () => {
    it('should save and retrieve a URL mapping', async () => {
      const mapping: UrlMapping = {
        shortCode: 'test123',
        longUrl: 'https://example.com/test',
        redirectType: '302',
        createdAt: new Date(),
      };

      await urlRepository.save(mapping);
      const result = await urlRepository.findByShortCode(mapping.shortCode);

      expect(result).toBeDefined();
      expect(result?.shortCode).toBe(mapping.shortCode);
      expect(result?.longUrl).toBe(mapping.longUrl);
    });

    it('should return null for non-existent shortCode', async () => {
      const result = await urlRepository.findByShortCode('non-existent');

      expect(result).toBeNull();
    });
  });
});
