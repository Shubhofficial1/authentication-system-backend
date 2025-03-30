import { responseMessage } from '../constant/responseMessage.js';
import httpError from '../util/httpError.js';

// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
    res.status(err.statusCode).json(err);
};

const notFound = (req, res, next) => {
    try {
        throw new Error(responseMessage.NOT_FOUND('Route'));
    } catch (err) {
        httpError(next, err, req, 404);
    }
};

export { globalErrorHandler, notFound };
