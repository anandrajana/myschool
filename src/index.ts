import http from 'http';

import Postgres from './libs/Postgres';
import app from './app';
import Logger from './libs/Logger';

const DEFAULT_PORT = 3004;
const PORT = process.env.PORT || DEFAULT_PORT;
const server = http.createServer(app);

server.listen(PORT, init);

process.on('uncaughtException', handleUncaughtException);
process.on('unhandledRejection', handleUnhandledRejection);

async function init() {
    Logger.info('Initializing server');

    Logger.info('Migrating database');
    await Postgres.migrate();

    Logger.info(`Server ready to serve traffic at port ${PORT}`);
}

function handleUncaughtException(error: Error) {
    Logger.error(error, 'Uncaught Exception');
    gracefullyExitProcess();
}

function handleUnhandledRejection(reason?: {} | null) {
    const error = reason || {};
    Logger.error(error, 'Unhandled Rejection');
    gracefullyExitProcess();
}

async function gracefullyExitProcess() {
    Logger.info('Exiting Process');
    await Postgres.close();
    server.close(() => process.exit());
}
