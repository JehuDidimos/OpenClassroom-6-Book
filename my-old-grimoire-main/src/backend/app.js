const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const Book = require("./models/book");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const auth = require("./auth")

const app = express();
app.use(express.json());

//TODO Encrypt Passwords

mongoose
  .connect(
    "mongodb+srv://jehudidimos:JehuD4278@openclass.rgfrmow.mongodb.net/?appName=OpenClass",
  )
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log("Connection Failed:");
    console.error(error);
  });

  app.post("/api/auth/login", async (req, res) => {
    const {email, password} = req.body;
    try{
      const user = await User.findOne({email}).select("+password");
      if(!user){
        return res.status(401).json({message: "Email does not exist, create a new account."})
      }
      console.log(user)
      console.log(password)
      if(user.password !== password){
        return res.status(401).json({message: "Invalid Login"});
      }
      const token = jwt.sign(
        {userId: user._id, email: user.email},
        "SECRET",
        {expiresIn: "24h"}
      )

      res.status(200).json({
        message: "Login Successful",
        token
      })
    } catch (error){
      console.error(error)
      res.status(500).json({error: error})
    }
  })

app.delete("/api/books/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    let book = await Book.findOne({ id });
    if (book) {
      await book.deleteOne();
      res.status(200).json({
        message: "Book has been deleted",
      });
    } else {
      res.status(404).json({
        message: "Book not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(503).json({
      message: "Internal Server Error",
    });
  }
});

app.put("/api/books/:id", auth, upload.single("imageUrl"), async (req, res) => {
  try {
    const updatedBook = req.body;
    const { id } = req.params;

    let book = await Book.findOne({ id });
    if (book) {
      book.title = updatedBook.title;
      book.imageUrl = req.file.filename;
      book.author = updatedBook.author;
      book.genre = updatedBook.genre;
      book.year = updatedBook.year;
      await book.save();
      res.status(200).json({
        message: "Book has been edited",
      });
    } else {
      res.status(404).json({
        message: "Book not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(503).json({
      message: "Internal Server Error",
    });
  }
});

app.get("/api/books/bestrating", async (req, res) => {
  let books = await Book.find().sort({ averageRating: -1 });
  res.status(200).json({ data: books.slice(0, 3) });
});

app.get("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let book = null;
    book = await Book.findOne({ id });
    if (!book) {
      res.status(404).json({
        error: "Book Not Found",
      });
    }
    res.status(200).json({ data: book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/api/books", async (req, res) => {
  let books = await Book.find();
  res.status(200).json({ data: books });
});

app.post("/api/books/:id/rating", auth,  async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  let book = await Book.findOne({ id });
  if (book) {
    let ratingObj = {
      userId: req.body.userId,
      grade: req.body.grade,
    };
    book.ratings.push(ratingObj);
    await book.save();
    const [avg] = await Book.aggregate([
      { $match: { id } },
      { $unwind: "$ratings" },
      {
        $group: {
          _id: "$id",
          averageRating: { $avg: "$ratings.grade" },
        },
      },
    ]);
    book.averageRating = avg.averageRating;
    book.save();

    console.log(avg);

    res.status(200).json({ data: book });
  } else {
    res.status(404).json({ message: "Book Not Found" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  let user = await User.findOne({ email });
  if (user) {
    res.status(200).json({
      message: "User already exists",
    });
  } else {
    const newUser = new User({
      email: email,
      password: req.body.password,
    });

    await newUser
      .save()
      .then(() => {
        res.status(201).json({
          message: "User created",
        });
      })
      .catch((error) => {
        res.status(400).json({
          message: "Server Error",
        });
      });
    user.save().then(() => {
      res.status(201).json({
        error: error,
      });
    });
  }
});

app.post("/api/books", auth, upload.single("imageUrl"), async (req, res, next) => {
  const bookId = crypto.randomUUID();
  console.log("TEST");
  console.log(req.body);
  const book = new Book({
    id: bookId,
    userId: req.body.userId, //Only for testing
    title: req.body.title,
    author: req.body.author,
    year: req.body.year,
    genre: req.body.genre,
    imageUrl: req.file.filename,
    averageRating: 0,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({
        message: "Book Saved",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
});

module.exports = app;
