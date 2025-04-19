import User from '../model/userModel.js';
import RefreshToken from '../model/refreshTokenModel.js';

const findUserByEmailAddress = (emailAddress, select = '') => {
    return User.findOne({ emailAddress }).select(select);
};

const findUserById = (id) => {
    return User.findById(id);
};

const createUser = (payload) => {
    return User.create(payload);
};

const findUserByConfirmationTokenAndCode = (token, code) => {
    return User.findOne({
        'accountConfirmation.token': token,
        'accountConfirmation.code': code
    });
};

const createRefreshToken = (payload) => {
    return RefreshToken.create(payload);
};
export { findUserByEmailAddress, findUserById, createUser, findUserByConfirmationTokenAndCode, createRefreshToken };
