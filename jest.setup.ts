jest.mock('pino', () => {
    return jest.fn().mockImplementation(() => ({
        info: jest.fn(),
        fatal: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
    }));
});
