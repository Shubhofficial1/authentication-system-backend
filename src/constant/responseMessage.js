const responseMessage = {
    SUCCESS: 'The operation has been successful',
    SOMETHING_WENT_WRONG: 'Something went wrong',
    NOT_FOUND: (entity) => `${entity} not found`,
    TOO_MANY_REQUESTS: 'Too many requests! Please try again after some time',
    ALREADY_EXIST: (entity, identifier) => `${entity} already exists with ${identifier}`,
    INVALID_CONFIRMATION_TOKEN_OR_CODE: 'Invalid acccount confirmation token or code',
    ACCOUNT_ALREADY_CONFIRMED: 'Account already confirmed',
    ACCOUNT_CONFIRMATION_REQUIRED: 'Account not confirmed',
    INVALID_EMAIL_OR_PASSWORD: 'Invalid email address or password',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    EXPIRED_URL: 'Your password reset url is expired',
    INVALID_REQUEST: 'Invalid request'
};

export { responseMessage };
