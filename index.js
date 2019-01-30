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

// Add headers
app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader(
        'Access-Control-Allow-Origin',
        'https://shelf-app.alphonsebouy.fr'
    )

    // Request methods you wish to allow
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    )

    // Request headers you wish to allow
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With,content-type'
    )

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true)

    // Pass to next layer of middleware
    next()
})

app.options('*', cors())
app.delete('*', cors(), function(req, res, next) {
    res.json({ msg: 'This is CORS-enabled for all origins!' })
})
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

app.listen({ port: process.env.PORT }, () =>
    console.log(`🚀 Server ready at whatever}`)
)
