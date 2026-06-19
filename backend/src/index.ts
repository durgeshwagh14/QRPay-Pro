import dns from 'dns';
// Force Google DNS to resolve MongoDB Atlas SRV connections reliably
dns.setServers(['8.8.8.8', '8.8.4.4']);

import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  process.on('unhandledRejection', (err: Error) => {
    logger.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error(`❌ Uncaught Exception: ${err.message}`);
    process.exit(1);
  });
};

startServer();
