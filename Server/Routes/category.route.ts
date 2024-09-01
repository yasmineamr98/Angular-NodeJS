import * as express from "express";
import { ObjectId } from "mongodb";
import { Category as CategoryModel } from "../Schemas/categories.schema"
import multer from "multer";
import { Book as BookModel } from "../Schemas/books.schema"
export const CategoryRouter = express.Router();
CategoryRouter.use(express.json());

const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes("image")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

CategoryRouter.use(express.urlencoded({ extended: true }));

CategoryRouter.get("/", async (_req, res) => {
  try {
    const Categorys = await CategoryModel?.find({});
    res.status(200).send(Categorys);
  } catch (error) {
    res
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});

CategoryRouter.get("/:name", async (req, res) => {
  try {
    console.log(req?.params?.name);
    const name = req?.params?.name;
    const query = { name: name };
    const Category = await CategoryModel?.findOne(query);
    //get the books from the category
    const Books = await BookModel?.find({ category: Category?._id }).populate( "author").exec();
    

    if (Books) {
      res.status(200).send(Books);
    
    } else {
      res.status(404).send(`Failed to find Books for category ${name}`);
      
    }
  } catch (error) {
    console.error(error);
    res.status(404).send(`Failed to find Books for category`);
    
  }
});

CategoryRouter.post("/",upload.none(), async (req, res) => {
  try {
    const Category = JSON.parse(req.body.category);
    console.log(req);
    const category = new CategoryModel(Category);
    const result = await category.save();

    if (result) {
      console.log(`Created a new Category: ID ${result.id}.`);
      
      res
        .status(201)
        .send({ some: `Created a new Category: ID ${result.id}.` });
    } else {
      console.log("Failed to create a new Category.");
      res.status(500).send({some:`Failed to create a new Category.`});
    }
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});

CategoryRouter.put("/:id",upload.none(), async (req, res) => {
  try {
    console.log(req.body);
    const id = req?.params?.id;
    const Category = JSON.parse(req.body.category);
    const query = { _id: new ObjectId(id) };
    const result = await CategoryModel?.updateOne(query, { $set: Category });

    if (result && result.matchedCount) {
      res.status(200).send({some:`Updated an Category: ID ${id}`});
    } else if (!result?.matchedCount) {
      res.status(404).send({some:`Failed to find an Category: ID ${id}`});
    } else {
      res.status(304).send({some:`Failed to update an Category: ID ${id}`});
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }
});

CategoryRouter.delete("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const result = await CategoryModel?.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send({some:`Removed an Category: ID ${id}`});
    } else if (!result) {
      res.status(400).send({some:`Failed to remove an Category: ID ${id}`});
    } else if (!result.deletedCount) {
      res.status(404).send({some:`Failed to find an Category: ID ${id}`});
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }
});
