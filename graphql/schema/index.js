const { graphQlRequire } = require('../../utils')

const Query = graphQlRequire(__dirname + '/query.graphql')
const Mutation = graphQlRequire(__dirname + '/mutations.graphql')
const User = graphQlRequire(__dirname + '/user.graphql')
const Book = graphQlRequire(__dirname + '/book.graphql')

module.exports = [Query, Mutation, User, Book]