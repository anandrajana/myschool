import { StatusCodes } from 'http-status-codes';
import BaseError from './BaseError';

export default class BadRequestError extends BaseError {
    statusCode = StatusCodes.BAD_REQUEST;

    constructor(message = 'Bad Request', errorCode = 'BAD_REQUEST_ERROR') {
        super(message, errorCode);
    }
}
