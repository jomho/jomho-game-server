const mongoose = require('mongoose');
const encrypt = require("../utils/encrypt");

const {Schema} = mongoose;

const UserSchema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },
        changedName: {
            type: Boolean,
            required: true,
            default: false,
        },
        registered: {
            type: Boolean,
            required: true,
            default: false,
        },
        email: {
            type: String,
            required: false,
        },
        password: {
            type: String,
            required: true,
        },
        useragent: {
            type: JSON,
            required: false,
        },
        location: {
            type: JSON,
            required: false,
        },
    },
    {timestamps: true},
);

UserSchema.statics.getById = async function (userId) {
    return await this.findById(userId).exec();
};

UserSchema.statics.getByUsername = async function (username) {
    return await this.findOne({username}).exec()
};

UserSchema.statics.getAll = async function () {
    return await this.find({}).exec();
};

UserSchema.statics.isUsernameUnique = async function (username) {
    return !!await this.findOne({username}).exec();
};

UserSchema.statics.isEmailUnique = async function (email) {
    return !!await User.findOne({email}).exec();
};

UserSchema.statics.validatePassword = async function (hashedPassword, actualPassword) {
    encrypt.validatePassword(hashedPassword, actualPassword)
};

module.exports = mongoose.model('User', UserSchema);