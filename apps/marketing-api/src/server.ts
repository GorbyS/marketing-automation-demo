import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../../..', '.env'),
});

import { app } from './app';
import { logger } from './logger/logger';

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  logger.info({ port }, 'marketing-api listening');
});
