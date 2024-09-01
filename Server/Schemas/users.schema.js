"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersSchema = exports.User = void 0;
var mongoose = require("mongoose");
var usersSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    profilePic: String,

    
});
exports.usersSchema = usersSchema;
var User = mongoose.model("User", usersSchema);
exports.User = User;

function validateUser(User) {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().required(),
      profilePic: Joi.string().required(),
      password: Joi.string(), hash: Joi.string().required()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    });
    return User;
  }

  exports.validateUser;