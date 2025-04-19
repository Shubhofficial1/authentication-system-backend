import User from '../model/userModel.js';
import RefreshToken from '../model/refreshTokenModel.js';

const findUserByEmailAddress = (emailAddress, select = '') => {
    return User.findOne({ emailAddress }).select(select);
};

const findUserById = (id) => {
    return User.findById(id);
};

const findUserByResetToken = (token) => {
    return User.findOne({ 'passwordReset.token': token });
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

const deleteRefreshToken = (token) => {
    return RefreshToken.deleteOne({ token: token });
};

const findRefreshToken = (token) => {
    return RefreshToken.findOne({ token: token });
};

export {
    findUserByEmailAddress,
    findUserById,
    createUser,
    findUserByConfirmationTokenAndCode,
    createRefreshToken,
    deleteRefreshToken,
    findRefreshToken,
    findUserByResetToken
};
