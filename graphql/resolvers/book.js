const mongoose = require('mongoose')
const path = require('path')

const fs = require('fs')
const { getUserId } = require('../../utils')

module.exports = {
    Query: {},
    Mutation: {
        async createBook (parent, { title, content, date }, { req, mongoSchemas }) {
            const id = await getUserId(req)
            const bookId = mongoose.Types.ObjectId()
            await new mongoSchemas.Book({
                _id: bookId,
                title,
                author: id,
                content,
                date: Date.parse(date)
            }).save()
            return await mongoSchemas.Book.findById(bookId)
        },
        async updateBook (parent, args, { req, mongoSchemas }) {
            const userId = getUserId(req)
            return await mongoSchemas.Book.findOneAndUpdate({ _id: args.id, author: userId }, { ...args }, { new: true })
        },
        async deleteBook (parent, { id }, { req, mongoSchemas }) {
            const userId = getUserId(req)
            return await mongoSchemas.Book.findOneAndDelete({ _id: id, author: userId })
        },
        async singleUpload(parent, { file }) {
            const { createReadStream, filename, mimetype, encoding} = await file
            // const filePath = path.resolve('../../upload/' + filename)
            await fs.writeFileSync(`upload/${filename}`, '')
            const stream = createReadStream()
            stream.pipe(fs.createWriteStream(`upload/${filename}`))
            const res = {
                filename,
                mimetype,
                encoding
            }

            return res
        }
    },
    resolvers: {
        author: async (book, args, { mongoSchemas }) => await mongoSchemas.User.findById(book.author),
        comments: async (book, args, { mongoSchemas }) => await mongoSchemas.Comment.find({book: book.id})
    }
}