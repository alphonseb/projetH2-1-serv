// const { APP_SECRET, APP_URL } = require('dotenv').config({
//     path: './.env'
// }).parsed
const jwt = require('jsonwebtoken')
const fs = require('fs')

const getUserId = req => {
    const Authorization = req.headers.authorization
    if (Authorization) {
        const token = Authorization.replace('Bearer ', '')
        const { userId } = jwt.verify(token, process.env.APP_SECRET)
        return userId
    }

    throw new AuthError()
}

const graphQlRequire = _path => {
    return fs.readFileSync(_path, { encoding: 'utf8' })
}

const writeFile = async (_id, _name, _type, _createReadStream) => {
    const splittedName = _name.split('.')
    const name = `${_id}-${_type}.${splittedName[splittedName.length - 1]}`
    const filePath = `upload/${name}`

    // Create the file
    await fs.writeFileSync(filePath, '')

    // Write it
    const stream = _createReadStream()
    stream.pipe(fs.createWriteStream(filePath))

    return `${process.env.APP_URL}/static/${name}`
}

const deleteFile = async _src => {
    const path = _src.split('/')
    fs.unlinkSync(`upload/${path[path.length - 1]}`)
    return true
}

class AuthError extends Error {
    constructor() {
        super('Not authorized')
    }
}

module.exports = {
    getUserId,
    graphQlRequire,
    AuthError,
    writeFile,
    deleteFile
}
