const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    id: {type: String, unique: true, required: true},
    userId: {type: String, unique: true, required: true},
    title: {type: String},
    author: {type: String},
    imageUrl: {type: String},
    year: {type: Number},
    genre: {type: String},
    ratings: [
        {
            userId: {type: String, required: true},
            grade: {type: Number}
        }
    ],
    averageRating: {type: Number}
});

module.exports = mongoose.model('Book', bookSchema)