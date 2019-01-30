const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const fs = require('fs')
const https = require('https')

const typeDefs = require('./graphql/schema')
const resolvers = require('./graphql/resolvers')
const mongoSchemas = require('./mongodb')

// const { DB_USER, DB_PASSWORD } = require('dotenv').config({
//     path: './.env'
// }).parsed

mongoose.connect(
    `mongodb://${process.env.DB_USER}:${
        process.env.DB_PASSWORD
    }@ds143971.mlab.com:43971/family-shelf`,
    {
        useNewUrlParser: true
    }
)

mongoose.connection.on('connected', () => {
    console.log('db connected')
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

// const httpsServer = https.createServer(app)

// {
//     key: fs.readFileSync('/etc/letsencrypt/live/julesguesnon.com/privkey.pem'),
//         cert: fs.readFileSync('/etc/letsencrypt/live/julesguesnon.cert.pem')
// // },

app.listen({ port: PORT }, () => console.log(`🚀 Server ready at whatever}`))
