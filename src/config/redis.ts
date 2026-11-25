import { env } from './env';
import { logger } from './logger';

// Redis-ready: not required in Phase 1. When enabled, wire a client here
// and pass it to the rate limiter / socket adapter.
export const redisConfig = {
  url: env.REDIS_URL,
  enabled: Boolean(env.REDIS_URL),
  client: null as unknown, // assign ioredis client when enabled
};

if (!redisConfig.enabled) logger.info('Redis not configured — using in-memory adapters.');