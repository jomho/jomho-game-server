const Bcrypt = require("bcryptjs");
const Crypto = require("crypto");

const validatePassword = (actualPassword, hashedPassword) => {
    return Bcrypt.compareSync(actualPassword, hashedPassword);
}

const randomPassword = (size = 21) => {
    return Crypto
        .randomBytes(size)
        .toString('hex')
        .slice(0, size)
}

const hashPassword = (password) => {
    return new Promise((resolve, reject) =>
        Bcrypt.hash(password, 10, async (error, hash) => {
            if (error) reject(error);
            resolve(hash);
        }));
}
module.exports = {
    validatePassword,
    randomPassword,
    hashPassword,
};