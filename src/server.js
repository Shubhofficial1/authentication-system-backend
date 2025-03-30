import app from './app.js';
import config from './config/config.js';
import logger from './util/logger.js';
import connectDB from './service/db.js';

const server = app.listen(config.PORT, () => {
    try {
        connectDB();
        logger.info('APPLICATION_STARTED', {
            meta: {
                PORT: config.PORT,
                SERVER_URL: config.SERVER_URL
            }
        });
    } catch (err) {
        logger.error(`APPLICATION_ERROR`, { meta: err });
        server.close((error) => {
            if (error) {
                logger.error(`APPLICATION_ERROR`, {
                    meta: error
                });
            }
            process.exit(1);
        });
    }
});
