import * as mongoose from "mongoose";
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { MongooseFindByReference } = require("mongoose-find-by-reference");
const { dateFormat } = require("../helpers/dateNotTime");
const booksSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  Rating: {
    type: Number,
    required: true,
  },
  Year: {
    type: Date,
    required: true,
    set: dateFormat,
    get: dateFormat,
  },
  CoverPhoto: {
    type: String,
    required: true,
  },

  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

  author: { type: mongoose.Schema.Types.ObjectId, ref: "Author" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
});
const BookModel = mongoose.model("Book", booksSchema);
export { BookModel as Book, booksSchema };


function validateBook(Book: any) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    author: Joi.string().required(),
    genre: Joi.string().required(),
    image: Joi.string().required(),
  });
  return Book;
}

function validateBookEdit(Book: any) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(50), 
    author: Joi.string(),
    genre: Joi.string(),
    image: Joi.string(),
});
  return Book;
}

export{
  validateBook, 
  validateBookEdit,
};