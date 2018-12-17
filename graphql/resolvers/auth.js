const { APP_SECRET } = require('dotenv').config({ path: './.env'}).parsed

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
    Mutation: {
        async signup (parent, args, { mongoSchemas }) {
            const pass = await bcrypt.hash(args.password, 10)

            const familyId = mongoose.Types.ObjectId()

            const user = await new mongoSchemas.User({_id: mongoose.Types.ObjectId(), ...args, password: pass, family: familyId}).save()

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
