import * as mongoose from "mongoose";
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { MongooseFindByReference } = require("mongoose-find-by-reference");
const { dateFormat } = require("../helpers/dateNotTime");
const authorsSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  DateOfBirth: {
    type: Date,
    required: true,
    set: dateFormat,
    get: dateFormat,
  },
  Photo: {
    type: String,
    required: true,
  },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
});

const AuthorModel = mongoose.model("Author", authorsSchema);
export { AuthorModel as Author, authorsSchema };



function validateAuthor(Author: any) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    image: Joi.string().required(),
  });
  return Author;
}


function validateAuthorEdit(Author: any) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50),
    image: Joi.string(),
  });
  return Author;
}


 export{
  validateAuthor,
  validateAuthorEdit,
 }