import config from '../config/config.js';
import { applicationEnvironment } from '../constant/application.js';
import { rateLimiterMongo } from '../config/rateLimiter.js';
import httpError from '../util/httpError.js';
import { responseMessage } from '../constant/responseMessage.js';

export default (req, res, next) => {
    if (config.ENV === applicationEnvironment.DEVELOPMENT) {
        return next();
    }

    if (rateLimiterMongo) {
        rateLimiterMongo
            .consume(req.ip, 1)
            .then(() => {
                next();
            })
            .catch(() => {
                httpError(next, new Error(responseMessage.TOO_MANY_REQUESTS), req, 429);
            });
    }
};
