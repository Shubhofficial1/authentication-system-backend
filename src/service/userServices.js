import User from '../model/userModel.js';

const findUserByEmailAddress = (emailAddress) => {
    return User.findOne({ emailAddress });
};

const createUser = (payload) => {
    return User.create(payload);
};

export { findUserByEmailAddress, createUser };
