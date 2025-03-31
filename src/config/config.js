import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();

export default {
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    SERVER_URL: process.env.SERVER_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    MIGRATE_MONGO_URL: process.env.MIGRATE_MONGO_URL,
    MIGRATE_AUTOSYNC: process.env.MIGRATE_AUTOSYNC,
    DISABLE_LOGS: process.env.DISABLE_LOGS,
    FRONTEND_URL: process.env.FRONTEND_URL,
    EMAIL_SERVICE_API_KEY: process.env.EMAIL_SERVICE_API_KEY
};
