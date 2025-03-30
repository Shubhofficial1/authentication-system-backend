import mongoose from 'mongoose';
import config from '../config/config.js';
import logger from '../util/logger.js';
import { initRateLimiter } from '../config/rateLimiter.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.DATABASE_URL);

        initRateLimiter(conn.connection);
        logger.info(`RATE_LIMITER_INITIATED`);

        logger.info(`DATABASE_CONNECTION`, {
            meta: {
                CONNECTION_NAME: conn.connection.name,
                CONNECTION_HOST: conn.connection.host
            }
        });
    } catch (err) {
        logger.error(`DATABASE_ERROR`, {
            meta: {
                CONNECTION_ERROR: err
            }
        });
        process.exit(1);
    }
};

export default connectDB;
