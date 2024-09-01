import * as express from "express";
import { ObjectId } from "mongodb";
import { ReviewModel } from "../Schemas/reviews.schema"
import { Book as BookModel } from "../Schemas/books.schema"
import mongoose from "mongoose";

export const ReviewRouter = express.Router();
ReviewRouter.use(express.json());

ReviewRouter.use(express.urlencoded({ extended: true }));

ReviewRouter.get("/", async (_req, res) => {
  try {
    const Reviews = await ReviewModel?.find({});
    res.status(200).send(Reviews);
  } catch (error) {
    res
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});

ReviewRouter.get("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const Review = await ReviewModel?.findOne(query);

    if (Review) {
      res.status(200).send(Review);
    } else {
      res.status(404).send(`Failed to find an Review: ID ${id}`);
    }
  } catch (error) {
    res.status(404).send(`Failed to find an Review: ID ${req?.params?.id}`);
  }
});

ReviewRouter.post("/:id", async (req, res) => {
  try {
    const { Title, content, Rating, User } = req.body;
    const id = req?.params?.id;
    console.log('Request:', req.body);

    // Validate id
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }

    const Review = new ReviewModel({ Title, content, Rating, User });
    const result = await Review.save();

    // Log the saved review ID
    console.log(`Created a new Review: ID ${result.id}.`);

    // Validate if book exists before updating
    const bookExists = await BookModel.exists({ _id: id });
    if (!bookExists) {
      throw new Error(`Book with ID ${id} does not exist`);
    }

    // Log the schema and connection details
    // console.log('BookModel Schema:', BookModel.schema);
    // console.log('Database Connection:', mongoose.connection.readyState);

    // Ensure the Reviews field is initialized as an array if it's null or undefined
    const result3=  await BookModel.updateOne({ _id: new ObjectId(id), reviews: { $exists: false } }, { $set: { reviews: [] } });
    console.log(`Update Result: ${JSON.stringify(result3)}`);
    
    // Add the id of the review to the book
    const query = { _id: new ObjectId(id) };
    const update = { $push: { reviews: result._id } };
    const result2 = await BookModel.updateOne(query, update);

    console.log(`Update Result: ${JSON.stringify(result2)}`);

    if (result2.acknowledged) {
      res.status(201).send({ message: `Created a new Review: ID ${result.id}.` });
    } else {
      throw new Error('Failed to update the book with the new review ID');
    }
  } catch (error) {
    console.error(error);
    res.status(400).send(error instanceof Error ? error.message : "Unknown error");
  }
});

ReviewRouter.put("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const Review = req.body;
    const query = { _id: new ObjectId(id) };
    const result = await ReviewModel?.updateOne(query, { $set: Review });

    if (result && result.matchedCount) {
      res.status(200).send(`Updated an Review: ID ${id}.`);
    } else if (!result?.matchedCount) {
      res.status(404).send(`Failed to find an Review: ID ${id}`);
    } else {
      res.status(304).send(`Failed to update an Review: ID ${id}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }
});

ReviewRouter.delete("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const result = await ReviewModel?.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send(`Removed an Review: ID ${id}`);
    } else if (!result) {
      res.status(400).send(`Failed to remove an Review: ID ${id}`);
    } else if (!result.deletedCount) {
      res.status(404).send(`Failed to find an Review: ID ${id}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }
});
