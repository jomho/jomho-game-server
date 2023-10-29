const {it, describe} = require('node:test');
const assert = require('assert');
const {wrap} = require('../../src/utils/util');

describe('Async Wrapper', () => {
    it('should resolve the promise and return the result', async () => {
        const promise = Promise.resolve('Resolved Value');
        const [error, result] = await wrap(promise);

        assert.strictEqual(error, null);
        assert.strictEqual(result, 'Resolved Value');
    });

    it('should reject the promise and return the error', async () => {
        const promise = Promise.reject(new Error('Rejected Error'));
        const [error, result] = await wrap(promise);

        assert(error instanceof Error);
        assert.strictEqual(result, null);
    });

    it('should work with asynchronous code', async () => {
        const asyncFunction = async () => {
            return 'Async Value';
        };

        const [error, result] = await wrap(asyncFunction());

        assert.strictEqual(error, null);
        assert.strictEqual(result, 'Async Value');
    });
});