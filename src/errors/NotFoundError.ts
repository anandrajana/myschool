import { StatusCodes } from 'http-status-codes';
import BaseError from './BaseError';

export default class NotFoundError extends BaseError {
    statusCode = StatusCodes.NOT_FOUND;

    constructor(message = 'Resource not found', errorCode = 'NOT_FOUND_ERROR') {
        super(message, errorCode);
    }
}
