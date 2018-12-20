const mongoose = require('mongoose')
const { getUserId } = require('../../utils')

module.exports = {
    Query: {
        book: async (parent, { id }, { mongoSchemas }) => await mongoSchemas.Book.findById(id)
    },
    Mutation: {
        async createBook (parent, { id, title, content, date }, { req, mongoSchemas }) {
            const authorId = await getUserId(req)
            return await await new mongoSchemas.Book({
                _id: mongoose.Types.ObjectId(),
                title,
                author: authorId,
                to: id ? id : authorId,
                content,
                date: Date.parse(date)
            }).save()
        },
        async updateBook (parent, args, { req, mongoSchemas }) {
            const userId = getUserId(req)
            return await mongoSchemas.Book.findOneAndUpdate({ _id: args.id, author: userId }, { ...args }, { new: true })
        },
        async deleteBook (parent, { id }, { req, mongoSchemas }) {
            const userId = getUserId(req)
            return await mongoSchemas.Book.findOneAndDelete({ _id: id, author: userId })
        }
    },
    resolvers: {
        author: async (book, args, { mongoSchemas }) => await mongoSchemas.User.findById(book.author),
        to: async (book, args, { mongoSchemas }) => await mongoSchemas.User.findById(book.to),
        comments: async (book, args, { mongoSchemas }) => await mongoSchemas.Comment.find({book: book.id}),
        medias: async (book, args, { mongoSchemas }) => await mongoSchemas.Media.find({ _id: { $in: book.medias }})
    }
}