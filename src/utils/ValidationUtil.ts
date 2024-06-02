import { Request } from 'express';
import Joi from 'joi';
import Logger from '../libs/Logger';
import BadRequestError from '../errors/BadRequestError';

const doValidate = (
    req: Request,
    schema: Joi.ObjectSchema,
    schemaName: string
) => {
    const validationError = schema.validate(req, { stripUnknown: true }).error;
    if (validationError) {
        Logger.error(validationError, `Error validating ${schemaName} payload`);
        throw new BadRequestError(validationError.message);
    }
};

export default {
    doValidate,
};
