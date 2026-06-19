import { Redis } from 'ioredis';
import { env } from './env.js';

let redisClient: Redis | null = null;
let isRedisConnected = false;

try {
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('📡 Redis Connected Successfully');
  });

  redisClient.on('error', (err: any) => {
    isRedisConnected = false;
    console.warn('⚠️ Redis connection error, caching might run on memory fallback:', err.message);
  });

  redisClient.connect().catch((err: any) => {
    console.warn('⚠️ Redis connect failed, using memory fallback:', err.message);
  });
} catch (error) {
  console.warn('⚠️ Failed to initialize Redis client. Caching will run on memory fallback.');
}

const memoryCache = new Map<string, { value: string; expiry: number }>();

export const cacheService = {
  async get(key: string): Promise<string | null> {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.get(key);
      } catch {
        // fallback
      }
    }
    const record = memoryCache.get(key);
    if (!record) return null;
    if (Date.now() > record.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return record.value;
  },

  async set(key: string, value: string, ttlSeconds = 3600): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.set(key, value, 'EX', ttlSeconds);
        return;
      } catch {
        // fallback
      }
    }
    memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  },

  async del(key: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.del(key);
        return;
      } catch {
        // fallback
      }
    }
    memoryCache.delete(key);
  }
};

export { redisClient };
