const User = require('./user')
const Auth = require('./auth')
const Book = require('./book')
const Comment = require('./comment')
const Media = require('./media')

module.exports = {
    Query: {
        ...User.Query
    },
    Mutation: {
        ...User.Mutation,
        ...Auth.Mutation,
        ...Book.Mutation,
        ...Comment.Mutation,
        ...Media.Mutation
    },
    User: {
        ...User.resolvers
    },
    Book: {
        ...Book.resolvers
    },
    Comment: {
        ...Comment.resolvers
    },
    Media: {
        ...Media.resolvers
    }
}