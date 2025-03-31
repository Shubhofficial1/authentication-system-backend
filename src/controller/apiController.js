import httpResponse from '../util/httpResponse.js';
import { responseMessage } from '../constant/responseMessage.js';
import httpError from '../util/httpError.js';
import { getApplicationHealth, getSystemHealth, generateRandomId, generateOtp } from '../util/quicker.js';
import { validateJoiSchema, validateRegisterBody } from '../service/validationService.js';
import { createUser, findUserByConfirmationTokenAndCode, findUserByEmailAddress } from '../service/userServices.js';
import { userRole } from '../constant/application.js';
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
