import * as mongoose from "mongoose";

import * as Joi from "joi";
const jwt = require("jsonwebtoken");
const usersSchema = new mongoose.Schema({
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
      validator: function (v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props: any) => `${props.value} is not a valid email!`,
    },
    unique: true,
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
  const User = mongoose.model("User", usersSchema);

function validateUserRegister(user: any) {
  const userObject = user.toObject ? user.toObject() : user;

   const userValidationSchema = Joi.object({
    
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

function validateUserLogin(user: any) {
  const userValidationSchema = Joi.object({
     email: Joi.string().required(),
     password: Joi.string().max(30).min(3),
   });

   return userValidationSchema.validate(user);
}
 
    
  

export {
    User,
    usersSchema,
    validateUserRegister,
    validateUserLogin
 };
