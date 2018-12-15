const User = require('./user')
const Auth = require('./auth')
const Book = require('./book')
const Comment = require('./comment')

module.exports = {
    Query: {
        ...User.Query
    },
    Mutation: {
        ...User.Mutation,
        ...Auth.Mutation,
        ...Book.Mutation,
        ...Comment.Mutation
    },
    User: {
        ...User.resolvers
    },
    Book: {
        ...Book.resolvers
    },
    Comment: {
        ...Comment.resolvers
    }
}