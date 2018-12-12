const { ApolloServer, gql } = require('apollo-server')

const typeDefs = gql`
  type Hello {
    name: String
    author: String
  }

  type Query {
      hello: Hello
  }
`

const resolvers = {
    Query: {
        hello: () => ({ name: 'Hello World', author: 'Jules Guesnon' })
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
})
