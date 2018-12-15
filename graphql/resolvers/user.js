const mongoose = require('mongoose')

const { getUserId } = require('../../utils')

module.exports = {
    Query: {
        async me (parent, args, { req, mongoSchemas }) {
            const id = await getUserId(req)
            const user = await mongoSchemas.User.findById(id)

            return user
        },
        async user (parent, { id }, { mongoSchemas }) {
            const user = await mongoSchemas.User.findById(id)
            
            if (!user)
                throw new Error('The id doesn\'t match any user')

            return user
        },
        async searchUser (parent, { name }, { mongoSchemas }) {
            const users = mongoSchemas.User.find({ name: { $regex: name, $options: 'gi' }}) 
            return users
        }
    },
    Mutation: {
        async updateMe (parent, args, { req, mongoSchemas }) {
            const id = await getUserId(req)
            const user = await mongoSchemas.User.findById(id)

            if (args.data.birth)
                args.data.birth = { ...user.birth, ...args.data.birth}

            return await mongoSchemas.User.findByIdAndUpdate(id, { $set: args.data}, { new: true })
        },
        async pushMeData (parent, { type, values }, { req, mongoSchemas }) {
            type = type.toLowerCase()
            const id = await getUserId(req)
            const user = await mongoSchemas.User.findById(id)

            return await mongoSchemas.User.findByIdAndUpdate(id, {$set: { [type]: [...user[type], ...values] }}, { new: true })
        },
        async removeMeData (parent, { type, values }, { req, mongoSchemas }) {
            type = type.toLowerCase()
            const id = await getUserId(req)
            const user = await mongoSchemas.User.findById(id)

            user[type] = user[type].filter(v => !values.includes(v))

            return await mongoSchemas.User.findByIdAndUpdate(id, {$set: { [type]: user[type] }}, { new: true })
        }
    },
    resolvers: {
        async books (user, args, { mongoSchemas }) {          
            return await mongoSchemas.Book
                .find({ author: user._id}, null, { limit: args.limit ? args.limit : null })
                .sort(`${args.order === 'DATE_ASC' ? '' : '-'}date`)
        }
    }
}
