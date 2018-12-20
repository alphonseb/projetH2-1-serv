const mongoose = require('mongoose')

const { getUserId, writeFile } = require('../../utils')
const { Mutation: { createNotification } } = require('./notification')

const oppositeFamilyType = {
    father: 'children',
    mother: 'children',
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
            if (name === '')
                return []
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
            
            if (args.data.profilePicture !== undefined) {
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

                // const fromUserGender = mongoSchemas.User.findById(fromUserId, 'gender')
                const { gender } = await mongoSchemas.User.findById(id, 'gender')
                
                const fromUser = await mongoSchemas.User.findById(fromUserId)

                switch (type) {
                    case 'father':
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: fromUserId }, { $set: { [type]: {
                            isVerified: false,
                            node: id
                        }}}, { new: true }))
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: id }, { $push: { [oppositeFamilyType[type]]: {
                            isVerified: false,
                            node: fromUserId
                        }}}, { new: true }))
                        createNotification('', {
                            from: fromUserId,
                            to: id,
                            content: `Votre ${fromUser.gender.toLowerCase() === 'homme' ? 'fils': 'fille'} ${fromUser.name} vous a ajouté`,
                            type: 'VALIDATE'
                        }, { mongoSchemas })
                        break;
                
                    case 'mother':
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: fromUserId }, { $set: { [type]: {
                            isVerified: false,
                            node: id
                        }}}, { new: true }))
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: id }, { $push: { [oppositeFamilyType[type]]: {
                            isVerified: false,
                            node: fromUserId
                        }}}, { new: true }))
                        createNotification('', {
                            from: fromUserId,
                            to: id,
                            content: `Votre ${fromUser.gender.toLowerCase() === 'homme' ? 'fils': 'fille'} ${fromUser.name} vous a ajouté`,
                            type: 'VALIDATE'
                        }, { mongoSchemas })
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
                        createNotification('', {
                            from: fromUserId,
                            to: id,
                            content: `Votre ${fromUser.gender.toLowerCase() === 'homme' ? 'frère': 'soeur'} ${fromUser.name} vous a ajouté`,
                            type: 'VALIDATE'
                        }, { mongoSchemas })
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
                        createNotification('', {
                            from: fromUserId,
                            to: id,
                            content: `Votre ${fromUser.gender.toLowerCase() === 'homme' ? 'conjoint': 'conjointe'} ${fromUser.name} vous a ajouté`,
                            type: 'VALIDATE'
                        }, { mongoSchemas })
                        break;
                            
                    case 'children':
                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: fromUserId }, { $push: { [type]: {
                            isVerified: false,
                            node: id
                        }}}, { new: true }))

                        const parentType = gender.toLowerCase() === 'homme' ? 'father' : 'mother'

                        returnUsers.push(await mongoSchemas.Family.findOneAndUpdate({ user: id }, { $set: { [parentType]: {
                            isVerified: false,
                            node: fromUserId
                        }}}, { new: true }))
                        createNotification('', {
                            from: fromUserId,
                            to: id,
                            content: `Votre ${fromUser.gender === 'homme' ? 'père': 'mère'} ${fromUser.name} vous a ajouté`,
                            type: 'VALIDATE'
                        }, { mongoSchemas })
                        break;

                    default:
                        break;
                }
            })
            
            return returnUsers
        },
        async familyMemberHasVerify (parent, { fromId, type }, { req, mongoSchemas }) {
            type = type.toLowerCase()

            const toId = await getUserId(req)
            const fromUserFamily = await mongoSchemas.Family.findOne({ user: fromId }, type)
            const toUserFamily = await mongoSchemas.Family.findOne({ user: toId }, oppositeFamilyType[type])
            let newChildren

            switch (type) {
                case 'father':
                    await mongoSchemas.Family.findOneAndUpdate({ user: fromId }, { $set: {
                        [type]: {
                            isVerified: true,
                            node: fromUserFamily[type].node
                        }
                    }})

                    newChildren = await toUserFamily.children.map(_child => {
                        if (_child.node == fromId)
                            _child.isVerified = true

                        return _child
                    })

                    await mongoSchemas.Family.findOneAndUpdate({ user: toId }, { $set: { children: newChildren}})
                    break;
            
                case 'mother':
                    await mongoSchemas.Family.findOneAndUpdate({ user: fromId }, { $push: {
                        [type]: {
                            isVerified: true,
                            node: fromUserFamily[type].node
                        }
                    }})
                    newChildren = await toUserFamily.children.map(_child => {
                        if (_child.node == fromId)
                            _child.isVerified = true

                        return _child
                    })
                    await mongoSchemas.Family.findOneAndUpdate({ user: toId }, { $set: { children: newChildren}})
                    break;

                case 'fratery':
                    const fromFratery = await toUserFamily.fratery.map(_broSis => {
                        if (_broSis.node == fromId)
                            _broSis.isVerified = true

                        return _broSis
                    })
                    await mongoSchemas.Family.findOneAndUpdate({ user: fromId }, { $set: {fratery: fromFratery }})

                    const toFratery = await toUserFamily.fratery.map(_broSis => {
                        if (_broSis.node == toId)
                            _broSis.isVerified = true

                        return _broSis
                    })
                    await mongoSchemas.Family.findOneAndUpdate({ user: toId }, { $set: {fratery: toFratery }})
                    break;

                case 'partner':
                    await mongoSchemas.Family.findOneAndUpdate({ user: fromId }, { $set: {
                        [type]: {
                            isVerified: true,
                            node: fromUserFamily[type].node
                        }
                    }})
                    await mongoSchemas.Family.findOneAndUpdate({ user: toId }, { $set: {
                        [oppositeFamilyType[type]]: {
                            isVerified: true,
                            node: toUserFamily[oppositeFamilyType[type]].node
                        }
                    }})
                    break;

                case 'children':
                    const { gender } = await mongoSchemas.User.findById(toId, 'gender')

                    const otherType = gender.toLowerCase() === 'homme' ? 'father': 'mother'

                    await mongoSchemas.Family.findOneAndUpdate({ user: toId}, { $set: {
                        [otherType]: {
                            isVerified: true,
                            node: fromId
                        }
                    }})

                    newChildren = await fromUserFamily.children.map(_child => {
                        if (_child.node == toId)
                            _child.isVerified = true

                        return _child
                    })

                    await mongoSchemas.Family.findOneAndUpdate({ user: fromId}, { $set: {
                        children: newChildren
                    }})
                    break;
            }

            return {
                id: ''
            }
        }
    },
    resolvers: {
        books: async (user, args, { mongoSchemas }) => await mongoSchemas.Book
                .find({ to: user._id}, null, { limit: args.limit ? args.limit : null })
                .sort(`${args.order === 'DATE_ASC' ? '' : '-'}date`),
        profilePicture: async (user, args, { mongoSchemas }) => await mongoSchemas.Media.findById(user.profilePicture),
        notifications: async (user, args, { mongoSchemas }) => await mongoSchemas.Notification.find({ to: user._id}),
        family: async (user, args, { mongoSchemas }) => await mongoSchemas.Family.findOne({user: user._id}),
    },
    Family: {
        mother: async (family, args, { mongoSchemas }) => {
            const isVerified = family.mother.isVerified
            const node = await mongoSchemas.User.findById(family.mother.node)
            return {
                isVerified,
                node
            }
        },
        father: async (family, args, { mongoSchemas }) => {
            const isVerified = family.father.isVerified
            const node = await mongoSchemas.User.findById(family.father.node)
            return {
                isVerified,
                node
            }
        },
        fratery: async (family, args, { mongoSchemas }) => {
            const ids = family.fratery.map(_v => _v.node._id)
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
