import * as mongoose from "mongoose";

const Joi = require("joi");
const jwt = require("jsonwebtoken");
const usersSchema = new mongoose.Schema({
    firstName: String,
    
    lastName: String,
    email: String,
    password: String,
    profilePic: String,
    isAdmin: Boolean,

  });
  const User = mongoose.model("User", usersSchema);


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

export {
    User,
    usersSchema,
     validateUser,
 };
