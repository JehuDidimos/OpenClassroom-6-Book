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

app.delete('/api/books/:id',async (req, res) => {
    try{
        const {id} = req.params

        let book = await Book.findOne({id})
         if(book){
            await book.deleteOne()
            res.status(200).json({
                message: "Book has been deleted"
            })
        } else {
            res.status(404).json({
                message: "Book not found"
            })
        }
    } catch(error){
        console.error(error)
        res.status(503).json({
            message: "Internal Server Error"
        })
    }
})

app.put('/api/books/:id', upload.single("imageUrl") ,async (req, res) => {
    try{
        const updatedBook = req.body;
        const {id} = req.params

        let book = await Book.findOne({id})
         if(book){
            book.title = updatedBook.title
            book.imageUrl = req.file.filename
            book.author = updatedBook.author
            book.genre = updatedBook.genre
            book.year = updatedBook.year
            await book.save()
            res.status(200).json({
                message: "Book has been edited"
            })
        } else {
            res.status(404).json({
                message: "Book not found"
            })
        }
    } catch(error){
        console.error(error)
        res.status(503).json({
            message: "Internal Server Error"
        })
    }
})

app.get('/api/books/bestrating', async (req, res) => {
    let books = await Book.find().sort({averageRating: -1})
    res.status(200).json({data: books.slice(0, 3)})
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
    console.log(req.body)    
    let book = await Book.findOne({id});
    if(book){
        let ratingObj = {
            userId: req.body.userId,
            grade: req.body.grade
        };
        book.ratings.push(ratingObj);
        await book.save()
        const [avg] = await Book.aggregate([
            {$match: {id}},
            {$unwind: "$ratings"},
            {
                $group: {
                    _id: "$id",
                    averageRating: {$avg: "$ratings.grade"}
                }
            }
        ])
        book.averageRating = avg.averageRating;
        book.save();

        console.log(avg)
        
        res.status(200).json({data: book});
    } else {
        res.status(404).json({message: "Book Not Found"})
    }
})

app.post('/api/books', upload.single("imageUrl"), async(req, res, next) => {

    const bookId = crypto.randomUUID();
    console.log("TEST")
    console.log(req.body)     
    const book = new Book({
        id: bookId,
        userId: req.body.userId, //Only for testing
        title: req.body.title,
        author: req.body.author,
        year: req.body.year,
        genre: req.body.genre,
        imageUrl: req.file.filename,
        averageRating: 0
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