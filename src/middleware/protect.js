import config from '../config/config.js';
import { responseMessage } from '../constant/responseMessage.js';
import { findUserById } from '../service/userServices.js';
import httpError from '../util/httpError.js';
import { verifyToken } from '../util/quicker.js';

export default async (req, res, next) => {
    try {
        const { cookies } = req;
        const { accessToken } = cookies;
        if (accessToken) {
            const { userId } = verifyToken(accessToken, config.ACCESS_TOKEN.SECRET);
            const user = await findUserById(userId);
            if (user) {
                req.authenticatedUser = user;
                return next();
            }
        }
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
    } catch (err) {
        httpError(next, err, req, 500);
    }
};
