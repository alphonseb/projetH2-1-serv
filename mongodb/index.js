const mongoose = require('mongoose')

const User = mongoose.model('Home',{
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, trim: true},
    password: {type: String},
    mail: {type: String, trim: true},
    gender: {type: String},
    birth: {
        date: Date,
        place: String
    },
    work: {type: String},
    loveSituation: {type: String},
    hobbies: [{type: String}],
    sports: [{type: String}]
}, 'user' )

// const Concert = mongoose.model('Concert',{
//     _id: mongoose.Schema.Types.ObjectId,
//     description: {type: String, trim: true},
//     place: {type: String,trim: true},
//     month: {type: String, trim: true},
//     day: {type: String, trim: true},
//     hour: {type: String, trim: true}
// }, 'concert')

// const Pswd = mongoose.model('Pswd',{
//     _id: mongoose.Schema.Types.ObjectId,
//     pswd: String
// }, 'pswd')

// const Medias = mongoose.model('Medias',{
//     _id: mongoose.Schema.Types.ObjectId,
//     path: String,
//     type: String,
//     date: {type: Date, default: new Date()},
// }, 'medias')


const schemas = {
    User
}

module.exports = schemas