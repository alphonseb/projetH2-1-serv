const mongoose = require('mongoose')

const { getUserId } = require('../../utils')

module.exports = {
    Query: {},
    Mutation: {
        async addComment (parent, { content }, { req, mongoSchemas }) {
            const userId = await getUserId(req)
            return await new mongoSchemas.Comment({
                _id: mongoose.Types.ObjectId(),
                author: userId,
                content
            }).save()
        },
        async updateComment (parent, { id, content}, { req, mongoSchemas }) {
            const userId = await getUserId(req)
            return await mongoSchemas.Comment.findOneAndUpdate({ _id: id, author: userId}, { content }, { new: true})
        },
        async deleteComment (parent, { id, content}, { req, mongoSchemas }) {
            const userId = await getUserId(req)
            return await mongoSchemas.Comment.findOneAndDelete({ _id: id, author: userId})
        }
    },
    resolvers: {
        author: async (comment, args, { mongoSchemas }) => await mongoSchemas.User.findById(comment.author)
    }
}