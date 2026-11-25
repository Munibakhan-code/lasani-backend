import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  mongoose.set('sanitizeFilter', true); // defense-in-depth vs query operator injection

  mongoose.connection.on('connected', () => logger.info('✅ MongoDB connected'));
  mongoose.connection.on('error', (e) => logger.error({ err: e }, 'MongoDB error'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(env.MONGO_URI, { autoIndex: !env.isProd });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}