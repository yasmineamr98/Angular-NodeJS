import * as mongoose from "mongoose";

const reviewsSchema = new mongoose.Schema({

  Title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  Rating: {
    type: Number,
    required: true,},

  User: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  UserImage: { type: String },
 


});
const ReviewModel = mongoose.model('Review', reviewsSchema);
export {
    ReviewModel,
    reviewsSchema 
 };
