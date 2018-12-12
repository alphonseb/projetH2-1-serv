const { getUserId } = require('../utils')

const Query = {
  me (parent, args, context) {
    const id = getUserId(context)
    return context.prisma.user({ id })
  }
}

module.exports = { Query }
