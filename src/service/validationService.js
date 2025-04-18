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

export const validateJoiSchema = (schema, value) => {
    const result = schema.validate(value);
    return {
        value: result.value,
        error: result.error
    };
};
