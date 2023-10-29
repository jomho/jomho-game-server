const password = (password) => {
    const error = [];
    if (!password?.length) error.push('Password no length.');
    if (password?.length < 5) error.push('Password must be at least 5 characters.');
    if (password?.length > 20) error.push('Password must be 20 characters or less.');
    return error;
}

const username = (username) => {
    const error = [];
    if (!username?.length) error.push('Username no length.');
    if (username?.length < 5) error.push('Username must be at least 5 characters.');
    if (username?.length > 20) error.push('Username must be 20 characters or less.');
    if (!/^[A-Za-z0-9\-]*$/.test(username)) error.push('Username can only contain alphanumeric characters and hyphens');

    return error;
}

const email = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

module.exports = {
    password,
    username,
    email,
};