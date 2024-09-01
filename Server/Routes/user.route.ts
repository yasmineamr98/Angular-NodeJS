import * as express from "express";
import * as dotenv from "dotenv";
import { ObjectId, UUID } from "mongodb";
import { User as MUser } from "../Schemas/users.schema";
import { writeImageToDisk } from "../helpers/image.helper";
const Joi = require("joi");
const jwt = require("jsonwebtoken");
dotenv.config();
import { validateUser } from "../Schemas/users.schema";

import mongoose from "mongoose";
// import userValidation from "../Schemas/users.schema";
// import { generateAuthToken } from 'auth';

mongoose.set("debug", true);
export const UserRouter = express.Router();
UserRouter.use(express.json());

UserRouter.use(express.urlencoded({ extended: true }));

UserRouter.post("/login/", async (_req, res) => {
  try {
    const { email, password } = _req.body;
    const User = await MUser.findOne({ email: email, password: password });

    // const User = await MUser.findOne({});
    if (User !== null) {
      const token = jwt.sign({ userId: User._id }, "key", {
        expiresIn: "1h",
      });
      //exclude password from response
      User.password = "";
      res.status(200).json({ token: token, User: User });
    } else {
      res.status(404).send(`Failed to find an User: email ${email}`);
    }
  } catch (error) {
    res
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});

UserRouter.get("/ForgetPassword/:email", async (_req, res) => {
  try {
    const User = await MUser.findOne({ email: _req.params.email });
    if (User === null) {
      res.status(404).send(`Failed to find an User: ID ${_req.params.email}`);
    } else {
      res.status(200).send(User);
    }
  } catch (error) {
    res
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});
UserRouter.post("/reset-password/", async (_req, res) => {
  try {
    //gert emai an password from request body
    const { email, password } = _req.body;

    const User = await MUser.findOne({ email: email });
    if (User === null) {
      res.status(404).send(`Failed to find an User: email ${email}`);
    } else {
      User.password = password;
      const result = await User.save();
      res.status(200).send(result);
    }
  } catch (error) {
    res
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});

UserRouter.get("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const User = await MUser.findOne(query);

    if (User) {
      res.status(200).send(User);
    } else {
      res.status(404).send(`Failed to find an User: ID ${id}`);
    }
  } catch (error) {
    res.status(404).send(`Failed to find an User: ID ${req?.params?.id}`);
  }
});

UserRouter.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, password, profilePic } = req.body;
    const user = new MUser({
      firstName,
      lastName,
      email,
      password,
      profilePic,
    });

    user.profilePic = await writeImageToDisk(profilePic, user.id);

    const result = await user.save();

    const token = jwt.sign({ userId: user._id }, "key", {
      expiresIn: "1h",
    });
    res.status(200).json({ token, user });
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
});

UserRouter.put("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const User = req.body;
    User.profilePic = await writeImageToDisk(User.profilePic, id);
    const query = { _id: new ObjectId(id) };
    const result = await MUser?.updateOne(query, { $set: User });

    if (result && result.matchedCount) {
      res.status(200).send({ message: `Updated an User: ID ${id}.` });
    } else if (!result?.matchedCount) {
      res.status(404).send({ message: `Failed to find an User: ID ${id}` });
    } else {
      res.status(304).send({ message: `Failed to update an User: ID ${id}` });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }
});

UserRouter.delete("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const result = await MUser?.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send(`Removed an User: ID ${id}`);
    } else if (!result) {
      res.status(400).send(`Failed to remove an User: ID ${id}`);
    } else if (!result.deletedCount) {
      res.status(404).send(`Failed to find an User: ID ${id}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }

});

  





 



