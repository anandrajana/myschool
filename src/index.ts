import http from 'http';

import Postgres from './libs/Postgres';
import app from './app';
import Logger from './libs/Logger';

const DEFAULT_PORT = 3004;
const PORT = process.env.PORT || DEFAULT_PORT;
const server = http.createServer(app);

const init = async () => {
    Logger.info('Initializing server');

    Logger.info('Migrating database');
    await Postgres.migrate();

    Logger.info(`Server ready to serve traffic at port ${PORT}`);
};

const gracefullyExitProcess = async () => {
    Logger.info('Exiting Process');
    await Postgres.close();
    server.close(() => process.exit());
};

const handleUncaughtException = (error: Error) => {
    Logger.error(error, 'Uncaught Exception');
    gracefullyExitProcess();
};

const handleUnhandledRejection = (reason?: {} | null) => {
    const error = reason || {};
    Logger.error(error, 'Unhandled Rejection');
    gracefullyExitProcess();
};

server.listen(PORT, init);

process.on('uncaughtException', handleUncaughtException);
process.on('unhandledRejection', handleUnhandledRejection);
