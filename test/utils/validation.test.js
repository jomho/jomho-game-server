const {it, describe} = require('node:test');
const assert = require('assert');
const {password, username, email} = require('../../src/utils/validate');

describe('Password Validation', () => {
    it('should return an error for an empty password', () => {
        const result = password('');
        assert.deepStrictEqual(result, ['Password no length.', 'Password must be at least 5 characters.']);
    });

    it('should return an error for too short of a password', () => {
        const result = password('1234');
        assert.deepStrictEqual(result, ['Password must be at least 5 characters.']);
    });

    it('should return an error for too long of a password', () => {
        const result = password('123456789012345678901');
        assert.deepStrictEqual(result, ['Password must be 20 characters or less.']);
    });

    it('should return an empty array for a valid password', () => {
        const result = password('validPassword123');
        assert.deepStrictEqual(result, []);
    });
});

describe('Username Validation', () => {
    it('should return an error for an empty username', () => {
        const result = username('');
        assert.deepStrictEqual(result, ['Username no length.', 'Username must be at least 5 characters.']);
    });

    it('should return an error for a short username', () => {
        const result = username('abc');
        assert.deepStrictEqual(result, ['Username must be at least 5 characters.']);
    });

    it('should return an error for a long username', () => {
        const result = username('abcdefghijklmnopqrstuvwxyz123456');
        assert.deepStrictEqual(result, ['Username must be 20 characters or less.']);
    });

    it('should return an error for an invalid username', () => {
        const result = username('user@name');
        assert.deepStrictEqual(result, ['Username can only contain alphanumeric characters and hyphens']);
    });

    it('should return an empty array for a valid username', () => {
        const result = username('valid-username123');
        assert.deepStrictEqual(result, []);
    });
});

describe('Email Validation', () => {
    it('should return true for a valid email', () => {
        const result = email('test@example.com');
        assert.strictEqual(result, true);
    });

    it('should return false for an invalid email', () => {
        const result = email('invalid-email');
        assert.strictEqual(result, false);
    });
});