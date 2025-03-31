import User from '../model/userModel.js';

const findUserByEmailAddress = (emailAddress) => {
    return User.findOne({ emailAddress });
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
export { findUserByEmailAddress, createUser, findUserByConfirmationTokenAndCode };
