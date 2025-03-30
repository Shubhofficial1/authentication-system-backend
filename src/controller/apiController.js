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

const register = (req, res) => {
    res.send('Register Endpoint');
};

const confirmation = (req, res) => {
    res.send('Confirmation Endpoint');
};

const login = (req, res) => {
    res.send('Login Endpoint');
};

const selfIdentification = (req, res) => {
    res.send('Self Identification Endpoint');
};

const logout = (req, res) => {
    res.send('Logout Endpoint');
};

const refreshToken = (req, res) => {
    res.send('refreshToken Endpoint');
};

const forgotPassword = (req, res) => {
    res.send('forgotPassword Endpoint');
};

const resetPassword = (req, res) => {
    res.send('resetPassword Endpoint');
};
const changePassword = (req, res) => {
    res.send('changePassword Endpoint');
};

export { self, health, register, confirmation, login, selfIdentification, logout, refreshToken, forgotPassword, resetPassword, changePassword };
