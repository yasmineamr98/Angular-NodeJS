"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersSchema = exports.User = void 0;
exports.validateUserRegister = validateUserRegister;
exports.validateUserLogin = validateUserLogin;
var mongoose = require("mongoose");
var Joi = require("joi");
var jwt = require("jsonwebtoken");
var usersSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30,
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: function (props) { return "".concat(props.value, " is not a valid email!"); },
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
    },
    profilePic: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: false,
    },
});
exports.usersSchema = usersSchema;
var User = mongoose.model("User", usersSchema);
exports.User = User;
function validateUserRegister(user) {
    var userObject = user.toObject ? user.toObject() : user;
    var userValidationSchema = Joi.object({
        firstName: Joi.string().required().min(3).max(30),
        lastName: Joi.string().required().min(3).max(30),
        email: Joi.string().required(),
        profilePic: Joi.string().required(),
        password: Joi.string().max(30).min(3),
        isAdmin: Joi.boolean().optional(),
        _id: Joi.optional(),
    });
    return userValidationSchema.validate(userObject);
}
function validateUserLogin(user) {
    var userValidationSchema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().max(30).min(3),
    });
    return userValidationSchema.validate(user);
}
