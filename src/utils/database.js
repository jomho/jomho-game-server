const mongoose = require('mongoose');

const createObjectId = (userIdString) => {
    return mongoose.Types.ObjectId(userIdString);
}

module.exports = {
    createObjectId,
}