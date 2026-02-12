import express from 'express';
import pinoHttp from 'pino-http';
import { logger } from './logger/logger';
import { pool } from './db/pool';
import { customersRoutes } from './routes/customersRoutes';
import { consentsRoutes } from './routes/consentsRoutes';
import { eventsRoutes } from './routes/eventsRoutes';
import { offersRoutes } from './routes/offersRoutes';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { loadOpenApiSpec } from './openapi/openapi';

export const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1 as ok');
    res.status(200).json({ status: 'ok', db: 'ok' });
  } catch {
    res.status(500).json({ status: 'degraded', db: 'down' });
  }
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(loadOpenApiSpec()));

app.use(customersRoutes);
app.use(consentsRoutes);
app.use(eventsRoutes);
app.use(offersRoutes);
app.use(errorHandler);
