import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { INestApplication, ServiceUnavailableException } from '@nestjs/common';
import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { CassandraHealthIndicator } from './indicators/cassandra.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import request from 'supertest';

describe('HealthController', () => {
  let app: INestApplication;
  let healthCheckService: HealthCheckService;
  let cassandraHealthIndicator: CassandraHealthIndicator;
  let redisHealthIndicator: RedisHealthIndicator;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockCassandraHealthIndicator = {
    isHealthy: jest.fn(),
  };

  const mockRedisHealthIndicator = {
    isHealthy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: CassandraHealthIndicator,
          useValue: mockCassandraHealthIndicator,
        },
        {
          provide: RedisHealthIndicator,
          useValue: mockRedisHealthIndicator,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    cassandraHealthIndicator = module.get<CassandraHealthIndicator>(
      CassandraHealthIndicator,
    );
    redisHealthIndicator =
      module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the status "ok" when both services are running', async () => {
    const mockResult: HealthCheckResult = {
      status: 'ok',
      info: {
        cassandra: { status: 'up' },
        redis: { status: 'up' },
      },
      details: {
        cassandra: { status: 'up' },
        redis: { status: 'up' },
      },
    };

    mockCassandraHealthIndicator.isHealthy.mockResolvedValue({
      cassandra: { status: 'up' },
    });

    mockRedisHealthIndicator.isHealthy.mockResolvedValue({
      redis: { status: 'up' },
    });

    mockHealthCheckService.check.mockResolvedValue(mockResult);

    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.info).toBeDefined();
    expect(response.body.info.cassandra).toBeDefined();
    expect(response.body.info.redis).toBeDefined();
  });

  it('should return the status error when Cassandra is down', async () => {
    const errorPayload: HealthCheckResult = {
      status: 'error',
      error: {
        cassandra: { status: 'down', message: 'Connection refused' },
      },
      details: {
        cassandra: { status: 'down', message: 'Connection refused' },
        redis: { status: 'up' },
      },
    };

    mockCassandraHealthIndicator.isHealthy.mockResolvedValue({
      cassandra: { status: 'down', message: 'Connection refused' },
    });

    mockRedisHealthIndicator.isHealthy.mockResolvedValue({
      redis: { status: 'up' },
    });

    mockHealthCheckService.check.mockRejectedValue(
      new ServiceUnavailableException(errorPayload),
    );

    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(503);

    expect(response.body.status).toBe('error');
    expect(response.body.error.cassandra).toBeDefined();
  });

  it('should return the status error when Redis is down', async () => {
    const errorPayload: HealthCheckResult = {
      status: 'error',
      error: {
        redis: { status: 'down', message: 'Connection refused' },
      },
      details: {
        cassandra: { status: 'up' },
        redis: { status: 'down', message: 'Connection refused' },
      },
    };

    mockCassandraHealthIndicator.isHealthy.mockResolvedValue({
      cassandra: { status: 'up' },
    });

    mockRedisHealthIndicator.isHealthy.mockResolvedValue({
      redis: { status: 'down', message: 'Connection refused' },
    });

    mockHealthCheckService.check.mockRejectedValue(
      new ServiceUnavailableException(errorPayload),
    );

    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(503);

    expect(response.body.status).toBe('error');
    expect(response.body.error.redis).toBeDefined();
  });
});
