const mongoose = require('mongoose')
const { getUserId } = require('../../utils')

module.exports = {
    Query: {},
    Mutation: {
        async createBook (parent, { title, content, date }, { req, mongoSchemas }) {
            const id = await getUserId(req)
            return await await new mongoSchemas.Book({
                _id: mongoose.Types.ObjectId(),
                title,
                author: id,
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
        comments: async (book, args, { mongoSchemas }) => await mongoSchemas.Comment.find({book: book.id}),
        medias: async (book, args, { mongoSchemas }) => await mongoSchemas.Media.find({ _id: { $in: book.medias }})
    }
}