const User = require('./user')
const Auth = require('./auth')
const Book = require('./book')

module.exports = {
    Query: {
        ...User.Query
    },
    Mutation: {
        ...User.Mutation,
        ...Auth.Mutation,
        ...Book.Mutation
    },
    User: {
        ...User.resolvers
    },
    Book: {
        ...Book.resolvers
    }
}