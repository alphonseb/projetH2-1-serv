const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose')

const typeDefs = require('./graphql/schema')
const resolvers = require('./graphql/resolvers')
const mongoSchemas = require('./mongodb')

mongoose.connect('mongodb://localhost/family', {
    useNewUrlParser: true
})

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
        req,
        mongoSchemas
    })
})

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
})