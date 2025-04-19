import joi from 'joi';

export const validateRegisterBody = joi.object({
    name: joi.string().min(2).max(72).trim().required(),
    emailAddress: joi.string().email().required(),
    password: joi.string().min(8).max(24).trim().required(),
    consent: joi.boolean().valid(true).required()
});

export const validateLoginBody = joi.object({
    emailAddress: joi.string().email().required(),
    password: joi.string().min(8).max(24).trim().required()
});

export const validateForgotPasswordBody = joi.object({
    emailAddress: joi.string().email().required()
});

export const validateResetPasswordBody = joi.object({
    newPassword: joi.string().min(8).max(24).trim().required()
});

export const validateChangePasswordBody = joi.object({
    oldPassword: joi.string().min(8).max(24).trim().required(),
    newPassword: joi.string().min(8).max(24).trim().required(),
    confirmNewPassword: joi.string().min(8).max(24).trim().valid(joi.ref('newPassword')).required()
});

export const validateJoiSchema = (schema, value) => {
    const result = schema.validate(value);
    return {
        value: result.value,
        error: result.error
    };
};
