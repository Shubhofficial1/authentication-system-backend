import config from '../config/config.js';
import { applicationEnvironment } from '../constant/application.js';
import logger from './logger.js';

export default (req, res, responseStatusCode, responseMessage, data = null) => {
    const response = {
        success: true,
        statusCode: responseStatusCode,
        request: {
            ip: req.ip || null,
            method: req.method,
            url: req.originalUrl
        },
        message: responseMessage,
        data: data
    };

    logger.info(`CONTROLLER_RESPONSE`, {
        meta: response
    });

    if (config.ENV === applicationEnvironment.PRODUCTION) {
        delete response.request.ip;
    }

    res.status(responseStatusCode).json(response);
};
