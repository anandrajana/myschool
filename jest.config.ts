module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    setupFiles: ['./jest.setup.ts'],
    testTimeout: 30000,
};
