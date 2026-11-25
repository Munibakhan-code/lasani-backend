// src/app.ts
import express, { Express } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { corsMiddleware } from './config/cors';
import { logger } from './config/logger';
import { globalLimiter } from './middlewares/rateLimiter';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(corsMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(compression());
  app.use(hpp());
  app.use(globalLimiter);

  if (!env.isProd) {
    app.use(morgan('dev'));
  } else {
    app.use(pinoHttp({ logger }));
  }

  app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
  app.use(env.API_PREFIX, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}