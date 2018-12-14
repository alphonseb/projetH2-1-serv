const User = require('./user')
const Auth = require('./auth')

module.exports = {
    Query: {
        ...User.Query
    },
    Mutation: {
        ...User.Mutation,
        ...Auth.Mutation
    }
}