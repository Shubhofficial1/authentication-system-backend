import config from '../config/config.js';
import { responseMessage } from '../constant/responseMessage.js';
import { findUserById } from '../service/userServices.js';
import httpError from '../util/httpError.js';
import { validateToken } from '../util/quicker.js';

export default async (req, res, next) => {
    try {
        const { cookies } = req;
        const { accessToken } = cookies;
        if (accessToken) {
            const { userId } = validateToken(accessToken, config.ACCESS_TOKEN.SECRET);
            const user = await findUserById(userId);
            if (user) {
                req.authenticatedUser = user;
                return next();
            }
        }
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 400);
    } catch (err) {
        httpError(next, err, req, 500);
    }
};
