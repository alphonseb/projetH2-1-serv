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
    city: String,
    work: {type: String},
    loveSituation: {type: String},
    hobbies: [{type: String}],
    sports: [{type: String}],
    books: [{type: mongoose.Schema.Types.ObjectId, ref: 'Book'}],
    notifications: [{type: mongoose.Schema.Types.ObjectId, ref: 'Notification'}]
}, 'user' )

const Family = mongoose.model('Family', {
    _id: mongoose.Schema.Types.ObjectId,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    father: {
        isVerified: { type: Boolean, default: false },
        node: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    },
    mother: {
        isVerified: { type: Boolean, default: false },
        node: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    },
    fratery: [{
        isVerified: { type: Boolean, default: false },
        node: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    }],
    partner: {
        isVerified: { type: Boolean, default: false },
        node: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    },
    children: [{
        isVerified: { type: Boolean, default: false },
        node: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    }]
}, 'family')

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
    book: {type: mongoose.Schema.Types.ObjectId, ref: 'Book'},
    description: String
}, 'media')

const Notification = mongoose.model('Notification', {
    _id: mongoose.Schema.Types.ObjectId,
    content: {type: String, trim: true},
    from: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    isRead: {type: Boolean, default: false},
    type: String,
    date: {type: Date, default: new Date()}
}, 'notification')

const Comment = mongoose.model('Comment', {
    _id: mongoose.Schema.Types.ObjectId,
    book: {type: mongoose.Schema.Types.ObjectId, ref: 'Book'},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    content: {type: String, trim: true},
    date: {type: Date, default: new Date()}
}, 'comment')

const schemas = {
    User,
    Family,
    Book,
    Media,
    Comment,
    Notification
}

module.exports = schemas