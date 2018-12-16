const mongoose = require('mongoose')

const { getUserId } = require('../../utils')

module.exports = {
    Mutation: {
        async createNotification (parent, args, { mongoSchemas }) {
            const user = await mongoSchemas.User.findById(args.to, 'notifications')

            if (!user)
                throw new Error('The to does not match any user')

            const notification = await new mongoSchemas.Notification({
                _id: mongoose.Types.ObjectId(),
                ...args
            }).save()

            user.notifications.push(notification._id)

            mongoSchemas.User.findByIdAndUpdate(user._id, { $set: { notifications: user.notifications }})
            return notification
        },
        async readNotifications (parent, { ids }, { req, mongoSchemas }) {
            const id = getUserId(req)
            const { n, nModified, ok} = await mongoSchemas.Notification.updateMany({ _id: { $in: ids}, to: id}, { $set: { isRead: true }}, { new: true})
            return {
                found: n,
                modified: nModified,
                ok
            }
        }
    },
    resolvers: {
        from: async (user, args, { mongoSchemas }) => await mongoSchemas.User.findById(user.from),
        to: async (user, args, { mongoSchemas }) => await mongoSchemas.User.findById(user.to)
    }
}