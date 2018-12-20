const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const fs = require('fs')
const https = require('https')

const typeDefs = require('./graphql/schema')
const resolvers = require('./graphql/resolvers')
const mongoSchemas = require('./mongodb')

mongoose.connect('mongodb://localhost/family', {
    useNewUrlParser: true
})

const app = express()

app.use('/static', express.static(__dirname + '/upload/'))
app.use(cors())
app.use(helmet())

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
        req,
        mongoSchemas
    })
})

server.applyMiddleware({ app })

const httpsServer = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/julesguesnon.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/julesguesnon.cert.pem')
}, app)

httpsServer.listen(4000, () => {
    console.log(`🚀  Server ready at localhost:4000`)
})