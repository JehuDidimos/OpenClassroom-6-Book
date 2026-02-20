const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, hashed: true, required: true, select: false}
});

module.exports = mongoose.model('User', userSchema); 