import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { corsOrigins, isTest } from './config/env';
import { globalLimiter } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { competitionRoutes } from './modules/competitions/competition.routes';
import { sendOk } from './utils/apiResponse';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: corsOrigins === '*' ? true : corsOrigins,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (!isTest) app.use(morgan('dev'));
  app.use(globalLimiter);

  app.get('/health', (_req, res) =>
    sendOk(res, { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }),
  );

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/competitions', competitionRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
