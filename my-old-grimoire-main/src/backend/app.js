const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({dest: "uploads/"});
const Book = require('./models/book');
const User = require('./models/user')


const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://jehudidimos:JehuD4278@openclass.rgfrmow.mongodb.net/?appName=OpenClass')
.then(() => {
    console.log("MongoDB Connected")
}).catch((error) => {
    console.log("Connection Failed:")
    console.error(error)
})

app.get('/api/books/:id', async (req, res) => {
    try{
        const {id} = req.params;

        let book = null;
        book = await Book.findOne({id})
        if(!book){
            res.status(404).json({
                error: "Book Not Found"
            });
        }
        res.status(200).json({data: book});
    } catch (error){
        console.error(error);
        res.status(500).json({error: "Server Error"});
    }
})

app.get('/api/books' ,async (req, res) => {
    let books = await Book.find();
    res.status(200).json({data: books})
});

app.post('/api/books/:id/rating', async (req, res) => {
    const {id} = req.params;
    console.log("TEST")
    console.log(req.body)    
    let book = await Book.findOne({id});
    if(book){
        let ratingObj = {
            userId: req.body.userId,
            grade: req.body.grade
        };
        book.ratings.push(ratingObj);
        await book.save()
        res.status(200).json({data: book});
    } else {
        res.status(404).json({message: "Book Not Found"})
    }
})

app.post('/api/books', upload.single("image"), async(req, res, next) => {

    const bookId = crypto.randomUUID();
    console.log("TEST")
    console.log(req.body)     
    const book = new Book({
        id: bookId,
        userId: req.body.userId, //Only for testing
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