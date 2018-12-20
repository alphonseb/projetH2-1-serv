const User = require('./user')
const Auth = require('./auth')
const Book = require('./book')
const Comment = require('./comment')
const Media = require('./media')
const Notification = require('./notification')

module.exports = {
    Query: {
        ...User.Query,
        ...Book.Query
    },
    Mutation: {
        ...User.Mutation,
        ...Auth.Mutation,
        ...Book.Mutation,
        ...Comment.Mutation,
        ...Media.Mutation,
        ...Notification.Mutation
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
    },
    Notification: {
        ...Notification.resolvers
    },
    Family: {
        ...User.Family
    }
}
