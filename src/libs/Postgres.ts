import pgMigrate from 'node-pg-migrate';
import { Pool, Client } from 'pg';
import { DatabaseError } from 'pg-protocol';
import { SQLStatement } from 'sql-template-strings';

let pool: Pool | null = null;

const migrate = async () => {
    const connectionString = process.env.DATABASE_URL;
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await client.connect();
        await pgMigrate({
            count: Number.POSITIVE_INFINITY,
            dbClient: client,
            dir: 'src/migrations',
            direction: 'up',
            migrationsTable: 'pgmigrations',
        });
    } catch (error) {
        throw error;
    } finally {
        await client.end();
    }
};

const close = () => {
    if (pool !== null) {
        return pool.end();
    }
};

const getConnectionPool = (connectionString: string): Pool => {
    return new Pool({
        max: 15,
        connectionString,
        ssl: { rejectUnauthorized: false },
    });
};

const getClient = async () => {
    let client;

    if (pool === null) {
        const connectionString = process.env.DATABASE_URL;
        pool = getConnectionPool(connectionString || '');
    }

    try {
        client = await pool.connect();
    } catch (e) {
        const error = e as DatabaseError;

        if (error.routine !== 'auth_failed') {
            throw new Error('Authorization to Postgres failed');
        }

        const connectionString = process.env.DATABASE_URL;

        pool = getConnectionPool(connectionString || '');

        client = await pool.connect();
    }

    return client;
};

const query = async (statement: SQLStatement) => {
    const client = await getClient();

    try {
        return await client.query(statement);
    } catch (error) {
        throw new Error('Error while querying the client');
    } finally {
        client.release();
    }
};

export default {
    query,
    migrate,
    close,
    getClient,
};
