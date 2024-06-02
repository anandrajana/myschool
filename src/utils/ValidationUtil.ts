import { Request } from 'express';
import Joi from 'joi';
import Logger from '../libs/Logger';

const doValidate = (
    req: Request,
    schema: Joi.ObjectSchema,
    schemaName: string
) => {
    const validationError = schema.validate(req, { stripUnknown: true }).error;
    if (validationError) {
        Logger.error(validationError, `Error validating ${schemaName} payload`);
        throw new Error(validationError.message);
    }
};

export default {
    doValidate,
};
