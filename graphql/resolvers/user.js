const mongoose = require('mongoose')

const { getUserId, writeFile } = require('../../utils')

const oppositeFamilyType = {
    father: 'child',
    mother: 'child',
    fratery: 'fratery',
    partner: 'partner',
    children: 'parent'
}

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
        },
        async addFamilyMember (parent, { users } , { req, mongoSchemas }) {
            const returnUsers = []

            await users.forEach(async ({ id, type }) => {
                type = type.toLowerCase()

                const fromUserId = getUserId(req)

                const fromUserGender = mongoSchemas.User.findById(fromUserId, 'gender')
                const toUserGender = mongoSchemas.User.findById(id, 'gender')

                switch (type) {
                    case 'father':
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: fromUserId }, { $set: { [type]: {
                            isVerified: false,
                            node: id
                        }}}, { new: true }))
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: id }, { $set: { [oppositeFamilyType[type]]: {
                            isVerified: false,
                            node: fromUserId
                        }}}, { new: true }))
                        break;
                
                    case 'mother':
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: fromUserId }, { $set: { [type]: {
                            isVerified: false,
                            node: id
                        }}}, { new: true }))
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: id }, { $set: { [oppositeFamilyType[type]]: {
                            isVerified: false,
                            node: fromUserId
                        }}}, { new: true }))
                        break;
                
                    case 'fratery':
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: fromUserId }, { $push: { [type]: {
                            isVerified: false,
                            node: id
                        }}}, { new: true }))
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: id }, { $push: { [oppositeFamilyType[type]]: {
                            isVerified: false,
                            node: fromUserId
                        }}}, { new: true }))
                        break;
        
                    case 'partner':
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: fromUserId }, { $set: { [type]: {
                            isVerified: false,
                            node: id
                        }}}, { new: true }))
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: id }, { $set: { [oppositeFamilyType[type]]: {
                            isVerified: false,
                            node: fromUserId
                        }}}, { new: true }))
                        break;
                            
                    case 'children':
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: fromUserId }, { $push: { [type]: {
                            isVerified: false,
                            node: id
                        }}}, { new: true }))

                        const parentType = toUserGender === 'homme' ? 'father' : 'mother'
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: id }, { $push: { [parentType]: {
                            isVerified: false,
                            node: fromUserId
                        }}}, { new: true }))
                        break;

                    default:
                        break;
                }
            })
            
            return returnUsers
        },
        async familyMemberHasVerify (parent, { fromId, type }, { req, mongoSchemas }) {
            const id = await getUserId(req)
            const toUserFamily = await mongoSchemas.Family.findOne({ user: id })
            const fromUserFamily = await mongoSchemas.Family.findOne({ user: fromId })
            console.log(toUserFamily)
            console.log(fromUserFamily)
            return
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
        notifications: async (user, args, { mongoSchemas }) => await mongoSchemas.Notification.find({ to: user._id}),
        family: async (user, args, { mongoSchemas }) => await mongoSchemas.Family.findOne({user: user._id}),
    },
    Family: {
        mother: async (family, args, { mongoSchemas }) => {
            const isVerified = family.mother.isVerified
            const node = await mongoSchemas.User.findById(family.father.node)
            return {
                isVerified,
                node
            }
        },
        father: async (family, args, { mongoSchemas }) => {
            const isVerified = family.father.isVerified
            const node = await mongoSchemas.User.findById(family.mother.node)
            return {
                isVerified,
                node
            }
        },
        fratery: async (family, args, { mongoSchemas }) => {
            const ids = family.fratery.map(_v => _v.node)
            const users = await mongoSchemas.User.find({ _id: { $in: ids } })
            await ids.forEach(( id, i) => {
                users[i] = {
                    isVerified: family.fratery[i].isVerified,
                    node: users[i]
                } 
            })
            return users
        },
        partner: async (family, args, { mongoSchemas }) => {
            const isVerified = family.partner.isVerified
            const node = await mongoSchemas.User.findById(family.partner.node)
            return {
                isVerified,
                node
            }
        },
        children: async (family, args, { mongoSchemas }) => {
            const ids = family.children.map(_v => _v.node)
            const users = await mongoSchemas.User.find({ _id: { $in: ids } })
            await ids.forEach(( id, i) => {
                users[i] = {
                    isVerified: family.children[i].isVerified,
                    node: users[i]
                } 
            })
            return users
        }
    }
}
