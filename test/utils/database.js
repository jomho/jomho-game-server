const {it, describe} = require('node:test');
const assert = require('assert');

const mongoose = require('mongoose');
const {createObjectId} = require('../../src/utils/database');

describe('Object ID Utils', () => {
    it('should create a valid ObjectID', () => {
        const userIdString = '5f4a07b5a7c1444f080b05e9'; // A valid ObjectID string
        const objectId = createObjectId(userIdString);

        assert.strictEqual(objectId instanceof mongoose.Types.ObjectId, true);
    });
});