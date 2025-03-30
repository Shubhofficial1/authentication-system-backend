import httpResponse from '../util/httpResponse.js';
import { responseMessage } from '../constant/responseMessage.js';
import httpError from '../util/httpError.js';
import { getApplicationHealth, getSystemHealth } from '../util/quicker.js';

const self = (req, res, next) => {
    try {
        httpResponse(req, res, 200, responseMessage.SUCCESS);
    } catch (err) {
        httpError(next, err, req, 500);
    }
};

const health = (req, res, next) => {
    try {
        const healthData = {
            application: getApplicationHealth(),
            system: getSystemHealth(),
            timestamp: Date.now()
        };
        httpResponse(req, res, 200, responseMessage.SUCCESS, healthData);
    } catch (err) {
        httpError(next, err, req, 500);
    }
};

export { self, health };
