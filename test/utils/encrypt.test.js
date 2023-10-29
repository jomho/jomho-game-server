const {it, describe} = require('node:test');
const assert = require('assert');
const {validatePassword, randomPassword, hashPassword} = require('../../src/utils/encrypt');

describe('Password Utils', () => {
    it('should validate a correct password', () => {
        const actualPassword = '$2y$10$oD2bcO5WryICLw4On8/c9.gCqSV4Q1dWq7QliyZebJw0SyVW.W0ee';
        const hashedPassword = 'password123';

        const result = validatePassword(hashedPassword, actualPassword);
        assert.strictEqual(result, true);
    });

    it('should validate an incorrect password', () => {
        const hashedPassword = '$2a$10$oCYK0cqHFy3dzTq6PXHnX.2ABdVvHKy9lF4OKHR6C8Hg0IJZPh9p2';
        const actualPassword = 'incorrectpassword';

        const result = validatePassword(hashedPassword, actualPassword);
        assert.strictEqual(result, false);
    });

    it('should generate a random password', () => {
        const result = randomPassword(12);
        assert.strictEqual(result.length, 12);
    });

    it('should hash a password', async () => {
        const password = 'password123';
        const hashedPassword = await hashPassword(password);

        assert(hashedPassword.startsWith('$2a$10$'));
    });
});