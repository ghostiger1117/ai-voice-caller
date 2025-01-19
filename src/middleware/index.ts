import { Application } from 'express';
import bodyParser from 'body-parser';
import { errorHandler } from './errorHandler';
import { requestLogger } from './requestLogger';

export function setupMiddleware(app: Application) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(requestLogger);
  app.use(errorHandler);
} 