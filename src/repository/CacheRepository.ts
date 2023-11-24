/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify';
import fastifyRedis from '@fastify/redis';
import { RedisCacheOptions } from '@/types';

class CacheRepository {
  private redis: any;
  constructor(app: FastifyInstance, options: RedisCacheOptions) {
    app.register(fastifyRedis, options).after(() => {
      // Access the Redis decorator using app.redis or app['redis']
      this.redis = app.redis;
    });
  }

  async get<T>(key: string): Promise<T | null> {
    // Retrieve the value from Redis
    const cachedValue = await this.redis.get(key);
    return cachedValue ? JSON.parse(cachedValue) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Save the value to Redis with an optional time-to-live (TTL)
    await this.redis.set(key, JSON.stringify(value));

    // If a TTL is provided, set it
    if (ttl) {
      await this.redis.expireat(key, ttl);
    }
  }

  async mget<T>(keys: string[]): Promise<T[]> {
    // Retrieve multiple values from Redis
    const values = await this.redis.mget(...keys);
    return values.map((value: any) => (value ? JSON.parse(value) : null));
  }
}

export default CacheRepository;
