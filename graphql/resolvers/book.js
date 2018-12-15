const mongoose = require('mongoose')

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
            return await mongoSchemas.Book.findById(bookId).populate('author')
        }
    }
}