import * as express from "express";
import * as mongoose from "mongoose";
import multer from "multer";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { Book as BookModel } from "../Schemas/books.schema";
import { Author as AuthorModel } from "../Schemas/authors.schema";
import { Category as CategoryModel } from "../Schemas/categories.schema";
import { ObjectId } from "mongodb";
import path from "path";
import {validateBook} from "../Schemas/books.schema";
import {validateBookEdit} from "../Schemas/books.schema";






dotenv.config();
const FilesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Uploads Path: ", path.join(__dirname, "..", "uploads","Books"));
    
    const fieldname = file.fieldname;
    const dir = `./uploads/Books/${fieldname}s`;
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
  if (file.fieldname === 'pdf' && !file.originalname.match(/\.(pdf)$/)) {
    return cb(new Error('Only PDF files are allowed!'), false);
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
  { name: 'file', maxCount: 1 },
  { name: 'image', maxCount: 1 },

];

const uploadFields = upload.fields(fields);



export const BookRouter = express.Router();
BookRouter.use(express.json());


BookRouter.use(express.urlencoded({ extended: true }));

BookRouter.get("/", async (_req, res) => {
  try {
    const Books = await BookModel.find().populate("author").exec();
    res.status(200).send(Books);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});

BookRouter.get("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const Book = await BookModel?.findOne(query).populate("author").populate({
      path: 'reviews',
      populate: {
        path: 'User'
      }
    }).exec();
    console.log("Book --------------------------------------------------",Book);
    Book?.reviews?.forEach((review: any) => {
      review.User.password = undefined;
      review.User.email = undefined;
    })
    if (Book) {
      res.status(200).send(Book);
    } else {
      res.status(404).send(`Failed to find an Book: ID ${id}`);
    }
  } catch (error) {
    console.error(error);
    res.status(404).send(`Failed to find an Book: ID ${req?.params?.id}`);
  }
});

BookRouter.post("/" , uploadFields, async (req, res) => {
  try {
    // console.log("req.body.Book --------------------------------------------------",req.body);
    
    const { name, CoverPhoto, Year, content, Rating, Reviews , authorId,categoryId } = JSON.parse(req.body.Book);
    let author = null;
    let category = null;
    // console.log("name --------------------------------------------------",name);
    

    
  if (authorId ) {
    //get the author
     author = await AuthorModel.findOne({ _id: new ObjectId(authorId) });

  }
  if(categoryId){
    category = await CategoryModel.findOne({ _id: new ObjectId(categoryId) });
  }
    const book = new BookModel({
      _id: req.body.id??new ObjectId(),
      name,
      CoverPhoto,
      Year,
      content,
      Rating,
      Reviews,
      author,
      category
    });
    req.body.id = book._id;
    

    if (req?.files) {
      const files:any = req.files;

      const imageNames = Object.keys(files).map((key) => files['image'][0].filename);
      book['CoverPhoto'] = process.env.BackendServerUrl + 'Books' + '/image/'+book._id;
      // console.log("Book['CoverPhoto'] --------------------------------------------------",Book['CoverPhoto']);

      const pdfNames = Object.keys(files).map((key) => files['file'][0].filename);
      book['content'] = process.env.BackendServerUrl + 'Books' + '/file/'+book._id;
      // console.log("Book['content'] --------------------------------------------------",Book['content']);
      
    }
    
    const result = await book.save();

    if (result) {
      console.log(`Created a new Book: ID ${result.id}.`);

      res.status(201).send({ some: `Created a new Book: ID ${result.id}.` , id: result.id});
    } else {
      console.log("Failed to create a new Book.");
      res.status(500).send("Failed to create a new Book.");
    }
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});

BookRouter.put("/:id", uploadFields, async (req, res) => {
  try {
    const id = req?.params?.id;
    // console.log("req.body --------------------------------------------------",req.body);
    
    const Book =  JSON.parse(req.body.Book);

    if (req?.files) {
      const files:any = req.files;
      console.log("files --------------------------------------------------",files);
      const imageNames = Object.keys(files).map((key) => files['image'][0].filename);
      Book['CoverPhoto'] = process.env.BackendServerUrl + 'Books' + '/image/'+id;
      // console.log("Book['CoverPhoto'] --------------------------------------------------",Book['CoverPhoto']);

      const pdfNames = Object.keys(files).map((key) => files['file'][0].filename);
      Book['content'] = process.env.BackendServerUrl + 'Books' + '/file/'+id;
      // console.log("Book['content'] --------------------------------------------------",Book['content']);
      
    }
    if (Book['authorId']) {
      //get the author
      Book['author'] = await AuthorModel.findOne({ _id: new ObjectId(Book['authorId']) });
  
    }
    if (Book['categoryId']) {
      Book['category'] = await CategoryModel.findOne({ _id: new ObjectId(Book['categoryId']) });
    }
    
    const query = { _id: new ObjectId(id) };
    const result = await BookModel?.updateOne(query, { $set: Book });

    if (result && result.matchedCount) {
      res.status(200).send({ some: `Updated an Book: ID ${id}.`});
    } else if (!result?.matchedCount) {
      res.status(404).send(`Failed to find an Book: ID ${id}`);
    } else {
      res.status(304).send(`Failed to update an Book: ID ${id}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(error);
    res.status(400).send(message);
  }
});

BookRouter.get('/file/:id', (req, res) => {
  const id = req.params.id;
  const pdfPath = path.join(__dirname, "..",'uploads', 'Books','files', `${id}.pdf`);
  console.log(pdfPath);

  if (fs.existsSync(pdfPath)) {
    res.sendFile(pdfPath);
  } else {
    res.status(404).send('PDF file not found');
  }
});

BookRouter.get('/image/:id', (req, res) => {
  const id = req.params.id;
  const imageDir = path.join(__dirname, "..",'uploads', 'Books','images');
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




BookRouter.delete("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const result = await BookModel?.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send({ some: `Removed an Book: ID ${id}` });
    } else if (!result) {
      res.status(400).send({ some: `Failed to remove an Book: ID ${id}` });
    } else if (!result.deletedCount) {
      res.status(404).send({ some: `Failed to find an Book: ID ${id}` });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }
});
