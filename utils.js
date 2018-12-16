const { APP_SECRET, APP_URL } = require('dotenv').config({ path: './.env' }).parsed
const jwt = require('jsonwebtoken')
const fs = require('fs')

const getUserId = (req) => {
    const Authorization = req.headers.authorization
    if (Authorization) {
        const token = Authorization.replace('Bearer ', '')
        const { userId } = jwt.verify(token, APP_SECRET)
        return userId
    }

    throw new AuthError()
}

const graphQlRequire = (_path) => {
    return fs.readFileSync(_path, { encoding: 'utf8' })
}

const writeFile = async (_id, _name, _type, _createReadStream) => {
    const splittedName = _name.split('.')
    const name = `${_id}-profilePic.${splittedName[splittedName.length - 1]}`
    const filePath = `upload/${name}`

    // Create the file
    await fs.writeFileSync(filePath, '')

    // Write it
    const stream = _createReadStream()
    stream.pipe(fs.createWriteStream(filePath))

    return `${APP_URL}/static/${name}`
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
    writeFile
}