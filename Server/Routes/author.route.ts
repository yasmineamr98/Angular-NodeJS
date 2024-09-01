import * as express from "express";
import { ObjectId } from "mongodb";
import { Author as AuthorModel } from "../Schemas/authors.schema"
import { writeImageToDisk } from "../helpers/image.helper";
import multer from "multer";
import * as fs from "fs";
import * as dotenv from "dotenv";
import * as mongoose from "mongoose";
import path from "path";
import {validateAuthor} from "../Schemas/authors.schema"
import {validateAuthorEdit} from "../Schemas/authors.schema"




dotenv.config();
const FilesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Uploads Path: ", path.join(__dirname, "..", "uploads","Authors"));
    
    const fieldname = file.fieldname;
    const dir = `./uploads/Authors/${fieldname}s`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    let bookId = req.params.id ?? req.body.id;
    if (!bookId) {
      bookId = new mongoose.Types.ObjectId().toString();
      req.body.id = bookId;
    }
    const fileExtension = file.originalname.split('.').pop();
    cb(null, `${bookId}.${fileExtension}`);
  },
});






const fileFilter = (req: any, file: any, cb: any) => {
  if (file.fieldname === 'image' && !file.originalname.match(/\.(jpg|jpeg|png|gif|bmp)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: FilesStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  }
});


const fields = [
  { name: 'image', maxCount: 1 },

];

const uploadFields = upload.fields(fields);



export const AuthorRouter = express.Router();
AuthorRouter.use(express.json());

AuthorRouter.use(express.urlencoded({ extended: true }));

AuthorRouter.get("/", async (_req, res) => {
  try {
    const Authors = await AuthorModel?.find({});
    res.status(200).send(Authors);
  } catch (error) {
    res
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});

AuthorRouter.get("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const Author = await AuthorModel?.findOne(query);

    if (Author) {
      res.status(200).send(Author);
    } else {
      res.status(404).send(`Failed to find an Author: ID ${id}`);
    }
  } catch (error) {
    res.status(404).send(`Failed to find an Author: ID ${req?.params?.id}`);
  }
});

AuthorRouter.get('/image/:id', (req, res) => {
  const id = req.params.id;
  const imageDir = path.join(__dirname, "..",'uploads', 'Authors','images');
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];

  for (const ext of extensions) {
    const imagePath = path.join(imageDir, `${id}${ext}`);
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
      return;
    }
  }

  res.status(404).send('Image file not found');
});

AuthorRouter.post("/",uploadFields, async (req, res) => {
  try {
    const { FirstName, LastName, DateOfBirth, Photo, Books }  = JSON.parse(req.body.Author);

    const Author = new AuthorModel({_id: req.body.id??new ObjectId(), FirstName, LastName, DateOfBirth, Photo, Books });

    if (req?.files) {
      const files:any = req.files;

      const imageNames = Object.keys(files).map((key) => files['image'][0].filename);
      Author.Photo = process.env.BackendServerUrl + 'Authors' + '/image/'+Author._id;
    }

    const result = await Author.save();

    if (result) {
      console.log(`Created a new Author: ID ${result.id}.`);
      
      res
        .status(201)
        .send({ some: `Created a new Author: ID ${result.id}.` });
    } else {
      console.log("Failed to create a new Author.");
      res.status(500).send("Failed to create a new Author.");
    }
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});

AuthorRouter.put("/:id", uploadFields, async (req, res) => {
  try {
    const id = req?.params?.id;
    // console.log("req.body --------------------------------------------------",req.body);
    
    const Author =  JSON.parse(req.body.Author);

    if (req?.files) {
      const files:any = req.files;
      console.log("files --------------------------------------------------",files);
      const imageNames = Object.keys(files).map((key) => files['image'][0].filename);
      Author.Photo = process.env.BackendServerUrl + 'Authors' + '/image/'+id;
      // console.log("Book['CoverPhoto'] --------------------------------------------------",Book['CoverPhoto']);

      
    }

    
    const query = { _id: new ObjectId(id) };
    const result = await AuthorModel?.updateOne(query, { $set: Author });

    if (result && result.matchedCount) {
      res.status(200).send({ some: `Updated an Author: ID ${id}.`});
    } else if (!result?.matchedCount) {
      res.status(404).send({ some:`Failed to find an Author: ID ${id}`});
    } else {
      res.status(304).send({ some:`Failed to update an Author: ID ${id}`});
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(error);
    res.status(400).send(message);
  }
});

AuthorRouter.delete("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const result = await AuthorModel?.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send({ some: `Removed an Author: ID ${id}.` });
    } else if (!result) {
      res.status(400).send({ some: `Failed to remove an Author: ID ${id}.` });
    } else if (!result.deletedCount) {
      res.status(404).send({ some: `Failed to find an Author: ID ${id}.` });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }
});



