import { Injectable, OnApplicationBootstrap, OnApplicationShutdown, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService, ConfigType } from '@nestjs/config';
import { redisConfig } from 'src/common/configs';

@Injectable()
export class RedisService implements OnModuleDestroy, OnApplicationBootstrap, OnApplicationShutdown {
  private redisClient: Redis;

  private readonly prefix = 'kitob_uz_';
  private readonly defaultTTL = 3600; // 1 hour default TTL

  constructor(private readonly configService: ConfigService) { }
  onApplicationBootstrap() {
    const config = this.configService.getOrThrow<ConfigType<typeof redisConfig>>('redis');
    console.log(config);
    this.redisClient = new Redis({
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password,
    });
  }

  onApplicationShutdown(signal?: string) {
    return this.redisClient.quit();
  }

  /**
   * Called when the module is being destroyed.
   * Properly closes the Redis connection.
   */
  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
  }

  /**
   * Builds a cache key with prefix
   */
  private buildKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Retrieves the remaining time to live (TTL) of a Redis key.
   * @param key - The key to retrieve the TTL for.
   * @returns A promise that resolves to the TTL of the key in seconds.
   */
  async getExpiry(key: string): Promise<number> {
    return this.redisClient.ttl(this.buildKey(key));
  }

  /**
   * Retrieves the value associated with the specified key from Redis.
   * Implements automatic JSON parsing and compression for large values.
   *
   * @param key - The key to retrieve the value for.
   * @returns A Promise that resolves to the value associated with the key.
   */
  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(this.buildKey(key));
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Sets a value in Redis with optimized serialization and optional compression.
   * @param key - The key to set the value for.
   * @param value - The value to be set.
   * @param ttl - Optional TTL in seconds (defaults to 1 hour)
   * @returns A Promise that resolves when the value is set.
   */
  async set(
    key: string,
    value: any,
    ttl: number = this.defaultTTL,
  ): Promise<void> {
    const serializedValue =
      typeof value === 'object' ? JSON.stringify(value) : String(value);

    if (ttl > 0) {
      await this.redisClient.set(
        this.buildKey(key),
        serializedValue,
        'EX',
        ttl,
      );
    } else {
      await this.redisClient.set(this.buildKey(key), serializedValue);
    }
  }

  /**
   * Deletes multiple keys from Redis efficiently using pipelining.
   * @param keys - Array of keys to delete.
   * @returns A Promise that resolves when all keys are deleted.
   */
  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const pipeline = this.redisClient.pipeline();
    keys.forEach((key) => pipeline.del(this.buildKey(key)));
    await pipeline.exec();
  }

  /**
   * Deletes a single key from Redis.
   * @param key - The key to delete.
   * @returns A Promise that resolves when the key is deleted.
   */
  async delete(key: string): Promise<void> {
    await this.redisClient.del(this.buildKey(key));
  }

  /**
   * Sets multiple values in Redis efficiently using pipelining.
   * @param entries - Array of key-value pairs to set.
   * @param ttl - Optional TTL in seconds (defaults to 1 hour)
   * @returns A Promise that resolves when all values are set.
   */
  async setMany(
    entries: Array<{ key: string; value: any }>,
    ttl: number = this.defaultTTL,
  ): Promise<void> {
    if (entries.length === 0) return;

    const pipeline = this.redisClient.pipeline();

    entries.forEach(({ key, value }) => {
      const serializedValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (ttl > 0) {
        pipeline.set(this.buildKey(key), serializedValue, 'EX', ttl);
      } else {
        pipeline.set(this.buildKey(key), serializedValue);
      }
    });

    await pipeline.exec();
  }

  /**
   * Gets multiple values from Redis efficiently using pipelining.
   * @param keys - Array of keys to retrieve.
   * @returns A Promise that resolves to an array of values.
   */
  async getMany<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) return [];

    const pipeline = this.redisClient.pipeline();
    keys.forEach((key) => pipeline.get(this.buildKey(key)));

    const results = await pipeline.exec();
    return (
      results?.map(([err, value]) => {
        if (err || !value) return null;
        try {
          return JSON.parse(value as string) as T;
        } catch {
          return value as unknown as T;
        }
      }) ?? []
    );
  }

  /**
   * Implements a cache-aside pattern with automatic refresh.
   * @param key - The cache key
   * @param fetchFn - Function to fetch data if cache misses
   * @param ttl - Optional TTL in seconds
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetchFn();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  /**
   * Increments a counter with optional expiry.
   * @param key - The counter key
   * @param ttl - Optional TTL in seconds
   */
  async increment(key: string, ttl: number = this.defaultTTL): Promise<number> {
    const value = await this.redisClient.incr(this.buildKey(key));
    if (ttl > 0) {
      await this.redisClient.expire(this.buildKey(key), ttl);
    }
    return value;
  }
}
