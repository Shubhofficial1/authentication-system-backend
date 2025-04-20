import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();

export default {
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    SERVER_URL: process.env.SERVER_URL,
    ORIGIN: process.env.ORIGIN,
    DATABASE_URL: process.env.DATABASE_URL,
    MIGRATE_MONGO_URL: process.env.MIGRATE_MONGO_URL,
    MIGRATE_AUTOSYNC: process.env.MIGRATE_AUTOSYNC,
    DISABLE_LOGS: process.env.DISABLE_LOGS,
    FRONTEND_URL: process.env.FRONTEND_URL,
    EMAIL_SERVICE_API_KEY: process.env.EMAIL_SERVICE_API_KEY,
    ACCESS_TOKEN: {
        SECRET: process.env.ACCESS_TOKEN_SECRET,
        EXPIRY: 3600
    },
    REFRESH_TOKEN: {
        SECRET: process.env.REFRESH_TOKEN_SECRET,
        EXPIRY: 3600 * 24 * 365
    }
};
