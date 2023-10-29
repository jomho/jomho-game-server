const { it, describe, afterEach } = require('node:test');
const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const mockLogger = {
    info: sinon.stub(),
    error: sinon.stub(),
};

const mockLeaderboard = {
    new: sinon.stub(),
    create: sinon.stub(),
    getAll: sinon.stub(),
    getByName: sinon.stub(),
    getEntry: sinon.stub(),
};

const mockUser = {
    getById: sinon.stub(),
    validatePassword: sinon.stub(),
};

let mongooseMock = {
    model: (modelName) => {
        if (modelName === 'Leaderboard') {
            return mockLeaderboard;
        }
        if (modelName === 'User') {
            return mockUser;
        }
    },
};

const leaderboardController = proxyquire('../../src/controllers/leaderboard', {
    mongoose: mongooseMock,
    '../config/logger': mockLogger,
});

describe('Leaderboard Controller - getAll', () => {
    afterEach(() => {
        sinon.reset();
    });

    it('should get all leaderboards successfully', async () => {
        const mockLeaderboards = [{ name: 'Leaderboard1' }, { name: 'Leaderboard2' }];
        mockLeaderboard.getAll.resolves(mockLeaderboards);

        const req = {};
        const res = {
            json: (data) => {
                assert.deepStrictEqual(data, mockLeaderboards);
            },
            status: (code) => {
                return res;
            },
        };

        await leaderboardController.getAll(req, res);

        sinon.assert.calledOnce(mockLeaderboard.getAll);
    });

    it('should handle an error during getAll', async () => {
        const error = new Error('Database error.');
        mockLeaderboard.getAll.rejects(error);

        const req = {};
        const res = {
            status: (code) => {
                return {
                    json: (data) => {
                        assert.deepStrictEqual(data, { error: 'Database error.' });
                    },
                };
            },
        };

        await leaderboardController.getAll(req, res);

        // Assertions
        sinon.assert.calledOnce(mockLeaderboard.getAll);
    });
});

describe('Leaderboard Controller - get', () => {
    afterEach(() => {
        sinon.reset();
    });

    it('should get a leaderboard successfully', async () => {
        const leaderboardName = 'Leaderboard1';
        const mockLeaderboardData = { name: leaderboardName };
        mockLeaderboard.getByName.resolves(mockLeaderboardData);

        const req = { params: { leaderboard: leaderboardName } };
        const res = {
            json: (data) => {
                assert.deepStrictEqual(data, { leaderboard: mockLeaderboardData });
            },
            status: (code) => {
                return res;
            },
        };

        await leaderboardController.get(req, res);

        // Assertions
        sinon.assert.calledOnce(mockLeaderboard.getByName);
    });

    it('should handle an error during get', async () => {
        const leaderboardName = 'Leaderboard1';
        const error = new Error('Database error.');
        mockLeaderboard.getByName.rejects(error);

        const req = { params: { leaderboard: leaderboardName } };
        const res = {
            status: (code) => {
                return {
                    json: (data) => {
                        assert.deepStrictEqual(data, { error: 'Database error.' });
                    },
                };
            },
        };

        await leaderboardController.get(req, res);

        // Assertions
        sinon.assert.calledOnce(mockLeaderboard.getByName);
        sinon.assert.calledOnce(mockLogger.error);
        sinon.assert.calledWith(mockLogger.error, `Could not get leaderboard "${leaderboardName}"`, error);
    });
});
