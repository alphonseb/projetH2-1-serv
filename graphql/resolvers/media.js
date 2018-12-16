const mongoose = require('mongoose')
const { getUserId, writeFile, deleteFile } = require('../../utils')

module.exports = {
    Mutation: {
        async addMedia (parent, { bookId, file, description }, { req, mongoSchemas }) {
            const id = getUserId(req)
            const mediaId = mongoose.Types.ObjectId()

            const { filename, createReadStream } = await file
            const src = await writeFile(mediaId, filename, 'bookMedia', createReadStream)

            const media = await new mongoSchemas.Media({
                _id: mediaId,
                src,
                author: id,
                description,
                book: bookId
            }).save()

            let book = await mongoSchemas.Book.findById(bookId, 'medias')

            if (!book.medias)
                book.medias = []

            book.medias.push(media._id)
                
            await mongoSchemas.Book.findByIdAndUpdate(bookId, { $set: { medias: book.medias }})
            return media
        },
        async updateMedia (parent, { id, description }, { req, mongoSchemas }) {
            const userId = getUserId(req)
            return await mongoSchemas.Media.findOneAndUpdate({_id: id, author: userId }, { description }, { new: true })
        },
        async deleteMedia (parent, { id }, { req, mongoSchemas }) {
            const userId = getUserId(req)
            const media = await mongoSchemas.Media.findOneAndDelete({ _id: id, author: userId})
            await deleteFile(media.src)
            return media
        }
    },
    resolvers: {
        author: async (media, args, { mongoSchemas }) => await mongoSchemas.User.findById(media.author),
        book: async (media, args, { mongoSchemas }) => await mongoSchemas.Book.findById(media.book)
    }
}