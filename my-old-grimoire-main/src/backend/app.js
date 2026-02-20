const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({dest: "uploads/"});
const Book = require('./models/book');
const User = require('./models/user')


const app = express();

mongoose.connect('mongodb+srv://jehudidimos:JehuD4278@openclass.rgfrmow.mongodb.net/?appName=OpenClass')
.then(() => {
    console.log("MongoDB Connected")
}).catch((error) => {
    console.log("Connection Failed:")
    console.error(error)
})

app.post('/api/books', upload.single("image"), async(req, res, next) => {
    const book = new Book({
        userId: "123",
        title: req.body.title,
        imageUrl: req.file.filename
    });

    book.save().then(() => {
        res.status(201).json({
            message: "Book Saved"
        })
    }).catch((error) =>{
        res.status(400).json({
            error: error
        })
    })
});


module.exports = app;