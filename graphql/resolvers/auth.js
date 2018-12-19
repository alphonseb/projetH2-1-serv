const { APP_SECRET, APP_URL } = require('dotenv').config({ path: './.env'}).parsed

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
    Mutation: {
        async signup (parent, args, { mongoSchemas }) {
            const pass = await bcrypt.hash(args.password, 10)

            const familyId = mongoose.Types.ObjectId()
            const userId = mongoose.Types.ObjectId()

            const media = await new mongoSchemas.Media({ _id: mongoose.Types.ObjectId(), author: userId, src: `${APP_URL}/static/default.png`}).save()

            const user = await new mongoSchemas.User({_id: userId, ...args, password: pass, family: familyId, profilePicture: media._id}).save()

            await new mongoSchemas.Family({_id: familyId, user: user._id}).save()

            return {
                token: await jwt.sign({ userId: user._id}, APP_SECRET),
                user
            }
        },
        async login (parent, {password, mail}, { mongoSchemas }) {
            const user = await mongoSchemas.User.findOne({ mail })
            if (!user)
                throw new Error(`No user found for email: ${email}`)

            const validPass = bcrypt.compare(password, user.password)
            if (!validPass)
                throw new Error(`Invalid password`)

            return {
                token: jwt.sign({ userId: user.id }, APP_SECRET),
                user
            }
        }
    }
}
