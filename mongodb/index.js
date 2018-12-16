const mongoose = require('mongoose')

const User = mongoose.model('User',{
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, trim: true},
    password: {type: String},
    mail: {type: String, trim: true},
    profilePicture: { type: mongoose.Schema.Types.ObjectId, ref: 'Media'},
    gender: {type: String},
    birth: {
        date: Date,
        place: String
    },
    work: {type: String},
    loveSituation: {type: String},
    hobbies: [{type: String}],
    sports: [{type: String}],
    books: [{type: mongoose.Schema.Types.ObjectId, ref: 'Book'}]
}, 'user' )

const Book = mongoose.model('Book', {
    _id: mongoose.Schema.Types.ObjectId,
    title: {type: String, trim: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    content: {type: String, trim: true},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    medias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
    date: {type: Date},
    createdAt: {type: Date, default: new Date()}
}, 'book')

const Media = mongoose.model('Media',{
    _id: mongoose.Schema.Types.ObjectId,
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    src: String,
}, 'media')

const Comment = mongoose.model('Comment', {
    _id: mongoose.Schema.Types.ObjectId,
    book: {type: mongoose.Schema.Types.ObjectId, ref: 'Book'},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    content: {type: String, trim: true},
    date: {type: Date, default: new Date()}
}, 'comment')

const schemas = {
    User,
    Book,
    Media,
    Comment
}

module.exports = schemas