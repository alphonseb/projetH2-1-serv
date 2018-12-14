const { APP_SECRET } = require('dotenv').config({ path: './.env' }).parsed
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

const getUserId = (req) => {
    const Authorization = req.headers.authorization
    if (Authorization) {
        const token = Authorization.replace('Bearer ', '')
        const {
            userId
        } = jwt.verify(token, APP_SECRET)
        return userId
    }

    throw new AuthError()
}

const graphQlRequire = (_path) => {
    return fs.readFileSync(_path, { encoding: 'utf8' })
}

class AuthError extends Error {
    constructor() {
        super('Not authorized')
    }
}

module.exports = {
    getUserId,
    graphQlRequire,
    AuthError
}