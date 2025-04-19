import httpResponse from '../util/httpResponse.js';
import { responseMessage } from '../constant/responseMessage.js';
import httpError from '../util/httpError.js';
import {
    getApplicationHealth,
    getSystemHealth,
    generateRandomId,
    generateOtp,
    generateToken,
    getDomainFromUrl,
    validateToken,
    generateResetPasswordExpiry
} from '../util/quicker.js';
import {
    validateJoiSchema,
    validateRegisterBody,
    validateLoginBody,
    validateForgotPasswordBody,
    validateResetPasswordBody,
    validateChangePasswordBody
} from '../service/validationService.js';
import {
    createUser,
    findUserByConfirmationTokenAndCode,
    findUserByEmailAddress,
    createRefreshToken,
    deleteRefreshToken,
    findRefreshToken,
    findUserByResetToken,
    findUserById
} from '../service/userServices.js';
import { userRole, applicationEnvironment } from '../constant/application.js';
import config from '../config/config.js';
import sendEmail from '../service/emailService.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);

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

const register = async (req, res, next) => {
    try {
        const { value, error } = validateJoiSchema(validateRegisterBody, req.body);

        if (error) {
            return httpError(next, error, req, 422);
        }

        const { name, emailAddress, password, consent } = value;

        const existingUser = await findUserByEmailAddress(emailAddress);
        if (existingUser) {
            return httpError(next, new Error(responseMessage.ALREADY_EXIST('User', emailAddress)), req, 422);
        }

        const token = generateRandomId();
        const code = generateOtp(6);

        const payload = {
            name,
            emailAddress,
            password,
            accountConfirmation: {
                status: false,
                token,
                code,
                timestamp: null
            },
            passwordReset: {
                token: null,
                expiry: null,
                lastResetAt: null
            },
            lastLoginAt: null,
            role: userRole.USER,
            consent
        };

        const createdUser = await createUser(payload);
        if (!createdUser) {
            return httpError(next, new Error(responseMessage.SOMETHING_WENT_WRONG), req, 400);
        }

        const confirmationUrl = `${config.FRONTEND_URL}/confirmation/${token}?code=${code}`;
        const to = [emailAddress];
        const subject = 'Confirm Your Account';
        const text = `Hey ${name} , Please confirm your acccount by clicking on the link given below\n\n ${confirmationUrl}`;
        sendEmail(to, subject, text);

        httpResponse(req, res, 201, responseMessage.SUCCESS, { _id: createdUser._id });
    } catch (err) {
        httpError(next, err, req, 500);
    }
};

const confirmation = async (req, res, next) => {
    try {
        const { params, query } = req;
        const { token } = params;
        const { code } = query;

        const user = await findUserByConfirmationTokenAndCode(token, code);
        if (!user) {
            return httpError(next, new Error(responseMessage.INVALID_CONFIRMATION_TOKEN_OR_CODE), req, 400);
        }

        if (user.accountConfirmation.status) {
            return httpError(next, new Error(responseMessage.ACCOUNT_ALREADY_CONFIRMED), req, 400);
        }

        user.accountConfirmation.status = true;
        user.accountConfirmation.timestamp = dayjs().utc().toDate();
        await user.save();

        const to = [user.emailAddress];
        const subject = 'Account Confirmed';
        const text = `Hey ${user.name} , Your account has now been confirmed.`;
        sendEmail(to, subject, text);

        httpResponse(req, res, 200, responseMessage.SUCCESS);
    } catch (err) {
        httpError(next, err, req, 500);
    }
};

const login = async (req, res, next) => {
    try {
        const { value, error } = validateJoiSchema(validateLoginBody, req.body);
        if (error) {
            return httpError(next, error, req, 422);
        }

        const { emailAddress, password } = value;
        const user = await findUserByEmailAddress(emailAddress, '+password');
        if (!user) {
            return httpError(next, new Error(responseMessage.NOT_FOUND('user')), req, 404);
        }

        if (!user.accountConfirmation.status) {
            return httpError(next, new Error(responseMessage.ACCOUNT_CONFIRMATION_REQUIRED), req, 400);
        }

        const isValidPassword = await user.matchPassword(password);
        if (!isValidPassword) {
            return httpError(next, new Error(responseMessage.INVALID_EMAIL_OR_PASSWORD), req, 400);
        }

        const accessToken = generateToken({ userId: user._id }, config.ACCESS_TOKEN.SECRET, config.ACCESS_TOKEN.EXPIRY);

        const refreshToken = generateToken({ userId: user._id }, config.REFRESH_TOKEN.SECRET, config.REFRESH_TOKEN.EXPIRY);

        user.lastLoginAt = dayjs().utc().toDate();
        await user.save();
        delete user.password;

        const refreshTokenPayload = {
            token: refreshToken
        };
        await createRefreshToken(refreshTokenPayload);

        const DOMAIN = getDomainFromUrl(config.SERVER_URL);
        res.cookie('accessToken', accessToken, {
            path: '/api/v1',
            domain: DOMAIN,
            sameSite: 'strict',
            maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
            httpOnly: true,
            secure: !(config.ENV == applicationEnvironment.DEVELOPMENT)
        }).cookie('refreshToken', refreshToken, {
            path: '/api/v1',
            domain: DOMAIN,
            sameSite: 'strict',
            maxAge: 1000 * config.REFRESH_TOKEN.EXPIRY,
            httpOnly: true,
            secure: !(config.ENV == applicationEnvironment.DEVELOPMENT)
        });

        httpResponse(req, res, 200, responseMessage.SUCCESS);
    } catch (err) {
        httpError(next, err, req, 500);
    }
};

const selfIdentification = (req, res, next) => {
    try {
        const { authenticatedUser } = req;
        httpResponse(req, res, 200, responseMessage.SUCCESS, authenticatedUser);
    } catch (err) {
        httpError(next, err, req, 500);
    }
};

const logout = async (req, res, next) => {
    try {
        const { cookies } = req;
        const { refreshToken } = cookies;
        if (refreshToken) {
            await deleteRefreshToken(refreshToken);
        }

        const DOMAIN = getDomainFromUrl(config.SERVER_URL);
        const cookieOptions = {
            path: '/api/v1',
            domain: DOMAIN,
            sameSite: 'strict',
            httpOnly: true,
            secure: !(config.ENV === applicationEnvironment.DEVELOPMENT)
        };
        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);

        httpResponse(req, res, 200, responseMessage.SUCCESS);
    } catch (err) {
        return httpError(next, err, req, 500);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { cookies } = req;
        const { refreshToken, accessToken } = cookies;

        if (accessToken) {
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { accessToken });
        }

        if (refreshToken) {
            const rft = await findRefreshToken(refreshToken);

            if (rft) {
                const DOMAIN = getDomainFromUrl(config.SERVER_URL);

                const { userId } = validateToken(refreshToken, config.REFRESH_TOKEN.SECRET);

                const accessToken = generateToken({ userId: userId }, config.ACCESS_TOKEN.SECRET, config.ACCESS_TOKEN.EXPIRY);

                res.cookie('accessToken', accessToken, {
                    path: '/api/v1',
                    domain: DOMAIN,
                    sameSite: 'strict',
                    maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
                    httpOnly: true,
                    secure: !(config.ENV == applicationEnvironment.DEVELOPMENT)
                });
                return httpResponse(req, res, 200, responseMessage.SUCCESS, { accessToken });
            }
        }
        httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
    } catch (err) {
        httpError(next, err, req, 500);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { value, error } = validateJoiSchema(validateForgotPasswordBody, req.body);
        if (error) {
            return httpError(next, error, req, 422);
        }
        const { emailAddress } = value;

        const user = await findUserByEmailAddress(emailAddress);

        if (!user) {
            return httpError(next, new Error(responseMessage.NOT_FOUND('user')), req, 404);
        }

        if (!user.accountConfirmation.status) {
            return httpError(next, new Error(responseMessage.ACCOUNT_CONFIRMATION_REQUIRED), req, 400);
        }

        const token = generateRandomId();
        const expiry = generateResetPasswordExpiry(15);

        user.passwordReset.token = token;
        user.passwordReset.expiry = expiry;
        await user.save();

        const resetUrl = `${config.FRONTEND_URL}/reset-password/${token}`;
        const to = [emailAddress];
        const subject = 'Reset Your Account';
        const text = `Hey ${user.name} , Please reset your account by clicking on the link given below\n\n Link will expire within 15 minutes\n\n ${resetUrl}`;
        sendEmail(to, subject, text);

        httpResponse(req, res, 200, responseMessage.SUCCESS);
    } catch (err) {
        httpError(next, err, req, 500);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { value, error } = validateJoiSchema(validateResetPasswordBody, req.body);
        if (error) {
            return httpError(next, error, req, 422);
        }
        const { newPassword } = value;
        const { params } = req;
        const { token } = params;

        const user = await findUserByResetToken(token);
        if (!user) {
            return httpError(next, new Error(responseMessage.NOT_FOUND('user')), req, 404);
        }

        if (!user.accountConfirmation.status) {
            return httpError(next, new Error(responseMessage.ACCOUNT_CONFIRMATION_REQUIRED), req, 400);
        }

        const storedExpiry = user.passwordReset.expiry;
        const currentTimestamp = dayjs().valueOf();

        if (!storedExpiry) {
            return httpError(next, new Error(responseMessage.INVALID_REQUEST), req, 400);
        }
        if (currentTimestamp > storedExpiry) {
            return httpError(next, new Error(responseMessage.EXPIRED_URL), req, 400);
        }

        user.password = newPassword;
        user.passwordReset.token = null;
        user.passwordReset.expiry = null;
        user.passwordReset.lastResetAt = dayjs().utc().toDate();
        await user.save();

        const to = [user.emailAddress];
        const subject = 'Reset Account Password Successful';
        const text = `Hey ${user.name} , your account password has been reset successfully`;
        sendEmail(to, subject, text);

        httpResponse(req, res, 200, responseMessage.SUCCESS);
    } catch (err) {
        httpError(next, err, req, 500);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { value, error } = validateJoiSchema(validateChangePasswordBody, req.body);
        if (error) {
            return httpError(next, error, req, 422);
        }

        const user = await findUserById(req.authenticatedUser._id, '+password');
        if (!user) {
            return httpError(next, new Error(responseMessage.NOT_FOUND('user')), req, 404);
        }

        const { oldPassword, newPassword } = value;

        const isPasswordMatching = await user.matchPassword(oldPassword);
        if (!isPasswordMatching) {
            return httpError(next, new Error(responseMessage.INVALID_OLD_PASSWORD), req, 404);
        }

        if (newPassword === oldPassword) {
            return httpError(next, new Error(responseMessage.PASSWORD_MATCHING_WITH_OLD_PASSWORD), req, 400);
        }

        user.password = newPassword;
        await user.save();
        delete user.password;

        const to = [user.emailAddress];
        const subject = 'Password changed Successful';
        const text = `Hey ${user.name} , your account password has been changed successfully`;
        sendEmail(to, subject, text);

        httpResponse(req, res, 200, responseMessage.SUCCESS);
    } catch (err) {
        httpError(next, err, req, 500);
    }
};

export { self, health, register, confirmation, login, selfIdentification, logout, refreshToken, forgotPassword, resetPassword, changePassword };
