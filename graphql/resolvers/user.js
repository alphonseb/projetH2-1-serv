const mongoose = require('mongoose')

const { getUserId, writeFile } = require('../../utils')

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

            if (typeof args.data.profilePicture !== undefined) {
                const { filename, createReadStream } = await args.data.profilePicture
                const src = await writeFile(id, filename, 'profilePic', createReadStream)

                if (typeof user.profilePicture !== undefined) {
                    mongoSchemas.Media.findOneAndDelete({ _id: user.profilePicture })
                }

                const media = await new mongoSchemas.Media({
                    _id: mongoose.Types.ObjectId(),
                    src,
                    author: user._id
                }).save()

                args.data.profilePicture = media._id
            }

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
        },
        async profilePicture (user, args, { mongoSchemas }) {
            if (!user.profilePicture)
                return {
                    id: '',
                    src: '',
                    author: ''
                }
            return await mongoSchemas.Media.findById(user.profilePicture)
        },
        notifications: async (user, args, { mongoSchemas }) => await mongoSchemas.Notification.find({ to: user._id})
    }
}
