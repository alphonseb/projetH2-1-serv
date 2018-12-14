const { getUserId } = require('../../utils')

module.exports = {
    Query: {
        async me (parent, args, { req }, info) {
            const id = await getUserId(req)
            const user = await context.mongoSchemas.User.findById(id)
            return user
        }
    },
    Mutation: {
        async updateMe (parent, args, { req, mongoSchemas }) {
            const id = await getUserId(req)
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
            console.log()
            return await mongoSchemas.User.findByIdAndUpdate(id, {$set: { [type]: user[type] }}, { new: true })

        }
    }
}
