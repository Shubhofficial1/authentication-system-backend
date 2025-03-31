const responseMessage = {
    SUCCESS: 'The operation has been successful',
    SOMETHING_WENT_WRONG: 'Something went wrong',
    NOT_FOUND: (entity) => `${entity} not found`,
    TOO_MANY_REQUESTS: 'Too many requests! Please try again after some time',
    ALREADY_EXIST: (entity, identifier) => `${entity} already exists with ${identifier}`,
    INVALID_CONFIRMATION_TOKEN_OR_CODE: 'Invalid acccount confirmation token or code',
    ACCOUNT_ALREADY_CONFIRMED: 'Account already confirmed'
};

export { responseMessage };
