import { z } from 'zod';

export const envSchema = z.object({
  // Cassandra
  CASSANDRA_HOST: z.string(),
  CASSANDRA_PORT: z.coerce.number().default(9042),
  CASSANDRA_KEYSPACE: z.string(),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),
});

export type Env = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error('❌ Invalid configuration in the .env file:');
    console.error(z.treeifyError(result.error));
    throw new Error('Invalid environment variables');
  }

  return result.data;
}
