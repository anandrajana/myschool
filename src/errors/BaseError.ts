import { StatusCodes } from 'http-status-codes';

export default class BaseError extends Error {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    errorCode: string;

    constructor(message = 'Something went wrong!', errorCode = 'ERROR') {
        super(message);
        this.errorCode = errorCode;
    }
}
